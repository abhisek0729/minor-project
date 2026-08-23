// generate_seed.js
const fs = require('fs');
const path = require('path');

// ==========================================
// 1. DATA POOLS FOR ACCURATE NEPAL DOMAIN DATA
// ==========================================

const PROVINCES_MAP = [
  { province: "Koshi Province", districts: ["Sunsari", "Morang", "Ilam", "Solukhumbu", "Jhapa", "Dhankuta", "Sankhuwasabha", "Taplejung"] },
  { province: "Madhesh Province", districts: ["Dhanusha", "Parsa", "Bara", "Siraha", "Mahottari", "Saptari", "Sarlahi", "Rautahat"] },
  { province: "Bagmati Province", districts: ["Kathmandu", "Lalitpur", "Bhaktapur", "Kavrepalanchok", "Chitwan", "Makwanpur", "Rasuwa", "Sindhupalchok"] },
  { province: "Gandaki Province", districts: ["Kaski", "Mustang", "Manang", "Gorkha", "Lamjung", "Tanahun", "Parbat", "Myagdi", "Syangja"] },
  { province: "Lumbini Province", districts: ["Rupandehi", "Kapilvastu", "Palpa", "Banke", "Bardiya", "Dang", "Arghakhanchi", "Gulmi"] },
  { province: "Karnali Province", districts: ["Jumla", "Mugu", "Dolpa", "Surkhet", "Humla", "Kalikot", "Dailekh", "Jajarkot"] },
  { province: "Sudurpashchim Province", districts: ["Kailali", "Kanchanpur", "Doti", "Dadeldhura", "Baitadi", "Bajhang", "Darchula", "Achham"] },
];

const DESTINATION_CATEGORIES = [
  "Lakes & Mountains",
  "Culture & Heritage",
  "High Altitude Trek",
  "Wildlife & Safari",
  "Viewpoint & Adventure",
  "Spiritual & Pilgrimage",
  "Scenic Viewpoint",
  "Expedition & Culture",
];

