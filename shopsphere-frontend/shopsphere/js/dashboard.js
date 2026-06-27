/* ==========================================================================
   ShopSphere — Admin Dashboard Logic
   This is a frontend-only mock of the admin views described in the PRD.
   In the Django version, every render() below becomes a GET to a real
   admin-only API endpoint (e.g. GET /api/admin/stats), protected by
   a permission check that the logged-in user is staff.
   ========================================================================== */

const DashData = {
  // Mock customers — in the real backend this is the Users table.
  customers: [
    { id: 1, name: "Priya Sharma", email: "priya@example.com", orders: 4, joined: "2026-02-11" },
    { id: 2, name: "Arjun Mehta", email: "arjun@example.com", orders: 2, joined: "2026-03-04" },
    { id: 3, name: "Kavya Reddy", email: "kavya@example.com", orders: 7, joined: "2026-01-20" },
    { id: 4, name: "Rohan Gupta", email: "rohan@example.com", orders: 1, joined: "2026-05-02" }
  ],

  // Mock admin order list (separate from the visitor's own real orders,
  // so the dashboard always has something to display for the demo)
  mockOrders: [
    { id: "ORD10293", customer: "Priya Sharma", total: 4499, status: "Delivered", date: "2026-06-20" },
    { id: "ORD10294", customer: "Arjun Mehta", total: 7798, status: "Shipped", date: "2026-06-22" },
    { id: "ORD10295", customer: "Kavya Reddy", total: 1599, status: "Pending", date: "2026-06-24" },
    { id: "ORD10296", customer: "Rohan Gupta", total: 3899, status: "Cancelled", date: "2026-06-25" }
  ]
};

