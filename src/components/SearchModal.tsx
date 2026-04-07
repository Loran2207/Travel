"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { cities, searchCities } from "@/data/mock";

interface SearchModalProps {
  onClose: () => void;
}

type Section = "where" | "duration" | null;

// Slider checkpoints: value in hours
const DURATION_STOPS = [
  { value: 4, label: "Half day" },
  { value: 8, label: "1 day" },
  { value: 16, label: "2 days" },
  { value: 24, label: "3 days" },
  { value: 40, label: "5 days" },
  { value: 56, label: "1 week" },
  { value: 112, label: "2 weeks" },
  { value: 168, label: "3 weeks" },
];

const QUICK_CHIPS = [
  { label: "Half day", value: 4 },
  { label: "1 day", value: 8 },
  { label: "2 days", value: 16 },
  { label: "3 days", value: 24 },
  { label: "1 week", value: 56 },
  { label: "3 weeks", value: 168 },
];

function durationLabel(hours: number): string {
  if (hours <= 4) return "Half day";
  if (hours <= 8) return "1 day";
  const days = Math.round(hours / 8);
  if (days <= 7) return `${days} days`;
  const weeks = Math.round(days / 7);
  if (weeks === 1) return "1 week";
  return `${weeks} weeks`;
}

function isChipValue(hours: number): boolean {
  return QUICK_CHIPS.some(c => c.value === hours);
}

