export interface RestaurantFacility {
  id: string;
  name: string;
  category: "Dining & Ambiance" | "Comfort & Connectivity" | "Services & Payments";
  iconName: string;
  description: string;
}

export const RESTAURANT_PREDEFINED_FACILITIES: RestaurantFacility[] = [
  {
    id: "wifi",
    name: "High-Speed Wi-Fi",
    category: "Comfort & Connectivity",
    iconName: "Wifi",
    description: "Free fast internet for diners & remote workers",
  },
  {
    id: "ac",
    name: "Air Conditioning",
    category: "Comfort & Connectivity",
    iconName: "Wind",
    description: "Climate-controlled dining hall for all seasons",
  },
  {
    id: "rooftop",
    name: "Rooftop / Outdoor Seating",
    category: "Dining & Ambiance",
    iconName: "Sun",
    description: "Scenic open-air patio, rooftop garden & mountain viewpoints",
  },
  {
    id: "family",
    name: "Family & Kids Section",
    category: "Dining & Ambiance",
    iconName: "Users",
    description: "Dedicated spacious seating with high chairs for families",
  },
  {
    id: "music",
    name: "Live Music & Cultural Night",
    category: "Dining & Ambiance",
    iconName: "Music",
    description: "Acoustic performances and Nepali traditional folk music",
  },
  {
    id: "bar",
    name: "Bar & Cocktail Lounge",
    category: "Dining & Ambiance",
    iconName: "Wine",
    description: "Curated domestic and imported wines, spirits & cocktails",
  },
  {
    id: "veg_halal",
    name: "Pure Veg & Halal Options",
    category: "Dining & Ambiance",
    iconName: "Utensils",
    description: "Dedicated vegetarian kitchen section & certified halal ingredients",
  },
  {
    id: "parking",
    name: "Dedicated Parking & Valet",
    category: "Services & Payments",
    iconName: "Car",
    description: "Secure four-wheeler & bike parking space on premise",
  },
  {
    id: "digital_payment",
    name: "Digital Payments & Cards",
    category: "Services & Payments",
    iconName: "CreditCard",
    description: "Accepts Fonepay, Khalti, eSewa, Visa & MasterCard",
  },
  {
    id: "private_hall",
    name: "Private Dining / Party Hall",
    category: "Dining & Ambiance",
    iconName: "Sparkles",
    description: "Reservable space for birthday parties, corporate meets & events",
  },
  {
    id: "pet_friendly",
    name: "Pet-Friendly Area",
    category: "Comfort & Connectivity",
    iconName: "Dog",
    description: "Welcoming outdoor area with water bowls for pets",
  },
  {
    id: "takeaway",
    name: "Takeaway & Fast Delivery",
    category: "Services & Payments",
    iconName: "ShoppingBag",
    description: "Eco-friendly packaging for takeaway orders and quick dispatch",
  },
];
