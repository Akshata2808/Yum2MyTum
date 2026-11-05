export type Format = "restaurant" | "cloud" | "campus";

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  veg: boolean;
  bestseller?: boolean;
  section: string;
  emoji: string;
  image: string;
};

export type Kitchen = {
  slug: string;
  name: string;
  format: Format;
  cuisines: string[];
  rating: number;
  ratingCount: string;
  etaMins: number;
  distanceKm: number;
  costForTwo: number;
  area: string;
  promo?: string;
  tags: string[];
  emoji: string;
  gradient: string;
  cover: string;
  lat: number;
  lng: number;
  blurb: string;
  menu: MenuItem[];
};

export const formatLabels: Record<Format, string> = {
  restaurant: "Local restaurant",
  cloud: "Cloud kitchen",
  campus: "Campus outlet",
};

export const formatShort: Record<Format, string> = {
  restaurant: "Restaurants",
  cloud: "Cloud kitchens",
  campus: "Campus outlets",
};

export const cuisines = [
  "North Indian",
  "South Indian",
  "Biryani",
  "Chinese",
  "Burgers",
  "Pizza",
  "Rolls",
  "Healthy",
  "Desserts",
  "Coffee",
];

export const cuisineEmoji: Record<string, string> = {
  "North Indian": "🍛",
  "South Indian": "🥘",
  Biryani: "🍚",
  Chinese: "🥡",
  Burgers: "🍔",
  Pizza: "🍕",
  Rolls: "🌯",
  Healthy: "🥗",
  Desserts: "🍮",
  Coffee: "☕",
};

const PHOTO_BASE = "https://www.themealdb.com/images/media/meals/";
/** Real food photographs (TheMealDB), keyed by menu item id. */
const photos: Record<string, string> = {
  cc1: "xrttsx1487339558.jpg",
  cc2: "xrttsx1487339558.jpg",
  cc3: "xxpqsy1511452222.jpg",
  cc4: "yuwtuu1511295751.jpg",
  cc5: "lmc6r51764365554.jpg",
  cc6: "xqwwpy1483908697.jpg",
  ws1: "1529444830.jpg",
  ws2: "1529444113.jpg",
  ws3: "1525876468.jpg",
  ws4: "wuyd2h1765655837.jpg",
  ws5: "grhn401765687086.jpg",
  ws6: "twspvx1511784937.jpg",
  bc1: "adxcbq1619787919.jpg",
  bc2: "1529445893.jpg",
  bc3: "9kecho1784575366.jpg",
  bc4: "hqaejl1695738653.jpg",
  bc5: "xxpqsy1511452222.jpg",
  bc6: "xqqqtu1511637379.jpg",
  sb1: "lgmnff1763789847.jpg",
  sb2: "0r7y5n1782681336.jpg",
  sb3: "lwsnkl1604181187.jpg",
  sb4: "j223gc1784579841.jpg",
  sb5: "k29viq1585565980.jpg",
  sb6: "pjbaq11784731571.jpg",
  np1: "x0lk931587671540.jpg",
  np2: "lrfdwz1764438393.jpg",
  np3: "wspuvp1511303478.jpg",
  np4: "lmc6r51764365554.jpg",
  np5: "wvqpwt1468339226.jpg",
  np6: "uryqru1511798039.jpg",
  gq1: "k29viq1585565980.jpg",
  gq2: "zry07j1763779321.jpg",
  gq3: "u5e9qq1763795441.jpg",
  gq4: "pjbaq11784731571.jpg",
  gq5: "1544384070.jpg",
  gq6: "1525874812.jpg",
  rs1: "grhn401765687086.jpg",
  rs2: "04axct1763793018.jpg",
  rs3: "u5e9qq1763795441.jpg",
  rs4: "1550441882.jpg",
  rs5: "qptpvt1487339892.jpg",
  rs6: "1xscby1764790242.jpg",
  mm1: "1525872624.jpg",
  mm2: "xxpqsy1511452222.jpg",
  mm3: "xrttsx1487339558.jpg",
  mm4: "adxcbq1619787919.jpg",
  mm5: "1525873040.jpg",
  mm6: "u1gisz1784732667.jpg",
  mx1: "swttys1511385853.jpg",
  mx2: "xqrwyr1511133646.jpg",
  mx3: "9kecho1784575366.jpg",
  mx4: "yypvst1511386427.jpg",
  mx5: "76nffj1763593933.jpg",
  mx6: "as88dq1762772486.jpg",
  hh1: "ip5xtp1769779958.jpg",
  hh2: "lgmnff1763789847.jpg",
  hh3: "arzs741766434335.jpg",
  hh4: "j223gc1784579841.jpg",
  hh5: "f3cxnc1765656994.jpg",
  hh6: "pjbaq11784731571.jpg",
};