const REAL_DESTINATION_SEEDS = [
  { name: "Phewa Lake & Tal Barahi", region: "Gandaki Province", category: "Lakes & Mountains", altitude: "822m", cost: "NPR 3,500/day", season: "October – May" },
  { name: "Everest Base Camp (EBC)", region: "Koshi Province", category: "High Altitude Trek", altitude: "5,364m", cost: "NPR 9,500/day", season: "March – May, Oct – Nov" },
  { name: "Pashupatinath Temple Complex", region: "Bagmati Province", category: "Spiritual & Pilgrimage", altitude: "1,400m", cost: "NPR 2,000/day", season: "All Year Round" },
  { name: "Chitwan National Park Safari", region: "Bagmati Province", category: "Wildlife & Safari", altitude: "415m", cost: "NPR 6,000/day", season: "October – March" },
  { name: "Annapurna Sanctuary & ABC", region: "Gandaki Province", category: "High Altitude Trek", altitude: "4,130m", cost: "NPR 6,500/day", season: "March – May, Sep – Nov" },
  { name: "Bhaktapur Durbar Square", region: "Bagmati Province", category: "Culture & Heritage", altitude: "1,401m", cost: "NPR 2,500/day", season: "All Year Round" },
  { name: "Swayambhunath Monkey Temple", region: "Bagmati Province", category: "Spiritual & Pilgrimage", altitude: "1,450m", cost: "NPR 1,500/day", season: "All Year Round" },
  { name: "Lumbini Sacred Garden & Maya Devi", region: "Lumbini Province", category: "Spiritual & Pilgrimage", altitude: "150m", cost: "NPR 3,000/day", season: "October – April" },
  { name: "Rara Lake (Queen of Lakes)", region: "Karnali Province", category: "Lakes & Mountains", altitude: "2,990m", cost: "NPR 7,500/day", season: "April – June, Sep – Nov" },
  { name: "Upper Mustang & Lo Manthang", region: "Gandaki Province", category: "Expedition & Culture", altitude: "3,840m", cost: "NPR 14,000/day", season: "April – November" },
  { name: "Poon Hill & Ghorepani Sunrise", region: "Gandaki Province", category: "Viewpoint & Adventure", altitude: "3,210m", cost: "NPR 4,500/day", season: "September – May" },
  { name: "Nagarkot Himalayan Panoramic Point", region: "Bagmati Province", category: "Scenic Viewpoint", altitude: "2,175m", cost: "NPR 4,000/day", season: "October – March" },
  { name: "Tilicho Lake (World Highest Lake)", region: "Gandaki Province", category: "High Altitude Trek", altitude: "4,919m", cost: "NPR 8,000/day", season: "April – June, Sep – Nov" },
  { name: "Bardia National Park Wilderness", region: "Lumbini Province", category: "Wildlife & Safari", altitude: "152m", cost: "NPR 7,000/day", season: "October – April" },
  { name: "Gosaikunda Holy Alpine Lakes", region: "Bagmati Province", category: "Spiritual & Pilgrimage", altitude: "4,380m", cost: "NPR 5,500/day", season: "August – November" },
  { name: "Patan Durbar Square & Krishna Mandir", region: "Bagmati Province", category: "Culture & Heritage", altitude: "1,400m", cost: "NPR 2,200/day", season: "All Year Round" },
  { name: "Manaslu Circuit & Larkya La Pass", region: "Gandaki Province", category: "High Altitude Trek", altitude: "5,106m", cost: "NPR 10,000/day", season: "March – May, Sep – Nov" },
  { name: "Boudhanath Stupa", region: "Bagmati Province", category: "Spiritual & Pilgrimage", altitude: "1,400m", cost: "NPR 1,500/day", season: "All Year Round" },
  { name: "Bandipur Preserved Heritage Town", region: "Gandaki Province", category: "Culture & Heritage", altitude: "1,030m", cost: "NPR 3,800/day", season: "All Year Round" },
  { name: "Sarangkot Sunrise & Paragliding", region: "Gandaki Province", category: "Viewpoint & Adventure", altitude: "1,600m", cost: "NPR 5,000/day", season: "October – April" },
  { name: "Gokyo Ri & Turquoise Lakes", region: "Koshi Province", category: "High Altitude Trek", altitude: "5,357m", cost: "NPR 9,000/day", season: "March – May, Oct – Nov" },
  { name: "Janaki Mandir (Janakpurdham)", region: "Madhesh Province", category: "Culture & Heritage", altitude: "74m", cost: "NPR 2,500/day", season: "October – March" },
  { name: "Kanchenjunga Base Camp", region: "Koshi Province", category: "Expedition & Culture", altitude: "5,143m", cost: "NPR 12,000/day", season: "March – May, Oct – Nov" },
  { name: "Khaptad National Park & Ashram", region: "Sudurpashchim Province", category: "Spiritual & Pilgrimage", altitude: "3,000m", cost: "NPR 6,000/day", season: "April – June, Sep – Nov" },
  { name: "Shey Phoksundo Lake & Bon Monasteries", region: "Karnali Province", category: "Lakes & Mountains", altitude: "3,611m", cost: "NPR 11,000/day", season: "April – October" },
  { name: "Ilam Kanyam Tea Gardens", region: "Koshi Province", category: "Scenic Viewpoint", altitude: "1,600m", cost: "NPR 3,200/day", season: "All Year Round" },
  { name: "Kalinchowk Bhagwati Shrine & Snow View", region: "Bagmati Province", category: "Spiritual & Pilgrimage", altitude: "3,842m", cost: "NPR 4,500/day", season: "December – February (Snow)" },
  { name: "Mardi Himal High Camp Trek", region: "Gandaki Province", category: "High Altitude Trek", altitude: "4,500m", cost: "NPR 5,500/day", season: "March – May, Sep – Nov" },
  { name: "Langtang Valley & Kyanjin Gompa", region: "Bagmati Province", category: "High Altitude Trek", altitude: "3,870m", cost: "NPR 5,000/day", season: "March – May, Sep – Nov" },
  { name: "Bhedetar Viewpoint & Namaste Falls", region: "Koshi Province", category: "Scenic Viewpoint", altitude: "1,420m", cost: "NPR 3,000/day", season: "All Year Round" },
  { name: "Tansen & Rani Mahal (Palpa)", region: "Lumbini Province", category: "Culture & Heritage", altitude: "1,350m", cost: "NPR 3,500/day", season: "October – April" },
  { name: "Dhorpatan Hunting Reserve", region: "Gandaki Province", category: "Wildlife & Safari", altitude: "2,850m", cost: "NPR 8,500/day", season: "March – May, Oct – Nov" },
  { name: "Khumai Danda (Great Wall of Machhapuchhre)", region: "Gandaki Province", category: "Viewpoint & Adventure", altitude: "3,245m", cost: "NPR 4,200/day", season: "September – May" },
  { name: "Shuklaphanta National Park Grasslands", region: "Sudurpashchim Province", category: "Wildlife & Safari", altitude: "174m", cost: "NPR 5,800/day", season: "November – April" },
  { name: "Gorkha Durbar & Museum", region: "Gandaki Province", category: "Culture & Heritage", altitude: "1,143m", cost: "NPR 2,800/day", season: "All Year Round" },
  { name: "Chandragiri Hills Cable Car & Temple", region: "Bagmati Province", category: "Scenic Viewpoint", altitude: "2,551m", cost: "NPR 3,500/day", season: "All Year Round" },
  { name: "Dharan Dantakali & Budha Subba", region: "Koshi Province", category: "Spiritual & Pilgrimage", altitude: "349m", cost: "NPR 2,500/day", season: "All Year Round" },
  { name: "Shivapuri Peak & Bagdwar", region: "Bagmati Province", category: "Viewpoint & Adventure", altitude: "2,732m", cost: "NPR 2,000/day", season: "September – May" },
  { name: "Badimalika Temple Sacred Plateau", region: "Sudurpashchim Province", category: "Spiritual & Pilgrimage", altitude: "4,200m", cost: "NPR 8,000/day", season: "August – September" },
  { name: "Panch Pokhari Sacred Alpine Lakes", region: "Bagmati Province", category: "High Altitude Trek", altitude: "4,100m", cost: "NPR 6,000/day", season: "August – November" }
];

