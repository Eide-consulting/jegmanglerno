import getRecipes from "./recipes.js";

export default function () {
  return [...new Set(getRecipes().map((recipe) => recipe.missingIngredient))].sort((a, b) => a.localeCompare(b, "nb"));
}
