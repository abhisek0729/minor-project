export interface GuidePackage {
  id: number;
  title: string;
  duration: string;
  price: number;
  description: string;
}

export interface Guide {
  id: number;
  name: string;
  description: string;
  location: string;
  experienceYears: number;
  languages: string;
  dailyRate: number;
  licenseNumber: string;
  specialty: string;
  packagesCount: number;
  image: string;
  packages: GuidePackage[];
}

export const guidesData: Guide[] = [
  {
    id: 1,
    name: "Jyoti Sharma",
    description: "Specialized in Kathmandu Valley heritage, sacred courtyards, ancient Newari architecture, and folklore with over 7 years of professional storytelling experience.",
    location: "Kathmandu & Patan",
    experienceYears: 7,
    languages: "Nepali, English, Hindi",
    dailyRate: 3200,
    licenseNumber: "NTA-GUIDE-4812",
    specialty: "Heritage & Culture",
    packagesCount: 3,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1200&auto=format&fit=crop",
    packages: [
      {
        id: 11,
        title: "Patan & Bhaktapur Ancient Courtyards",
        duration: "1 Day",
        price: 3500,
        description: "Deep cultural walking tour visiting medieval palaces, woodcarving ateliers, and living goddess courtyards.",
      },
      {
        id: 12,
        title: "Sacred Temples & Monasteries of Valley",
        duration: "2 Days",
        price: 6800,
        description: "Boudhanath, Swayambhunath, Pashupatinath, and Kopan Monastery spiritual walk.",
      },
      {
        id: 13,
        title: "Kathmandu UNESCO World Heritage Circuit",
        duration: "1 Day",
        price: 4200,
        description: "Comprehensive heritage tour covering Swayambhunath, Kathmandu Durbar Square, and Pashupatinath.",
      },
    ],
  },
  {
    id: 2,
    name: "Bikram Rai",
    description: "High-altitude mountain guide certified in Annapurna Circuit, Mardi Himal, and Poon Hill trekking trails with 10 years of alpine experience.",
    location: "Pokhara & Annapurna",
    experienceYears: 10,
    languages: "Nepali, English, Gurung",
    dailyRate: 4600,
    licenseNumber: "NTA-TREK-1092",
    specialty: "High Altitude Trekking",
    packagesCount: 4,
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1200&auto=format&fit=crop",
    packages: [
      {
        id: 21,
        title: "Poon Hill Sunrise Himalayan Trek",
        duration: "3 Days",
        price: 12500,
        description: "Famous rhododendron forest trail with 360-degree panoramic sunrise over Annapurna and Dhaulagiri.",
      },
      {
        id: 22,
        title: "Mardi Himal High Camp Expedition",
        duration: "5 Days",
        price: 21000,
        description: "Ridge-line trek taking you right under the sacred Machapuchare (Fishtail) peak.",
      },
      {
        id: 23,
        title: "Annapurna Base Camp (ABC) Sanctuary Trek",
        duration: "7 Days",
        price: 32000,
        description: "High alpine trek into the glacial amphitheater surrounded by Annapurna I and Machapuchare.",
      },
      {
        id: 24,
        title: "Ghorepani & Ghandruk Cultural Trek",
        duration: "4 Days",
        price: 16000,
        description: "Scenic trek blending Annapurna panoramic views with traditional Gurung village homestays.",
      },
    ],
  },
  {
    id: 3,
    name: "Sunita Tamang",
    description: "Eco-tourism and wildlife naturalist leading jeep safaris, bird-watching, and cultural homestay tours in Chitwan National Park.",
    location: "Chitwan & Sauraha",
    experienceYears: 6,
    languages: "Nepali, English, Tharu",
    dailyRate: 3800,
    licenseNumber: "NTA-WILD-3301",
    specialty: "Wildlife Safari",
    packagesCount: 2,
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=1200&auto=format&fit=crop",
    packages: [
      {
        id: 31,
        title: "Chitwan Jungle Safari & Wildlife Adventure",
        duration: "2 Days",
        price: 8500,
        description: "One-horned rhino spotting, canoe ride on Rapti River, and Tharu cultural evening dance.",
      },
      {
        id: 32,
        title: "Deep Forest Bird Watching & Elephant Trail",
        duration: "1 Day",
        price: 4200,
        description: "Early morning naturalist-guided bird walk and elephant conservation observation.",
      },
    ],
  },
  {
    id: 4,
    name: "Pemba Sherpa",
    description: "Everest region veteran with decades of high-pass navigation, Sagarmatha expeditions, and alpine safety expertise.",
    location: "Namche & Khumbu",
    experienceYears: 14,
    languages: "Nepali, English, Tibetan",
    dailyRate: 5500,
    licenseNumber: "NTA-EXP-8890",
    specialty: "High Altitude Trekking",
    packagesCount: 5,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1200&auto=format&fit=crop",
    packages: [
      {
        id: 41,
        title: "Everest Base Camp (EBC) Classical Trek",
        duration: "12 Days",
        price: 62000,
        description: "Iconic trek through Sagarmatha National Park, Namche Bazaar, Tengboche Monastery to EBC and Kala Patthar.",
      },
      {
        id: 42,
        title: "Gokyo Lakes & Cho La Pass Trek",
        duration: "14 Days",
        price: 74000,
        description: "Pristine turquoise glacial lakes, Ngozumpa glacier crossing, and breathtaking Everest vistas from Gokyo Ri.",
      },
      {
        id: 43,
        title: "Namche Bazaar & Tengboche Spiritual Trek",
        duration: "5 Days",
        price: 28000,
        description: "Short Khumbu trek visiting Sherpa cultural capital and the legendary Tengboche Buddhist Monastery.",
      },
      {
        id: 44,
        title: "Three Passes High Altitude Expedition",
        duration: "18 Days",
        price: 95000,
        description: "Ultimate Everest adventure crossing Kongma La, Cho La, and Renjo La passes above 5,300m.",
      },
      {
        id: 45,
        title: "Ama Dablam Base Camp Trek",
        duration: "7 Days",
        price: 38000,
        description: "Scenic trek close to the spectacular pyramid of Ama Dablam, one of the world's most beautiful mountains.",
      },
    ],
  },
  {
    id: 5,
    name: "Rajesh Shrestha",
    description: "Spiritual tour leader and historian covering Lumbini sacred gardens, Kapilvastu, and Buddhist pilgrimage sites.",
    location: "Lumbini & Kapilvastu",
    experienceYears: 8,
    languages: "Nepali, English, Japanese",
    dailyRate: 3500,
    licenseNumber: "NTA-GUIDE-5120",
    specialty: "Heritage & Culture",
    packagesCount: 2,
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=1200&auto=format&fit=crop",
    packages: [
      {
        id: 51,
        title: "Lumbini Sacred Garden & Monastic Zone Pilgrimage",
        duration: "1 Day",
        price: 3500,
        description: "Mayadevi Temple, Ashoka Pillar, Sacred Pond, and international monastic zones guided pilgrimage.",
      },
      {
        id: 52,
        title: "Kapilvastu & Tilaurakot Ancient Kingdom Tour",
        duration: "2 Days",
        price: 7000,
        description: "Archaeological exploration of Prince Siddhartha's childhood palace and ancient Shakya stupas.",
      },
    ],
  },
  {
    id: 6,
    name: "Pooja Gurung",
    description: "Adventure and paragliding enthusiast guiding Chinde Danda, Bhedetar, and scenic trails of Eastern Nepal.",
    location: "Dharan & Bhedetar",
    experienceYears: 5,
    languages: "Nepali, English",
    dailyRate: 3000,
    licenseNumber: "NTA-EAST-2104",
    specialty: "Adventure & Paragliding",
    packagesCount: 2,
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop",
    packages: [
      {
        id: 61,
        title: "Bhedetar Paragliding & Charles Point Hike",
        duration: "1 Day",
        price: 5500,
        description: "Tandem paragliding flight over Dharan valley followed by scenic ridge walking to Charles Point.",
      },
      {
        id: 62,
        title: "Namaste Falls & Baraha Chhetra Eco Tour",
        duration: "2 Days",
        price: 6200,
        description: "Lush Eastern Nepal gorge hiking to pristine waterfalls and holy confluence temple.",
      },
    ],
  },
];

export const guidesMap: Record<number, Guide> = guidesData.reduce((acc, guide) => {
  acc[guide.id] = guide;
  return acc;
}, {} as Record<number, Guide>);