const m = (
  id: string,
  name: string,
  description: string,
  price: number,
  veg: boolean,
  section: string,
  emoji: string,
  bestseller = false,
): MenuItem => ({ id, name, description, price, veg, section, emoji, bestseller, image: PHOTO_BASE + (photos[id] ?? photos["cc1"]) });

const kitchenCoords: Record<string, [number, number]> = {
  "copper-clay-kitchen": [19.0596, 72.8295],
  "wokstreet-collective": [19.1364, 72.8296],
  "block-c-canteen": [19.0213, 72.871],
  "smashbox-burger-lab": [18.998, 72.8303],
  "napoli-lane": [18.9067, 72.8147],
  "green-quad-bowls": [19.0218, 72.8705],
  "the-roll-siding": [19.0178, 72.8478],
  "madras-meridian": [19.027, 72.8553],
  "midnight-mixer": [19.1176, 72.906],
  "hostel-hatch": [19.0209, 72.8716],
};

const rawKitchens: Omit<Kitchen, "cover" | "lat" | "lng">[] = [
  {
    slug: "copper-clay-kitchen",
    name: "Copper & Clay Kitchen",
    format: "restaurant",
    cuisines: ["North Indian", "Biryani"],
    rating: 4.6,
    ratingCount: "12.4K",
    etaMins: 32,
    distanceKm: 5.1,
    costForTwo: 650,
    area: "Bandra West",
    promo: "50% off up to ₹120",
    tags: ["Slow-cooked", "Family portions"],
    emoji: "🍛",
    gradient: "from-primary/25 via-accent to-lime/25",
    blurb:
      "Handi-cooked curries and dum biryanis from a 22-year-old family kitchen. Everything simmers in copper, nothing arrives lukewarm.",
    menu: [
      m("cc1", "Dum Handi Chicken Biryani", "Long-grain rice sealed with dough, saffron, fried onion", 349, false, "Biryani & rice", "🍚", true),
      m("cc2", "Kathal Biryani", "Jackfruit slow-cooked in whole spices, smoked with charcoal", 299, true, "Biryani & rice", "🍚"),
      m("cc3", "Butter Paneer Masala", "Tomato-cashew gravy, hand-churned butter, kasuri methi", 289, true, "Mains", "🧀", true),
      m("cc4", "Laal Maas", "Fiery Rajasthani mutton with mathania chillies", 429, false, "Mains", "🍖"),
      m("cc5", "Kulcha Basket", "Four stuffed kulchas, white butter, pickled onion", 179, true, "Breads", "🫓"),
      m("cc6", "Shahi Tukda", "Saffron-milk soaked brioche, pistachio crumb", 149, true, "Desserts", "🍮"),
    ],
  },
  {
    slug: "wokstreet-collective",
    name: "Wokstreet Collective",
    format: "cloud",
    cuisines: ["Chinese", "Rolls"],
    rating: 4.4,
    ratingCount: "8.1K",
    etaMins: 24,
    distanceKm: 9.8,
    costForTwo: 400,
    area: "Andheri West",
    promo: "Free Chilli Garlic Momos over ₹399",
    tags: ["Wok-fired", "Late night"],
    emoji: "🥡",
    gradient: "from-secondary/25 via-lime/20 to-accent",
    blurb:
      "A delivery-only wok bar running six burners till 2am. Sauces are made in small batches every morning.",
    menu: [
      m("ws1", "Burnt Garlic Hakka Noodles", "Wok-tossed with cabbage, spring onion, black pepper", 219, true, "Noodles", "🍜", true),
      m("ws2", "Chilli Chicken (Dry)", "Double-fried, tossed in fermented chilli paste", 269, false, "Starters", "🌶️", true),
      m("ws3", "Steamed Veg Momos", "Eight pieces, chive filling, roasted tomato chutney", 159, true, "Momos", "🥟"),
      m("ws4", "Chicken Schezwan Fried Rice", "Short grain rice, scrambled egg, house schezwan", 239, false, "Rice", "🍚"),
      m("ws5", "Paneer Chilli Roll", "Flaky lachha paratha, pickled onion, mayo drizzle", 189, true, "Rolls", "🌯"),
      m("ws6", "Dark Chocolate Bao", "Steamed bun, molten 62% chocolate", 129, true, "Desserts", "🍫"),
    ],
  },
  {
    slug: "block-c-canteen",
    name: "Vidyalankar Main Canteen",
    format: "campus",
    cuisines: ["South Indian", "Coffee"],
    rating: 4.2,
    ratingCount: "3.6K",
    etaMins: 14,
    distanceKm: 0.3,
    costForTwo: 180,
    area: "Vidyalankar (VIT), Wadala",
    promo: "Student pricing · flat ₹20 off",
    tags: ["Campus pickup", "Budget"],
    emoji: "☕",
    gradient: "from-lime/30 via-accent to-primary/15",
    blurb:
      "The canteen that runs on 7am filter coffee and 40-second dosa flips. Pickup counter sits right beside the VIT main building.",
    menu: [
      m("bc1", "Ghee Podi Dosa", "Crisp dosa, gunpowder, chutney trio", 99, true, "Tiffin", "🥞", true),
      m("bc2", "Mini Idli Sambar Bowl", "Eight buttery mini idlis drowned in sambar", 89, true, "Tiffin", "🍚"),
      m("bc3", "Filter Coffee (Tumbler)", "Chicory blend, frothed by hand", 39, true, "Beverages", "☕", true),
      m("bc4", "Masala Omelette Toast", "Three eggs, green chilli, butter toast", 79, false, "All day", "🍳"),
      m("bc5", "Campus Meal Combo", "Rice, two curries, rasam, curd, papad", 129, true, "All day", "🍱"),
      m("bc6", "Banana Halwa Cube", "Nendran banana, jaggery, ghee", 45, true, "Sweets", "🍮"),
    ],
  },
  {
    slug: "smashbox-burger-lab",
    name: "Smashbox Burger Lab",
    format: "cloud",
    cuisines: ["Burgers", "Healthy"],
    rating: 4.5,
    ratingCount: "9.9K",
    etaMins: 27,
    distanceKm: 6.2,
    costForTwo: 450,
    area: "Lower Parel",
    promo: "Buy 1 Get 1 on classics",
    tags: ["Smash patties", "Brioche baked daily"],
    emoji: "🍔",
    gradient: "from-primary/30 via-accent to-secondary/15",
    blurb:
      "Griddle-smashed patties pressed to order, potato buns steamed for nine seconds before they hit the box.",
    menu: [
      m("sb1", "Double Smash Classic", "Two beefy-style patties, cheese, pickles, house sauce", 329, false, "Burgers", "🍔", true),
      m("sb2", "Herb Mushroom Smash", "Portobello patty, truffle mayo, rocket", 289, true, "Burgers", "🍄"),
      m("sb3", "Crispy Chicken Katsu Burger", "Panko thigh, slaw, yuzu mayo", 309, false, "Burgers", "🐔", true),
      m("sb4", "Loaded Cheese Fries", "Beer cheese, jalapeño, crisp shallots", 179, true, "Sides", "🍟"),
      m("sb5", "Kale Crunch Salad", "Massaged kale, apple, toasted seeds, tahini", 249, true, "Greens", "🥗"),
      m("sb6", "Salted Caramel Shake", "Thick, spoon-standing, malted", 199, true, "Shakes", "🥤"),
    ],
  },
  {
    slug: "napoli-lane",
    name: "Napoli Lane Pizzeria",
    format: "restaurant",
    cuisines: ["Pizza", "Desserts"],
    rating: 4.7,
    ratingCount: "15.2K",
    etaMins: 38,
    distanceKm: 14.5,
    costForTwo: 900,
    area: "Colaba",
    promo: "20% off on orders above ₹599",
    tags: ["Wood-fired", "48h fermented dough"],
    emoji: "🍕",
    gradient: "from-accent via-lime/25 to-primary/20",
    blurb:
      "A twelve-table pizzeria with an imported oven that hits 480°C. Dough rests two days before it ever sees fire.",
    menu: [
      m("np1", "Margherita D.O.P.", "San Marzano, fior di latte, basil", 429, true, "Pizza", "🍕", true),
      m("np2", "Diavola Piccante", "Spicy salami, chilli honey, oregano", 549, false, "Pizza", "🌶️", true),
      m("np3", "Truffle Funghi Bianca", "White base, three mushrooms, taleggio", 599, true, "Pizza", "🍄"),
      m("np4", "Garlic Focaccia Sticks", "Rosemary, sea salt, marinara dip", 219, true, "Starters", "🥖"),
      m("np5", "Burrata & Peach Salad", "Basil oil, aged balsamic", 389, true, "Starters", "🥗"),
      m("np6", "Tiramisu Jar", "Mascarpone, espresso soak, cocoa", 229, true, "Desserts", "🍰"),
    ],
  },
  {
    slug: "green-quad-bowls",
    name: "VIT Bowls & Juice Corner",
    format: "campus",
    cuisines: ["Healthy", "Rolls"],
    rating: 4.3,
    ratingCount: "2.2K",
    etaMins: 16,
    distanceKm: 0.3,
    costForTwo: 260,
    area: "Vidyalankar (VIT), Wadala",
    promo: "Flat ₹49 off first campus order",
    tags: ["Macro-labelled", "Compostable boxes"],
    emoji: "🥗",
    gradient: "from-secondary/25 via-lime/30 to-accent",
    blurb:
      "Built for back-to-back lectures: protein bowls, wraps and cold-pressed juice assembled in under four minutes.",
    menu: [
      m("gq1", "Peri Chicken Power Bowl", "Brown rice, grilled thigh, corn salsa, 42g protein", 269, false, "Bowls", "🍗", true),
      m("gq2", "Rajma Quinoa Bowl", "Slow-cooked rajma, quinoa, mint yoghurt", 229, true, "Bowls", "🥣", true),
      m("gq3", "Hummus Falafel Wrap", "Whole wheat wrap, pickled slaw, tahini", 199, true, "Wraps", "🌯"),
      m("gq4", "Cold Pressed Green Juice", "Spinach, apple, cucumber, ginger", 129, true, "Drinks", "🥤"),
      m("gq5", "Peanut Protein Ladoo", "Two pieces, jaggery sweetened", 89, true, "Snacks", "🍡"),
      m("gq6", "Chilli Paneer Bowl", "Tossed paneer, sesame slaw, rice", 239, true, "Bowls", "🧀"),
    ],
  },
  {
    slug: "the-roll-siding",
    name: "The Roll Siding",
    format: "cloud",
    cuisines: ["Rolls", "North Indian"],
    rating: 4.1,
    ratingCount: "5.4K",
    etaMins: 21,
    distanceKm: 2.9,
    costForTwo: 300,
    area: "Dadar West",
    promo: "3 rolls for ₹399",
    tags: ["Kolkata-style", "Egg-first parathas"],
    emoji: "🌯",
    gradient: "from-primary/20 via-accent to-lime/20",
    blurb:
      "One griddle, one flame, rolls folded the Park Street way — egg cracked onto the paratha, never beside it.",
    menu: [
      m("rs1", "Double Egg Chicken Roll", "Two eggs, charred chicken, lime, green chilli", 199, false, "Rolls", "🌯", true),
      m("rs2", "Mutton Seekh Roll", "Hand-minced seekh, onion, chaat masala", 249, false, "Rolls", "🍢"),
      m("rs3", "Paneer Tikka Roll", "Char-marked paneer, mint mayo", 179, true, "Rolls", "🧀", true),
      m("rs4", "Aloo Kabli Cup", "Spiced potato, chickpeas, tamarind", 99, true, "Sides", "🥔"),
      m("rs5", "Tandoori Chicken Half", "Overnight yoghurt marinade", 289, false, "Grill", "🍗"),
      m("rs6", "Nolen Gur Kulfi", "Date palm jaggery, slow set", 119, true, "Desserts", "🍦"),
    ],
  },
  {
    slug: "madras-meridian",
    name: "Madras Meridian",
    format: "restaurant",
    cuisines: ["South Indian", "Biryani"],
    rating: 4.5,
    ratingCount: "11.0K",
    etaMins: 29,
    distanceKm: 2.0,
    costForTwo: 520,
    area: "Matunga (King's Circle)",
    promo: "Free filter coffee with every meal",
    tags: ["Banana leaf meals", "Ghee roast"],
    emoji: "🥘",
    gradient: "from-lime/25 via-accent to-secondary/20",
    blurb:
      "Chettinad classics and banana-leaf meals, cooked with stone-ground masalas and absolutely no shortcuts.",
    menu: [
      m("mm1", "Chettinad Chicken Ghee Roast", "Twelve-spice masala, curry leaf tempering", 349, false, "Mains", "🍗", true),
      m("mm2", "Banana Leaf Meal", "Rice, five sides, sambar, rasam, payasam", 299, true, "Meals", "🍱", true),
      m("mm3", "Ambur Mutton Biryani", "Seeraga samba rice, short-grain, fiery", 399, false, "Biryani", "🍚"),
      m("mm4", "Kal Dosa Duo", "Soft griddle dosas with kara chutney", 149, true, "Tiffin", "🥞"),
      m("mm5", "Prawn Milagu Fry", "Black pepper, shallots, coconut oil", 379, false, "Mains", "🦐"),
      m("mm6", "Elaneer Payasam", "Tender coconut, palm sugar, chilled", 159, true, "Desserts", "🥥"),
    ],
  },
  {
    slug: "midnight-mixer",
    name: "Midnight Mixer Dessert Co.",
    format: "cloud",
    cuisines: ["Desserts", "Coffee"],
    rating: 4.8,
    ratingCount: "6.7K",
    etaMins: 19,
    distanceKm: 11.4,
    costForTwo: 350,
    area: "Powai",
    promo: "Flat ₹75 off after 10pm",
    tags: ["Open till 3am", "Small batch"],
    emoji: "🍮",
    gradient: "from-accent via-primary/20 to-lime/20",
    blurb:
      "Desserts baked in the hours nobody else works. Everything is pulled from the oven within two hours of dispatch.",
    menu: [
      m("mx1", "Basque Burnt Cheesecake", "Deeply caramelised top, jammy centre", 259, true, "Cakes", "🍰", true),
      m("mx2", "Molten Biscoff Jar", "Warm cookie base, torched top", 219, true, "Jars", "🍯", true),
      m("mx3", "Cold Brew Affogato", "18h cold brew over vanilla bean gelato", 189, true, "Coffee", "☕"),
      m("mx4", "Sea Salt Brownie Slab", "Fudgy, 70% chocolate, flaky salt", 149, true, "Bakes", "🍫"),
      m("mx5", "Pistachio Kunafa Cup", "Crisp kataifi, cheese pull, rose syrup", 289, true, "Jars", "🥧"),
      m("mx6", "Masala Chai Cruffin", "Laminated, cardamom sugar dusted", 139, true, "Bakes", "🥐"),
    ],
  },
  {
    slug: "hostel-hatch",
    name: "Vidyalankar Hostel Hatch",
    format: "campus",
    cuisines: ["Chinese", "Burgers"],
    rating: 4.0,
    ratingCount: "1.8K",
    etaMins: 12,
    distanceKm: 0.2,
    costForTwo: 200,
    area: "Vidyalankar (VIT), Wadala",
    promo: "Late-night combo at ₹149",
    tags: ["Hostel delivery", "Open till 1am"],
    emoji: "🍟",
    gradient: "from-primary/20 via-lime/25 to-accent",
    blurb:
      "The hatch window beside the VIT hostel block. Orders travel less than 300 metres, which is why nothing ever arrives soggy.",
    menu: [
      m("hh1", "Maggi Loaded Cheese Bowl", "Double cheese, chilli flakes, fried egg option", 89, true, "Bowls", "🍜", true),
      m("hh2", "Crispy Veg Burger", "Potato-corn patty, tangy mayo", 99, true, "Burgers", "🍔"),
      m("hh3", "Chilli Paneer Rice Combo", "Fried rice, gravy, salad", 149, true, "Combos", "🍚", true),
      m("hh4", "Peri Peri Fries Bucket", "Shareable, house peri seasoning", 119, true, "Sides", "🍟"),
      m("hh5", "Egg Chowmein", "Wok-tossed, extra pepper", 129, false, "Noodles", "🍝"),
      m("hh6", "Iced Lemon Tea", "Chilled, mildly spiced", 49, true, "Drinks", "🥤"),
    ],
  },
];

