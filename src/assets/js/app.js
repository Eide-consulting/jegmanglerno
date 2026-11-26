const searchForm = document.querySelector("#search-form");
if (searchForm) {
  const search = document.querySelector("#recipe-search");
  const cards = [...document.querySelectorAll(".published-card")];
  const filters = [...document.querySelectorAll(".filter-chip")];
  const status = document.querySelector("#search-status");
  let selectedIngredient = "";

  const normalize = (value) => value.normalize("NFKC").toLocaleLowerCase("nb").trim();
  function filterRecipes() {
    const query = normalize(search.value);
    const words = query.split(/\s+/).filter(Boolean);
    let count = 0;
    for (const card of cards) {
      const searchable = normalize(card.dataset.search);
      const matches = words.every((word) => searchable.includes(word)) &&
        (!selectedIngredient || normalize(card.dataset.missing) === selectedIngredient);
      card.hidden = !matches;
      if (matches) count++;
    }
    document.querySelector("#no-recipes").hidden = count !== 0;
    status.hidden = !query && !selectedIngredient;
    status.textContent = `${count} ${count === 1 ? "oppskrift" : "oppskrifter"} funnet.`;
    for (const button of filters) {
      const active = normalize(button.dataset.filter) === selectedIngredient;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    }
  }
  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    filterRecipes();
  });
  search.addEventListener("input", filterRecipes);
  for (const button of filters) {
    button.addEventListener("click", () => {
      selectedIngredient = normalize(button.dataset.filter);
      search.value = "";
      filterRecipes();
    });
  }
  document.querySelector("#reset-search").addEventListener("click", () => {
    selectedIngredient = "";
    search.value = "";
    filterRecipes();
    search.focus();
  });
}

document.querySelector("#print-recipe")?.addEventListener("click", () => window.print());