const CURATED_IMAGES = [
  "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200",
  "https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?q=80&w=1200",
  "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=1200",
  "https://images.unsplash.com/photo-1605640840605-14ac1855827b?q=80&w=1200",
  "https://images.unsplash.com/photo-1623880840102-530b135efbd1?q=80&w=1200",
  "https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?q=80&w=1200",
  "https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=1200",
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200",
  "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=1200",
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200"
];

const HOTEL_BRANDS = [
  "Hotel Barahi", "Dwarika's Heritage", "Soaltee Crowne", "Yak & Yeti", "Temple Tree Resort",
  "Fish Tail Lodge", "Kasara Jungle Resort", "Meghauli Serai", "Yeti Mountain Home", "Shinta Mani Mustang",
  "Waterfront Resort", "Himalayan Front Hotel", "Tiger Tops Tharu Lodge", "Club Himalaya Nagarkot", "Mystic Mountain Resort",
  "Rupsi Resort", "Pavilions Himalayas", "Everest Panorama Resort", "Gokarna Forest Resort", "Hotel Shanker Heritage",
  "Landmark Hotel", "Atithi Resort & Spa", "Mount Kailash Resort", "Da Yatra Courtyard", "Bodhi Redsun Hotel",
  "Peace Dragon Lodge", "Annapurna View Sarangkot", "Himalayan Horizon", "Hotel Yak", "Hotel Lake Star"
];

const RESTAURANT_BRANDS = [
  "Moondance Restaurant & Bar", "OR2K Middle Eastern", "Bhojan Griha Heritage Dining", "Krishnarpan Traditional Newari",
  "Fire and Ice Pizzeria", "Roadhouse Cafe & Grill", "Himalayan Java Coffee", "Rosemary Kitchen & Coffee",
  "Le Sherpa Organic Restaurant", "Kaiser Cafe Garden of Dreams", "Thamel House Traditional Dining", "Newa Lahana Kirtipur",
  "Utse Tibetan Restaurant", "Busy Bee Cafe & Lounge", "Caffe Concerto Lakeside", "Godfather Pizzeria Pokhara",
  "Fresh Elements Restaurant", "Bamboole Green Garden", "Saigon Pho Vietnamese", "Chilly Bar & Restaurant",
  "Third Eye Restaurant Thamel", "La Bella Italia Pokhara", "Little Italy Vegetarian", "Helena's Rooftop Bakery",
  "Mike's Breakfast & Cafe", "Mustang Thakali Kitchen", "Bhanchha Ghar Traditional", "Honacha Newari Bhaktapur",
  "Chitwan Tharu Bhojanalaya", "Palpali Dhido & Sekuwa Corner"
];

const NEPALI_FIRST_NAMES = [
  "Pasang", "Nima", "Lakpa", "Dawa", "Karma", "Pemba", "Tenzing", "Mingma", "Ang", "Dorje",
  "Ram", "Hari", "Shyam", "Krishna", "Bibek", "Suman", "Manoj", "Dipendra", "Bikram", "Gautam",
  "Sunita", "Sita", "Puja", "Rasmita", "Anita", "Deepa", "Kabita", "Sarita", "Manju", "Anjali"
];

