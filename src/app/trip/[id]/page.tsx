"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { getTripById, TripDay, TripStop } from "@/data/mock";
import { useApp } from "@/context/AppContext";

type TabValue = "overview" | number;

function TransportIcon({ type }: { type: string }) {
  if (type === "walk") {
    return (
      <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="4" r="2" />
        <path d="M14 10l-1 4-2 2v4M10 10l1 4 2 2v4M10 10l-2 6M14 10l2 6" />
      </svg>
    );
  }
  if (type === "drive") {
    return (
      <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M5 17h14M5 17a2 2 0 01-2-2V9a2 2 0 012-2h14a2 2 0 012 2v6a2 2 0 01-2 2M5 17l-1 2M19 17l1 2" />
        <circle cx="7.5" cy="14" r="1" />
        <circle cx="16.5" cy="14" r="1" />
      </svg>
    );
  }
  if (type === "bus") {
    return (
      <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="4" y="3" width="16" height="16" rx="2" />
        <path d="M4 11h16M4 7h16" />
        <circle cx="7.5" cy="15.5" r="1" />
        <circle cx="16.5" cy="15.5" r="1" />
        <path d="M6 19v1M18 19v1" />
      </svg>
    );
  }
  if (type === "metro") {
    return (
      <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="4" y="3" width="16" height="14" rx="3" />
        <path d="M4 12h16" />
        <circle cx="8" cy="15" r="0.5" fill="currentColor" />
        <circle cx="16" cy="15" r="0.5" fill="currentColor" />
        <path d="M6 17l-2 4M18 17l2 4M9 21h6" />
      </svg>
    );
  }
  return null;
}

