import { getRestaurants } from "@/app/features/restaurant/services/restaurant.service";
import RestaurantsClientView from "@/app/restaurants/components/RestaurantsClientView";

export const dynamic = "force-dynamic";

export default async function RestaurantsPage() {
  let restaurants: any[] = [];

  try {
    restaurants = await getRestaurants();
  } catch (error) {
    console.error("Failed to fetch restaurants:", error);
  }

  // Fallback curated restaurants if DB is empty
  if (!restaurants || restaurants.length === 0) {
    restaurants = [
      {
        id: 1,
        name: "Himalayan Table & Rooftop",
        description: "Authentic Thakali thali, Newari samay baji, and organic mountain tea with panoramic valley views.",
        location: "Kathmandu (Thamel Marg-4)",
        phoneNumber: "+977 1-4701234",
        cuisine: "Traditional Nepali",
        imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200&auto=format&fit=crop",
        isOpen: true,
        openingTime: "08:00 AM",
        closingTime: "10:30 PM",
      },
      {
        id: 2,
        name: "Lakeside Grill & Bar",
        description: "Fresh lake fish, charcoal grills, wood-fired pizzas, and craft cocktails overlooking Phewa lake sunset.",
        location: "Pokhara (Lakeside-6)",
        phoneNumber: "+977 61-465432",
        cuisine: "Multi-Cuisine",
        imageUrl: "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1200&auto=format&fit=crop",
        isOpen: true,
        openingTime: "10:00 AM",
        closingTime: "11:30 PM",
      },
      {
        id: 3,
        name: "Dharan Sekuwa Corner",
        description: "Famous authentic Dharani pork and mutton sekuwa with traditional spicy Timur chutney and Tongba.",
        location: "Dharan (Bhanuchowk-2)",
        phoneNumber: "+977 25-521908",
        cuisine: "Local Nepali",
        imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop",
        isOpen: true,
        openingTime: "11:00 AM",
        closingTime: "10:00 PM",
      },
      {
        id: 4,
        name: "Patan Heritage Courtyard Kitchen",
        description: "Artisan Newari feast, Chatamari, Bara, Choila, and traditional drinks served in an ancient brick courtyard.",
        location: "Lalitpur (Patan Durbar Square)",
        phoneNumber: "+977 1-5543210",
        cuisine: "Newari Specialty",
        imageUrl: "https://images.unsplash.com/photo-1525610553991-2bede1a236e2?q=80&w=1200&auto=format&fit=crop",
        isOpen: true,
        openingTime: "09:00 AM",
        closingTime: "09:30 PM",
      },
      {
        id: 5,
        name: "Sauraha Tharu Village Kitchen",
        description: "Authentic Tharu ethnic recipes, river fish curries, and sticky rice preparations after jungle safari.",
        location: "Chitwan (Sauraha)",
        phoneNumber: "+977 56-580456",
        cuisine: "Tharu & Continental",
        imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop",
        isOpen: true,
        openingTime: "07:30 AM",
        closingTime: "10:00 PM",
      },
      {
        id: 6,
        name: "Bhedetar Cloud View Cafe",
        description: "Hot momos, local Tibetan noodle soup (Thukpa), and steaming ginger tea amidst the mountain clouds.",
        location: "Bhedetar (Dharan-Dhankuta Highway)",
        phoneNumber: "+977 25-560123",
        cuisine: "Cafe & Fast Food",
        imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop",
        isOpen: true,
        openingTime: "08:00 AM",
        closingTime: "09:00 PM",
      },
    ];
  }

  return <RestaurantsClientView initialRestaurants={restaurants} />;
}