const NEPALI_LAST_NAMES = [
  "Sherpa", "Gurung", "Tamang", "Rai", "Limbu", "Thapa", "Magar", "Chhetri", "Lama", "Shrestha",
  "Baniya", "Poudel", "Adhikari", "Basnet", "Karki", "Maharjan", "Bajracharya", "Khadka", "Bhandari", "Sah"
];

const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min, max, decimals = 4) => parseFloat((Math.random() * (max - min) + min).toFixed(decimals));

// ==========================================
// 2. GENERATE 100 REALISTIC DESTINATIONS
// ==========================================
function generateDestinations(count = 100) {
  const list = [];
  
  // Seed the first 40 high-accuracy curated real destinations
  REAL_DESTINATION_SEEDS.forEach((seed, idx) => {
    list.push({
      id: idx + 1,
      name: seed.name,
      region: seed.region,
      category: seed.category,
      altitude: seed.altitude,
      bestSeason: seed.season,
      rating: randomFloat(4.6, 5.0, 1),
      reviews: randomInt(120, 850),
      startingCost: seed.cost,
      coverImage: CURATED_IMAGES[idx % CURATED_IMAGES.length],
      shortDescription: `Discover the breathtaking vistas, rich cultural heritage, and pristine alpine environment of ${seed.name}.`,
      historyAndCulture: `Deeply rooted in traditional Himalayan traditions, ancient shrines, and local ethnic communities.`,
      activities: ["Sightseeing", "Guided Trekking", "Photography", "Cultural Walking"],
      highlights: ["Panoramic Views", "Local Hospitality", "Authentic Heritage"],
      mapQuery: `${seed.name}, Nepal`,
      nearbyAttractions: ["Scenic Viewpoint", "Local Monastery/Temple", "Traditional Village"]
    });
  });

  // Dynamically generate remaining 60 realistic destinations across all 7 provinces
  const landmarks = [
    "Valley", "Base Camp", "Lake", "Pass Trek", "Waterfall", "Temple", "Monastery", 
    "National Park", "Ghat", "Sanctuary", "Ridge Walk", "Hilltop Viewpoint", "Cave Complex"
  ];
  const regionNames = [
    "Makalu", "Jumla", "Dolpo", "Gosaikunda", "Lamjung", "Dhorpatan", "Sankhuwasabha", "Dadeldhura",
    "Kanchanpur", "Baitadi", "Humla", "Taplejung", "Solu", "Rolwaling", "Sindhupalchok", "Ramechhap",
    "Arghakhanchi", "Gulmi", "Pyuthan", "Bardiya", "Surkhet", "Dailekh", "Doti", "Bajhang"
  ];

  for (let i = list.length + 1; i <= count; i++) {
    const loc = randomItem(regionNames);
    const landmark = randomItem(landmarks);
    const name = `${loc} ${landmark}`;
    const pObj = randomItem(PROVINCES_MAP);

    list.push({
      id: i,
      name: name,
      region: pObj.province,
      category: randomItem(DESTINATION_CATEGORIES),
      altitude: `${randomInt(600, 3500)}m`,
      bestSeason: randomItem(["September – November", "March – May", "October – March", "All Year Round"]),
      rating: randomFloat(4.3, 4.9, 1),
      reviews: randomInt(40, 420),
      startingCost: `NPR ${randomInt(2500, 9000).toLocaleString()}/day`,
      coverImage: randomItem(CURATED_IMAGES),
      shortDescription: `Experience the untouched mountain scenery and warm local hospitality of ${name} in ${pObj.province}.`,
      historyAndCulture: `Centuries-old trade route traditions and indigenous cultural heritage.`,
      activities: ["Photography", "Nature Trail Walk", "Cultural Exploration", "Bird Watching"],
      highlights: ["Lush Alpine Vistas", "Traditional Homestays", "Peaceful Wilderness"],
      mapQuery: `${name}, ${pObj.province}, Nepal`,
      nearbyAttractions: ["Local Village Market", "Historic Gompa", "Mountain River"]
    });
  }

  return list;
}

