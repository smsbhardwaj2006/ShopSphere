/* ==========================================================================
   ShopSphere — Shared Header & Footer
   Plain HTML/CSS/JS has no native "include" system, so this is the
   standard workaround: write the header/footer once, inject via JS.
   ========================================================================== */

function renderLayout() {
  const headerEl = document.getElementById("site-header");
  const footerEl = document.getElementById("site-footer");

  if (headerEl) {
    headerEl.innerHTML = `
      <div class="container">
        <a href="index.html" class="logo">Shop<span>Sphere</span></a>

        <nav class="main-nav" aria-label="Main navigation">
          <a href="index.html">Home</a>
          <a href="shop.html">Shop</a>
          <a href="cart.html">Cart</a>
          <a href="dashboard.html">Admin</a>
        </nav>

        <div class="header-actions">
          <div class="search-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
            <input type="text" placeholder="Search products…" data-site-search aria-label="Search products">
          </div>

          <a href="wishlist.html" class="icon-btn" aria-label="Wishlist">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>
          </a>

          <a href="cart.html" class="icon-btn" aria-label="Cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg>
            <span class="cart-badge">0</span>
          </a>

          <span data-auth-slot></span>
        </div>
      </div>
    `;
  }

  if (footerEl) {
    footerEl.innerHTML = `
      <div class="container">
        <div class="footer-grid">
          <div>
            <div class="logo">Shop<span>Sphere</span></div>
            <p>A modern marketplace built as a full-stack project.</p>
          </div>
          <div class="footer-col">
            <h4>Shop</h4>
            <a href="shop.html">All Products</a>
            <a href="shop.html">New Arrivals</a>
            <a href="wishlist.html">Wishlist</a>
          </div>
          <div class="footer-col">
            <h4>Account</h4>
            <a href="login.html">Sign In</a>
            <a href="register.html">Create Account</a>
            <a href="account.html">Order History</a>
          </div>
          <div class="footer-col">
            <h4>Project</h4>
            <a href="dashboard.html">Admin Dashboard</a>
            <a href="https://github.com" target="_blank" rel="noopener">View on GitHub</a>
          </div>
        </div>
        <div class="footer-bottom">
          <span>Developed with passion by Sahil Bhardwaj © 2026 ShopSphere.</span>
        </div>
      </div>
    `;
  }

  UI.updateCartBadge();
  UI.refreshAuthUI();
  UI.highlightActiveNav();
}

document.addEventListener("DOMContentLoaded", renderLayout);
