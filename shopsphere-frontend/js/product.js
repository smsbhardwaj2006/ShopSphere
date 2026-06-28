/* ==========================================================================
   ShopSphere — Product Detail Page Logic
   Reads ?id= from URL. In Django version: GET /api/products/{id}
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const productId = parseInt(params.get("id"));
  const product = PRODUCTS.find(p => p.id === productId);
  const root = document.getElementById("product-root");

  if (!product) {
    root.innerHTML = `
      <div class="empty-state">
        <div class="emoji">📦</div>
        <h3>Product not found</h3>
        <p>This item may have been removed.</p>
        <br>
        <a href="shop.html" class="btn btn-accent">Back to shop</a>
      </div>
    `;
    return;
  }

  document.title = `${product.name} — ShopSphere`;

  let qty = 1;
  const lowStock = product.stock > 0 && product.stock <= 5;
  const outOfStock = product.stock === 0;
  const reviews = REVIEWS[product.id] || [];

  root.innerHTML = `
    <div class="product-detail">
      <div>
        <div class="pd-gallery-main">
          <img src="${product.images[0]}" alt="${product.name}" id="pd-main-img">
        </div>
        ${product.images.length > 1 ? `
          <div class="pd-thumbs">
            ${product.images.map((img, i) => `
              <div class="thumb ${i === 0 ? 'active' : ''}" data-thumb-src="${img}">
                <img src="${img}" alt="">
              </div>
            `).join("")}
          </div>
        ` : ""}
      </div>

      <div>
        <div class="pd-category">${product.category}</div>
        <h1 class="pd-title">${product.name}</h1>

        <div class="pd-meta">
          <span class="product-rating">
            <span class="stars">${UI.renderStars(product.rating)}</span>
            <span>${product.rating} (${product.reviewCount} reviews)</span>
          </span>
          <span class="pd-stock ${lowStock ? 'low' : ''}">
            ${outOfStock ? "Out of stock" : (lowStock ? `Only ${product.stock} left` : "In stock")}
          </span>
        </div>

        <div class="pd-price">
          ${UI.formatPrice(product.price)}
          ${product.oldPrice ? `<span class="old" style="font-size:1.1rem;">${UI.formatPrice(product.oldPrice)}</span>` : ""}
        </div>

        <p class="pd-desc">${product.description}</p>

        <div class="qty-selector">
          <button id="qty-minus" aria-label="Decrease quantity">−</button>
          <span id="qty-value">1</span>
          <button id="qty-plus" aria-label="Increase quantity">+</button>
        </div>

        <div class="pd-actions">
          <button class="btn btn-accent" id="add-to-cart-btn" ${outOfStock ? "disabled" : ""}>
            ${outOfStock ? "Out of stock" : "Add to cart"}
          </button>
          <button class="icon-btn wishlist-btn ${Wishlist.has(product.id) ? 'active' : ''}" id="pd-wishlist-btn" style="width:48px;height:48px;background:var(--white);box-shadow:var(--shadow-sm);" aria-label="Toggle wishlist">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="${Wishlist.has(product.id) ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>
          </button>
        </div>

        <div class="pd-tabs">
          <div class="pd-tab-headers">
            <button class="active" data-tab="reviews">Reviews (${reviews.length})</button>
            <button data-tab="shipping">Shipping &amp; Returns</button>
          </div>
          <div data-tab-panel="reviews">
            ${reviews.length === 0 ? `<p style="color:var(--gray); font-size:0.9rem;">No reviews yet — be the first to review this product.</p>` : reviews.map(r => `
              <div class="review-item">
                <div class="review-head">
                  <span class="review-author">${r.author}</span>
                  <span class="review-date">${r.date}</span>
                </div>
                <div class="review-stars">${UI.renderStars(r.rating)}</div>
                <p class="review-text">${r.text}</p>
              </div>
            `).join("")}
          </div>
          <div data-tab-panel="shipping" style="display:none;">
            <p style="color:var(--gray); font-size:0.9rem; line-height:1.7;">
              Standard delivery in 3–5 business days. Free returns within 14 days of delivery, item must be unused and in original packaging.
            </p>
          </div>
        </div>
      </div>
    </div>
  `;

  // Thumbnail gallery
  root.querySelectorAll("[data-thumb-src]").forEach(thumb => {
    thumb.addEventListener("click", () => {
      document.getElementById("pd-main-img").src = thumb.dataset.thumbSrc;
      root.querySelectorAll(".thumb").forEach(t => t.classList.remove("active"));
      thumb.classList.add("active");
    });
  });

  // Quantity selector
  document.getElementById("qty-plus").addEventListener("click", () => {
    if (qty < product.stock) { qty++; document.getElementById("qty-value").textContent = qty; }
  });
  document.getElementById("qty-minus").addEventListener("click", () => {
    if (qty > 1) { qty--; document.getElementById("qty-value").textContent = qty; }
  });

  // Add to cart
  const addBtn = document.getElementById("add-to-cart-btn");
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      Cart.add(product.id, qty);
      UI.toast(`${qty} × ${product.name} added to cart`, "success");
    });
  }

  // Wishlist toggle
  document.getElementById("pd-wishlist-btn").addEventListener("click", (e) => {
    const btn = e.currentTarget;
    const nowActive = Wishlist.toggle(product.id);
    btn.classList.toggle("active", nowActive);
    btn.querySelector("svg").setAttribute("fill", nowActive ? "currentColor" : "none");
    UI.toast(nowActive ? "Added to wishlist" : "Removed from wishlist", "success");
  });

  // Tabs
  root.querySelectorAll("[data-tab]").forEach(tabBtn => {
    tabBtn.addEventListener("click", () => {
      root.querySelectorAll("[data-tab]").forEach(b => b.classList.remove("active"));
      tabBtn.classList.add("active");
      root.querySelectorAll("[data-tab-panel]").forEach(panel => {
        panel.style.display = panel.dataset.tabPanel === tabBtn.dataset.tab ? "block" : "none";
      });
    });
  });

  // Related products (same category, excluding current)
  const related = PRODUCTS.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
  const relatedFallback = related.length > 0 ? related : PRODUCTS.filter(p => p.id !== product.id).slice(0, 4);
  renderProductGrid(document.getElementById("related-grid"), relatedFallback);
});
