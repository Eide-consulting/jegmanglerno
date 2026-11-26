export function slugify(title) {
  return title.toLocaleLowerCase("nb")
    .replace(/æ/g, "ae").replace(/ø/g, "o").replace(/å/g, "a")
    .normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function validateRecipe(recipe) {
  if (!recipe || typeof recipe !== "object") throw new TypeError("Oppskriften må være et objekt.");
  for (const [field, max] of [["title", 120], ["slug", 120], ["missingIngredient", 60], ["description", 300], ["category", 60], ["content", 30000]]) {
    if (typeof recipe[field] !== "string" || !recipe[field].trim() || recipe[field].length > max) {
      throw new TypeError(`Feltet «${field}» må være tekst med 1–${max} tegn.`);
    }
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(recipe.slug)) throw new TypeError("Nettadressen må bare inneholde små bokstaver a–z, tall og bindestreker.");
  for (const field of ["minutes", "servings"]) {
    if (!Number.isInteger(recipe[field]) || recipe[field] < 1 || recipe[field] > 1440) throw new TypeError(`Feltet «${field}» må være et heltall mellom 1 og 1440.`);
  }
  if (!["kitchen", "pancakes", "muffins"].includes(recipe.illustration)) throw new TypeError("Velg en av de tilgjengelige illustrasjonene.");
  return recipe;
}

export function createRecipe(values) {
  return validateRecipe({
    title: values.title.trim(),
    slug: values.slug.trim(),
    missingIngredient: values.missingIngredient.trim().toLocaleLowerCase("nb"),
    description: values.description.trim(),
    category: values.category.trim(),
    minutes: Number(values.minutes),
    servings: Number(values.servings),
    illustration: values.illustration,
    content: values.content.trim(),
  });
}
