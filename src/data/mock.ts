export interface City {
  id: string;
  name: string;
  country: string;
}

export interface Review {
  author: string;
  rating: number;
  timeAgo: string;
  text: string;
}

export interface TripStop {
  number: number;
  name: string;
  category: string;
  description: string;
  address?: string;
  rating?: number;
  reviewCount?: number;
  tips?: string[];
  openingHours?: string;
  phone?: string;
  website?: string;
  priceLevel?: string;
  photos?: number;
  reviews?: Review[];
  transport?: {
    type: "walk" | "drive" | "bus" | "metro";
    duration: string;
    distance: string;
  };
}

export interface TripDay {
  day: number;
  city: string;
  distance: string;
  spots: number;
  stops: TripStop[];
}

export interface Trip {
  id: string;
  cityId: string;
  title: string;
  city: string;
  country: string;
  categories: string[];
  rating: number;
  reviewCount: number;
  places: number;
  steps: string;
  pricePerPerson: number;
  description: string;
  totalDistance: string;
  estimatedTime: string;
  days: TripDay[];
  imageCount: number;
}

export const cities: City[] = [
  { id: "warsaw", name: "Warsaw", country: "Poland" },
  { id: "krakow", name: "Krakow", country: "Poland" },
  { id: "gdansk", name: "Gdansk", country: "Poland" },
  { id: "berlin", name: "Berlin", country: "Germany" },
  { id: "prague", name: "Prague", country: "Czech Republic" },
  { id: "lisbon", name: "Lisbon", country: "Portugal" },
  { id: "barcelona", name: "Barcelona", country: "Spain" },
  { id: "rome", name: "Rome", country: "Italy" },
];

export const popularCities = ["warsaw", "berlin", "prague", "barcelona"];
export const topPicks = ["lisbon", "rome", "krakow", "gdansk"];

export const interests = [
  "History",
  "Food & Drink",
  "Architecture",
  "Nature",
  "Shopping",
  "Art & Museums",
  "Nightlife",
  "Hidden Gems",
  "Local Life",
  "Sports",
];

export const budgetOptions = [
  { label: "Budget", description: "under $10", value: "budget" },
  { label: "Standard", description: "$10–30", value: "standard" },
  { label: "Comfort", description: "$30–60", value: "comfort" },
  { label: "Premium", description: "$60+", value: "premium" },
];

