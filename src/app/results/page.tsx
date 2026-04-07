"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { filterTrips, trips } from "@/data/mock";
import { TripCard } from "@/components/TripCard";

type SortOption = "recommended" | "rating" | "price";

export default function ResultsPage() {
  const router = useRouter();
  const { state } = useApp();
  const [sort, setSort] = useState<SortOption>("recommended");

  const { cityId, cityName, duration, interests, budget, guests, checkIn, checkOut } = state.search;

  const hasFilters = cityId || interests.length > 0 || budget;

  let results = hasFilters
    ? filterTrips({ cityId, interests, budget })
    : [...trips];

  if (sort === "rating") {
    results = [...results].sort((a, b) => b.rating - a.rating);
  } else if (sort === "price") {
    results = [...results].sort(
      (a, b) => a.pricePerPerson - b.pricePerPerson
    );
  }

  const filterChips: string[] = [];
  if (cityName) filterChips.push(cityName);
  if (checkIn && checkOut) {
    const fmt = (d: string) => { const dt = new Date(d); return `${dt.getDate()}/${dt.getMonth()+1}`; };
    filterChips.push(`${fmt(checkIn)} - ${fmt(checkOut)}`);
  } else if (duration) {
    filterChips.push(`${duration} days`);
  }
  if (guests > 0) filterChips.push(`${guests} guest${guests !== 1 ? "s" : ""}`);
  if (interests.length > 0) filterChips.push(...interests.slice(0, 2));
  if (budget) filterChips.push(budget.charAt(0).toUpperCase() + budget.slice(1));

  return (
    <div className="px-5 pt-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => router.back()}
          className="text-gray-500 text-lg"
        >
          ←
        </button>
        <div className="flex-1 flex flex-wrap gap-1.5">
          {filterChips.length > 0 ? (
            filterChips.map((chip) => (
              <span
                key={chip}
                className="text-xs px-2 py-1 bg-gray-100 border border-gray-200 rounded-full text-gray-700"
              >
                {chip}
              </span>
            ))
          ) : (
            <span className="text-sm text-gray-500">All trips</span>
          )}
        </div>
      </div>

      {/* Sort */}
      <div className="flex items-center gap-2 mb-4 text-xs">
        <span className="text-gray-500">Sort by:</span>
        {(["recommended", "rating", "price"] as SortOption[]).map((opt) => (
          <button
            key={opt}
            onClick={() => setSort(opt)}
            className={`px-3 py-1 rounded-full border transition-colors ${
              sort === opt
                ? "bg-black text-white border-black"
                : "border-gray-300 text-gray-600"
            }`}
          >
            {opt.charAt(0).toUpperCase() + opt.slice(1)}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="flex flex-col gap-4 pb-4">
        {results.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              No trips match your filters
            </p>
          </div>
        ) : (
          results.map((trip) => <TripCard key={trip.id} trip={trip} />)
        )}
      </div>
    </div>
  );
}
