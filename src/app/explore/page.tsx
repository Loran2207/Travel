"use client";

import { useState } from "react";
import { cities, popularCities, topPicks } from "@/data/mock";
import { CityCard } from "@/components/CityCard";
import { SearchModal } from "@/components/SearchModal";

export default function ExplorePage() {
  const [showSearch, setShowSearch] = useState(false);

  const popular = cities.filter((c) => popularCities.includes(c.id));
  const picks = cities.filter((c) => topPicks.includes(c.id));

  return (
    <div className="px-5 pt-12">
      {/* Greeting */}
      <h1 className="text-2xl font-bold text-gray-900">Good morning 👋</h1>
      <p className="text-sm text-gray-500 mt-1">
        Where are you going next?
      </p>

      {/* Search Bar */}
      <button
        onClick={() => setShowSearch(true)}
        className="w-full mt-5 px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-left text-sm text-gray-400"
      >
        Search cities...
      </button>

      {/* Popular */}
      <section className="mt-8">
        <h2 className="text-base font-bold text-gray-900 mb-3">
          Popular right now
        </h2>
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
          {popular.map((city) => (
            <CityCard
              key={city.id}
              name={city.name}
              country={city.country}
              onClick={() => setShowSearch(true)}
            />
          ))}
        </div>
      </section>

      {/* Top Picks */}
      <section className="mt-8">
        <h2 className="text-base font-bold text-gray-900 mb-3">
          Top picks for you
        </h2>
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
          {picks.map((city) => (
            <CityCard
              key={city.id}
              name={city.name}
              country={city.country}
              onClick={() => setShowSearch(true)}
            />
          ))}
        </div>
      </section>

      {showSearch && <SearchModal onClose={() => setShowSearch(false)} />}
    </div>
  );
}
