/**
 * MealDash Demo Seed Script
 * --------------------------
 * Run from the backend/ directory:
 *   node src/seed.js
 *
 * Inserts 2 demo restaurants, their menus, and 9 food items
 * owned by Manas Sidh (existing restaurant-owner account).
 *
 * Safe to re-run: skips documents that already exist.
 */

require("dotenv").config({ path: "./src/config/config.env" });

const mongoose = require("mongoose");
const { DB_NAME } = require("./constant");

//Import Models
const Restaurant = require("./models/restaurant.model");
const Menu = require("./models/menu.model");
const FoodItem = require("./models/foodItem.model");

//Fixed IDs (so re-runs are idempotent)
const OWNER_ID = new mongoose.Types.ObjectId("69c4d940fe35b8d682cef2ef"); // Manas Sidh

const IDS = {
  // Restaurants
  spiceGarden:  new mongoose.Types.ObjectId("67fb4a1c2d3e4f5a6b7c8d01"),
  greenBowl:    new mongoose.Types.ObjectId("67fb4a1c2d3e4f5a6b7c8d02"),
  // Menus
  menuSpice:    new mongoose.Types.ObjectId("67fb4a1c2d3e4f5a6b7c8d20"),
  menuGreen:    new mongoose.Types.ObjectId("67fb4a1c2d3e4f5a6b7c8d21"),
  // Food Items — Spice Garden
  butterChicken:    new mongoose.Types.ObjectId("67fb4a1c2d3e4f5a6b7c8d10"),
  dalMakhani:       new mongoose.Types.ObjectId("67fb4a1c2d3e4f5a6b7c8d11"),
  biryani:          new mongoose.Types.ObjectId("67fb4a1c2d3e4f5a6b7c8d12"),
  garlicNaan:       new mongoose.Types.ObjectId("67fb4a1c2d3e4f5a6b7c8d13"),
  mangoLassi:       new mongoose.Types.ObjectId("67fb4a1c2d3e4f5a6b7c8d14"),
  // Food Items — Green Bowl
  quinoaBowl:       new mongoose.Types.ObjectId("67fb4a1c2d3e4f5a6b7c8d15"),
  falafelWrap:      new mongoose.Types.ObjectId("67fb4a1c2d3e4f5a6b7c8d16"),
  gardenSalad:      new mongoose.Types.ObjectId("67fb4a1c2d3e4f5a6b7c8d17"),
  coldPressedJuice: new mongoose.Types.ObjectId("67fb4a1c2d3e4f5a6b7c8d18"),
};

// Seed Data 

const foodItems = [
  // Spice Garden
  {
    _id: IDS.butterChicken,
    name: "Butter Chicken",
    description: "Tender chicken in a rich, creamy tomato-based gravy. Served with naan.",
    category: "Main Course",
    price: 299,
    image: {
      public_id: "mealdash/food-items/butter_chicken",
      url: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600",
    },
    isAvailable: true,
    stock: 40,
    menu: IDS.menuSpice,
    restaurant: IDS.spiceGarden,
    reviews: [],
  },
  {
    _id: IDS.dalMakhani,
    name: "Dal Makhani",
    description: "Slow-cooked black lentils simmered overnight in butter and cream.",
    category: "Main Course",
    price: 199,
    image: {
      public_id: "mealdash/food-items/dal_makhani",
      url: "https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=600",
    },
    isAvailable: true,
    stock: 50,
    menu: IDS.menuSpice,
    restaurant: IDS.spiceGarden,
    reviews: [],
  },
  {
    _id: IDS.biryani,
    name: "Chicken Biryani",
    description: "Fragrant basmati rice layered with spiced chicken, saffron and caramelized onions.",
    category: "Biryani & Rice",
    price: 349,
    image: {
      public_id: "mealdash/food-items/chicken_biryani",
      url: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600",
    },
    isAvailable: true,
    stock: 30,
    menu: IDS.menuSpice,
    restaurant: IDS.spiceGarden,
    reviews: [],
  },
  {
    _id: IDS.garlicNaan,
    name: "Garlic Naan",
    description: "Soft leavened flatbread topped with garlic butter and fresh coriander.",
    category: "Breads",
    price: 59,
    image: {
      public_id: "mealdash/food-items/garlic_naan",
      url: "https://images.unsplash.com/photo-1574484284002-952d92456975?w=600",
    },
    isAvailable: true,
    stock: 100,
    menu: IDS.menuSpice,
    restaurant: IDS.spiceGarden,
    reviews: [],
  },
  {
    _id: IDS.mangoLassi,
    name: "Mango Lassi",
    description: "Chilled thick yogurt drink blended with ripe Alphonso mangoes.",
    category: "Drinks",
    price: 99,
    image: {
      public_id: "mealdash/food-items/mango_lassi",
      url: "https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=600",
    },
    isAvailable: true,
    stock: 80,
    menu: IDS.menuSpice,
    restaurant: IDS.spiceGarden,
    reviews: [],
  },
  //The Green Bowl
  {
    _id: IDS.quinoaBowl,
    name: "Quinoa Power Bowl",
    description: "Quinoa, roasted chickpeas, avocado, cherry tomatoes and tahini dressing.",
    category: "Bowls",
    price: 279,
    image: {
      public_id: "mealdash/food-items/quinoa_bowl",
      url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600",
    },
    isAvailable: true,
    stock: 35,
    menu: IDS.menuGreen,
    restaurant: IDS.greenBowl,
    reviews: [],
  },
  {
    _id: IDS.falafelWrap,
    name: "Falafel Wrap",
    description: "Crispy falafel, hummus, pickled veggies, and harissa in a whole wheat wrap.",
    category: "Wraps",
    price: 199,
    image: {
      public_id: "mealdash/food-items/falafel_wrap",
      url: "https://images.unsplash.com/photo-1542574271-7f3b92e6c821?w=600",
    },
    isAvailable: true,
    stock: 45,
    menu: IDS.menuGreen,
    restaurant: IDS.greenBowl,
    reviews: [],
  },
  {
    _id: IDS.gardenSalad,
    name: "Garden Salad",
    description: "Fresh greens, cucumber, cherry tomatoes, olives and balsamic vinaigrette.",
    category: "Salads",
    price: 149,
    image: {
      public_id: "mealdash/food-items/garden_salad",
      url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600",
    },
    isAvailable: true,
    stock: 60,
    menu: IDS.menuGreen,
    restaurant: IDS.greenBowl,
    reviews: [],
  },
  {
    _id: IDS.coldPressedJuice,
    name: "Cold Pressed Juice",
    description: "Seasonal fruits and vegetables cold-pressed to retain maximum nutrients.",
    category: "Drinks",
    price: 129,
    image: {
      public_id: "mealdash/food-items/cold_pressed_juice",
      url: "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=600",
    },
    isAvailable: true,
    stock: 50,
    menu: IDS.menuGreen,
    restaurant: IDS.greenBowl,
    reviews: [],
  },
];

