import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";

// Eleventy foundation adapted from Eide-consulting/Modern-web.
export default function (eleventyConfig) {
  const localAuthoring = process.env.ELEVENTY_RUN_MODE === "serve";
  const authoringPaths = ["legg-inn", "assets/js/author.js", "assets/js/recipe-tools.js"];
  eleventyConfig.addGlobalData("localAuthoring", localAuthoring);
  eleventyConfig.addPassthroughCopy({
    "src/assets/css": "assets/css",
    "src/assets/images": "assets/images",
    "src/assets/js/app.js": "assets/js/app.js",
  });
  eleventyConfig.addPassthroughCopy({ "src/favicon.svg": "favicon.svg" });
  eleventyConfig.setNunjucksEnvironmentOptions({ autoescape: true });
  eleventyConfig.addWatchTarget("src/recipes/");

  if (localAuthoring) {
    eleventyConfig.addPassthroughCopy({
      "src/assets/js/author.js": "assets/js/author.js",
      "src/assets/js/recipe-tools.js": "assets/js/recipe-tools.js",
    });
  } else {
    eleventyConfig.ignores.add("src/author.njk");
    // Remove local-tool files left by older builds before creating deployable output.
    eleventyConfig.on("eleventy.before", ({ directories }) => {
      for (const path of authoringPaths) rmSync(join(directories.output, path), { recursive: true, force: true });
    });
    eleventyConfig.on("eleventy.after", ({ directories }) => {
      for (const path of authoringPaths) {
        if (existsSync(join(directories.output, path))) throw new Error(`Publisering stoppet: lokalverktøyet finnes i byggemappen (${path}).`);
      }
    });
  }

  return {
    dir: {
      input: "src",
      output: localAuthoring ? "_preview" : "_site",
      includes: "_includes",
      data: "_data",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