export const trips: Trip[] = [
  {
    id: "warsaw-old-town",
    cityId: "warsaw",
    title: "Old Town Heritage Walk",
    city: "Warsaw",
    country: "Poland",
    categories: ["History", "Architecture"],
    rating: 4.8,
    reviewCount: 124,
    places: 7,
    steps: "28k",
    pricePerPerson: 15,
    description: "Discover the meticulously rebuilt Old Town of Warsaw, a UNESCO World Heritage Site. Walk through cobblestone streets and see how the city rose from the ashes of WWII.",
    totalDistance: "18 km",
    estimatedTime: "2 days",
    imageCount: 5,
    days: [
      {
        day: 1,
        city: "Warsaw",
        distance: "10 km",
        spots: 3,
        stops: [
          { number: 1, name: "Castle Square", category: "Landmark", description: "Start at the iconic Royal Castle square with its Sigismund Column. The square is the main entrance to the Old Town and features a panoramic view of the Vistula river.", address: "Plac Zamkowy, 00-001 Warsaw, Poland", rating: 4.7, reviewCount: 12840, tips: ["Best photos at sunrise before the crowds arrive.", "The Royal Castle interior is worth the entrance fee.", "Free guided tours available on Sundays."], openingHours: "Open 24 hours", phone: "+48 22 355 51 70", website: "zamek-krolewski.pl", priceLevel: "Free", photos: 8, reviews: [{ author: "Anna M.", rating: 5, timeAgo: "2 weeks ago", text: "Absolutely stunning square! The Royal Castle is beautifully restored. We spent 2 hours here and it wasn't enough." }, { author: "James K.", rating: 4, timeAgo: "1 month ago", text: "Great starting point for exploring Old Town. Can get crowded during peak hours but worth visiting early morning." }, { author: "Sofia R.", rating: 5, timeAgo: "3 months ago", text: "The view from the terrace overlooking the Vistula is breathtaking. Don't miss the free Sunday tours!" }], transport: { type: "walk", duration: "12 min", distance: "900m" } },
          { number: 2, name: "Old Town Market Square", category: "Landmark", description: "Explore the colorful townhouses and the Mermaid statue. This medieval square was completely rebuilt after WWII destruction and is now a UNESCO World Heritage Site.", address: "Rynek Starego Miasta, 00-272 Warsaw, Poland", rating: 4.6, reviewCount: 8920, tips: ["Try traditional Polish food at one of the restaurants around the square.", "The Mermaid statue is a great photo spot.", "Visit during Christmas for the holiday market."], openingHours: "Open 24 hours", priceLevel: "Free", photos: 12, reviews: [{ author: "Maria L.", rating: 5, timeAgo: "1 week ago", text: "The most beautiful square in Warsaw. The restaurants are a bit touristy but the atmosphere is incredible." }, { author: "Tom W.", rating: 4, timeAgo: "2 months ago", text: "Lovely architecture. The reconstruction after WWII is remarkable. Grab some ice cream and just sit and enjoy." }], transport: { type: "walk", duration: "8 min", distance: "600m" } },
          { number: 3, name: "Barbican", category: "Museum", description: "Visit the semicircular fortified outpost and city walls. Built in 1540, it's one of the few remaining relics of the complex network of historic fortifications.", address: "ul. Nowomiejska 15/17, 00-257 Warsaw, Poland", rating: 4.5, reviewCount: 5430, tips: ["Walk along the top of the old city walls for great views.", "Art exhibitions are often held inside."], openingHours: "Opens at 10:00 AM", phone: "+48 22 831 02 48", priceLevel: "$", photos: 5, reviews: [{ author: "Peter D.", rating: 5, timeAgo: "3 weeks ago", text: "Fascinating piece of medieval architecture. The city wall walk is a hidden gem that most tourists miss." }] },
        ],
      },
      {
        day: 2,
        city: "Warsaw",
        distance: "8 km",
        spots: 2,
        stops: [
          { number: 1, name: "Krakowskie Przedmiescie", category: "Neighborhood", description: "Stroll along Warsaw's most prestigious avenue for lunch.", transport: { type: "bus", duration: "15 min", distance: "3.2 km" } },
          { number: 2, name: "Lazienki Park", category: "Nature", description: "End at the beautiful Palace on the Isle and its gardens." },
        ],
      },
    ],
  },
  {
    id: "warsaw-food-tour",
    cityId: "warsaw",
    title: "Warsaw Food & Flavors",
    city: "Warsaw",
    country: "Poland",
    categories: ["Food & Drink", "Local Life"],
    rating: 4.6,
    reviewCount: 89,
    places: 6,
    steps: "18k",
    pricePerPerson: 25,
    description: "Taste your way through Warsaw's vibrant food scene from traditional pierogi to modern Polish fusion cuisine.",
    totalDistance: "12 km",
    estimatedTime: "1 day",
    imageCount: 5,
    days: [
      {
        day: 1,
        city: "Warsaw",
        distance: "12 km",
        spots: 4,
        stops: [
          { number: 1, name: "Hala Koszyki", category: "Food Market", description: "Start at this renovated market hall with artisan food stalls.", transport: { type: "walk", duration: "15 min", distance: "1.2 km" } },
          { number: 2, name: "Pierogi House", category: "Restaurant", description: "Try traditional Polish dumplings with seasonal fillings.", transport: { type: "walk", duration: "8 min", distance: "650m" } },
          { number: 3, name: "Praga District", category: "Neighborhood", description: "Cross the Vistula to explore the bohemian food scene.", transport: { type: "metro", duration: "10 min", distance: "3.5 km" } },
          { number: 4, name: "Powisle Craft Brewery", category: "Bar", description: "Sample local craft beers in this riverside neighborhood." },
        ],
      },
    ],
  },
  {
    id: "berlin-wall-trail",
    cityId: "berlin",
    title: "Berlin Wall Trail",
    city: "Berlin",
    country: "Germany",
    categories: ["History", "Art & Museums"],
    rating: 4.9,
    reviewCount: 210,
    places: 9,
    steps: "22k",
    pricePerPerson: 12,
    description: "Trace the path of the Berlin Wall from Checkpoint Charlie to the East Side Gallery. A journey through Cold War history.",
    totalDistance: "25 km",
    estimatedTime: "3 days",
    imageCount: 5,
    days: [
      {
        day: 1,
        city: "Berlin",
        distance: "8 km",
        spots: 3,
        stops: [
          { number: 1, name: "Checkpoint Charlie", category: "Landmark", description: "Begin at the famous Cold War crossing point between East and West.", transport: { type: "walk", duration: "12 min", distance: "1 km" } },
          { number: 2, name: "Topography of Terror", category: "Museum", description: "Learn about the Nazi regime at this powerful documentation center.", transport: { type: "walk", duration: "15 min", distance: "1.3 km" } },
          { number: 3, name: "Brandenburg Gate", category: "Landmark", description: "Visit the symbol of German unity and have lunch nearby." },
        ],
      },
      {
        day: 2,
        city: "Berlin",
        distance: "6 km",
        spots: 3,
        stops: [
          { number: 1, name: "Berlin Wall Memorial", category: "Memorial", description: "See the preserved section of the wall with guard tower.", transport: { type: "metro", duration: "8 min", distance: "2.1 km" } },
          { number: 2, name: "East Side Gallery", category: "Art", description: "Walk along the longest remaining section of the Wall, now an open-air gallery.", transport: { type: "walk", duration: "20 min", distance: "1.5 km" } },
          { number: 3, name: "Oberbaum Bridge", category: "Landmark", description: "Cross the iconic double-deck bridge over the River Spree." },
        ],
      },
      {
        day: 3,
        city: "Berlin",
        distance: "11 km",
        spots: 3,
        stops: [
          { number: 1, name: "Reichstag Building", category: "Landmark", description: "Visit the German parliament building and its glass dome.", transport: { type: "bus", duration: "10 min", distance: "2.5 km" } },
          { number: 2, name: "Museum Island", category: "Museum", description: "Explore the UNESCO-listed museum complex on the River Spree.", transport: { type: "walk", duration: "18 min", distance: "1.4 km" } },
          { number: 3, name: "Alexanderplatz", category: "Landmark", description: "End at Berlin's iconic central square with the TV Tower." },
        ],
      },
    ],
  },
  {
    id: "prague-old-town",
    cityId: "prague",
    title: "Prague Castle & Old Town",
    city: "Prague",
    country: "Czech Republic",
    categories: ["History", "Architecture"],
    rating: 4.7,
    reviewCount: 185,
    places: 7,
    steps: "20k",
    pricePerPerson: 18,
    description: "From the hilltop castle to the astronomical clock, experience Prague's fairy-tale architecture and thousand years of history.",
    totalDistance: "13 km",
    estimatedTime: "2 days",
    imageCount: 5,
    days: [
      {
        day: 1,
        city: "Prague",
        distance: "7 km",
        spots: 3,
        stops: [
          { number: 1, name: "Prague Castle", category: "Landmark", description: "Explore the world's largest ancient castle complex.", transport: { type: "walk", duration: "15 min", distance: "1.2 km" } },
          { number: 2, name: "Charles Bridge", category: "Landmark", description: "Cross the iconic 14th-century bridge lined with statues.", transport: { type: "walk", duration: "10 min", distance: "800m" } },
          { number: 3, name: "Old Town Square", category: "Landmark", description: "Watch the astronomical clock and enjoy lunch at a cafe." },
        ],
      },
      {
        day: 2,
        city: "Prague",
        distance: "6 km",
        spots: 4,
        stops: [
          { number: 1, name: "Jewish Quarter", category: "Neighborhood", description: "Visit the historic synagogues and the Old Jewish Cemetery.", transport: { type: "walk", duration: "8 min", distance: "600m" } },
          { number: 2, name: "Wenceslas Square", category: "Landmark", description: "Walk along the broad boulevard at the heart of the New Town.", transport: { type: "metro", duration: "5 min", distance: "1.5 km" } },
          { number: 3, name: "Dancing House", category: "Architecture", description: "See the iconic deconstructivist building by Frank Gehry.", transport: { type: "walk", duration: "12 min", distance: "1 km" } },
          { number: 4, name: "Vysehrad", category: "Landmark", description: "End at the ancient fortress with panoramic views over Prague." },
        ],
      },
    ],
  },
  {
    id: "barcelona-gaudi",
    cityId: "barcelona",
    title: "Gaudi's Barcelona",
    city: "Barcelona",
    country: "Spain",
    categories: ["Architecture", "Art & Museums"],
    rating: 4.9,
    reviewCount: 302,
    places: 8,
    steps: "25k",
    pricePerPerson: 30,
    description: "Follow the trail of Antoni Gaudi's masterpieces from the Sagrada Familia to Park Guell. A feast for the eyes.",
    totalDistance: "17 km",
    estimatedTime: "2 days",
    imageCount: 5,
    days: [
      {
        day: 1,
        city: "Barcelona",
        distance: "9 km",
        spots: 4,
        stops: [
          { number: 1, name: "Sagrada Familia", category: "Landmark", description: "Start at Gaudi's unfinished masterpiece basilica.", transport: { type: "walk", duration: "20 min", distance: "1.6 km" } },
          { number: 2, name: "Casa Batllo", category: "Architecture", description: "Marvel at the colorful facade on Passeig de Gracia.", transport: { type: "walk", duration: "5 min", distance: "400m" } },
          { number: 3, name: "Casa Mila", category: "Architecture", description: "Visit La Pedrera and its rooftop with warrior chimneys.", transport: { type: "bus", duration: "25 min", distance: "4.5 km" } },
          { number: 4, name: "Park Guell", category: "Nature", description: "Explore the whimsical hilltop park with mosaic terraces." },
        ],
      },
      {
        day: 2,
        city: "Barcelona",
        distance: "8 km",
        spots: 4,
        stops: [
          { number: 1, name: "La Rambla", category: "Neighborhood", description: "Stroll down Barcelona's famous boulevard.", transport: { type: "walk", duration: "10 min", distance: "800m" } },
          { number: 2, name: "La Boqueria Market", category: "Food Market", description: "Browse the vibrant food market for fresh tapas.", transport: { type: "walk", duration: "15 min", distance: "1.2 km" } },
          { number: 3, name: "Gothic Quarter", category: "Neighborhood", description: "Wander through the medieval streets of the old city.", transport: { type: "walk", duration: "12 min", distance: "950m" } },
          { number: 4, name: "Barceloneta Beach", category: "Nature", description: "End the day relaxing at the city's famous beach." },
        ],
      },
    ],
  },
  {
    id: "rome-ancient",
    cityId: "rome",
    title: "Ancient Rome in a Day",
    city: "Rome",
    country: "Italy",
    categories: ["History", "Architecture"],
    rating: 4.8,
    reviewCount: 267,
    places: 5,
    steps: "24k",
    pricePerPerson: 20,
    description: "Walk through 2,000 years of history from the Colosseum to the Pantheon. Experience the grandeur of the Roman Empire.",
    totalDistance: "16 km",
    estimatedTime: "1 day",
    imageCount: 5,
    days: [
      {
        day: 1,
        city: "Rome",
        distance: "16 km",
        spots: 5,
        stops: [
          { number: 1, name: "Colosseum", category: "Landmark", description: "Start at the iconic amphitheater of ancient Rome.", transport: { type: "walk", duration: "7 min", distance: "500m" } },
          { number: 2, name: "Roman Forum", category: "Landmark", description: "Wander through the ruins of Rome's ancient center of public life.", transport: { type: "walk", duration: "18 min", distance: "1.4 km" } },
          { number: 3, name: "Trevi Fountain", category: "Landmark", description: "Toss a coin and grab lunch at a nearby trattoria.", transport: { type: "walk", duration: "10 min", distance: "800m" } },
          { number: 4, name: "Pantheon", category: "Landmark", description: "Enter the best-preserved ancient Roman building.", transport: { type: "walk", duration: "12 min", distance: "950m" } },
          { number: 5, name: "Piazza Navona", category: "Landmark", description: "Relax at this beautiful baroque square with three fountains." },
        ],
      },
    ],
  },
];

