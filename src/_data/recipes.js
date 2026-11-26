import { readdirSync, readFileSync } from "node:fs";
import { validateRecipe } from "../assets/js/recipe-tools.js";

export default function () {
  const directory = new URL("../recipes/", import.meta.url);
  const slugs = new Set();
  return readdirSync(directory).filter((file) => file.endsWith(".json")).sort().map((file) => {
    const recipe = validateRecipe(JSON.parse(readFileSync(new URL(file, directory), "utf8")));
    if (slugs.has(recipe.slug)) throw new Error(`Flere oppskrifter har samme nettadresse: ${recipe.slug}`);
    slugs.add(recipe.slug);
    return recipe;
  });
}
