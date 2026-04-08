"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { cities, searchCities, interests } from "@/data/mock";

interface SearchModalProps {
  onClose: () => void;
  initialCity?: { id: string; name: string };
}

type Section = "where" | "duration" | "preferences" | null;

const INTEREST_ICONS: Record<string, React.ReactNode> = {
  "History": <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" /></svg>,
  "Food & Drink": <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3" /></svg>,
  "Architecture": <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="4" y="2" width="16" height="20" rx="2" /><path d="M9 22V12h6v10M9 6h.01M15 6h.01M9 10h.01M15 10h.01" /></svg>,
  "Nature": <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22V8M5 12l7-8 7 8M8 17l4-5 4 5" /></svg>,
  "Shopping": <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" /></svg>,
  "Art & Museums": <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>,
  "Nightlife": <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 18a5 5 0 00-10 0M12 2v1M4.22 4.22l.71.71M1 12h1M4.22 19.78l.71-.71M23 12h-1M19.78 19.78l-.71-.71M19.78 4.22l-.71.71" /><circle cx="12" cy="12" r="4" /></svg>,
  "Hidden Gems": <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>,
  "Local Life": <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>,
  "Sports": <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 000 20M2 12h20" /></svg>,
};

// Duration picker: Half day + 1..30 days
const DURATION_OPTIONS: string[] = [
  "Half day",
  ...Array.from({ length: 30 }, (_, i) => `${i + 1} ${i === 0 ? "day" : "days"}`),
];