export function getTripsByCity(cityId: string): Trip[] {
  return trips.filter((t) => t.cityId === cityId);
}

export function getTripById(id: string): Trip | undefined {
  return trips.find((t) => t.id === id);
}

export function getCityById(id: string): City | undefined {
  return cities.find((c) => c.id === id);
}

export function searchCities(query: string): City[] {
  const q = query.toLowerCase();
  return cities.filter(
    (c) =>
      c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q)
  );
}

export function filterTrips(filters: {
  cityId?: string;
  duration?: number;
  interests?: string[];
  budget?: string;
}): Trip[] {
  let result = [...trips];

  if (filters.cityId) {
    result = result.filter((t) => t.cityId === filters.cityId);
  }

  if (filters.interests && filters.interests.length > 0) {
    result = result.filter((t) =>
      t.categories.some((c) => filters.interests!.includes(c))
    );
  }

  if (filters.budget) {
    const budgetMax: Record<string, number> = {
      budget: 10,
      standard: 30,
      comfort: 60,
      premium: Infinity,
    };
    const max = budgetMax[filters.budget] ?? Infinity;
    const min =
      filters.budget === "budget"
        ? 0
        : filters.budget === "standard"
          ? 10
          : filters.budget === "comfort"
            ? 30
            : 60;
    result = result.filter(
      (t) => t.pricePerPerson >= min && t.pricePerPerson <= max
    );
  }

  return result;
}
