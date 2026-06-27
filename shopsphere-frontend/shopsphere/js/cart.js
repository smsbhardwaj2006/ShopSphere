/* ==========================================================================
   ShopSphere — Cart Page Logic
   ========================================================================== */

function renderCartPage() {
  const root = document.getElementById("cart-root");
  const items = Cart.getItemsWithProducts();

  if (items.length === 0) {
    root.innerHTML = `
      <div class="empty-state">
        <div class="emoji">🛒</div>
        <h3>Your cart is empty</h3>
        <p>Looks like you haven't added anything yet.</p>
        <br>
        <a href="shop.html" class="btn btn-accent">Start shopping</a>
      </div>
    `;
    return;
  }

  const subtotal = Cart.subtotal();
  const shipping = subtotal > 2000 ? 0 : 99;
  const total = subtotal + shipping;

  root.innerHTML = `
    <div class="cart-layout">
      <div>
        ${items.map(item => `
          <div class="cart-item" data-cart-item="${item.productId}">
            <img src="${item.product.image}" alt="${item.product.name}">
            <div>
              <div class="cart-item-name">${item.product.name}</div>
              <div class="cart-item-cat">${item.product.category}</div>
              <a href="#" class="cart-item-remove" data-remove="${item.productId}">Remove</a>
            </div>
            <div class="qty-selector">
              <button data-qty-minus="${item.productId}" aria-label="Decrease quantity">−</button>
              <span>${item.qty}</span>
              <button data-qty-plus="${item.productId}" aria-label="Increase quantity">+</button>
            </div>
            <div class="price">${UI.formatPrice(item.product.price * item.qty)}</div>
          </div>
        `).join("")}
      </div>

      <div class="summary-card">
        <h3 style="margin-bottom:18px;">Order summary</h3>
        <div class="summary-row"><span>Subtotal</span><span>${UI.formatPrice(subtotal)}</span></div>
        <div class="summary-row"><span>Shipping</span><span>${shipping === 0 ? "Free" : UI.formatPrice(shipping)}</span></div>
        ${shipping > 0 ? `<p style="font-size:0.78rem; color:var(--gray);">Add ${UI.formatPrice(2000 - subtotal)} more for free shipping</p>` : ""}
        <div class="summary-row total"><span>Total</span><span>${UI.formatPrice(total)}</span></div>
        <a href="checkout.html" class="btn btn-accent btn-block" style="margin-top:18px;">Proceed to checkout</a>
        <a href="shop.html" class="btn btn-outline btn-block" style="margin-top:10px;">Continue shopping</a>
      </div>
    </div>
  `;

  // Quantity + and -
  root.querySelectorAll("[data-qty-plus]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.dataset.qtyPlus);
      const item = Cart.getItemsWithProducts().find(i => i.productId === id);
      if (item && item.qty < item.product.stock) {
        Cart.updateQty(id, item.qty + 1);
        renderCartPage();
      } else {
        UI.toast("No more stock available", "error");
      }
    });
  });

  root.querySelectorAll("[data-qty-minus]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.dataset.qtyMinus);
      const item = Cart.getItemsWithProducts().find(i => i.productId === id);
      if (item && item.qty > 1) {
        Cart.updateQty(id, item.qty - 1);
        renderCartPage();
      }
    });
  });

  // Remove
  root.querySelectorAll("[data-remove]").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      Cart.remove(parseInt(link.dataset.remove));
      UI.toast("Item removed from cart", "success");
      renderCartPage();
    });
  });
}

document.addEventListener("DOMContentLoaded", renderCartPage);
