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
    <div className="min-h-screen bg-white">
      {/* Hero banner */}
      <div className="relative bg-gray-200 pt-14 pb-16 px-5">
        {/* Placeholder pattern for future image */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-gray-300/50 to-gray-200" />
        </div>

        <div className="relative z-10 text-center">
          <p className="text-xs text-gray-500 mb-1">Find your next adventure</p>
          <h1 className="text-3xl font-bold text-gray-900">Good morning</h1>
          <p className="text-sm text-gray-500 mt-1">Where are you going next?</p>

          {/* Search bar inside banner */}
          <button
            onClick={() => setShowSearch(true)}
            className="w-full mt-5 flex items-center gap-3 bg-white rounded-full px-5 py-3.5 shadow-sm border border-gray-200 text-left"
          >
            <svg className="w-5 h-5 text-gray-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <div>
              <p className="text-sm font-medium text-gray-900">Search trips</p>
              <p className="text-xs text-gray-400">Anywhere · Any duration</p>
            </div>
          </button>
        </div>
      </div>

      {/* Content panel overlapping banner */}
      <div className="relative -mt-6 bg-white rounded-t-3xl pt-6 px-5 pb-4">
        {/* Popular */}
        <section>
          <h2 className="text-base font-bold text-gray-900 mb-3">Popular right now</h2>
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
          <h2 className="text-base font-bold text-gray-900 mb-3">Top picks for you</h2>
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
      </div>

      {showSearch && <SearchModal onClose={() => setShowSearch(false)} />}
    </div>
  );
}
