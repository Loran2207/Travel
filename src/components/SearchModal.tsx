"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { cities, searchCities } from "@/data/mock";

interface SearchModalProps {
  onClose: () => void;
}

type Section = "where" | "when" | "who" | null;
type DateMode = "dates" | "flexible";
type FlexDuration = "weekend" | "week" | "month";

const SUGGESTED_DESTINATIONS = [
  { id: "", name: "Nearby", subtitle: "Find what's around you", icon: "navigate" },
  { id: "rome", name: "Rome, Lazio", subtitle: "For its stunning architecture", icon: "colosseum" },
  { id: "barcelona", name: "Barcelona, Spain", subtitle: "For its vibrant culture", icon: "gaudi" },
  { id: "prague", name: "Prague, Czech Republic", subtitle: "For its fairy-tale charm", icon: "castle" },
  { id: "berlin", name: "Berlin, Germany", subtitle: "For its rich history", icon: "gate" },
];

function getDestinationIcon(icon: string) {
  const iconMap: Record<string, { bg: string; content: string }> = {
    navigate: { bg: "bg-blue-50", content: "text-blue-500" },
    colosseum: { bg: "bg-red-50", content: "text-red-500" },
    gaudi: { bg: "bg-orange-50", content: "text-orange-500" },
    castle: { bg: "bg-purple-50", content: "text-purple-500" },
    gate: { bg: "bg-green-50", content: "text-green-500" },
    location: { bg: "bg-gray-100", content: "text-gray-600" },
  };
  const style = iconMap[icon] || iconMap.location;
  const symbols: Record<string, string> = {
    navigate: "\u2197",
    colosseum: "\u26D1",
    gaudi: "\u2616",
    castle: "\u265C",
    gate: "\u2302",
    location: "\u25CB",
  };
  return (
    <div className={`w-12 h-12 rounded-xl ${style.bg} flex items-center justify-center flex-shrink-0`}>
      <span className={`text-lg ${style.content}`}>{symbols[icon] || "\u25CB"}</span>
    </div>
  );
}

function getSearchResultIcon(type: string) {
  const symbols: Record<string, string> = {
    city: "\u{1F4CD}",
    station: "\u{1F689}",
    neighborhood: "\u{1F3E0}",
    landmark: "\u{1F52D}",
  };
  return (
    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
      <span className="text-base text-gray-500">{symbols[type] || symbols.city}</span>
    </div>
  );
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Monday = 0
}

