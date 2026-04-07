export interface City {
  id: string;
  name: string;
  country: string;
}

export interface TripStop {
  time: string;
  number: number;
  name: string;
  description: string;
  walkToNext?: string;
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
  carDistance: string;
  footSteps: string;
  footDistance: string;
  estimatedTime: string;
  stops: TripStop[];
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
    description:
      "Discover the meticulously rebuilt Old Town of Warsaw, a UNESCO World Heritage Site. Walk through cobblestone streets and see how the city rose from the ashes of WWII.",
    carDistance: "12 km",
    footSteps: "28,000 steps (~18 km)",
    footDistance: "18 km",
    estimatedTime: "6–8 hours",
    imageCount: 5,
    stops: [
      { time: "9:00 AM", number: 1, name: "Castle Square", description: "Start at the iconic Royal Castle square with its Sigismund Column.", walkToNext: "8 min walk" },
      { time: "10:00 AM", number: 2, name: "Old Town Market Square", description: "Explore the colorful townhouses and the Mermaid statue.", walkToNext: "5 min walk" },
      { time: "11:30 AM", number: 3, name: "Barbican", description: "Visit the semicircular fortified outpost and city walls.", walkToNext: "12 min walk" },
      { time: "1:00 PM", number: 4, name: "Krakowskie Przedmiescie", description: "Stroll along Warsaw's most prestigious avenue for lunch.", walkToNext: "10 min walk" },
      { time: "3:00 PM", number: 5, name: "Lazienki Park", description: "End the day at the beautiful Palace on the Isle and its gardens." },
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
    description:
      "Taste your way through Warsaw's vibrant food scene from traditional pierogi to modern Polish fusion cuisine.",
    carDistance: "8 km",
    footSteps: "18,000 steps (~12 km)",
    footDistance: "12 km",
    estimatedTime: "5–6 hours",
    imageCount: 5,
    stops: [
      { time: "10:00 AM", number: 1, name: "Hala Koszyki", description: "Start at this renovated market hall with artisan food stalls.", walkToNext: "15 min walk" },
      { time: "11:30 AM", number: 2, name: "Pierogi House", description: "Try traditional Polish dumplings with seasonal fillings.", walkToNext: "8 min walk" },
      { time: "1:00 PM", number: 3, name: "Praga District", description: "Cross the Vistula to explore the bohemian food scene.", walkToNext: "10 min walk" },
      { time: "3:00 PM", number: 4, name: "Powiśle Craft Brewery", description: "Sample local craft beers in this riverside neighborhood." },
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
    places: 6,
    steps: "22k",
    pricePerPerson: 12,
    description:
      "Trace the path of the Berlin Wall from Checkpoint Charlie to the East Side Gallery. A journey through Cold War history.",
    carDistance: "10 km",
    footSteps: "22,000 steps (~15 km)",
    footDistance: "15 km",
    estimatedTime: "5–7 hours",
    imageCount: 5,
    stops: [
      { time: "9:00 AM", number: 1, name: "Checkpoint Charlie", description: "Begin at the famous Cold War crossing point between East and West.", walkToNext: "12 min walk" },
      { time: "10:30 AM", number: 2, name: "Topography of Terror", description: "Learn about the Nazi regime at this powerful documentation center.", walkToNext: "15 min walk" },
      { time: "12:00 PM", number: 3, name: "Brandenburg Gate", description: "Visit the symbol of German unity and have lunch nearby.", walkToNext: "20 min walk" },
      { time: "2:00 PM", number: 4, name: "Berlin Wall Memorial", description: "See the preserved section of the wall with guard tower.", walkToNext: "10 min walk" },
      { time: "3:30 PM", number: 5, name: "East Side Gallery", description: "End at the longest remaining section of the Wall, now an open-air gallery." },
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
    places: 5,
    steps: "20k",
    pricePerPerson: 18,
    description:
      "From the hilltop castle to the astronomical clock, experience Prague's fairy-tale architecture and thousand years of history.",
    carDistance: "7 km",
    footSteps: "20,000 steps (~13 km)",
    footDistance: "13 km",
    estimatedTime: "5–6 hours",
    imageCount: 5,
    stops: [
      { time: "9:00 AM", number: 1, name: "Prague Castle", description: "Explore the world's largest ancient castle complex.", walkToNext: "15 min walk" },
      { time: "11:00 AM", number: 2, name: "Charles Bridge", description: "Cross the iconic 14th-century bridge lined with statues.", walkToNext: "5 min walk" },
      { time: "12:30 PM", number: 3, name: "Old Town Square", description: "Watch the astronomical clock and enjoy lunch at a cafe.", walkToNext: "8 min walk" },
      { time: "2:00 PM", number: 4, name: "Jewish Quarter", description: "Visit the historic synagogues and the Old Jewish Cemetery." },
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
    places: 6,
    steps: "25k",
    pricePerPerson: 30,
    description:
      "Follow the trail of Antoni Gaudi's masterpieces from the Sagrada Familia to Park Guell. A feast for the eyes.",
    carDistance: "15 km",
    footSteps: "25,000 steps (~17 km)",
    footDistance: "17 km",
    estimatedTime: "7–8 hours",
    imageCount: 5,
    stops: [
      { time: "9:00 AM", number: 1, name: "Sagrada Familia", description: "Start at Gaudi's unfinished masterpiece basilica.", walkToNext: "20 min walk" },
      { time: "11:00 AM", number: 2, name: "Casa Batllo", description: "Marvel at the colorful facade on Passeig de Gracia.", walkToNext: "5 min walk" },
      { time: "12:30 PM", number: 3, name: "Casa Mila", description: "Visit La Pedrera and its rooftop with warrior chimneys.", walkToNext: "25 min walk" },
      { time: "2:00 PM", number: 4, name: "Park Guell", description: "Explore the whimsical hilltop park with mosaic terraces.", walkToNext: "15 min walk" },
      { time: "4:00 PM", number: 5, name: "La Rambla", description: "End the day strolling down Barcelona's famous boulevard." },
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
    places: 6,
    steps: "24k",
    pricePerPerson: 20,
    description:
      "Walk through 2,000 years of history from the Colosseum to the Pantheon. Experience the grandeur of the Roman Empire.",
    carDistance: "9 km",
    footSteps: "24,000 steps (~16 km)",
    footDistance: "16 km",
    estimatedTime: "6–7 hours",
    imageCount: 5,
    stops: [
      { time: "9:00 AM", number: 1, name: "Colosseum", description: "Start at the iconic amphitheater of ancient Rome.", walkToNext: "5 min walk" },
      { time: "11:00 AM", number: 2, name: "Roman Forum", description: "Wander through the ruins of Rome's ancient center of public life.", walkToNext: "10 min walk" },
      { time: "12:30 PM", number: 3, name: "Trevi Fountain", description: "Toss a coin and grab lunch at a nearby trattoria.", walkToNext: "8 min walk" },
      { time: "2:00 PM", number: 4, name: "Pantheon", description: "Enter the best-preserved ancient Roman building.", walkToNext: "12 min walk" },
      { time: "3:30 PM", number: 5, name: "Piazza Navona", description: "Relax at this beautiful baroque square with three fountains." },
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
