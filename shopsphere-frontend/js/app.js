/* ==========================================================================
   ShopSphere — App Core
   Shared logic used on every page: cart, wishlist, fake-auth, toasts, header.
   Uses localStorage so cart/login state persists across page navigation
   (but it's still just browser storage, not a real backend/database).
   ========================================================================== */

const Store = {
  KEYS: { CART: "shopsphere_cart", WISHLIST: "shopsphere_wishlist", USER: "shopsphere_user", ORDERS: "shopsphere_orders" },

  get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  },

  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },

  getCart() { return this.get(this.KEYS.CART, []); },
  setCart(cart) { this.set(this.KEYS.CART, cart); },

  getWishlist() { return this.get(this.KEYS.WISHLIST, []); },
  setWishlist(list) { this.set(this.KEYS.WISHLIST, list); },

  getUser() { return this.get(this.KEYS.USER, null); },
  setUser(user) { this.set(this.KEYS.USER, user); },
  clearUser() { localStorage.removeItem(this.KEYS.USER); },

  getOrders() { return this.get(this.KEYS.ORDERS, []); },
  setOrders(orders) { this.set(this.KEYS.ORDERS, orders); }
};

const Cart = {
  add(productId, qty = 1) {
    const cart = Store.getCart();
    const existing = cart.find(item => item.productId === productId);
    if (existing) {
      existing.qty += qty;
    } else {
      cart.push({ productId, qty });
    }
    Store.setCart(cart);
    UI.bumpCartBadge();
    UI.updateCartBadge();
  },

  remove(productId) {
    const cart = Store.getCart().filter(item => item.productId !== productId);
    Store.setCart(cart);
    UI.updateCartBadge();
  },

  updateQty(productId, qty) {
    const cart = Store.getCart();
    const item = cart.find(i => i.productId === productId);
    if (!item) return;
    item.qty = Math.max(1, qty);
    Store.setCart(cart);
    UI.updateCartBadge();
  },

  getItemsWithProducts() {
    return Store.getCart().map(item => {
      const product = PRODUCTS.find(p => p.id === item.productId);
      return product ? { ...item, product } : null;
    }).filter(Boolean);
  },

  count() {
    return Store.getCart().reduce((sum, item) => sum + item.qty, 0);
  },

  subtotal() {
    return this.getItemsWithProducts().reduce((sum, item) => sum + item.product.price * item.qty, 0);
  },

  clear() { Store.setCart([]); UI.updateCartBadge(); }
};

const Wishlist = {
  toggle(productId) {
    let list = Store.getWishlist();
    if (list.includes(productId)) {
      list = list.filter(id => id !== productId);
    } else {
      list.push(productId);
    }
    Store.setWishlist(list);
    return list.includes(productId);
  },
  has(productId) { return Store.getWishlist().includes(productId); },
  getProducts() { return Store.getWishlist().map(id => PRODUCTS.find(p => p.id === id)).filter(Boolean); }
};

const Auth = {
  isLoggedIn() { return !!Store.getUser(); },

  register(name, email, password) {
    // Demo-only "auth": stores user in localStorage, no real backend/hashing.
    // The Django phase of this project replaces this with real JWT auth.
    const users = Store.get("shopsphere_users", []);
    if (users.find(u => u.email === email)) {
      return { ok: false, error: "An account with this email already exists." };
    }
    users.push({ name, email, password });
    Store.set("shopsphere_users", users);
    Store.setUser({ name, email });
    return { ok: true };
  },

  login(email, password) {
    const users = Store.get("shopsphere_users", []);
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return { ok: false, error: "Incorrect email or password." };
    Store.setUser({ name: user.name, email: user.email });
    return { ok: true };
  },

  logout() {
    Store.clearUser();
    window.location.href = "index.html";
  }
};

const UI = {
  formatPrice(amount) {
    return "₹" + amount.toLocaleString("en-IN");
  },

  renderStars(rating) {
    const full = Math.round(rating);
    return "★".repeat(full) + "☆".repeat(5 - full);
  },

  updateCartBadge() {
    document.querySelectorAll(".cart-badge").forEach(el => {
      el.textContent = Cart.count();
      el.style.display = Cart.count() > 0 ? "flex" : "none";
    });
  },

  bumpCartBadge() {
    document.querySelectorAll(".cart-badge").forEach(el => {
      el.classList.add("bump");
      setTimeout(() => el.classList.remove("bump"), 300);
    });
  },

  toast(message, type = "success") {
    let el = document.getElementById("toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "toast";
      document.body.appendChild(el);
    }
    el.className = "toast " + type;
    el.textContent = message;
    requestAnimationFrame(() => el.classList.add("show"));
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
  },

  refreshAuthUI() {
    const user = Store.getUser();
    document.querySelectorAll("[data-auth-slot]").forEach(slot => {
      if (user) {
        slot.innerHTML = `<a href="account.html" class="icon-btn" title="${user.name}" aria-label="Account">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>
        </a>`;
      } else {
        slot.innerHTML = `<a href="login.html" class="icon-btn" title="Sign in" aria-label="Sign in">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>
        </a>`;
      }
    });
  },

  highlightActiveNav() {
    const current = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".main-nav a").forEach(a => {
      if (a.getAttribute("href") === current) a.classList.add("active");
    });
  }
};

document.addEventListener("DOMContentLoaded", () => {
  UI.updateCartBadge();
  UI.refreshAuthUI();
  UI.highlightActiveNav();

  // Wire up the header search box (present on every page) to go to shop.html?q=
  const searchInput = document.querySelector("[data-site-search]");
  if (searchInput) {
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && searchInput.value.trim()) {
        window.location.href = "shop.html?q=" + encodeURIComponent(searchInput.value.trim());
      }
    });
  }
});
