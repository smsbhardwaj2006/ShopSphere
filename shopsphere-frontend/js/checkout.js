/* ==========================================================================
   ShopSphere — Checkout Page Logic
   In the Django version this becomes POST /api/orders (creates Order +
   OrderItem rows in a single transaction). Here we simulate that by
   writing an "order" object into localStorage.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("checkout-root");
  const items = Cart.getItemsWithProducts();

  if (items.length === 0) {
    root.innerHTML = `
      <div class="empty-state">
        <div class="emoji">🛒</div>
        <h3>Your cart is empty</h3>
        <p>Add something to your cart before checking out.</p>
        <br>
        <a href="shop.html" class="btn btn-accent">Browse products</a>
      </div>
    `;
    return;
  }

  const subtotal = Cart.subtotal();
  const shipping = subtotal > 2000 ? 0 : 99;
  const total = subtotal + shipping;
  const user = Store.getUser();

  root.innerHTML = `
    <div class="section-head"><div><h2>Checkout</h2></div></div>

    <div class="checkout-steps">
      <div class="checkout-step active"><span class="num">1</span> Delivery address</div>
      <div class="checkout-step"><span class="num">2</span> Payment</div>
      <div class="checkout-step"><span class="num">3</span> Confirmation</div>
    </div>

    <div class="checkout-layout">
      <form id="checkout-form" novalidate>
        <div class="form-card">
          <h3>Delivery address</h3>
          <div class="form-row">
            <div class="form-field">
              <label for="full-name">Full name</label>
              <input type="text" id="full-name" value="${user ? user.name : ''}" required>
              <div class="error-msg"></div>
            </div>
            <div class="form-field">
              <label for="phone">Phone number</label>
              <input type="tel" id="phone" placeholder="10-digit mobile number" required>
              <div class="error-msg"></div>
            </div>
          </div>
          <div class="form-row single">
            <div class="form-field">
              <label for="address-line">Address</label>
              <input type="text" id="address-line" placeholder="House no., street, area" required>
              <div class="error-msg"></div>
            </div>
          </div>
          <div class="form-row">
            <div class="form-field">
              <label for="city">City</label>
              <input type="text" id="city" required>
              <div class="error-msg"></div>
            </div>
            <div class="form-field">
              <label for="pincode">Pincode</label>
              <input type="text" id="pincode" placeholder="6-digit pincode" required>
              <div class="error-msg"></div>
            </div>
          </div>
        </div>

        <div class="form-card">
          <h3>Payment method</h3>
          <label class="payment-option selected">
            <input type="radio" name="payment" value="cod" checked>
            <div>
              <div style="font-weight:600; font-size:0.9rem;">Cash on Delivery</div>
              <div style="font-size:0.78rem; color:var(--gray);">Pay when your order arrives</div>
            </div>
          </label>
          <label class="payment-option">
            <input type="radio" name="payment" value="card" disabled>
            <div>
              <div style="font-weight:600; font-size:0.9rem;">Card / UPI (Coming Soon)</div>
              <div style="font-size:0.78rem; color:var(--gray);">To get the order at the earliest</div>
            </div>
          </label>
        </div>

        <button type="submit" class="btn btn-accent btn-block" id="place-order-btn">Place order · ${UI.formatPrice(total)}</button>
      </form>

      <div class="summary-card">
        <h3 style="margin-bottom:18px;">Order summary</h3>
        ${items.map(item => `
          <div class="summary-row">
            <span>${item.product.name} × ${item.qty}</span>
            <span>${UI.formatPrice(item.product.price * item.qty)}</span>
          </div>
        `).join("")}
        <div class="summary-row"><span>Subtotal</span><span>${UI.formatPrice(subtotal)}</span></div>
        <div class="summary-row"><span>Shipping</span><span>${shipping === 0 ? "Free" : UI.formatPrice(shipping)}</span></div>
        <div class="summary-row total"><span>Total</span><span>${UI.formatPrice(total)}</span></div>
      </div>
    </div>
  `;

  // Payment option highlight
  root.querySelectorAll('input[name="payment"]').forEach(radio => {
    radio.addEventListener("change", () => {
      root.querySelectorAll(".payment-option").forEach(el => el.classList.remove("selected"));
      radio.closest(".payment-option").classList.add("selected");
    });
  });

  // Validation + submit
  const form = document.getElementById("checkout-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let valid = true;

    const fields = [
      { id: "full-name", check: v => v.trim().length >= 2, msg: "Enter your full name." },
      { id: "phone", check: v => /^\d{10}$/.test(v.trim()), msg: "Enter a valid 10-digit phone number." },
      { id: "address-line", check: v => v.trim().length >= 5, msg: "Enter a complete address." },
      { id: "city", check: v => v.trim().length >= 2, msg: "Enter your city." },
      { id: "pincode", check: v => /^\d{6}$/.test(v.trim()), msg: "Enter a valid 6-digit pincode." }
    ];

    fields.forEach(f => {
      const input = document.getElementById(f.id);
      const errorEl = input.closest(".form-field").querySelector(".error-msg");
      if (!f.check(input.value)) {
        errorEl.textContent = f.msg;
        input.style.borderColor = "var(--danger)";
        valid = false;
      } else {
        errorEl.textContent = "";
        input.style.borderColor = "";
      }
    });

    if (!valid) {
      UI.toast("Please fix the highlighted fields", "error");
      return;
    }

    // "Place order": create an order record + clear cart (simulated backend write)
    const order = {
      id: "ORD" + Date.now().toString().slice(-8),
      date: new Date().toISOString(),
      items: items.map(i => ({ name: i.product.name, qty: i.qty, price: i.product.price })),
      total,
      status: "Pending",
      address: {
        name: document.getElementById("full-name").value,
        phone: document.getElementById("phone").value,
        line: document.getElementById("address-line").value,
        city: document.getElementById("city").value,
        pincode: document.getElementById("pincode").value
      },
      payment: "Cash on Delivery"
    };

    const orders = Store.getOrders();
    orders.unshift(order);
    Store.setOrders(orders);
    Cart.clear();

    window.location.href = "order-confirmation.html?id=" + order.id;
  });
});
