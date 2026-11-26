import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRecipe, validateRecipe, slugify } from "../src/assets/js/recipe-tools.js";
import getRecipes from "../src/_data/recipes.js";
import getIngredients from "../src/_data/ingredients.js";

const values = {
  title: "Brun saus uten kraft", slug: "brun-saus-uten-kraft", missingIngredient: "Kraft",
  description: "En god saus.", category: "MIDDAG", minutes: "20", servings: "4",
  illustration: "kitchen", content: "INGREDIENSER\n2 ss smør\n\nSLIK GJØR DU\n1. Smelt smøret.",
};

test("creates an exportable recipe without altering the pasted instructions", () => {
  const recipe = createRecipe(values);
  assert.equal(recipe.content, values.content);
  assert.equal(recipe.missingIngredient, "kraft");
  assert.equal(recipe.minutes, 20);
  assert.equal(recipe.servings, 4);
  assert.deepEqual(validateRecipe(JSON.parse(JSON.stringify(recipe))), recipe);
});

test("generates Norwegian URL slugs", () => {
  assert.equal(slugify("Rømme, blåbær & søte små kaker!"), "romme-blabaer-sote-sma-kaker");
  assert.equal(slugify("Crème fraîche"), "creme-fraiche");
  assert.equal(slugify("  Brun saus uten kraft  "), "brun-saus-uten-kraft");
});

test("rejects invalid metadata and unsafe URL paths", () => {
  for (const slug of ["../secret", "a/b", "", "-abc", "abc-", "abc--def", "Blåbær"]) {
    assert.throws(() => createRecipe({ ...values, slug }), TypeError);
  }
  for (const minutes of ["", "0", "-1", "1.5", "NaN", "1441"]) {
    assert.throws(() => createRecipe({ ...values, minutes }), TypeError);
  }
  assert.throws(() => createRecipe({ ...values, content: " " }), TypeError);
  assert.throws(() => createRecipe({ ...values, illustration: "../../secret" }), TypeError);
  assert.throws(() => createRecipe({ ...values, title: "a".repeat(121) }), TypeError);
});

test("all published recipes are valid and their illustrations exist", () => {
  const recipes = getRecipes();
  assert.equal(recipes.length, 3);
  assert.equal(new Set(recipes.map((recipe) => recipe.slug)).size, recipes.length);
  for (const recipe of recipes) {
    assert.equal(validateRecipe(recipe), recipe);
    assert.match(readFileSync(new URL(`../src/assets/images/${recipe.illustration}.svg`, import.meta.url), "utf8"), /<svg/);
    assert.ok(recipe.content.includes("INGREDIENSER"));
    assert.ok(recipe.content.includes("SLIK GJØR DU"));
  }
});

test("filters come from the published recipes, not replacement suggestions", () => {
  assert.deepEqual(getIngredients(), ["egg", "kraft", "melk"]);
});

test("recipe content remains text even when it contains HTML", () => {
  const content = "<script>alert('not executed')</script>\n2 ss smør";
  assert.equal(createRecipe({ ...values, content }).content, content);
});
