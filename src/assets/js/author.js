import { createRecipe, slugify } from "./recipe-tools.js";

const authorForm = document.querySelector("#author-form");
const title = document.querySelector("#recipe-title");
const slug = document.querySelector("#recipe-slug");
const status = document.querySelector("#author-status");
const preview = document.querySelector("#author-preview");
let slugEdited = false;

title.addEventListener("input", () => {
  if (!slugEdited) slug.value = slugify(title.value);
});
slug.addEventListener("input", () => { slugEdited = true; });

function readRecipe() {
  const values = Object.fromEntries(new FormData(authorForm));
  return createRecipe(values);
}

function showPreview(recipe) {
  document.querySelector("#preview-title").textContent = recipe.title;
  document.querySelector("#preview-description").textContent = recipe.description;
  document.querySelector("#preview-meta").textContent = `Uten ${recipe.missingIngredient} · ${recipe.minutes} min · ${recipe.servings} porsjoner`;
  document.querySelector("#preview-content").textContent = recipe.content;
  preview.hidden = false;
}

document.querySelector("#preview-button").addEventListener("click", () => {
  if (!authorForm.reportValidity()) return;
  try {
    showPreview(readRecipe());
    status.hidden = true;
  } catch (error) {
    if (!(error instanceof TypeError)) throw error;
    status.textContent = error.message;
    status.hidden = false;
  }
});

authorForm.addEventListener("submit", (event) => {
  event.preventDefault();
  let recipe;
  try {
    recipe = readRecipe();
  } catch (error) {
    if (!(error instanceof TypeError)) throw error;
    status.textContent = error.message;
    status.hidden = false;
    return;
  }
  showPreview(recipe);
  const blob = new Blob([`${JSON.stringify(recipe, null, 2)}\n`], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${recipe.slug}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  status.textContent = `Filen «${recipe.slug}.json» er klargjort for nedlasting. Lagre den i src/recipes/ og bygg siden for å publisere. Oppskriften er ikke publisert ennå.`;
  status.hidden = false;
});
