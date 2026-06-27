"""
Seeds the database with sample categories and products so the API has
something to return immediately after migrating — no need to manually
create products via Postman before you can test GET /api/products.

Run with: python manage.py seed_products

The data here intentionally mirrors shopsphere-frontend/js/data.js so the
two halves of the project describe the same catalog, even though they're
not wired together yet.
"""

from django.core.management.base import BaseCommand
from products.models import Category, Product

CATEGORIES = ["Electronics", "Fashion", "Home", "Sports", "Beauty", "Books"]

PRODUCTS = [
    {"name": "Aero Wireless Headphones", "category": "Electronics", "price": 4499, "stock": 14,
     "description": "Over-ear wireless headphones with active noise cancellation, 40-hour battery life, and a foldable design built for daily commutes and travel."},
    {"name": "Pulse Smart Watch", "category": "Electronics", "price": 6999, "stock": 8,
     "description": "Track workouts, heart rate, and sleep with a vivid AMOLED display and 10-day battery life. Water resistant to 50m."},
    {"name": "Canvas Weekender Bag", "category": "Fashion", "price": 2199, "stock": 22,
     "description": "Durable waxed canvas weekender with leather trim, a padded laptop sleeve, and a detachable shoulder strap."},
    {"name": "Minimalist Leather Wallet", "category": "Fashion", "price": 899, "stock": 3,
     "description": "Slim full-grain leather wallet with 6 card slots and a hidden cash pocket."},
    {"name": "Ceramic Pour-Over Set", "category": "Home", "price": 1599, "stock": 17,
     "description": "Hand-glazed ceramic pour-over coffee dripper with matching carafe."},
    {"name": "Linen Throw Pillow Cover", "category": "Home", "price": 549, "stock": 30,
     "description": "Pre-washed European linen cover with a hidden zip closure, machine washable."},
    {"name": "Trail Running Shoes", "category": "Sports", "price": 3899, "stock": 11,
     "description": "Grippy lugged outsole and breathable mesh upper built for technical trails."},
    {"name": "Adjustable Dumbbell Set", "category": "Sports", "price": 5499, "stock": 6,
     "description": "Space-saving adjustable dumbbells, 5–25kg per side, with a quick dial-lock system."},
    {"name": "Organic Skincare Trio", "category": "Beauty", "price": 1299, "stock": 19,
     "description": "Cleanser, serum, and moisturizer made with organic botanicals, fragrance-free."},
    {"name": "Matte Lipstick Set", "category": "Beauty", "price": 799, "stock": 25,
     "description": "Long-wear matte lipstick trio in everyday shades, transfer-resistant."},
    {"name": "The Art of Clean Code", "category": "Books", "price": 649, "stock": 40,
     "description": "A practical guide to writing maintainable software with real-world examples."},
    {"name": "Modular Desk Organizer", "category": "Home", "price": 1099, "stock": 2,
     "description": "Stackable bamboo desk organizer with modular trays for pens, cables, and notebooks."},
]


class Command(BaseCommand):
    help = "Seeds sample categories and products into the database."

    def handle(self, *args, **options):
        category_map = {}
        for name in CATEGORIES:
            category, created = Category.objects.get_or_create(name=name)
            category_map[name] = category
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created category: {name}"))

        created_count = 0
        for p in PRODUCTS:
            _, created = Product.objects.get_or_create(
                name=p["name"],
                defaults={
                    "description": p["description"],
                    "price": p["price"],
                    "stock": p["stock"],
                    "category": category_map[p["category"]],
                },
            )
            if created:
                created_count += 1

        self.stdout.write(self.style.SUCCESS(
            f"Done. {created_count} new products created (existing ones skipped)."
        ))
