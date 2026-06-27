# ShopSphere — Backend (Django REST Framework + MySQL)

Implements the PRD's backend: user auth (JWT), products, cart, orders, and reviews, backed by MySQL.

## ⚠️ Important: how this was built and what that means for you

This code was written without a live Django/MySQL environment available to test against (no network access in the build sandbox). Every file passed a **Python syntax check** (`py_compile`) and a **manual review of every cross-app import** to confirm names match up — but it has **not been run end-to-end** the way the frontend was. Treat this as carefully-written code that needs you to run through the steps below and verify it works on your machine, not as something pre-validated. If something breaks on first run, that's expected for a project this size — debugging it yourself is also genuinely good interview prep ("tell me about a bug you fixed").

## Tech stack

- Django 5 + Django REST Framework
- `djangorestframework-simplejwt` for JWT authentication
- MySQL (via `mysqlclient`)
- `django-cors-headers` so the separate frontend can call this API from the browser
- `django-filter` for product search/filter query params

## Deploying this to the internet

This backend is pre-configured for deployment to **Railway** (Procfile, `runtime.txt`, production-safe settings via `DATABASE_URL`, gunicorn, whitenoise). For exact click-by-click steps, see `DEPLOYMENT_RUNBOOK.md` in the separate `deployment` zip — it covers both this backend (Railway) and the frontend (Vercel), plus how to connect them via CORS.

## Setup

```bash
# 1. Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Create the MySQL database (run inside the mysql client)
mysql -u root -p
CREATE DATABASE shopsphere CHARACTER SET utf8mb4;
exit

# 4. Configure environment variables
cp .env.example .env
# then edit .env and fill in your real DB_PASSWORD (and other values if needed)

# 5. Run migrations
python manage.py makemigrations
python manage.py migrate

# 6. Create an admin (staff) user for Django admin + admin-only endpoints
python manage.py createsuperuser

# 7. (Optional) Seed sample products so /api/products returns data immediately
python manage.py seed_products

# 8. Run the dev server
python manage.py runserver
```

The API is now at `http://localhost:8000/api/`. Django admin is at `http://localhost:8000/admin/`.

## Running the tests

```bash
python manage.py test
```

Tests exist for the two highest-risk areas: registration/login (`users/tests.py`) and order placement (`orders/tests.py` — covers the cart→order transaction, stock decrement, insufficient-stock rejection, and cancellation/restock). Run these first if you only have time to verify one thing.

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/register` | — | Create account |
| POST | `/api/login` | — | Get JWT access + refresh tokens |
| POST | `/api/login/refresh` | — | Refresh an expired access token |
| POST | `/api/logout` | ✓ | Logout (client discards tokens) |
| GET/PUT | `/api/profile` | ✓ | View/edit your own profile |
| GET | `/api/products` | — | List products (supports `?search=`, `?category=`, `?min_price=`, `?max_price=`, `?ordering=`) |
| POST | `/api/products` | ✓ staff | Create product |
| GET | `/api/products/{id}` | — | Product detail |
| PUT/DELETE | `/api/products/{id}` | ✓ staff | Update/delete product |
| GET | `/api/categories` | — | List categories |
| GET | `/api/cart` | ✓ | Your cart |
| POST | `/api/cart` | ✓ | Add item `{product_id, quantity}` |
| DELETE | `/api/cart?product_id=` | ✓ | Remove one item, or clear if no param |
| GET | `/api/orders` | ✓ | Your past orders |
| POST | `/api/orders` | ✓ | Place order from your current cart |
| GET | `/api/orders/{id}` | ✓ | Order detail (only your own) |
| POST | `/api/orders/{id}/cancel` | ✓ | Cancel (only if still pending) |
| GET | `/api/admin/orders` | ✓ staff | All orders |
| PUT | `/api/admin/orders/{id}/status` | ✓ staff | Update order status |
| POST | `/api/reviews` | ✓ | Add a review |
| GET | `/api/reviews/{product_id}` | — | Reviews for a product |
| PUT/DELETE | `/api/reviews/{id}/detail` | ✓ owner | Edit/delete your own review |

JWT auth: send `Authorization: Bearer <access_token>` header on protected routes. Get the token from `/api/login`.

## Design decisions worth knowing for an interview

- **Why MySQL only, not MySQL + MongoDB (per original PRD):** see the docstring at the top of `reviews/models.py`. Short version — the PRD's "MongoDB data" (reviews, search history) has a clean relational shape, and running two databases adds real complexity without a strong technical reason at this scale.
- **Why `OrderItem` is a separate table from `Order`:** see the docstring at the top of `orders/models.py`. One order, many product lines — this is standard normalization.
- **Why order placement uses `transaction.atomic()`:** see the docstring at the top of `orders/views.py`. Creating the order, creating order items, and decrementing stock must all succeed together or all fail together.
- **Why `OrderItem` snapshots `product_name`/`price_at_purchase` instead of just linking to `Product`:** an order is a historical record — if the admin changes a product's price next month, past invoices must not silently change.
- **Why a custom `User` model:** the PRD's Users table logs in by email, not username — see `users/models.py`.

## Folder structure

```
backend/
├── manage.py
├── requirements.txt
├── .env.example
├── config/          settings, root urls, wsgi/asgi
├── users/           custom User model, register/login/JWT, profile
├── products/        Category, Product, search/filter, seed command
├── cart/             Cart, CartItem — always scoped to request.user
├── orders/           Order, OrderItem, Payment — the atomic checkout transaction
└── reviews/          Review (kept in MySQL — see design decision above)
```

## Connecting the frontend

The `shopsphere-frontend` zip currently uses `js/data.js` (hardcoded) and `localStorage` instead of calling this API. To wire them together, the main change is in the frontend's JS files: replace direct `PRODUCTS` array lookups and `Store.get/set` calls with `fetch()` calls to these endpoints, storing the JWT token instead of the fake `shopsphere_user` object. That wiring isn't done in this zip — it's a reasonable next step once you've confirmed this backend runs correctly on its own.