export function SearchModal({ onClose }: SearchModalProps) {
  const router = useRouter();
  const { setSearch } = useApp();

  const [activeSection, setActiveSection] = useState<Section>("where");
  const [searchFocused, setSearchFocused] = useState(false);

  // Where state
  const [query, setQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState({ id: "", name: "" });

  // When state
  const [dateMode, setDateMode] = useState<DateMode>("dates");
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [flexDuration, setFlexDuration] = useState<FlexDuration | null>(null);
  const [flexMonths, setFlexMonths] = useState<string[]>([]);
  const [dateFlex, setDateFlex] = useState<string>("exact");

  // Who state
  const [adults, setAdults] = useState(0);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);

  const totalGuests = adults + children;

  const filteredCities = useMemo(() => {
    if (query.length === 0) return [];
    return searchCities(query);
  }, [query]);

  const handleCitySelect = useCallback((id: string, name: string) => {
    setSelectedCity({ id, name });
    setQuery("");
    setSearchFocused(false);
    setActiveSection("when");
  }, []);

  const handleDateClick = useCallback((date: Date) => {
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(date);
      setCheckOut(null);
    } else {
      if (date < checkIn) {
        setCheckIn(date);
      } else {
        setCheckOut(date);
      }
    }
  }, [checkIn, checkOut]);

  const toggleFlexMonth = useCallback((monthKey: string) => {
    setFlexMonths(prev =>
      prev.includes(monthKey)
        ? prev.filter(m => m !== monthKey)
        : [...prev, monthKey]
    );
  }, []);

  const handleSearch = () => {
    const duration = checkIn && checkOut
      ? Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
      : flexDuration === "weekend" ? 2 : flexDuration === "week" ? 7 : flexDuration === "month" ? 30 : 2;

    setSearch({
      cityId: selectedCity.id,
      cityName: selectedCity.name,
      duration,
      interests: [],
      budget: "",
    });
    onClose();
    router.push("/results");
  };

  const handleClearAll = () => {
    setSelectedCity({ id: "", name: "" });
    setQuery("");
    setCheckIn(null);
    setCheckOut(null);
    setFlexDuration(null);
    setFlexMonths([]);
    setDateFlex("exact");
    setAdults(0);
    setChildren(0);
    setInfants(0);
    setActiveSection("where");
  };

  const formatDateRange = () => {
    if (checkIn && checkOut) {
      const fmt = (d: Date) => `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}`;
      return `${fmt(checkIn)} - ${fmt(checkOut)}`;
    }
    if (checkIn) {
      return `${checkIn.getDate()} ${MONTHS[checkIn.getMonth()].slice(0, 3)}`;
    }
    if (flexDuration) {
      return flexDuration.charAt(0).toUpperCase() + flexDuration.slice(1);
    }
    return "";
  };

  const formatGuests = () => {
    if (totalGuests === 0 && infants === 0) return "";
    const parts: string[] = [];
    if (totalGuests > 0) parts.push(`${totalGuests} guest${totalGuests !== 1 ? "s" : ""}`);
    if (infants > 0) parts.push(`${infants} infant${infants !== 1 ? "s" : ""}`);
    return parts.join(", ");
  };

  // Full-screen destination search overlay
  if (activeSection === "where" && searchFocused) {
    return (
      <div className="fixed inset-0 z-50 flex justify-center">
        <div className="w-full max-w-[430px] bg-white flex flex-col h-full">
          {/* Search header */}
          <div className="p-4 pt-3">
            <div className="flex items-center gap-3 border border-gray-300 rounded-full px-4 py-3">
              <button
                onClick={() => setSearchFocused(false)}
                className="text-gray-800 text-lg flex-shrink-0"
              >
                &larr;
              </button>
              <input
                type="text"
                autoFocus
                placeholder="Search destinations"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 text-sm focus:outline-none bg-transparent"
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

          {/* Results */}
          <div className="flex-1 overflow-y-auto px-4">
            {query.length > 0 ? (
              /* Search results */
              <div>
                {filteredCities.map((city) => (
                  <button
                    key={city.id}
                    onClick={() => handleCitySelect(city.id, city.name)}
                    className="flex items-center gap-3 w-full py-3 text-left"
                  >
                    {getSearchResultIcon("city")}
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
              /* Suggested destinations */
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-3">Suggested destinations</p>
                {SUGGESTED_DESTINATIONS.map((dest) => (
                  <button
                    key={dest.name}
                    onClick={() => {
                      if (dest.id) {
                        const city = cities.find(c => c.id === dest.id);
                        if (city) handleCitySelect(city.id, city.name);
                      }
                    }}
                    className="flex items-center gap-3 w-full py-3 text-left"
                  >
                    {getDestinationIcon(dest.icon)}
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{dest.name}</p>
                      <p className="text-xs text-gray-500">{dest.subtitle}</p>
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

  // Calendar rendering
  const renderCalendar = () => {
    const { year, month } = calendarMonth;
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const cells: React.ReactNode[] = [];

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isPast = date < today;
      const isCheckIn = checkIn && date.getTime() === checkIn.getTime();
      const isCheckOut = checkOut && date.getTime() === checkOut.getTime();
      const isInRange = checkIn && checkOut && date > checkIn && date < checkOut;
      const isSelected = isCheckIn || isCheckOut;

      cells.push(
        <button
          key={day}
          disabled={isPast}
          onClick={() => handleDateClick(date)}
          className={`aspect-square flex items-center justify-center text-sm rounded-full relative transition-colors
            ${isPast ? "text-gray-300 cursor-default" : ""}
            ${isSelected ? "bg-black text-white font-bold" : ""}
            ${isInRange ? "bg-gray-100" : ""}
            ${!isPast && !isSelected && !isInRange ? "hover:bg-gray-50 text-gray-800" : ""}
          `}
        >
          {day}
        </button>
      );
    }

    const prevMonth = () => {
      const prev = month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 };
      const now = new Date();
      if (prev.year > now.getFullYear() || (prev.year === now.getFullYear() && prev.month >= now.getMonth())) {
        setCalendarMonth(prev);
      }
    };

    const nextMonth = () => {
      setCalendarMonth(month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 });
    };

    return (
      <div>
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="p-1 text-gray-500 text-lg">&lsaquo;</button>
          <span className="text-sm font-bold text-gray-900">{MONTHS[month]} {year}</span>
          <button onClick={nextMonth} className="p-1 text-gray-500 text-lg">&rsaquo;</button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-2">
          {WEEKDAYS.map((d, i) => (
            <div key={i} className="text-center text-xs font-medium text-gray-500 py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-y-1">
          {cells}
        </div>
      </div>
    );
  };

  // Flexible months grid
  const renderFlexibleMonths = () => {
    const now = new Date();
    const monthCards: { key: string; label: string; year: number }[] = [];
    for (let i = 0; i < 6; i++) {
      const m = (now.getMonth() + i) % 12;
      const y = now.getFullYear() + Math.floor((now.getMonth() + i) / 12);
      monthCards.push({ key: `${y}-${m}`, label: MONTHS[m], year: y });
    }

    return (
      <div className="grid grid-cols-3 gap-3">
        {monthCards.map(({ key, label, year }) => {
          const selected = flexMonths.includes(key);
          return (
            <button
              key={key}
              onClick={() => toggleFlexMonth(key)}
              className={`flex flex-col items-center justify-center py-4 px-2 rounded-2xl border-2 transition-colors ${
                selected
                  ? "border-black bg-gray-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <svg className="w-6 h-6 text-gray-500 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="9" y1="4" x2="9" y2="2" />
                <line x1="15" y1="4" x2="15" y2="2" />
              </svg>
              <span className="text-sm font-semibold text-gray-900">{label}</span>
              <span className="text-xs text-gray-500">{year}</span>
            </button>
          );
        })}
      </div>
    );
  };

  // Guest counter row
  const GuestRow = ({
    label,
    subtitle,
    value,
    onDecrement,
    onIncrement,
    min = 0,
  }: {
    label: string;
    subtitle: string;
    value: number;
    onDecrement: () => void;
    onIncrement: () => void;
    min?: number;
  }) => (
    <div className="flex items-center justify-between py-4">
      <div>
        <p className="text-sm font-semibold text-gray-900">{label}</p>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onDecrement}
          disabled={value <= min}
          className={`w-8 h-8 rounded-full border flex items-center justify-center text-lg transition-colors ${
            value <= min
              ? "border-gray-200 text-gray-300 cursor-default"
              : "border-gray-400 text-gray-600 hover:border-gray-600"
          }`}
        >
          &minus;
        </button>
        <span className="w-6 text-center text-sm font-medium">{value}</span>
        <button
          onClick={onIncrement}
          className="w-8 h-8 rounded-full border border-gray-400 text-gray-600 hover:border-gray-600 flex items-center justify-center text-lg transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/40 animate-fade-in"
        onClick={onClose}
      />
      <div className="relative w-full max-w-[430px] bg-gray-100 rounded-t-3xl animate-slide-up flex flex-col" style={{ maxHeight: "95vh" }}>
        {/* Top tabs + close */}
        <div className="flex items-center justify-between px-6 pt-4 pb-2">
          <div className="flex gap-6">
            <button className="flex flex-col items-center gap-1">
              <span className="text-xs font-bold text-gray-900 border-b-2 border-black pb-1">Trips</span>
            </button>
            <button className="flex flex-col items-center gap-1">
              <span className="text-xs text-gray-400 pb-1">Experiences</span>
            </button>
            <button className="flex flex-col items-center gap-1">
              <span className="text-xs text-gray-400 pb-1">Services</span>
            </button>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm"
          >
            <span className="text-gray-600 text-sm">&times;</span>
          </button>
        </div>

        {/* Scrollable accordion content */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {/* WHERE section */}
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

              {/* Suggested destinations */}
              <div className="mt-4">
                <p className="text-sm font-semibold text-gray-900 mb-3">Suggested destinations</p>
                {SUGGESTED_DESTINATIONS.map((dest) => (
                  <button
                    key={dest.name}
                    onClick={() => {
                      if (dest.id) {
                        const city = cities.find(c => c.id === dest.id);
                        if (city) handleCitySelect(city.id, city.name);
                      }
                    }}
                    className="flex items-center gap-3 w-full py-2.5 text-left"
                  >
                    {getDestinationIcon(dest.icon)}
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{dest.name}</p>
                      <p className="text-xs text-gray-500">{dest.subtitle}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Collapsed WHERE */
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

          {/* WHEN section */}
          {activeSection === "when" ? (
            <div className="bg-white rounded-2xl p-5 mb-3 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">When?</h2>

              {/* Dates / Flexible toggle */}
              <div className="flex bg-gray-100 rounded-full p-1 mb-5">
                <button
                  onClick={() => setDateMode("dates")}
                  className={`flex-1 py-2 rounded-full text-sm font-medium transition-colors ${
                    dateMode === "dates"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500"
                  }`}
                >
                  Dates
                </button>
                <button
                  onClick={() => setDateMode("flexible")}
                  className={`flex-1 py-2 rounded-full text-sm font-medium transition-colors ${
                    dateMode === "flexible"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500"
                  }`}
                >
                  Flexible
                </button>
              </div>

              {dateMode === "dates" ? (
                <div>
                  {renderCalendar()}

                  {/* Flexibility chips */}
                  <div className="flex gap-2 mt-4 overflow-x-auto hide-scrollbar pb-1">
                    {[
                      { label: "Exact dates", value: "exact" },
                      { label: "\u00B1 1 day", value: "1day" },
                      { label: "\u00B1 2 days", value: "2days" },
                      { label: "\u00B1 3 days", value: "3days" },
                      { label: "\u00B1 7 days", value: "7days" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setDateFlex(opt.value)}
                        className={`px-4 py-2 rounded-full text-xs font-medium border whitespace-nowrap transition-colors ${
                          dateFlex === opt.value
                            ? "border-black bg-white text-gray-900"
                            : "border-gray-300 text-gray-600"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  {/* Duration options */}
                  <div className="mb-5">
                    <p className="text-sm font-semibold text-gray-900 mb-3">How long would you like to stay?</p>
                    <div className="flex gap-2">
                      {(["weekend", "week", "month"] as FlexDuration[]).map((d) => (
                        <button
                          key={d}
                          onClick={() => setFlexDuration(prev => prev === d ? null : d)}
                          className={`px-5 py-2 rounded-full text-sm font-medium border transition-colors ${
                            flexDuration === d
                              ? "border-black bg-white text-gray-900"
                              : "border-gray-300 text-gray-600"
                          }`}
                        >
                          {d.charAt(0).toUpperCase() + d.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-5">
                    <p className="text-sm font-semibold text-gray-900 mb-3">Go anytime</p>
                    {renderFlexibleMonths()}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Collapsed WHEN */
            <button
              onClick={() => setActiveSection("when")}
              className="w-full bg-white rounded-2xl px-5 py-4 mb-3 shadow-sm flex items-center justify-between"
            >
              <span className="text-sm text-gray-500">When</span>
              <span className="text-sm font-semibold text-gray-900">
                {formatDateRange() || "Add dates"}
              </span>
            </button>
          )}

          {/* WHO section */}
          {activeSection === "who" ? (
            <div className="bg-white rounded-2xl p-5 mb-3 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Who?</h2>
              <GuestRow
                label="Adults"
                subtitle="Ages 13 or above"
                value={adults}
                onDecrement={() => setAdults(Math.max(0, adults - 1))}
                onIncrement={() => setAdults(adults + 1)}
              />
              <div className="border-t border-gray-100" />
              <GuestRow
                label="Children"
                subtitle="Ages 2 \u2013 12"
                value={children}
                onDecrement={() => setChildren(Math.max(0, children - 1))}
                onIncrement={() => setChildren(children + 1)}
              />
              <div className="border-t border-gray-100" />
              <GuestRow
                label="Infants"
                subtitle="Under 2"
                value={infants}
                onDecrement={() => setInfants(Math.max(0, infants - 1))}
                onIncrement={() => setInfants(infants + 1)}
              />
            </div>
          ) : (
            /* Collapsed WHO */
            <button
              onClick={() => setActiveSection("who")}
              className="w-full bg-white rounded-2xl px-5 py-4 mb-3 shadow-sm flex items-center justify-between"
            >
              <span className="text-sm text-gray-500">Who</span>
              <span className="text-sm font-semibold text-gray-900">
                {formatGuests() || "Add guests"}
              </span>
            </button>
          )}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-200 bg-white px-5 py-4 flex items-center justify-between rounded-b-none">
          <button
            onClick={handleClearAll}
            className="text-sm font-semibold text-gray-900 underline"
          >
            Clear all
          </button>
          <button
            onClick={handleSearch}
            className="flex items-center gap-2 bg-[#E51D53] hover:bg-[#D31450] text-white px-6 py-3 rounded-xl text-sm font-bold transition-colors"
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
