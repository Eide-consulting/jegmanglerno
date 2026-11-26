import test from "node:test";
import assert from "node:assert/strict";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { createRecipe } from "../src/assets/js/recipe-tools.js";

test("a downloaded recipe becomes a linked, escaped recipe page after building", () => {
  const directory = mkdtempSync(join(tmpdir(), "jegmangler-publication-"));
  const source = join(directory, "src");
  const output = join(directory, "_site");
  const recipe = createRecipe({
    title: "Testrett <b>uten egg</b>",
    slug: "testrett-uten-egg",
    missingIngredient: "egg",
    description: 'En oppskrift med "anførselstegn" og <HTML>.',
    category: "MIDDAG",
    minutes: "20",
    servings: "4",
    illustration: "kitchen",
    content: "INGREDIENSER\n2 ss smør\n\nSLIK GJØR DU\n<script>window.unsafeRecipe = true</script>",
  });
  try {
    cpSync(new URL("../src/", import.meta.url), source, { recursive: true });
    cpSync(new URL("../eleventy.config.js", import.meta.url), join(directory, "eleventy.config.js"));
    cpSync(new URL("../package.json", import.meta.url), join(directory, "package.json"));
    writeFileSync(join(source, "recipes", `${recipe.slug}.json`), `${JSON.stringify(recipe, null, 2)}\n`);
    const command = new URL("../node_modules/@11ty/eleventy/cmd.cjs", import.meta.url).pathname;
    const build = spawnSync(process.execPath, [command], { cwd: directory, encoding: "utf8" });
    assert.equal(build.status, 0, `${build.stdout}\n${build.stderr}`);
    const home = readFileSync(join(output, "index.html"), "utf8");
    const page = readFileSync(join(output, "oppskrift", recipe.slug, "index.html"), "utf8");
    assert.ok(home.includes(`/oppskrift/${recipe.slug}/`));
    assert.ok(home.includes("Testrett &lt;b&gt;uten egg&lt;/b&gt;"));
    assert.ok(page.includes("&lt;script&gt;window.unsafeRecipe = true&lt;/script&gt;"));
    assert.ok(!page.includes("<script>window.unsafeRecipe"));
    assert.ok(page.includes("INGREDIENSER\n2 ss smør\n\nSLIK GJØR DU"));
    assert.equal(existsSync(join(output, "legg-inn")), false);
    assert.ok(!home.includes("/legg-inn/"));
    for (const asset of ["assets/js/app.js", "assets/css/style.css", "assets/images/kitchen.svg"]) {
      assert.ok(readFileSync(join(output, asset), "utf8").length);
    }
    assert.equal(existsSync(join(output, "assets/js/author.js")), false);
    assert.equal(existsSync(join(output, "assets/js/recipe-tools.js")), false);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("local preview stays separate, and production removes stale authoring files", () => {
  const directory = mkdtempSync(join(tmpdir(), "jegmangler-build-modes-"));
  const command = new URL("../node_modules/@11ty/eleventy/cmd.cjs", import.meta.url).pathname;
  const eleventyModule = new URL("../node_modules/@11ty/eleventy/src/Eleventy.js", import.meta.url).href;
  try {
    cpSync(new URL("../src/", import.meta.url), join(directory, "src"), { recursive: true });
    cpSync(new URL("../eleventy.config.js", import.meta.url), join(directory, "eleventy.config.js"));
    cpSync(new URL("../package.json", import.meta.url), join(directory, "package.json"));
    const preview = spawnSync(process.execPath, ["--input-type=module", "--eval",
      `import Eleventy from ${JSON.stringify(eleventyModule)}; const site = new Eleventy(undefined, undefined, {runMode: "serve"}); await site.write();`,
    ], { cwd: directory, encoding: "utf8" });
    assert.equal(preview.status, 0, `${preview.stdout}\n${preview.stderr}`);
    const local = join(directory, "_preview");
    const output = join(directory, "_site");
    assert.equal(existsSync(output), false);
    assert.ok(readFileSync(join(local, "legg-inn/index.html"), "utf8").includes("/assets/js/author.js"));
    assert.ok(readFileSync(join(local, "index.html"), "utf8").includes("/legg-inn/"));
    for (const asset of ["author.js", "recipe-tools.js"]) assert.ok(existsSync(join(local, "assets/js", asset)));

    mkdirSync(join(output, "legg-inn"), { recursive: true });
    writeFileSync(join(output, "legg-inn/index.html"), "Old publicly built editor");
    mkdirSync(join(output, "assets/js"), { recursive: true });
    for (const asset of ["author.js", "recipe-tools.js"]) writeFileSync(join(output, "assets/js", asset), "Old editor code");
    const build = spawnSync(process.execPath, [command], {
      cwd: directory, encoding: "utf8", env: { ...process.env, ELEVENTY_RUN_MODE: "serve" },
    });
    assert.equal(build.status, 0, `${build.stdout}\n${build.stderr}`);
    for (const path of ["legg-inn", "assets/js/author.js", "assets/js/recipe-tools.js"]) assert.equal(existsSync(join(output, path)), false);
    assert.ok(!readFileSync(join(output, "index.html"), "utf8").includes("/legg-inn/"));
    assert.ok(existsSync(join(local, "legg-inn/index.html")));
    assert.ok(!readFileSync(join(output, "assets/js/app.js"), "utf8").includes("recipe-tools.js"));

    mkdirSync(join(output, "legg-inn"), { recursive: true });
    writeFileSync(join(output, "legg-inn/marker.txt"), "Unrelated output");
    const override = spawnSync(process.execPath, [command, "--output=_preview"], { cwd: directory, encoding: "utf8" });
    assert.equal(override.status, 0, `${override.stdout}\n${override.stderr}`);
    for (const path of ["legg-inn", "assets/js/author.js", "assets/js/recipe-tools.js"]) assert.equal(existsSync(join(local, path)), false);
    assert.ok(existsSync(join(output, "legg-inn/marker.txt")));

    writeFileSync(join(directory, "src/accidental-editor.njk"), "---\npermalink: /legg-inn/index.html\n---\nAn accidentally included editor");
    const unsafe = spawnSync(process.execPath, [command], { cwd: directory, encoding: "utf8" });
    assert.notEqual(unsafe.status, 0);
    assert.match(`${unsafe.stdout}\n${unsafe.stderr}`, /Publisering stoppet/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