export function SearchModal({ onClose, initialCity }: SearchModalProps) {
  const router = useRouter();
  const { setSearch } = useApp();

  const [activeSection, setActiveSection] = useState<Section>(initialCity ? "duration" : "where");
  const [searchFocused, setSearchFocused] = useState(false);

  // Where
  const [query, setQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState(initialCity || { id: "", name: "" });

  // Duration
  const [selectedDuration, setSelectedDuration] = useState(1); // index into DURATION_OPTIONS
  const pickerRef = useRef<HTMLDivElement>(null);

  // Preferences
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
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
    const days = selectedDuration === 0 ? 1 : selectedDuration;
    setSearch({
      cityId: selectedCity.id,
      cityName: selectedCity.name,
      duration: days,
      interests: selectedInterests,
      budget: "",
      guests: 0,
    });
    onClose();
    router.push("/results");
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const handleSurpriseMe = () => {
    setSelectedInterests([]);
    handleSearch();
  };

  const handleClearAll = () => {
    setSelectedCity({ id: "", name: "" });
    setQuery("");
    setSelectedDuration(1);
    setSelectedInterests([]);
    setActiveSection("where");
  };

  // Scroll picker to selected item
  const scrollToSelected = useCallback((idx: number, smooth = true) => {
    if (!pickerRef.current) return;
    const itemH = 56;
    const containerH = pickerRef.current.clientHeight;
    const scrollTop = idx * itemH - (containerH / 2 - itemH / 2);
    pickerRef.current.scrollTo({ top: scrollTop, behavior: smooth ? "smooth" : "auto" });
  }, []);

  const initialScrollDone = useRef(false);
  useEffect(() => {
    if (activeSection === "duration" && !initialScrollDone.current) {
      initialScrollDone.current = true;
      setTimeout(() => scrollToSelected(selectedDuration, false), 50);
    }
    if (activeSection !== "duration") {
      initialScrollDone.current = false;
    }
  }, [activeSection, scrollToSelected, selectedDuration]);

  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handlePickerScroll = useCallback(() => {
    if (!pickerRef.current) return;
    const itemH = 56;
    const containerH = pickerRef.current.clientHeight;
    const scrollTop = pickerRef.current.scrollTop;
    const idx = Math.round((scrollTop + containerH / 2 - itemH / 2) / itemH);
    const clamped = Math.max(0, Math.min(DURATION_OPTIONS.length - 1, idx));
    setSelectedDuration(clamped);

    // Snap after scroll ends
    if (scrollTimer.current) clearTimeout(scrollTimer.current);
    scrollTimer.current = setTimeout(() => {
      if (pickerRef.current) {
        const targetTop = clamped * itemH - (containerH / 2 - itemH / 2);
        pickerRef.current.scrollTo({ top: targetTop, behavior: "smooth" });
      }
    }, 100);
  }, []);

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

          {/* DURATION — drum picker */}
          {activeSection === "duration" ? (
            <div className="bg-white rounded-2xl p-5 mb-3 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">How long?</h2>
              <p className="text-sm text-gray-500 mb-4">Number of days</p>

              {/* Drum picker */}
              <div className="relative h-[224px] overflow-hidden">
                {/* Selection highlight band */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-14 bg-gray-100 rounded-xl pointer-events-none z-0" />

                {/* Fade gradients */}
                <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none" />
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none" />

                {/* Scrollable list */}
                <div
                  ref={pickerRef}
                  className="absolute inset-0 overflow-y-auto hide-scrollbar snap-y snap-mandatory"
                  onScroll={handlePickerScroll}
                  style={{ scrollSnapType: "y mandatory" }}
                >
                  {/* Top spacer */}
                  <div style={{ height: 84 }} />

                  {DURATION_OPTIONS.map((opt, i) => {
                    const isSelected = i === selectedDuration;
                    const dist = Math.abs(i - selectedDuration);
                    return (
                      <div
                        key={opt}
                        className="h-14 flex items-center justify-center snap-center cursor-pointer"
                        style={{ scrollSnapAlign: "center" }}
                        onClick={() => {
                          setSelectedDuration(i);
                          scrollToSelected(i);
                        }}
                      >
                        <span
                          className={`transition-all duration-150 ${
                            isSelected
                              ? "text-2xl font-bold text-gray-900"
                              : dist === 1
                                ? "text-lg text-gray-400"
                                : "text-base text-gray-300"
                          }`}
                        >
                          {opt}
                        </span>
                      </div>
                    );
                  })}

                  {/* Bottom spacer */}
                  <div style={{ height: 84 }} />
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setActiveSection("duration")}
              className="w-full bg-white rounded-2xl px-5 py-4 mb-3 shadow-sm flex items-center justify-between"
            >
              <span className="text-sm text-gray-500">How long</span>
              <span className="text-sm font-semibold text-gray-900">
                {DURATION_OPTIONS[selectedDuration]}
              </span>
            </button>
          )}

          {/* PREFERENCES */}
          {activeSection === "preferences" ? (
            <div className="bg-white rounded-2xl p-5 mb-3 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Preferences</h2>
              <p className="text-sm text-gray-500 mb-5">What are you into?</p>

              <div className="grid grid-cols-2 gap-2.5">
                {interests.map((interest) => {
                  const selected = selectedInterests.includes(interest);
                  return (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-colors ${
                        selected
                          ? "border-black bg-gray-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className={`flex-shrink-0 ${selected ? "text-gray-900" : "text-gray-400"}`}>
                        {INTEREST_ICONS[interest] || <div className="w-5 h-5" />}
                      </div>
                      <span className={`text-sm font-medium ${selected ? "text-gray-900" : "text-gray-600"}`}>
                        {interest}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Surprise me */}
              <button
                onClick={handleSurpriseMe}
                className="w-full mt-5 flex items-center justify-center gap-2 py-3 border border-gray-300 rounded-full text-sm font-medium text-gray-600 hover:border-gray-400 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
                  <circle cx="12" cy="12" r="4" />
                </svg>
                Skip, Surprise me
              </button>
            </div>
          ) : (
            <button
              onClick={() => setActiveSection("preferences")}
              className="w-full bg-white rounded-2xl px-5 py-4 mb-3 shadow-sm flex items-center justify-between"
            >
              <span className="text-sm text-gray-500">Preferences</span>
              <span className="text-sm font-semibold text-gray-900">
                {selectedInterests.length > 0
                  ? `${selectedInterests.length} selected`
                  : "Any"}
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
          {activeSection === "preferences" ? (
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
          ) : (
            <button
              onClick={() => {
                if (activeSection === "where") setActiveSection("duration");
                else if (activeSection === "duration") setActiveSection("preferences");
              }}
              className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-xl text-sm font-bold transition-colors"
            >
              Continue
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