export function SearchModal({ onClose }: SearchModalProps) {
  const router = useRouter();
  const { setSearch } = useApp();

  const [activeSection, setActiveSection] = useState<Section>("where");
  const [searchFocused, setSearchFocused] = useState(false);

  // Where
  const [query, setQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState({ id: "", name: "" });

  // Duration (in hours)
  const [durationHours, setDurationHours] = useState(8);
  const [showCustom, setShowCustom] = useState(false);
  const [customDays, setCustomDays] = useState("");
  const sliderRef = useRef<HTMLDivElement>(null);

  const filteredCities = useMemo(() => {
    if (query.length === 0) return [];
    return searchCities(query);
  }, [query]);

  const suggestedCities = useMemo(() => cities.slice(0, 5), []);

  const handleCitySelect = useCallback((id: string, name: string) => {
    setSelectedCity({ id, name });
    setQuery("");
    setSearchFocused(false);
    setActiveSection("duration");
  }, []);

  const handleSearch = () => {
    const days = Math.max(1, Math.round(durationHours / 8));
    setSearch({
      cityId: selectedCity.id,
      cityName: selectedCity.name,
      duration: days,
      interests: [],
      budget: "",
      guests: 0,
    });
    onClose();
    router.push("/results");
  };

  const handleClearAll = () => {
    setSelectedCity({ id: "", name: "" });
    setQuery("");
    setDurationHours(8);
    setShowCustom(false);
    setCustomDays("");
    setActiveSection("where");
  };

  const handleCustomApply = () => {
    const num = parseInt(customDays, 10);
    if (num > 0) {
      const minVal = DURATION_STOPS[0].value;
      const maxVal = DURATION_STOPS[DURATION_STOPS.length - 1].value;
      const hours = Math.min(Math.max(num * 8, minVal), maxVal);
      setDurationHours(hours);
      setShowCustom(false);
    }
  };

  // Slider logic — free-form, no snap
  const minVal = DURATION_STOPS[0].value;
  const maxVal = DURATION_STOPS[DURATION_STOPS.length - 1].value;

  const getPositionFromValue = (val: number) => {
    return ((val - minVal) / (maxVal - minVal)) * 100;
  };

  const getValueFromPosition = (clientX: number) => {
    if (!sliderRef.current) return durationHours;
    const rect = sliderRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const raw = minVal + pct * (maxVal - minVal);
    return Math.round(raw);
  };

  const thumbPosition = getPositionFromValue(durationHours);

  const startDrag = (startX: number, isTouch: boolean) => {
    setDurationHours(getValueFromPosition(startX));
    setShowCustom(false);

    const onMove = (ev: MouseEvent | TouchEvent) => {
      const x = "touches" in ev ? ev.touches[0].clientX : ev.clientX;
      setDurationHours(getValueFromPosition(x));
    };
    const onEnd = () => {
      window.removeEventListener(isTouch ? "touchmove" : "mousemove", onMove);
      window.removeEventListener(isTouch ? "touchend" : "mouseup", onEnd);
    };
    window.addEventListener(isTouch ? "touchmove" : "mousemove", onMove, isTouch ? { passive: true } : undefined);
    window.addEventListener(isTouch ? "touchend" : "mouseup", onEnd);
  };

  // --- Full-screen search overlay ---
  if (activeSection === "where" && searchFocused) {
    return (
      <div className="fixed inset-0 z-50 flex justify-center">
        <div className="w-full max-w-[430px] bg-white flex flex-col h-full">
          <div className="p-4 pt-3">
            <div className="flex items-center gap-3 border border-gray-300 rounded-full px-4 py-3">
              <button
                onClick={() => setSearchFocused(false)}
                className="text-gray-800 text-lg flex-shrink-0"
              >
                &#8592;
              </button>
              <input
                type="text"
                autoFocus
                placeholder="Search destinations"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 text-[16px] leading-tight focus:outline-none bg-transparent"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0"
                >
                  <span className="text-gray-600 text-xs">&times;</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4">
            {query.length > 0 ? (
              <div>
                {filteredCities.map((city) => (
                  <button
                    key={city.id}
                    onClick={() => handleCitySelect(city.id, city.name)}
                    className="flex items-center gap-3 w-full py-3 text-left"
                  >
                    <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                        <circle cx="12" cy="9" r="2.5" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{city.name}</p>
                      <p className="text-xs text-gray-500">{city.country}</p>
                    </div>
                  </button>
                ))}
                {filteredCities.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-8">No destinations found</p>
                )}
              </div>
            ) : (
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-3">Suggested destinations</p>
                {suggestedCities.map((city) => (
                  <button
                    key={city.id}
                    onClick={() => handleCitySelect(city.id, city.name)}
                    className="flex items-center gap-3 w-full py-3 text-left"
                  >
                    <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                        <circle cx="12" cy="9" r="2.5" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{city.name}</p>
                      <p className="text-xs text-gray-500">{city.country}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- Main modal ---
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/40 animate-fade-in"
        onClick={onClose}
      />
      <div className="relative w-full max-w-[430px] bg-gray-100 rounded-t-3xl animate-slide-up flex flex-col" style={{ maxHeight: "95vh" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-2">
          <h1 className="text-lg font-bold text-gray-900">Find your next trip</h1>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm flex-shrink-0"
          >
            <span className="text-gray-600 text-sm">&times;</span>
          </button>
        </div>

        {/* Sections */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {/* WHERE */}
          {activeSection === "where" ? (
            <div className="bg-white rounded-2xl p-5 mb-3 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Where?</h2>
              <button
                onClick={() => setSearchFocused(true)}
                className="w-full flex items-center gap-3 border border-gray-300 rounded-xl px-4 py-3"
              >
                <svg className="w-5 h-5 text-gray-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <span className="text-sm text-gray-400">Search destinations</span>
              </button>

              <div className="mt-4">
                <p className="text-sm font-semibold text-gray-900 mb-3">Suggested destinations</p>
                {suggestedCities.map((city) => (
                  <button
                    key={city.id}
                    onClick={() => handleCitySelect(city.id, city.name)}
                    className="flex items-center gap-3 w-full py-2.5 text-left"
                  >
                    <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                        <circle cx="12" cy="9" r="2.5" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{city.name}</p>
                      <p className="text-xs text-gray-500">{city.country}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <button
              onClick={() => setActiveSection("where")}
              className="w-full bg-white rounded-2xl px-5 py-4 mb-3 shadow-sm flex items-center justify-between"
            >
              <span className="text-sm text-gray-500">Where</span>
              <span className="text-sm font-semibold text-gray-900">
                {selectedCity.name || "Any destination"}
              </span>
            </button>
          )}

          {/* DURATION */}
          {activeSection === "duration" ? (
            <div className="bg-white rounded-2xl p-5 mb-3 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">How long?</h2>
              <p className="text-lg font-semibold text-gray-900 mb-6">
                {durationLabel(durationHours)}
              </p>

              {/* Slider */}
              <div className="px-1 mb-6">
                <div
                  ref={sliderRef}
                  className="relative h-12 select-none touch-none"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    startDrag(e.clientX, false);
                  }}
                  onTouchStart={(e) => {
                    startDrag(e.touches[0].clientX, true);
                  }}
                >
                  {/* Track bg */}
                  <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1 bg-gray-200 rounded-full">
                    <div
                      className="absolute left-0 top-0 h-full bg-black rounded-full"
                      style={{ width: `${thumbPosition}%` }}
                    />
                  </div>

                  {/* Checkpoint dots */}
                  {DURATION_STOPS.map((stop) => {
                    const pos = getPositionFromValue(stop.value);
                    const isActive = stop.value <= durationHours;
                    return (
                      <div
                        key={stop.value}
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
                        style={{ left: `${pos}%` }}
                      >
                        <div className={`w-2.5 h-2.5 rounded-full border-2 ${
                          isActive
                            ? "bg-black border-black"
                            : "bg-white border-gray-300"
                        }`} />
                      </div>
                    );
                  })}

                  {/* Thumb */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 bg-white border-2 border-black rounded-full shadow-md cursor-grab active:cursor-grabbing"
                    style={{ left: `${thumbPosition}%` }}
                  />
                </div>

                {/* Labels under stops */}
                <div className="relative h-4 mt-1">
                  {DURATION_STOPS.filter((_, i) => i % 2 === 0 || i === DURATION_STOPS.length - 1).map((stop) => {
                    const pos = getPositionFromValue(stop.value);
                    return (
                      <span
                        key={stop.value}
                        className="absolute -translate-x-1/2 text-[10px] text-gray-400 whitespace-nowrap"
                        style={{ left: `${pos}%` }}
                      >
                        {stop.label}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Quick pick chips + Custom */}
              <div className="flex flex-wrap gap-2">
                {QUICK_CHIPS.map((chip) => (
                  <button
                    key={chip.value}
                    onClick={() => {
                      setDurationHours(chip.value);
                      setShowCustom(false);
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                      durationHours === chip.value && !showCustom
                        ? "border-black text-gray-900 bg-gray-50"
                        : "border-gray-300 text-gray-500 hover:border-gray-400"
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
                <button
                  onClick={() => setShowCustom(!showCustom)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                    showCustom || !isChipValue(durationHours)
                      ? "border-black text-gray-900 bg-gray-50"
                      : "border-gray-300 text-gray-500 hover:border-gray-400"
                  }`}
                >
                  Custom
                </button>
              </div>

              {/* Custom input */}
              {showCustom && (
                <div className="mt-4 flex items-center gap-3 animate-fade-in">
                  <div className="flex-1 flex items-center border border-gray-300 rounded-xl px-4 py-2.5 focus-within:border-black transition-colors">
                    <input
                      type="number"
                      autoFocus
                      min={1}
                      max={21}
                      placeholder="Enter days"
                      value={customDays}
                      onChange={(e) => setCustomDays(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleCustomApply(); }}
                      className="flex-1 text-[16px] leading-tight focus:outline-none bg-transparent w-full"
                    />
                    <span className="text-sm text-gray-400 ml-2">days</span>
                  </div>
                  <button
                    onClick={handleCustomApply}
                    disabled={!customDays || parseInt(customDays, 10) <= 0}
                    className="px-4 py-2.5 bg-black text-white rounded-xl text-sm font-medium disabled:bg-gray-300 disabled:cursor-default transition-colors"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setActiveSection("duration")}
              className="w-full bg-white rounded-2xl px-5 py-4 mb-3 shadow-sm flex items-center justify-between"
            >
              <span className="text-sm text-gray-500">How long</span>
              <span className="text-sm font-semibold text-gray-900">
                {durationLabel(durationHours)}
              </span>
            </button>
          )}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-200 bg-white px-5 py-4 flex items-center justify-between">
          <button
            onClick={handleClearAll}
            className="text-sm font-semibold text-gray-900 underline"
          >
            Clear all
          </button>
          <button
            onClick={handleSearch}
            className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-xl text-sm font-bold transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            Search
          </button>
        </div>
      </div>
    </div>
  );
}