export default function TripDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toggleSavedTrip, isTripSaved } = useApp();

  const trip = getTripById(params.id as string);
  const [activeTab, setActiveTab] = useState<TabValue>("overview");
  const [selectedStop, setSelectedStop] = useState<TripStop | null>(null);

  // Edit mode
  const [editMode, setEditMode] = useState(false);
  const [editedDays, setEditedDays] = useState<TripDay[] | null>(null);
  const [selectedStops, setSelectedStops] = useState<Set<string>>(new Set());
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  // Bottom sheet drag
  const sheetRef = useRef<HTMLDivElement>(null);
  const [sheetPosition, setSheetPosition] = useState<"half" | "full" | "collapsed">("half");
  const dragStartY = useRef(0);
  const dragStartPos = useRef<"half" | "full" | "collapsed">("half");

  const handleDragStart = useCallback((clientY: number) => {
    dragStartY.current = clientY;
    dragStartPos.current = sheetPosition;
  }, [sheetPosition]);

  const handleDragEnd = useCallback((clientY: number) => {
    const delta = clientY - dragStartY.current;
    const threshold = 60;

    if (dragStartPos.current === "half") {
      if (delta < -threshold) setSheetPosition("full");
      else if (delta > threshold) setSheetPosition("collapsed");
    } else if (dragStartPos.current === "full") {
      if (delta > threshold) setSheetPosition("half");
    } else if (dragStartPos.current === "collapsed") {
      if (delta < -threshold) setSheetPosition("half");
    }
  }, []);

  if (!trip) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Trip not found</p>
      </div>
    );
  }

  const saved = isTripSaved(trip.id);
  const currentDays = editedDays || trip.days;
  const totalSpots = currentDays.reduce((sum, d) => sum + d.stops.length, 0);
  const sheetTop = sheetPosition === "full" ? "8%" : sheetPosition === "half" ? "45%" : "78%";

  const enterEditMode = () => {
    setEditedDays(trip.days.map(d => ({ ...d, stops: [...d.stops] })));
    setSelectedStops(new Set());
    setEditMode(true);
    if (activeTab === "overview" && trip.days.length > 0) {
      setActiveTab(trip.days[0].day);
    }
  };

  const exitEditMode = () => {
    setEditMode(false);
    setEditedDays(null);
    setSelectedStops(new Set());
    setDragIndex(null);
  };

  const toggleStopSelection = (dayNum: number, stopIdx: number) => {
    const key = `${dayNum}-${stopIdx}`;
    setSelectedStops(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const deleteSelected = () => {
    if (!editedDays) return;
    setEditedDays(prev => {
      if (!prev) return prev;
      return prev.map(day => ({
        ...day,
        stops: day.stops
          .filter((_, idx) => !selectedStops.has(`${day.day}-${idx}`))
          .map((s, idx) => ({ ...s, number: idx + 1 })),
        spots: day.stops.filter((_, idx) => !selectedStops.has(`${day.day}-${idx}`)).length,
      }));
    });
    setSelectedStops(new Set());
  };

  const moveStop = (dayNum: number, fromIdx: number, toIdx: number) => {
    if (!editedDays) return;
    setEditedDays(prev => {
      if (!prev) return prev;
      return prev.map(day => {
        if (day.day !== dayNum) return day;
        const stops = [...day.stops];
        const [moved] = stops.splice(fromIdx, 1);
        stops.splice(toIdx, 0, moved);
        return { ...day, stops: stops.map((s, i) => ({ ...s, number: i + 1 })) };
      });
    });
    setDragIndex(null);
  };

  const renderOverview = () => (
    <div className="space-y-3">
      {currentDays.map((day) => (
        <button
          key={day.day}
          onClick={() => setActiveTab(day.day)}
          className="w-full bg-gray-50 rounded-2xl p-4 text-left"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white bg-black px-2 py-0.5 rounded-full">
                Day {day.day}
              </span>
              <span className="text-sm font-semibold text-gray-900">{day.city}</span>
            </div>
            <span className="text-xs text-gray-500">
              {day.distance} · {day.stops.length} spots
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto hide-scrollbar">
            {day.stops.map((stop, i) => (
              <div key={i} className="w-14 h-14 rounded-xl bg-gray-200 flex-shrink-0 flex items-center justify-center">
                <span className="text-[10px] text-gray-400 text-center leading-tight px-0.5">{stop.name.split(" ")[0]}</span>
              </div>
            ))}
          </div>
        </button>
      ))}
    </div>
  );

  const renderDayTimeline = (day: TripDay) => (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-gray-900">{day.city}</span>
        <span className="text-xs text-gray-500">{day.distance} · {day.stops.length} spots</span>
      </div>

      <div className="relative">
        {day.stops.map((stop, i) => {
          const isSelected = selectedStops.has(`${day.day}-${i}`);
          const isDragging = dragIndex === i;

          return (
            <div key={`${stop.name}-${i}`} className={isDragging ? "opacity-50" : ""}>
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-7 h-7 rounded-full text-xs flex items-center justify-center font-bold flex-shrink-0 ${
                    editMode && isSelected ? "bg-black text-white" : "bg-gray-200 text-gray-500"
                  }`}>
                    {stop.number}
                  </div>
                  {i < day.stops.length - 1 && (
                    <div className="w-px flex-1 bg-gray-200 my-1" />
                  )}
                </div>

                <div className="flex-1 pb-2">
                  {editMode ? (
                    <div className={`flex items-center gap-2 bg-gray-50 rounded-xl p-3 border-2 transition-colors ${
                      isSelected ? "border-black" : "border-transparent"
                    }`}>
                      {/* Drag handle */}
                      <div
                        className="flex flex-col gap-0.5 cursor-grab active:cursor-grabbing touch-none py-2 px-1"
                        onMouseDown={() => setDragIndex(i)}
                        onTouchStart={() => setDragIndex(i)}
                        onMouseUp={() => {
                          if (dragIndex !== null && dragIndex !== i) moveStop(day.day, dragIndex, i);
                          else setDragIndex(null);
                        }}
                        onTouchEnd={() => {
                          if (dragIndex !== null && dragIndex !== i) moveStop(day.day, dragIndex, i);
                          else setDragIndex(null);
                        }}
                      >
                        <div className="flex gap-0.5">
                          <div className="w-1 h-1 bg-gray-400 rounded-full" />
                          <div className="w-1 h-1 bg-gray-400 rounded-full" />
                        </div>
                        <div className="flex gap-0.5">
                          <div className="w-1 h-1 bg-gray-400 rounded-full" />
                          <div className="w-1 h-1 bg-gray-400 rounded-full" />
                        </div>
                        <div className="flex gap-0.5">
                          <div className="w-1 h-1 bg-gray-400 rounded-full" />
                          <div className="w-1 h-1 bg-gray-400 rounded-full" />
                        </div>
                      </div>

                      <div className="w-14 h-14 rounded-lg bg-gray-200 flex-shrink-0 flex items-center justify-center">
                        <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <path d="M21 15l-5-5L5 21" />
                        </svg>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900">{stop.name}</p>
                        <span className="inline-block text-[10px] px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full mt-1">
                          {stop.category}
                        </span>
                      </div>

                      {/* Checkbox */}
                      <button
                        onClick={() => toggleStopSelection(day.day, i)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                          isSelected ? "bg-black border-black" : "border-gray-300"
                        }`}
                      >
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                        )}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedStop(stop)}
                      className="w-full bg-gray-50 rounded-xl p-3 flex gap-3 text-left active:bg-gray-100 transition-colors"
                    >
                      <div className="w-16 h-16 rounded-lg bg-gray-200 flex-shrink-0 flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <path d="M21 15l-5-5L5 21" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900">{stop.name}</p>
                        <span className="inline-block text-[10px] px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full mt-1">
                          {stop.category}
                        </span>
                      </div>
                    </button>
                  )}
                </div>
              </div>

              {/* Transport (hidden in edit mode) */}
              {!editMode && stop.transport && (
                <div className="flex gap-3 mb-2">
                  <div className="flex flex-col items-center w-7">
                    <div className="w-px flex-1 bg-gray-200" />
                  </div>
                  <div className="flex-1 flex items-center justify-between py-1">
                    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-3 py-1.5">
                      <TransportIcon type={stop.transport.type} />
                      <span className="text-xs text-gray-600">
                        {stop.transport.duration} · {stop.transport.distance}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="relative h-screen overflow-hidden bg-gray-200">
      {/* Map placeholder */}
      <div className="absolute inset-0">
        <div className="w-full h-full bg-gray-200 flex items-center justify-center relative">
          <div className="absolute inset-0 opacity-30">
            <svg width="100%" height="100%">
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ccc" strokeWidth="0.5" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          <div className="relative z-10 flex flex-col items-center gap-1">
            {currentDays.map((day) => (
              <div key={day.day} className="flex items-center gap-1">
                <span className="text-[10px] font-bold text-white bg-black px-2 py-0.5 rounded-full">
                  Day {day.day} · {day.distance}
                </span>
              </div>
            ))}
          </div>

          {/* Back button */}
          <button
            onClick={() => { if (editMode) exitEditMode(); else router.back(); }}
            className="absolute top-4 left-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md z-20"
          >
            <svg className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Save / Edit button */}
          {!editMode && (
            <button
              onClick={() => { if (saved) enterEditMode(); else toggleSavedTrip(trip.id); }}
              className="absolute top-4 right-4 bg-black text-white px-4 py-2.5 rounded-full flex items-center gap-2 shadow-md z-20 text-sm font-bold"
            >
              {saved ? (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Edit
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                  </svg>
                  Save Trip
                </>
              )}
            </button>
          )}

          {/* Done button in edit mode */}
          {editMode && (
            <button
              onClick={exitEditMode}
              className="absolute top-4 right-4 bg-black text-white px-4 py-2.5 rounded-full flex items-center gap-2 shadow-md z-20 text-sm font-bold"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              Done
            </button>
          )}
        </div>
      </div>

      {/* Bottom sheet */}
      <div
        ref={sheetRef}
        className="absolute left-0 right-0 bottom-0 bg-white rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)] flex flex-col transition-[top] duration-300 ease-out z-30"
        style={{ top: sheetTop }}
      >
        {/* Drag handle */}
        <div
          className="flex justify-center py-3 cursor-grab active:cursor-grabbing touch-none"
          onMouseDown={(e) => {
            handleDragStart(e.clientY);
            const onMove = () => {};
            const onUp = (ev: MouseEvent) => {
              handleDragEnd(ev.clientY);
              window.removeEventListener("mousemove", onMove);
              window.removeEventListener("mouseup", onUp);
            };
            window.addEventListener("mousemove", onMove);
            window.addEventListener("mouseup", onUp);
          }}
          onTouchStart={(e) => {
            handleDragStart(e.touches[0].clientY);
            const onEnd = (ev: TouchEvent) => {
              handleDragEnd(ev.changedTouches[0].clientY);
              window.removeEventListener("touchend", onEnd);
            };
            window.addEventListener("touchend", onEnd);
          }}
        >
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Trip header */}
        <div className="px-5 pb-3 flex gap-3">
          <div className="w-24 h-20 rounded-xl bg-gray-200 flex-shrink-0 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-gray-900 leading-tight">{trip.title}</h1>
            <p className="text-xs text-gray-500 mt-1">
              {currentDays.length} {currentDays.length === 1 ? "day" : "days"} · {totalSpots} spots
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{trip.city}, {trip.country}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-5 mb-3">
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            {!editMode && (
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === "overview"
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                Overview
              </button>
            )}
            {currentDays.map((day) => (
              <button
                key={day.day}
                onClick={() => setActiveTab(day.day)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === day.day
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                Day {day.day}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className={`flex-1 overflow-y-auto px-5 ${editMode && selectedStops.size > 0 ? "pb-32" : "pb-24"}`}>
          {activeTab === "overview" && !editMode
            ? renderOverview()
            : renderDayTimeline(currentDays.find((d) => d.day === activeTab) || currentDays[0])
          }
        </div>

        {/* Edit mode bottom bar */}
        {editMode && selectedStops.size > 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-5 py-4 flex items-center gap-3 z-10">
            <button
              onClick={() => {
                if (dragIndex !== null) return;
                // Move selected up
                if (!editedDays) return;
                const day = currentDays.find(d => d.day === activeTab);
                if (!day) return;
                const indices = Array.from(selectedStops)
                  .filter(k => k.startsWith(`${day.day}-`))
                  .map(k => parseInt(k.split("-")[1]))
                  .sort((a, b) => a - b);
                if (indices.length === 1 && indices[0] > 0) {
                  moveStop(day.day, indices[0], indices[0] - 1);
                  setSelectedStops(new Set([`${day.day}-${indices[0] - 1}`]));
                }
              }}
              className="flex-1 bg-white border-2 border-gray-200 rounded-full py-3 flex items-center justify-center gap-2 text-sm font-medium text-gray-900"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
              Move
            </button>
            <button
              onClick={deleteSelected}
              className="flex-1 bg-white border-2 border-gray-300 rounded-full py-3 flex items-center justify-center gap-2 text-sm font-medium text-gray-900"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
              Delete
              <span className="w-5 h-5 bg-black text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {selectedStops.size}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Spot detail popup */}
      {selectedStop && !editMode && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/50 animate-fade-in"
            onClick={() => setSelectedStop(null)}
          />
          <div className="relative w-full max-w-[430px] bg-white rounded-t-3xl animate-slide-up max-h-[85vh] flex flex-col">
            <div className="p-5 pb-3 flex gap-4">
              <div className="w-24 h-24 rounded-xl bg-gray-200 flex-shrink-0 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-gray-900">{selectedStop.name}</h2>
                {selectedStop.rating && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg key={star} className="w-3.5 h-3.5" viewBox="0 0 24 24" fill={star <= Math.round(selectedStop.rating!) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14 2 9.27l6.91-1.01z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">{selectedStop.rating} ({selectedStop.reviewCount?.toLocaleString()})</span>
                  </div>
                )}
                <span className="inline-block text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full mt-2 border border-gray-200">{selectedStop.category}</span>
              </div>
              <button onClick={() => setSelectedStop(null)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 self-start">
                <span className="text-gray-500 text-sm">&times;</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-6">
              <p className="text-sm text-gray-600 leading-relaxed">{selectedStop.description}</p>

              {selectedStop.tips && selectedStop.tips.length > 0 && (
                <div className="mt-4 bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-xs font-bold text-gray-900 mb-2">Tips from travelers</p>
                  <div className="space-y-2.5">
                    {selectedStop.tips.map((tip, i) => (
                      <div key={i} className="flex gap-2">
                        <div className="w-1 bg-gray-300 rounded-full flex-shrink-0 mt-0.5" style={{ minHeight: 16 }} />
                        <p className="text-xs text-gray-600 leading-relaxed">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 border-t border-gray-100">
                {selectedStop.openingHours && (
                  <div className="flex items-center gap-3 py-3 border-b border-gray-100">
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Hours</p>
                      <p className="text-sm text-gray-900">{selectedStop.openingHours}</p>
                    </div>
                  </div>
                )}
                {selectedStop.address && (
                  <div className="flex items-center gap-3 py-3 border-b border-gray-100">
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" /><circle cx="12" cy="9" r="2.5" /></svg>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Location</p>
                      <p className="text-sm text-gray-900">{selectedStop.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
