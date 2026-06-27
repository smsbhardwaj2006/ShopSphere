# ShopSphere — Frontend Prototype

A frontend prototype of **ShopSphere**, a full-stack e-commerce platform. Built with plain **HTML, CSS, and JavaScript** — no frameworks, no build step, no install required. Just open `index.html` in a browser.

> **Status:** This is the frontend-only prototype. The full PRD (see `PRD.md` or original doc) specs a React + Django REST Framework + MySQL/MongoDB backend, which is the next phase of this build. Cart, login, and orders currently persist in browser `localStorage`, not a real database — this is intentional, to make the UI fully demoable with zero setup.

## What's implemented

- **Home page** — hero, category browsing, featured & new-arrival product grids
- **Shop page** — search, category filter, price range filter, rating filter, sorting
- **Product detail page** — image gallery, quantity selector, add to cart, wishlist, reviews tab
- **Cart** — add/remove/update quantity, live subtotal & shipping calculation
- **Checkout** — address form with validation, Cash on Delivery, order confirmation
- **Auth (demo)** — register/login stored in `localStorage` (not real password hashing — see note below)
- **Account page** — order history
- **Wishlist**
- **Admin dashboard** — overview stats, product table, order status management, customer table

## What's intentionally not real yet

- No backend server, no database — `js/data.js` is a hardcoded product list standing in for `GET /api/products`
- "Login" is browser storage only, not secure — a real implementation needs Django + JWT + password hashing (per the PRD)
- Admin actions (edit/delete product, restock) show a toast instead of persisting, since there's no backend to persist to

## Folder structure

```
shopsphere/
├── index.html              Home page
├── shop.html                All products + filters
├── product.html              Single product detail
├── cart.html                  Shopping cart
├── checkout.html               Checkout + address form
├── order-confirmation.html      Post-checkout confirmation
├── login.html / register.html    Auth pages
├── account.html                   Order history
├── wishlist.html                   Saved products
├── dashboard.html                   Admin panel
├── css/style.css                     All styling
└── js/
    ├── data.js          Product/category/review data (mock "database")
    ├── app.js           Cart, wishlist, auth, toast, shared header logic
    ├── layout.js        Injects shared header/footer HTML on every page
    ├── products-render.js   Shared product card rendering
    ├── shop.js          Shop page filter/sort logic
    ├── product.js       Product detail page logic
    ├── cart.js          Cart page logic
    ├── checkout.js      Checkout form + order placement
    └── dashboard.js     Admin dashboard logic
```

## Deploying this to the internet

Pre-configured for **Vercel** (`vercel.json`) and **Netlify** (`netlify.toml`) — either works for a static site like this, pick one. `js/config.js` holds the single place to point at your deployed backend URL once you have one. Full click-by-click steps are in `DEPLOYMENT_RUNBOOK.md` in the `deployment` zip.

## Running it

No install needed:

```bash
# Just open index.html in a browser, or for a local server:
python -m http.server 8000
# then visit http://localhost:8000
```

## Next steps (per PRD)

1. Build Django REST Framework backend (User, Product, Order models)
2. Replace `js/data.js` mock calls with real `fetch()` calls to the Django API
3. Replace localStorage auth with JWT-based authentication
4. Add MongoDB for reviews/activity logs (optional — see PRD section 7)
5. Deploy: frontend → Vercel/Netlify, backend → Railway/Render