// ==========================================
// 3. GENERATE 100 REALISTIC HOTELS
// ==========================================
function generateHotels(count = 100) {
  const list = [];
  const roomTypes = ["single", "double", "twin", "family", "suite"];

  for (let i = 1; i <= count; i++) {
    const brand = HOTEL_BRANDS[(i - 1) % HOTEL_BRANDS.length];
    const pObj = randomItem(PROVINCES_MAP);
    const district = randomItem(pObj.districts);
    const hotelName = i <= HOTEL_BRANDS.length ? brand : `${brand} ${district}`;

    list.push({
      name: hotelName,
      description: `A distinguished property in ${district}, ${pObj.province} offering modern amenities, comfortable luxury suites, mountain views, and authentic Nepali hospitality.`,
      establishedYear: randomInt(1985, 2023),
      phoneNumber: `+977-${randomInt(1, 9)}-${randomInt(400000, 999999)}`,
      website: `https://${hotelName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com.np`,
      province: pObj.province,
      district: district,
      municipality: `${district} Municipality`,
      ward: `${randomInt(1, 15)}`,
      street: randomItem(["Lakeside Marg", "Heritage Chowk", "Main Tourist Road", "Temple View Street", "Resort Valley Way"]),
      latitude: randomFloat(26.8, 29.2, 4),
      longitude: randomFloat(80.5, 87.8, 4),
      coverImageUrl: CURATED_IMAGES[(i - 1) % CURATED_IMAGES.length],
      facilities: ["Free High-Speed WiFi", "Restaurant & Bar", "Mountain View Balcony", "Airport Shuttle", "24/7 Room Service", "Swimming Pool"].slice(0, randomInt(3, 6)),
      rooms: [
        {
          roomNumber: "101",
          roomType: randomItem(roomTypes),
          pricePerNight: `${randomInt(2500, 7500)}`,
          capacity: randomInt(1, 3),
          description: "Comfortable deluxe room with air conditioning, private bathroom, and scenic views.",
          status: "available"
        },
        {
          roomNumber: "201",
          roomType: "suite",
          pricePerNight: `${randomInt(8000, 22000)}`,
          capacity: randomInt(2, 4),
          description: "Spacious premium executive suite with private balcony, mini-fridge, and panoramic mountain backdrop.",
          status: "available"
        }
      ]
    });
  }

  return list;
}

// ==========================================
// 4. GENERATE 100 REALISTIC RESTAURANTS
// ==========================================
function generateRestaurants(count = 100) {
  const list = [];
  const cuisines = [
    "Continental, Italian & Nepali",
    "Authentic Traditional Newari & Nepali",
    "Thakali Khana Set Special",
    "Middle Eastern, Vegan & Organic",
    "Tibetan, Himalayan & Bakery",
    "Wood-Fired Pizza & Grill"
  ];

  for (let i = 1; i <= count; i++) {
    const brand = RESTAURANT_BRANDS[(i - 1) % RESTAURANT_BRANDS.length];
    const pObj = randomItem(PROVINCES_MAP);
    const district = randomItem(pObj.districts);
    const name = i <= RESTAURANT_BRANDS.length ? brand : `${brand} (${district})`;

    list.push({
      name: name,
      description: `A highly acclaimed culinary venue in ${district} celebrated for freshly prepared signature dishes, cozy ambiance, and authentic regional flavours.`,
      phoneNumber: `+977-${randomInt(1, 9)}-${randomInt(400000, 999999)}`,
      establishedDate: `${randomInt(1992, 2023)}`,
      cuisine: randomItem(cuisines),
      location: `${district}, ${pObj.province}`,
      province: pObj.province,
      district: district,
      municipality: `${district} City`,
      ward: `${randomInt(1, 15)}`,
      street: randomItem(["Central Market", "Lakeside Marg", "Food Street", "Durbar Chowk", "Riverside Road"]),
      latitude: randomFloat(26.8, 29.2, 4),
      longitude: randomFloat(80.5, 87.8, 4),
      isOpen: true,
      openingTime: "08:00 AM",
      closingTime: "10:30 PM",
      restaurantImageUrl: CURATED_IMAGES[(i - 1) % CURATED_IMAGES.length],
      menus: [
        {
          name: "Authentic Thakali / Newari Platter",
          description: "Locally sourced traditional set with organic grains, seasonal curries, and house-made dips.",
          price: randomInt(450, 950),
          category: "Main Course",
          isAvailable: true,
          menusImageUrl: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=800"
        },
        {
          name: "Fresh Himalayan Trout / Wood-Fired Pizza",
          description: "Freshly prepared signature delicacy with herbs and organic toppings.",
          price: randomInt(750, 1550),
          category: "Chef Special",
          isAvailable: true,
          menusImageUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=800"
        },
        {
          name: "Steamed Artisan Momo Platter",
          description: "Handcrafted dumplings served with spicy tomato sesame chutney.",
          price: randomInt(280, 550),
          category: "Starters",
          isAvailable: true,
          menusImageUrl: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?q=80&w=800"
        }
      ]
    });
  }

  return list;
}