export const kitchens: Kitchen[] = rawKitchens.map((k) => ({
  ...k,
  cover: k.menu[0]!.image,
  lat: kitchenCoords[k.slug]![0],
  lng: kitchenCoords[k.slug]![1],
}));

export type Offer = {
  code: string;
  title: string;
  detail: string;
  minOrder: number;
  discountPct: number;
  maxDiscount: number;
  tint: string;
};

export const offers: Offer[] = [
  {
    code: "GRIDFIRST",
    title: "60% off your first order",
    detail: "New to Yum2MyTum? Take 60% off, up to ₹150, on any kitchen.",
    minOrder: 199,
    discountPct: 60,
    maxDiscount: 150,
    tint: "from-primary/20 to-accent",
  },
  {
    code: "CAMPUS20",
    title: "Campus hour · 20% off",
    detail: "Valid on campus outlets between 11am and 4pm on weekdays.",
    minOrder: 149,
    discountPct: 20,
    maxDiscount: 80,
    tint: "from-lime/30 to-accent",
  },
  {
    code: "CLOUD99",
    title: "Cloud kitchen flat 25%",
    detail: "Delivery-only kitchens, all week, up to ₹120 off.",
    minOrder: 299,
    discountPct: 25,
    maxDiscount: 120,
    tint: "from-secondary/20 to-lime/20",
  },
  {
    code: "LATENIGHT",
    title: "After-dark 30% off",
    detail: "Orders placed after 10pm get 30% off, up to ₹100.",
    minOrder: 249,
    discountPct: 30,
    maxDiscount: 100,
    tint: "from-accent to-primary/20",
  },
];

export type Address = {
  id: string;
  label: string;
  line: string;
  detail: string;
  icon: "home" | "work" | "campus";
  lat: number;
  lng: number;
};

export const savedAddresses: Address[] = [
  {
    id: "home",
    label: "Home",
    line: "Flat 402, Marigold CHS, Road No. 24, Sion West",
    detail: "Mumbai 400022 · Ring the second bell",
    icon: "home",
    lat: 19.039,
    lng: 72.8619,
  },
  {
    id: "work",
    label: "Work",
    line: "Level 6, One BKC Tower, Bandra Kurla Complex",
    detail: "Bandra East, Mumbai 400051 · Reception drop-off",
    icon: "work",
    lat: 19.066,
    lng: 72.8656,
  },
  {
    id: "hostel",
    label: "College",
    line: "Vidyalankar Institute of Technology, Wadala East",
    detail: "Mumbai 400037 · Main gate, security verifies orders",
    icon: "campus",
    lat: 19.0222,
    lng: 72.8718,
  },
];

export const bySlug = (slug: string) => kitchens.find((k) => k.slug === slug);

export const rupees = (n: number) => `₹${n.toLocaleString("en-IN")}`;
