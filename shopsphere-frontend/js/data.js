/* ==========================================================================
   ShopSphere — Product Data
   In the real PRD this comes from Django + MySQL via /api/products.
   Here it's a plain JS array so the site works with zero backend/install.
   ========================================================================== */

const PRODUCTS = [
  {
    id: 1, name: "Aero Wireless Headphones", category: "Electronics", price: 4499, oldPrice: 5999,
    stock: 14, rating: 4.6, reviewCount: 128, isNew: true,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600"
    ],
    description: "Over-ear wireless headphones with active noise cancellation, 40-hour battery life, and a foldable design built for daily commutes and travel."
  },
  {
    id: 2, name: "Pulse Smart Watch", category: "Electronics", price: 6999, oldPrice: null,
    stock: 8, rating: 4.4, reviewCount: 89, isNew: false,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
    images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600"],
    description: "Track workouts, heart rate, and sleep with a vivid AMOLED display and 10-day battery life. Water resistant to 50m."
  },
  {
    id: 3, name: "Canvas Weekender Bag", category: "Fashion", price: 2199, oldPrice: 2799,
    stock: 22, rating: 4.7, reviewCount: 64, isNew: false,
    image: "https://images.unsplash.com/photo-1547949003-9792a18a2645?w=600",
    images: ["https://images.unsplash.com/photo-1547949003-9792a18a2645?w=600"],
    description: "Durable waxed canvas weekender with leather trim, a padded laptop sleeve, and a detachable shoulder strap."
  },
  {
    id: 4, name: "Minimalist Leather Wallet", category: "Fashion", price: 899, oldPrice: null,
    stock: 3, rating: 4.5, reviewCount: 41, isNew: false,
    image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600",
    images: ["https://images.unsplash.com/photo-1627123424574-724758594e93?w=600"],
    description: "Slim full-grain leather wallet with 6 card slots and a hidden cash pocket. Ages beautifully over time."
  },
  {
    id: 5, name: "Ceramic Pour-Over Set", category: "Home", price: 1599, oldPrice: 1899,
    stock: 17, rating: 4.8, reviewCount: 102, isNew: true,
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600",
    images: ["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600"],
    description: "Hand-glazed ceramic pour-over coffee dripper with matching carafe. Pairs with any standard #2 paper filter."
  },
  {
    id: 6, name: "Linen Throw Pillow Cover", category: "Home", price: 549, oldPrice: null,
    stock: 30, rating: 4.3, reviewCount: 36, isNew: false,
    image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600",
    images: ["https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600"],
    description: "Pre-washed European linen cover with a hidden zip closure. Machine washable, softens with every wash."
  },
  {
    id: 7, name: "Trail Running Shoes", category: "Sports", price: 3899, oldPrice: 4599,
    stock: 11, rating: 4.6, reviewCount: 77, isNew: false,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600"],
    description: "Grippy lugged outsole and a breathable mesh upper built for technical trails and wet conditions."
  },
  {
    id: 8, name: "Adjustable Dumbbell Set", category: "Sports", price: 5499, oldPrice: null,
    stock: 6, rating: 4.5, reviewCount: 53, isNew: false,
    image: "https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?w=600",
    images: ["https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?w=600"],
    description: "Space-saving adjustable dumbbells, 5–25kg per side, with a quick dial-lock weight change system."
  },
  {
    id: 9, name: "Organic Skincare Trio", category: "Beauty", price: 1299, oldPrice: 1599,
    stock: 19, rating: 4.7, reviewCount: 95, isNew: true,
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600",
    images: ["https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600"],
    description: "Cleanser, serum, and moisturizer set made with organic botanicals. Fragrance-free, suitable for sensitive skin."
  },
  {
    id: 10, name: "Matte Lipstick Set", category: "Beauty", price: 799, oldPrice: null,
    stock: 25, rating: 4.2, reviewCount: 48, isNew: false,
    image: "https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=600",
    images: ["https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=600"],
    description: "Long-wear matte lipstick trio in everyday shades. Transfer-resistant and free of parabens."
  },
  {
    id: 11, name: "The Art of Clean Code", category: "Books", price: 649, oldPrice: 799,
    stock: 40, rating: 4.9, reviewCount: 210, isNew: false,
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600",
    images: ["https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600"],
    description: "A practical guide to writing maintainable software, packed with real-world before-and-after examples."
  },
  {
    id: 12, name: "Modular Desk Organizer", category: "Home", price: 1099, oldPrice: null,
    stock: 2, rating: 4.4, reviewCount: 29, isNew: false,
    image: "https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=600",
    images: ["https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=600"],
    description: "Stackable bamboo desk organizer with modular trays for pens, cables, and notebooks."
  }
];

const CATEGORIES = [
  { name: "Electronics", emoji: "🎧" },
  { name: "Fashion", emoji: "👜" },
  { name: "Home", emoji: "🏠" },
  { name: "Sports", emoji: "🏃" },
  { name: "Beauty", emoji: "💄" },
  { name: "Books", emoji: "📚" }
];

const REVIEWS = {
  1: [
    { author: "Priya S.", rating: 5, date: "2026-05-12", text: "Battery life is exactly as advertised. Comfortable even after 4+ hour calls." },
    { author: "Arjun M.", rating: 4, date: "2026-04-29", text: "Great sound, noise cancellation could be slightly stronger on flights." }
  ],
  5: [
    { author: "Kavya R.", rating: 5, date: "2026-05-20", text: "Looks gorgeous on the counter and makes genuinely better coffee than my old dripper." }
  ]
};