// ==========================================
// 5. GENERATE 100 REALISTIC NEPALI GUIDES
// ==========================================
function generateGuides(count = 100) {
  const list = [];
  const trekNames = [
    "Annapurna Circuit & Thorong La", "Everest Base Camp & Kala Patthar", "Langtang Valley & Kyanjin Gompa",
    "Manaslu Larke Pass Trek", "Mardi Himal Ridge Trail", "Ghorepani Poon Hill Panorama",
    "Upper Mustang Lo Manthang Circuit", "Rara Lake Wilderness Expedition", "Kanchenjunga Circuit",
    "Gosaikunda Sacred Lakes Trek", "Shey Phoksundo Dolpo Trek", "Khumai Danda Machhapuchhre View"
  ];

  for (let i = 1; i <= count; i++) {
    const fn = NEPALI_FIRST_NAMES[(i - 1) % NEPALI_FIRST_NAMES.length];
    const ln = NEPALI_LAST_NAMES[Math.floor((i - 1) / NEPALI_FIRST_NAMES.length) % NEPALI_LAST_NAMES.length];
    const name = `${fn} ${ln}`;
    const pObj = randomItem(PROVINCES_MAP);
    const district = randomItem(pObj.districts);
    const trek = trekNames[(i - 1) % trekNames.length];

    list.push({
      name: name,
      description: `Certified professional mountain and cultural tour guide with ${randomInt(4, 18)} years of leading Himalayan expeditions. Certified in Wilderness First Aid and NATHM mountain safety.`,
      location: `${district} / Kathmandu`,
      phoneNumber: `+977-98${randomInt(40000000, 69999999)}`,
      guideImageUrl: CURATED_IMAGES[(i - 1) % CURATED_IMAGES.length],
      experienceYears: randomInt(3, 18),
      languages: "Nepali, English, " + randomItem(["Sherpa", "Hindi", "French", "German", "Japanese", "Korean", "Spanish"]),
      dailyRate: randomInt(2500, 5500),
      isAvailable: true,
      licenseNumber: `NATHM-TG-${randomInt(2011, 2023)}-${randomInt(1000, 9999)}`,
      packages: [
        {
          title: `${trek} (${randomInt(5, 14)} Days)`,
          destination: trek,
          durationDays: randomInt(5, 14),
          price: randomInt(25000, 85000),
          maxGroupSize: randomInt(4, 10),
          description: `Guided multi-day trek across ${trek} featuring scenic ridges, alpine rhododendron forests, and cultural teahouse stays.`,
          itinerary: `Day 1: Drive to trailhead | Day 2-4: Acclimatization & ridge climbing | Day 5: Summit viewpoint | Day 6: Return descent`,
          included: "Certified guide service, TIMS permit assistance, First Aid kit, Daily safety briefings",
          excluded: "Personal accommodation, meals, airfare, porter tips",
          packageImageUrl: randomItem(CURATED_IMAGES),
          isPublished: true
        }
      ],
      availability: [
        { date: "2026-09-01", isAvailable: true, note: "Autumn Season Open" },
        { date: "2026-09-15", isAvailable: true, note: "Available for treks" }
      ]
    });
  }

  return list;
}

// ==========================================
// 6. EXECUTE & WRITE FILES
// ==========================================
console.log("🚀 Generating 100 high-accuracy records for each category...");

const destinations = generateDestinations(100);
fs.writeFileSync(path.join(__dirname, 'destinations.json'), JSON.stringify(destinations, null, 2));
console.log("✅ destinations.json created (100 items)");

const hotels = generateHotels(100);
fs.writeFileSync(path.join(__dirname, 'hotels.json'), JSON.stringify(hotels, null, 2));
console.log("✅ hotels.json created (100 items)");

const restaurants = generateRestaurants(100);
fs.writeFileSync(path.join(__dirname, 'restaurants.json'), JSON.stringify(restaurants, null, 2));
console.log("✅ restaurants.json created (100 items)");

const guides = generateGuides(100);
fs.writeFileSync(path.join(__dirname, 'guides.json'), JSON.stringify(guides, null, 2));
console.log("✅ guides.json created (100 items)");

console.log("\n🎉 ALL 400 SEED RECORDS GENERATED SUCCESSFULLY IN JSON!");