function renderOverview() {
  const totalUsers = DashData.customers.length + 1208;
  const totalOrders = DashData.mockOrders.length + Store.getOrders().length + 3940;
  const totalRevenue = DashData.mockOrders.reduce((s, o) => s + o.total, 0) + 1842300;
  const totalProducts = PRODUCTS.length;
  const lowStockProducts = PRODUCTS.filter(p => p.stock > 0 && p.stock <= 5);

  return `
    <div class="section-head"><div><h2>Dashboard overview</h2><p class="sub">Snapshot of store performance</p></div></div>

    <div class="stat-cards">
      <div class="stat-card">
        <div class="label">Total users</div>
        <div class="value">${totalUsers.toLocaleString("en-IN")}</div>
        <div class="delta">+12.4% this month</div>
      </div>
      <div class="stat-card">
        <div class="label">Total orders</div>
        <div class="value">${totalOrders.toLocaleString("en-IN")}</div>
        <div class="delta">+8.1% this month</div>
      </div>
      <div class="stat-card">
        <div class="label">Total revenue</div>
        <div class="value">${UI.formatPrice(totalRevenue)}</div>
        <div class="delta">+15.7% this month</div>
      </div>
      <div class="stat-card">
        <div class="label">Total products</div>
        <div class="value">${totalProducts}</div>
        <div class="delta down">${lowStockProducts.length} low on stock</div>
      </div>
    </div>

    <div class="form-card">
      <h3>Low stock alerts</h3>
      ${lowStockProducts.length === 0 ? `<p style="color:var(--gray); font-size:0.9rem;">All products are well stocked.</p>` : `
        <table class="data-table">
          <thead><tr><th>Product</th><th>Category</th><th>Stock left</th><th></th></tr></thead>
          <tbody>
            ${lowStockProducts.map(p => `
              <tr>
                <td>${p.name}</td>
                <td>${p.category}</td>
                <td><span class="status-pill cancelled">${p.stock} left</span></td>
                <td class="table-actions"><button data-restock="${p.id}">Restock</button></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `}
    </div>
  `;
}

function renderProductsTab() {
  return `
    <div class="section-head">
      <div><h2>Products</h2><p class="sub">${PRODUCTS.length} products in catalog</p></div>
      <button class="btn btn-accent btn-sm" id="add-product-btn">+ Add product</button>
    </div>

    <table class="data-table">
      <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Rating</th><th></th></tr></thead>
      <tbody>
        ${PRODUCTS.map(p => `
          <tr>
            <td style="display:flex; align-items:center; gap:10px;">
              <img src="${p.image}" alt="" style="width:36px;height:36px;border-radius:6px;object-fit:cover;">
              ${p.name}
            </td>
            <td>${p.category}</td>
            <td>${UI.formatPrice(p.price)}</td>
            <td>
              ${p.stock === 0 ? '<span class="status-pill cancelled">Out of stock</span>' :
                p.stock <= 5 ? `<span class="status-pill pending">${p.stock} left</span>` :
                `${p.stock} in stock`}
            </td>
            <td>${p.rating} ★</td>
            <td class="table-actions">
              <button data-edit-product="${p.id}">Edit</button>
              <button data-delete-product="${p.id}" style="color:var(--danger);">Delete</button>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function renderOrdersTab() {
  const statusClass = { Pending: "pending", Shipped: "shipped", Delivered: "delivered", Cancelled: "cancelled" };
  return `
    <div class="section-head"><div><h2>Orders</h2><p class="sub">Manage and update order status</p></div></div>

    <table class="data-table">
      <thead><tr><th>Order ID</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th><th></th></tr></thead>
      <tbody>
        ${DashData.mockOrders.map(o => `
          <tr>
            <td><strong>${o.id}</strong></td>
            <td>${o.customer}</td>
            <td>${new Date(o.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</td>
            <td>${UI.formatPrice(o.total)}</td>
            <td><span class="status-pill ${statusClass[o.status]}">${o.status}</span></td>
            <td class="table-actions">
              <button data-advance-order="${o.id}">Mark next status</button>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function renderCustomersTab() {
  return `
    <div class="section-head"><div><h2>Customers</h2><p class="sub">${DashData.customers.length} registered customers (demo data)</p></div></div>

    <table class="data-table">
      <thead><tr><th>Name</th><th>Email</th><th>Orders placed</th><th>Joined</th></tr></thead>
      <tbody>
        ${DashData.customers.map(c => `
          <tr>
            <td>${c.name}</td>
            <td>${c.email}</td>
            <td>${c.orders}</td>
            <td>${new Date(c.joined).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

const TAB_RENDERERS = {
  overview: renderOverview,
  products: renderProductsTab,
  orders: renderOrdersTab,
  customers: renderCustomersTab
};

const ORDER_STATUS_FLOW = ["Pending", "Shipped", "Delivered"];

function loadDashTab(tabName) {
  const dashMain = document.getElementById("dash-main");
  dashMain.innerHTML = TAB_RENDERERS[tabName]();

  document.querySelectorAll("[data-dash-tab]").forEach(link => {
    link.classList.toggle("active", link.dataset.dashTab === tabName);
  });

  // Wire up demo-only interactive buttons (no real persistence needed —
  // these illustrate the admin actions described in the PRD)
  dashMain.querySelectorAll("[data-advance-order]").forEach(btn => {
    btn.addEventListener("click", () => {
      const order = DashData.mockOrders.find(o => o.id === btn.dataset.advanceOrder);
      const currentIndex = ORDER_STATUS_FLOW.indexOf(order.status);
      if (currentIndex >= 0 && currentIndex < ORDER_STATUS_FLOW.length - 1) {
        order.status = ORDER_STATUS_FLOW[currentIndex + 1];
        UI.toast(`${order.id} marked as ${order.status}`, "success");
        loadDashTab("orders");
      } else {
        UI.toast("Order is already delivered", "success");
      }
    });
  });

  dashMain.querySelectorAll("[data-delete-product]").forEach(btn => {
    btn.addEventListener("click", () => UI.toast("Demo mode: connect Django backend to persist deletes", "error"));
  });
  dashMain.querySelectorAll("[data-edit-product]").forEach(btn => {
    btn.addEventListener("click", () => UI.toast("Demo mode: connect Django backend to persist edits", "error"));
  });
  const addBtn = dashMain.querySelector("#add-product-btn");
  if (addBtn) addBtn.addEventListener("click", () => UI.toast("Demo mode: connect Django backend to persist new products", "error"));
  dashMain.querySelectorAll("[data-restock]").forEach(btn => {
    btn.addEventListener("click", () => UI.toast("Demo mode: connect Django backend to update stock", "error"));
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadDashTab("overview");
  document.querySelectorAll("[data-dash-tab]").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      loadDashTab(link.dataset.dashTab);
    });
  });
});
