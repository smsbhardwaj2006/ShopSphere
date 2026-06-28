/* ==========================================================================
   ShopSphere — Product Rendering Helpers
   Shared by index.html, shop.html, wishlist.html
   ========================================================================== */

function productCardHTML(p) {
  const isWishlisted = Wishlist.has(p.id);
  const lowStock = p.stock > 0 && p.stock <= 5;
  const outOfStock = p.stock === 0;

  return `
    <div class="product-card" data-product-id="${p.id}">
      <a href="product.html?id=${p.id}" class="product-thumb">
        ${p.isNew ? '<span class="badge new">New</span>' : (lowStock ? '<span class="badge low-stock">Low stock</span>' : '')}
        <img src="${p.image}" alt="${p.name}" loading="lazy">
      </a>
      <button class="wishlist-btn ${isWishlisted ? 'active' : ''}" data-wishlist-toggle="${p.id}" aria-label="Toggle wishlist">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="${isWishlisted ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>
      </button>
      <div class="product-info">
        <a href="product.html?id=${p.id}">
          <div class="product-category">${p.category}</div>
          <div class="product-name">${p.name}</div>
        </a>
        <div class="product-rating">
          <span class="stars">${UI.renderStars(p.rating)}</span>
          <span>${p.rating} (${p.reviewCount})</span>
        </div>
        <div class="product-footer">
          <div class="price">${UI.formatPrice(p.price)}${p.oldPrice ? `<span class="old">${UI.formatPrice(p.oldPrice)}</span>` : ''}</div>
          <button class="add-cart-btn" data-add-to-cart="${p.id}" ${outOfStock ? 'disabled' : ''} aria-label="Add to cart">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg>
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderProductGrid(container, products) {
  if (!container) return;

  if (products.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1;">
        <div class="emoji">🔍</div>
        <h3>No products found</h3>
        <p>Try adjusting your filters or search term.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = products.map(productCardHTML).join("");

  container.querySelectorAll("[data-add-to-cart]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const id = parseInt(btn.dataset.addToCart);
      Cart.add(id, 1);
      const product = PRODUCTS.find(p => p.id === id);
      UI.toast(`${product.name} added to cart`, "success");
    });
  });

  container.querySelectorAll("[data-wishlist-toggle]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const id = parseInt(btn.dataset.wishlistToggle);
      const nowActive = Wishlist.toggle(id);
      btn.classList.toggle("active", nowActive);
      btn.querySelector("svg").setAttribute("fill", nowActive ? "currentColor" : "none");
      UI.toast(nowActive ? "Added to wishlist" : "Removed from wishlist", "success");
    });
  });
}

function renderCategoryStrip(container) {
  if (!container) return;
  container.innerHTML = CATEGORIES.map(c => `
    <a href="shop.html?category=${encodeURIComponent(c.name)}" class="category-chip">
      <span class="emoji">${c.emoji}</span>
      <span>${c.name}</span>
    </a>
  `).join("");
}
