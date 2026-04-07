"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { filterTrips, trips, interests, budgetOptions } from "@/data/mock";
import { TripCard } from "@/components/TripCard";

type SortOption = "recommended" | "rating" | "price";

export default function ResultsPage() {
  const router = useRouter();
  const { state } = useApp();
  const [sort, setSort] = useState<SortOption>("recommended");
  const [showFilters, setShowFilters] = useState(false);

  // Local filter state (applied on "Show trips")
  const [filterInterests, setFilterInterests] = useState<string[]>(state.search.interests);
  const [filterBudget, setFilterBudget] = useState(state.search.budget);

  // Applied filters
  const [appliedInterests, setAppliedInterests] = useState<string[]>(state.search.interests);
  const [appliedBudget, setAppliedBudget] = useState(state.search.budget);

  const { cityId, cityName, duration } = state.search;

  const results = useMemo(() => {
    const hasFilters = cityId || appliedInterests.length > 0 || appliedBudget;
    let r = hasFilters
      ? filterTrips({ cityId, interests: appliedInterests, budget: appliedBudget })
      : [...trips];

    if (sort === "rating") r = [...r].sort((a, b) => b.rating - a.rating);
    else if (sort === "price") r = [...r].sort((a, b) => a.pricePerPerson - b.pricePerPerson);
    return r;
  }, [cityId, appliedInterests, appliedBudget, sort]);

  const pillText = cityName
    ? `${cityName}${duration ? ` · ${duration}d` : ""}`
    : "All destinations";

  const activeFilterCount = appliedInterests.length + (appliedBudget ? 1 : 0);

  const toggleFilterInterest = (interest: string) => {
    setFilterInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const handleApplyFilters = () => {
    setAppliedInterests([...filterInterests]);
    setAppliedBudget(filterBudget);
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setFilterInterests([]);
    setFilterBudget("");
  };

  const openFilters = () => {
    setFilterInterests([...appliedInterests]);
    setFilterBudget(appliedBudget);
    setShowFilters(true);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Search pill */}
          <button
            onClick={() => router.back()}
            className="flex-1 bg-white border border-gray-200 rounded-full px-4 py-2 shadow-sm text-left"
          >
            <p className="text-sm font-semibold text-gray-900 truncate">{pillText}</p>
            <p className="text-xs text-gray-500 truncate">
              {results.length} trip{results.length !== 1 ? "s" : ""} found
            </p>
          </button>

          {/* Filter button */}
          <button
            onClick={openFilters}
            className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center flex-shrink-0 relative hover:border-gray-400 transition-colors"
          >
            <svg className="w-4 h-4 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="8" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
              <circle cx="6" cy="6" r="2" fill="currentColor" />
              <circle cx="14" cy="12" r="2" fill="currentColor" />
              <circle cx="8" cy="18" r="2" fill="currentColor" />
            </svg>
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-black text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Sort bar */}
      <div className="px-5 py-3 flex items-center gap-2 overflow-x-auto hide-scrollbar">
        {(["recommended", "rating", "price"] as SortOption[]).map((opt) => (
          <button
            key={opt}
            onClick={() => setSort(opt)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-colors ${
              sort === opt
                ? "bg-black text-white border-black"
                : "border-gray-300 text-gray-600"
            }`}
          >
            {opt === "recommended" ? "Recommended" : opt === "rating" ? "Top rated" : "Lowest price"}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="px-5 pb-6">
        <div className="flex flex-col gap-4">
          {results.length === 0 ? (
            <div className="text-center py-16">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
              <p className="text-sm font-medium text-gray-900">No trips found</p>
              <p className="text-xs text-gray-500 mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            results.map((trip) => <TripCard key={trip.id} trip={trip} />)
          )}
        </div>
      </div>

      {/* Filter modal */}
      {showFilters && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/40 animate-fade-in"
            onClick={() => setShowFilters(false)}
          />
          <div className="relative w-full max-w-[430px] bg-white rounded-t-3xl animate-slide-up flex flex-col" style={{ maxHeight: "90vh" }}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
              <div className="w-8" />
              <h2 className="text-base font-bold text-gray-900">Filters</h2>
              <button
                onClick={() => setShowFilters(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <span className="text-gray-500 text-lg">&times;</span>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-5">
              {/* Activities */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Activities</h3>
                <p className="text-xs text-gray-500 mb-4">What are you interested in?</p>
                <div className="flex flex-wrap gap-2">
                  {interests.map((interest) => {
                    const selected = filterInterests.includes(interest);
                    return (
                      <button
                        key={interest}
                        onClick={() => toggleFilterInterest(interest)}
                        className={`px-4 py-2.5 rounded-full text-sm font-medium border transition-colors ${
                          selected
                            ? "bg-black text-white border-black"
                            : "border-gray-300 text-gray-600 hover:border-gray-400"
                        }`}
                      >
                        {interest}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="h-px bg-gray-100 mb-6" />

              {/* Price range */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Price range</h3>
                <p className="text-xs text-gray-500 mb-4">Per person, per trip</p>
                <div className="grid grid-cols-2 gap-3">
                  {budgetOptions.map((opt) => {
                    const selected = filterBudget === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setFilterBudget(selected ? "" : opt.value)}
                        className={`p-4 rounded-2xl border-2 text-left transition-colors ${
                          selected
                            ? "border-black bg-gray-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <p className="text-sm font-bold text-gray-900">{opt.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{opt.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="h-px bg-gray-100 mb-6" />

              {/* Sort preference */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Sort by</h3>
                <p className="text-xs text-gray-500 mb-4">Order your results</p>
                <div className="flex flex-col gap-2">
                  {([
                    { value: "recommended" as SortOption, label: "Recommended", desc: "Best match for you" },
                    { value: "rating" as SortOption, label: "Top rated", desc: "Highest rated first" },
                    { value: "price" as SortOption, label: "Lowest price", desc: "Cheapest per person" },
                  ]).map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSort(opt.value)}
                      className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-colors ${
                        sort === opt.value
                          ? "border-black bg-gray-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div>
                        <p className="text-sm font-bold text-gray-900">{opt.label}</p>
                        <p className="text-xs text-gray-500">{opt.desc}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        sort === opt.value ? "border-black" : "border-gray-300"
                      }`}>
                        {sort === opt.value && <div className="w-2.5 h-2.5 bg-black rounded-full" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-gray-200 px-5 py-4 flex items-center justify-between">
              <button
                onClick={handleClearFilters}
                className="text-sm font-semibold text-gray-900 underline"
              >
                Clear all
              </button>
              <button
                onClick={handleApplyFilters}
                className="bg-black text-white px-6 py-3 rounded-xl text-sm font-bold transition-colors hover:bg-gray-800"
              >
                Show {results.length} trip{results.length !== 1 ? "s" : ""}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