const menus = [
  {
    _id: IDS.menuSpice,
    restaurant: IDS.spiceGarden,
    menu: [
      { category: "Main Course",    items: [IDS.butterChicken, IDS.dalMakhani] },
      { category: "Biryani & Rice", items: [IDS.biryani] },
      { category: "Breads",         items: [IDS.garlicNaan] },
      { category: "Drinks",         items: [IDS.mangoLassi] },
    ],
  },
  {
    _id: IDS.menuGreen,
    restaurant: IDS.greenBowl,
    menu: [
      { category: "Bowls",   items: [IDS.quinoaBowl] },
      { category: "Wraps",   items: [IDS.falafelWrap] },
      { category: "Salads",  items: [IDS.gardenSalad] },
      { category: "Drinks",  items: [IDS.coldPressedJuice] },
    ],
  },
];

const restaurants = [
  {
    _id: IDS.spiceGarden,
    owner: OWNER_ID,
    name: "Spice Garden",
    description: "Authentic North Indian cuisine with rich curries, tandoor specials and biryanis.",
    isVegetarian: false,
    address: "12 MG Road, Connaught Place, New Delhi, 110001",
    openingHours: "11:00 AM - 11:00 PM",
    location: { type: "Point", coordinates: [77.209, 28.6139] },
    noOfReviews: 0,
    rating: 0,
    reviews: [],
    images: [
      {
        public_id: "mealdash/restaurants/spice_garden_main",
        url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
      },
    ],
  },
  {
    _id: IDS.greenBowl,
    owner: OWNER_ID,
    name: "The Green Bowl",
    description: "100% plant-based restaurant serving healthy salads, wraps and grain bowls.",
    isVegetarian: true,
    address: "45 Jubilee Hills, Hyderabad, 500033",
    openingHours: "9:00 AM - 9:00 PM",
    location: { type: "Point", coordinates: [78.4072, 17.4065] },
    noOfReviews: 0,
    rating: 0,
    reviews: [],
    images: [
      {
        public_id: "mealdash/restaurants/green_bowl_main",
        url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800",
      },
    ],
  },
];

//Helpers

async function upsertMany(Model, docs) {
  let inserted = 0;
  let skipped = 0;
  for (const doc of docs) {
    const exists = await Model.exists({ _id: doc._id });
    if (exists) {
      console.log(`  ⏭  Skipped (already exists): ${doc.name || doc._id}`);
      skipped++;
    } else {
      await Model.create(doc);
      console.log(`  ✅ Inserted: ${doc.name || doc._id}`);
      inserted++;
    }
  }
  return { inserted, skipped };
}

// Main

async function seed() {
  const uri = process.env.MONGO_URI+DB_NAME ;
  console.log("\n🌱 Connecting to MongoDB...");
  await mongoose.connect(uri);
  console.log("✅ Connected!\n");

  // 1. Food Items first (menus + restaurants reference these)
  console.log("📦 Seeding FoodItems...");
  const fi = await upsertMany(FoodItem, foodItems);

  // 2. Menus
  console.log("\n📋 Seeding Menus...");
  const mn = await upsertMany(Menu, menus);

  // 3. Restaurants last
  console.log("\n🏪 Seeding Restaurants...");
  const rs = await upsertMany(Restaurant, restaurants);

  // ── Summary ──
  console.log("\n─────────────────────────────────");
  console.log("🎉 Seed complete!");
  console.log(`   FoodItems:   ${fi.inserted} inserted, ${fi.skipped} skipped`);
  console.log(`   Menus:       ${mn.inserted} inserted, ${mn.skipped} skipped`);
  console.log(`   Restaurants: ${rs.inserted} inserted, ${rs.skipped} skipped`);
  console.log("─────────────────────────────────\n");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  mongoose.disconnect();
  process.exit(1);
});
