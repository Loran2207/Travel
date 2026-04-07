"use client";

import { useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { filterTrips, trips, interests } from "@/data/mock";
import { TripCard } from "@/components/TripCard";

type SortOption = "recommended" | "rating" | "price";

export default function ResultsPage() {
  const router = useRouter();
  const { state } = useApp();
  const [sort, setSort] = useState<SortOption>("recommended");
  const [showFilters, setShowFilters] = useState(false);

  // Price constants
  const PRICE_MIN = 0;
  const PRICE_MAX = 80;
  const PRICE_STEP = 5;

  // Local filter state (applied on "Show trips")
  const [filterInterests, setFilterInterests] = useState<string[]>(state.search.interests);
  const [filterPriceMin, setFilterPriceMin] = useState(PRICE_MIN);
  const [filterPriceMax, setFilterPriceMax] = useState(PRICE_MAX);

  // Applied filters
  const [appliedInterests, setAppliedInterests] = useState<string[]>(state.search.interests);
  const [appliedPriceMin, setAppliedPriceMin] = useState(PRICE_MIN);
  const [appliedPriceMax, setAppliedPriceMax] = useState(PRICE_MAX);

  const priceSliderRef = useRef<HTMLDivElement>(null);

  const { cityId, cityName, duration } = state.search;

  // Histogram bars for price distribution
  const priceHistogram = useMemo(() => {
    const buckets = Math.ceil((PRICE_MAX - PRICE_MIN) / PRICE_STEP);
    const counts = new Array(buckets).fill(0);
    const allTrips = cityId ? trips.filter(t => t.cityId === cityId) : trips;
    allTrips.forEach(t => {
      const idx = Math.min(Math.floor((t.pricePerPerson - PRICE_MIN) / PRICE_STEP), buckets - 1);
      if (idx >= 0) counts[idx]++;
    });
    const max = Math.max(...counts, 1);
    return counts.map(c => c / max);
  }, [cityId]);

  const results = useMemo(() => {
    const hasPriceFilter = appliedPriceMin > PRICE_MIN || appliedPriceMax < PRICE_MAX;
    const hasFilters = cityId || appliedInterests.length > 0 || hasPriceFilter;

    let r = hasFilters
      ? filterTrips({ cityId, interests: appliedInterests, budget: "" })
      : [...trips];

    if (hasPriceFilter) {
      r = r.filter(t => t.pricePerPerson >= appliedPriceMin && t.pricePerPerson <= appliedPriceMax);
    }

    if (sort === "rating") r = [...r].sort((a, b) => b.rating - a.rating);
    else if (sort === "price") r = [...r].sort((a, b) => a.pricePerPerson - b.pricePerPerson);
    return r;
  }, [cityId, appliedInterests, appliedPriceMin, appliedPriceMax, sort]);

  const pillText = cityName
    ? `${cityName}${duration ? ` · ${duration}d` : ""}`
    : "All destinations";

  const hasPriceActive = appliedPriceMin > PRICE_MIN || appliedPriceMax < PRICE_MAX;
  const activeFilterCount = appliedInterests.length + (hasPriceActive ? 1 : 0);

  const toggleFilterInterest = (interest: string) => {
    setFilterInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const handleApplyFilters = () => {
    setAppliedInterests([...filterInterests]);
    setAppliedPriceMin(filterPriceMin);
    setAppliedPriceMax(filterPriceMax);
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setFilterInterests([]);
    setFilterPriceMin(PRICE_MIN);
    setFilterPriceMax(PRICE_MAX);
  };

  const openFilters = () => {
    setFilterInterests([...appliedInterests]);
    setFilterPriceMin(appliedPriceMin);
    setFilterPriceMax(appliedPriceMax);
    setShowFilters(true);
  };

  const getPriceFromX = (clientX: number) => {
    if (!priceSliderRef.current) return 0;
    const rect = priceSliderRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const raw = PRICE_MIN + pct * (PRICE_MAX - PRICE_MIN);
    return Math.round(raw / PRICE_STEP) * PRICE_STEP;
  };

  const startPriceDrag = (thumb: "min" | "max", startX: number, isTouch: boolean) => {
    const onMove = (ev: MouseEvent | TouchEvent) => {
      const x = "touches" in ev ? ev.touches[0].clientX : ev.clientX;
      const val = getPriceFromX(x);
      if (thumb === "min") {
        setFilterPriceMin(Math.min(val, filterPriceMax - PRICE_STEP));
      } else {
        setFilterPriceMax(Math.max(val, filterPriceMin + PRICE_STEP));
      }
    };
    const onEnd = () => {
      window.removeEventListener(isTouch ? "touchmove" : "mousemove", onMove);
      window.removeEventListener(isTouch ? "touchend" : "mouseup", onEnd);
    };
    window.addEventListener(isTouch ? "touchmove" : "mousemove", onMove, isTouch ? { passive: true } : undefined);
    window.addEventListener(isTouch ? "touchend" : "mouseup", onEnd);
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
            className="flex-1 bg-white border border-gray-200 rounded-full px-4 py-2 shadow-sm text-center"
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

              {/* Price range — Airbnb style */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Price range</h3>
                <p className="text-xs text-gray-500 mb-5">Per person, per trip</p>

                {/* Histogram */}
                <div className="flex items-end gap-px h-16 mb-2 px-1">
                  {priceHistogram.map((h, i) => {
                    const bucketMin = PRICE_MIN + i * PRICE_STEP;
                    const inRange = bucketMin >= filterPriceMin && bucketMin < filterPriceMax;
                    return (
                      <div
                        key={i}
                        className="flex-1 rounded-t-sm transition-colors"
                        style={{ height: `${Math.max(h * 100, 4)}%` }}
                      >
                        <div
                          className={`w-full h-full rounded-t-sm ${inRange ? "bg-gray-900" : "bg-gray-200"}`}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Dual thumb slider */}
                <div
                  ref={priceSliderRef}
                  className="relative h-10 select-none touch-none"
                >
                  {/* Track */}
                  <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-0.5 bg-gray-300 rounded-full">
                    <div
                      className="absolute top-0 h-full bg-black rounded-full"
                      style={{
                        left: `${((filterPriceMin - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100}%`,
                        right: `${100 - ((filterPriceMax - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100}%`,
                      }}
                    />
                  </div>

                  {/* Min thumb */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 bg-white border-2 border-gray-400 rounded-full shadow cursor-grab active:cursor-grabbing z-10"
                    style={{ left: `${((filterPriceMin - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100}%` }}
                    onMouseDown={(e) => { e.preventDefault(); startPriceDrag("min", e.clientX, false); }}
                    onTouchStart={(e) => startPriceDrag("min", e.touches[0].clientX, true)}
                  />

                  {/* Max thumb */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 bg-white border-2 border-gray-400 rounded-full shadow cursor-grab active:cursor-grabbing z-10"
                    style={{ left: `${((filterPriceMax - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100}%` }}
                    onMouseDown={(e) => { e.preventDefault(); startPriceDrag("max", e.clientX, false); }}
                    onTouchStart={(e) => startPriceDrag("max", e.touches[0].clientX, true)}
                  />
                </div>

                {/* Min / Max labels */}
                <div className="flex justify-between mt-2">
                  <div className="text-center">
                    <p className="text-[10px] text-gray-500">Minimum</p>
                    <div className="mt-1 border border-gray-300 rounded-full px-3 py-1">
                      <span className="text-xs font-medium text-gray-900">${filterPriceMin}</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-gray-500">Maximum</p>
                    <div className="mt-1 border border-gray-300 rounded-full px-3 py-1">
                      <span className="text-xs font-medium text-gray-900">${filterPriceMax}{filterPriceMax >= PRICE_MAX ? "+" : ""}</span>
                    </div>
                  </div>
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
