/* ==========================================================================
   ShopSphere — Shop Page Logic
   Reads URL params (?category=, ?q=) on load, then filters/sorts client-side.
   In the Django version, this becomes a real GET /api/products?... call.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const initialCategory = params.get("category") || "";
  const initialQuery = params.get("q") || "";

  // Build category filter options
  const categoryFiltersEl = document.getElementById("category-filters");
  categoryFiltersEl.innerHTML = CATEGORIES.map(c => `
    <label class="filter-option">
      <input type="radio" name="category" value="${c.name}" ${c.name === initialCategory ? "checked" : ""}>
      ${c.emoji} ${c.name}
    </label>
  `).join("");

  if (!initialCategory) {
    document.querySelector('input[name="category"][value=""]').checked = true;
  }

  // Pre-fill search box with query param, if any
  const searchInput = document.querySelector("[data-site-search]");
  if (searchInput && initialQuery) searchInput.value = initialQuery;

  function getFilters() {
    const category = document.querySelector('input[name="category"]:checked')?.value || "";
    const minPrice = parseFloat(document.getElementById("price-min").value) || 0;
    const maxPrice = parseFloat(document.getElementById("price-max").value) || Infinity;
    const minRating = parseFloat(document.querySelector('input[name="rating"]:checked')?.value || "0");
    const query = (searchInput?.value || "").trim().toLowerCase();
    const sort = document.getElementById("sort-select").value;
    return { category, minPrice, maxPrice, minRating, query, sort };
  }

  function applyFilters() {
    const { category, minPrice, maxPrice, minRating, query, sort } = getFilters();

    let results = PRODUCTS.filter(p => {
      if (category && p.category !== category) return false;
      if (p.price < minPrice || p.price > maxPrice) return false;
      if (p.rating < minRating) return false;
      if (query && !p.name.toLowerCase().includes(query) && !p.category.toLowerCase().includes(query)) return false;
      return true;
    });

    switch (sort) {
      case "price-asc": results.sort((a, b) => a.price - b.price); break;
      case "price-desc": results.sort((a, b) => b.price - a.price); break;
      case "rating-desc": results.sort((a, b) => b.rating - a.rating); break;
      case "name-asc": results.sort((a, b) => a.name.localeCompare(b.name)); break;
    }

    renderProductGrid(document.getElementById("shop-grid"), results);
    document.getElementById("result-count").textContent =
      `${results.length} product${results.length === 1 ? "" : "s"} found`;
    document.getElementById("results-summary").textContent =
      category ? `Browsing: ${category}` : (query ? `Results for "${query}"` : "Browse our full catalog");
  }

  // Wire up every filter control to re-run applyFilters on change
  document.querySelectorAll('input[name="category"], input[name="rating"]').forEach(el =>
    el.addEventListener("change", applyFilters)
  );
  document.getElementById("price-min").addEventListener("input", applyFilters);
  document.getElementById("price-max").addEventListener("input", applyFilters);
  document.getElementById("sort-select").addEventListener("change", applyFilters);
  if (searchInput) searchInput.addEventListener("input", applyFilters);

  document.getElementById("clear-filters").addEventListener("click", () => {
    document.querySelector('input[name="category"][value=""]').checked = true;
    document.querySelector('input[name="rating"][value="0"]').checked = true;
    document.getElementById("price-min").value = "";
    document.getElementById("price-max").value = "";
    document.getElementById("sort-select").value = "default";
    if (searchInput) searchInput.value = "";
    applyFilters();
  });

  applyFilters();
});
