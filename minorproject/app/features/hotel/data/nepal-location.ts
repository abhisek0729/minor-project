export interface Municipality {
  name: string;
}

export interface District {
  name: string;
  municipalities: string[];
}

export interface Province {
  id: number;
  name: string;
  districts: District[];
}

export const provinces: Province[] = [
  {
    id: 1,
    name: "Koshi",
    districts: [
      {
        name: "Sunsari",
        municipalities: ["Dharan", "Itahari", "Inaruwa", "Duhabi", "Ramdhuni", "Barahachhetra"],
      },
      {
        name: "Morang",
        municipalities: ["Biratnagar", "Belbari", "Pathari Shanischare", "Sundar Haraicha", "Urlabari", "Rangeli"],
      },
      {
        name: "Jhapa",
        municipalities: ["Birtamod", "Damak", "Mechinagar", "Bhadrapur", "Arjundhara", "Kankai", "Shivasatakshi"],
      },
      {
        name: "Ilam",
        municipalities: ["Ilam", "Deumai", "Mai", "Suryodaya", "Fikkal", "Kanyam"],
      },
      {
        name: "Panchthar",
        municipalities: ["Phidim", "Falgunanda", "Hilihang", "Kummayak", "Miklajung"],
      },
      {
        name: "Taplejung",
        municipalities: ["Phungling", "Sirijangha", "Sidingba", "Maiwakhola", "Pathibhara"],
      },
      {
        name: "Dhankuta",
        municipalities: ["Dhankuta", "Pakhribas", "Mahalaxmi", "Bhedetar"],
      },
      {
        name: "Bhojpur",
        municipalities: ["Bhojpur", "Shadanand", "Hatuwagadhi", "Ramprasad Rai"],
      },
      {
        name: "Terhathum",
        municipalities: ["Myanglung", "Laligurans", "Aathrai", "Chhathar"],
      },
      {
        name: "Sankhuwasabha",
        municipalities: ["Khandbari", "Chainpur", "Dharmadevi", "Madi", "Panchkhapan"],
      },
      {
        name: "Solukhumbu",
        municipalities: ["Solududhkunda", "Namche", "Lukla", "Khumbu Pasanglhamu", "Dudhkaushika"],
      },
      {
        name: "Okhaldhunga",
        municipalities: ["Siddhicharan", "Khijidemba", "Champadevi", "Manebhanjyang"],
      },
      {
        name: "Khotang",
        municipalities: ["Diktel Rupakot Majhuwagadhi", "Halesi Tuwachung", "Khotehang", "Jantedhunga"],
      },
      {
        name: "Udayapur",
        municipalities: ["Triyuga", "Katari", "Chaudandigadhi", "Belaka"],
      },
    ],
  },
  {
    id: 2,
    name: "Madhesh",
    districts: [
      {
        name: "Dhanusha",
        municipalities: ["Janakpurdham", "Chhireshwarnath", "Dhanusadham", "Mithila", "Sabaila"],
      },
      {
        name: "Parsa",
        municipalities: ["Birgunj", "Pokhariya", "Bahudaramai", "Parsagadhi"],
      },
      {
        name: "Bara",
        municipalities: ["Kalaiya", "Jeetpur Simara", "Kolhabi", "Nijgadh", "Mahagadhimai"],
      },
      {
        name: "Rautahat",
        municipalities: ["Gaur", "Chandrapur", "Garuda", "Gujara", "Brindaban"],
      },
      {
        name: "Sarlahi",
        municipalities: ["Malangwa", "Harion", "Lalbandi", "Ishwarpur", "Barahathwa"],
      },
      {
        name: "Mahottari",
        municipalities: ["Jaleshwor", "Bardibas", "Gaushala", "Bhangaha", "Loharpatti"],
      },
      {
        name: "Siraha",
        municipalities: ["Siraha", "Lahan", "Golbazar", "Mirchaiya", "Dhangadhimai"],
      },
      {
        name: "Saptari",
        municipalities: ["Rajbiraj", "Kanchanrup", "Dakneshwori", "Bodhebarsain", "Hanumannagar Kankalini"],
      },
    ],
  },
  {
    id: 3,
    name: "Bagmati",
    districts: [
      {
        name: "Kathmandu",
        municipalities: ["Kathmandu Metropolitan City", "Kirtipur", "Budhanilkantha", "Tokha", "Chandragiri", "Tarakeshwar", "Gokarneshwar", "Nagarjun", "Kageshwari Manohara", "Dakshinkali", "Shankharapur"],
      },
      {
        name: "Lalitpur",
        municipalities: ["Lalitpur Metropolitan City", "Mahalaxmi", "Godawari", "Konjyoson", "Bagmati", "Mahankal"],
      },
      {
        name: "Bhaktapur",
        municipalities: ["Bhaktapur", "Madhyapur Thimi", "Suryabinayak", "Changunarayan"],
      },
      {
        name: "Chitwan",
        municipalities: ["Bharatpur Metropolitan City", "Ratnanagar (Sauraha)", "Khairhani", "Madi", "Rapti", "Kalika"],
      },
      {
        name: "Makwanpur",
        municipalities: ["Hetauda Sub-Metropolitan", "Thaha", "Bhimfedi", "Makawanpurgadhi", "Manahari"],
      },
      {
        name: "Kavrepalanchok",
        municipalities: ["Dhulikhel", "Banepa", "Panauti", "Panchkhal", "Namobuddha", "Mandandeupur"],
      },
      {
        name: "Sindhupalchok",
        municipalities: ["Chautara Sangachokgadhi", "Melamchi", "Barhabise", "Helambu", "Bhotekoshi"],
      },
      {
        name: "Dhading",
        municipalities: ["Nilkantha", "Dhunibeshi", "Galchhi", "Gajuri", "Benighat Rorang"],
      },
      {
        name: "Nuwakot",
        municipalities: ["Bidur", "Belkotgadhi", "Kakani", "Dupcheshwar", "Likhu"],
      },
      {
        name: "Rasuwa",
        municipalities: ["Gosaikunda (Dhunche)", "Uttargaya", "Kalika", "Naukunda", "Amachodingmo"],
      },
      {
        name: "Dolakha",
        municipalities: ["Bhimeshwar (Charikot)", "Jiri", "Kalinchok", "Baiteshwar", "Gaurishankar"],
      },
      {
        name: "Ramechhap",
        municipalities: ["Manthali", "Ramechhap", "Umakunda", "Khandadevi", "Doramba"],
      },
      {
        name: "Sindhuli",
        municipalities: ["Kamalamai (Sindhulimadi)", "Dudhauli", "Golanjor", "Sunkoshi", "Marin"],
      },
    ],
  },
  {
    id: 4,
    name: "Gandaki",
    districts: [
      {
        name: "Kaski",
        municipalities: ["Pokhara Metropolitan City", "Annapurna", "Machhapuchhre", "Madi", "Rupa"],
      },
      {
        name: "Tanahun",
        municipalities: ["Byas (Damauli)", "Shuklagandaki", "Bhimad", "Bhanu", "Bandipur", "Devghat"],
      },
      {
        name: "Gorkha",
        municipalities: ["Gorkha", "Palungtar", "Manakamana", "Barpak Sulikot", "Aarughat", "Chumanubri"],
      },
      {
        name: "Lamjung",
        municipalities: ["Besisahar", "Sundarbazar", "Rainas", "Madhya Nepal", "Marsyangdi"],
      },
      {
        name: "Syangja",
        municipalities: ["Putalibazar", "Waling", "Chapakot", "Bhirkot", "Galyang"],
      },
      {
        name: "Nawalpur",
        municipalities: ["Kawasoti", "Gaindakot", "Devachuli", "Madhyabindu", "Hupsekot"],
      },
      {
        name: "Parbat",
        municipalities: ["Kusma", "Phalebas", "Jaljala", "Modi", "Mahashila"],
      },
      {
        name: "Baglung",
        municipalities: ["Baglung", "Galkot", "Jaimuni", "Dhorpatan"],
      },
      {
        name: "Myagdi",
        municipalities: ["Beni", "Annapurna (Tatopani/Ghorepani)", "Mangala", "Malika", "Dhaulagiri"],
      },
      {
        name: "Mustang",
        municipalities: ["Gharapjhong (Jomsom)", "Baragung Muktichhetra (Muktinath)", "Lo-Ghekar Damodarkunda", "Lomanthang", "Thasang"],
      },
      {
        name: "Manang",
        municipalities: ["Chame", "Manang Ngisyang", "Narpa Bhumi", "Nasong"],
      },
    ],
  },
  {
    id: 5,
    name: "Lumbini",
    districts: [
      {
        name: "Rupandehi",
        municipalities: ["Butwal Sub-Metropolitan", "Siddharthanagar (Bhairahawa)", "Lumbini Sanskritik", "Tilottama", "Sainamaina", "Devdaha"],
      },
      {
        name: "Kapilvastu",
        municipalities: ["Kapilvastu (Taulihawa)", "Banganga", "Buddhabhumi", "Shivaraj", "Krishnanagar"],
      },
      {
        name: "Palpa",
        municipalities: ["Tansen", "Rampur", "Rainadevi Chhahara", "Ribdikot", "Bagnaskali"],
      },
      {
        name: "Dang",
        municipalities: ["Ghorahi Sub-Metropolitan", "Tulsipur Sub-Metropolitan", "Lamahi", "Rapti", "Gadhawa"],
      },
      {
        name: "Banke",
        municipalities: ["Nepalgunj Sub-Metropolitan", "Kohalpur", "Khajura", "Janaki", "Raptisonari"],
      },
      {
        name: "Bardiya",
        municipalities: ["Gulariya", "Madhuwan", "Rajapur", "Thakurbaba (Bardia NP)", "Bansgadhi"],
      },
      {
        name: "Parasi",
        municipalities: ["Ramgram (Parasi)", "Sunwal", "Bardaghat", "Sarawal", "Palhinandan"],
      },
      {
        name: "Arghakhanchi",
        municipalities: ["Sandhikharka", "Sitaganga", "Bhumikasthan", "Chhatradev", "Panini"],
      },
      {
        name: "Gulmi",
        municipalities: ["Resunga (Tamghas)", "Musikot", "Chandrakot", "Isma", "Ruru (Ridi)"],
      },
      {
        name: "Pyuthan",
        municipalities: ["Pyuthan", "Swargadwari", "Gaumukhi", "Mallarani", "Jhimruk"],
      },
      {
        name: "Rolpa",
        municipalities: ["Liwang (Rolpa)", "Runtigadhi", "Sunil Smriti", "Thawang"],
      },
      {
        name: "Eastern Rukum",
        municipalities: ["Rukumkot (Sisne)", "Bhume", "Putha Uttarganga"],
      },
    ],
  },
  {
    id: 6,
    name: "Karnali",
    districts: [
      {
        name: "Surkhet",
        municipalities: ["Birendranagar", "Gurbhakot", "Bheriganga", "Panchapuri", "Chaukune"],
      },
      {
        name: "Dailekh",
        municipalities: ["Narayan", "Dullu", "Chamunda Bindrasaini", "Aathbis", "Bhairabi"],
      },
      {
        name: "Jumla",
        municipalities: ["Chandannath", "Tatopani", "Patarasi", "Hima", "Sinja (Khas Heritage)"],
      },
      {
        name: "Mugu",
        municipalities: ["Chhayanath Rara (Rara Lake)", "Khatyad", "Soru", "Mugum Karmarong"],
      },
      {
        name: "Dolpa",
        municipalities: ["Thuli Bheri (Dunai)", "Tripurasundari", "Shey Phoksundo", "Dolpo Buddha"],
      },
      {
        name: "Humla",
        municipalities: ["Simikot", "Namkha (Hilsa Route)", "Kharpunath", "Sarkegad", "Chankheli"],
      },
      {
        name: "Kalikot",
        municipalities: ["Khandachakra (Manma)", "Raskot", "Tilagufa", "Pachaljharana"],
      },
      {
        name: "Jajarkot",
        municipalities: ["Bheri (Khalanga)", "Chhedagad", "Nalgad", "Barekot", "Kuse"],
      },
      {
        name: "Salyan",
        municipalities: ["Sharada (Khalanga)", "Bagchaur", "Bangad Kupinde", "Kupinde", "Kapurkot"],
      },
      {
        name: "Western Rukum",
        municipalities: ["Musikot", "Chaurjahari", "Aathbiskot", "Sanibheri"],
      },
    ],
  },
  {
    id: 7,
    name: "Sudurpashchim",
    districts: [
      {
        name: "Kailali",
        municipalities: ["Dhangadhi Sub-Metropolitan", "Tikapur", "Godawari (Attariya)", "Lamki Chuha", "Ghodaghodi", "Bhajani"],
      },
      {
        name: "Kanchanpur",
        municipalities: ["Bhimdatta (Mahendranagar)", "Bedkot", "Shuklaphanta", "Mahakali (Dhodhara Chandani)", "Krishnapur"],
      },
      {
        name: "Dadeldhura",
        municipalities: ["Amargadhi", "Parshuram", "Aalital", "Ganyapadhura", "Navadurga"],
      },
      {
        name: "Doti",
        municipalities: ["Dipayal Silgadhi", "Shikhar", "Purbichauki", "Sayal", "Bogatan"],
      },
      {
        name: "Achham",
        municipalities: ["Mangalsen", "Sanfebagar", "Kamalbazar", "Panchadewal Binayak", "Ramaroshan"],
      },
      {
        name: "Bajhang",
        municipalities: ["Jayaprithvi (Chainpur)", "Bungal", "Khaptadchhanna", "Saipal (Base Camp)"],
      },
      {
        name: "Bajura",
        municipalities: ["Badimalika (Martadi)", "Budhiganga", "Budhinanda", "Triveni", "Khaptad Chhededaha"],
      },
      {
        name: "Baitadi",
        municipalities: ["Dasharathchand", "Patan", "Melauli", "Purchaudi", "Dogadakedar"],
      },
      {
        name: "Darchula",
        municipalities: ["Mahakali (Darchula)", "Shailyashikhar", "Malikarjun", "Apihimal (Base Camp)"],
      },
    ],
  },
];