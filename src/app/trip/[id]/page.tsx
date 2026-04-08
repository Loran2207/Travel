"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { getTripById, TripDay, TripStop } from "@/data/mock";
import { useApp } from "@/context/AppContext";

type TabValue = "overview" | number;

function TransportIcon({ type }: { type: string }) {
  const paths: Record<string, React.ReactNode> = {
    walk: <><circle cx="12" cy="4" r="2" /><path d="M14 10l-1 4-2 2v4M10 10l1 4 2 2v4M10 10l-2 6M14 10l2 6" /></>,
    drive: <><path d="M5 17h14M5 17a2 2 0 01-2-2V9a2 2 0 012-2h14a2 2 0 012 2v6a2 2 0 01-2 2M5 17l-1 2M19 17l1 2" /><circle cx="7.5" cy="14" r="1" /><circle cx="16.5" cy="14" r="1" /></>,
    bus: <><rect x="4" y="3" width="16" height="16" rx="2" /><path d="M4 11h16M4 7h16" /><circle cx="7.5" cy="15.5" r="1" /><circle cx="16.5" cy="15.5" r="1" /></>,
    metro: <><rect x="4" y="3" width="16" height="14" rx="3" /><path d="M4 12h16" /><path d="M6 17l-2 4M18 17l2 4M9 21h6" /></>,
  };
  if (!paths[type]) return null;
  return <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">{paths[type]}</svg>;
}

function ArrowUp({ disabled, onClick }: { disabled: boolean; onClick: () => void }) {
  return (
    <button disabled={disabled} onClick={onClick} className={`w-7 h-7 rounded-full border flex items-center justify-center ${disabled ? "border-gray-200 text-gray-300" : "border-gray-400 text-gray-600 active:bg-gray-100"}`}>
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
    </button>
  );
}

function ArrowDown({ disabled, onClick }: { disabled: boolean; onClick: () => void }) {
  return (
    <button disabled={disabled} onClick={onClick} className={`w-7 h-7 rounded-full border flex items-center justify-center ${disabled ? "border-gray-200 text-gray-300" : "border-gray-400 text-gray-600 active:bg-gray-100"}`}>
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
    </button>
  );
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
  const [checkedStops, setCheckedStops] = useState<Set<string>>(new Set());

  // Transport picker
  const [transportPicker, setTransportPicker] = useState<{ dayNum: number; stopIdx: number } | null>(null);

  // Bottom sheet
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
    return <div className="flex items-center justify-center h-screen"><p className="text-gray-500">Trip not found</p></div>;
  }

  const saved = isTripSaved(trip.id);
  const currentDays = editedDays || trip.days;
  const totalSpots = currentDays.reduce((sum, d) => sum + d.stops.length, 0);
  const sheetTop = sheetPosition === "full" ? "8%" : sheetPosition === "half" ? "45%" : "78%";

  const enterEditMode = () => {
    setEditedDays(trip.days.map(d => ({ ...d, stops: d.stops.map(s => ({ ...s })) })));
    setCheckedStops(new Set());
    setEditMode(true);
    setActiveTab("overview");
  };

  const exitEditMode = () => {
    setEditMode(false);
    setEditedDays(null);
    setCheckedStops(new Set());
  };

  // Day reorder
  const moveDayUp = (idx: number) => {
    if (!editedDays || idx <= 0) return;
    setEditedDays(prev => {
      if (!prev) return prev;
      const arr = [...prev];
      [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
      return arr.map((d, i) => ({ ...d, day: i + 1 }));
    });
  };

  const moveDayDown = (idx: number) => {
    if (!editedDays || idx >= editedDays.length - 1) return;
    setEditedDays(prev => {
      if (!prev) return prev;
      const arr = [...prev];
      [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
      return arr.map((d, i) => ({ ...d, day: i + 1 }));
    });
  };

  // Stop reorder within a day
  const moveStopUp = (dayNum: number, idx: number) => {
    if (!editedDays || idx <= 0) return;
    setEditedDays(prev => {
      if (!prev) return prev;
      return prev.map(day => {
        if (day.day !== dayNum) return day;
        const stops = [...day.stops];
        [stops[idx - 1], stops[idx]] = [stops[idx], stops[idx - 1]];
        return { ...day, stops: stops.map((s, i) => ({ ...s, number: i + 1 })) };
      });
    });
  };

  const moveStopDown = (dayNum: number, idx: number) => {
    if (!editedDays) return;
    const day = editedDays.find(d => d.day === dayNum);
    if (!day || idx >= day.stops.length - 1) return;
    setEditedDays(prev => {
      if (!prev) return prev;
      return prev.map(d => {
        if (d.day !== dayNum) return d;
        const stops = [...d.stops];
        [stops[idx], stops[idx + 1]] = [stops[idx + 1], stops[idx]];
        return { ...d, stops: stops.map((s, i) => ({ ...s, number: i + 1 })) };
      });
    });
  };

  const toggleCheck = (dayNum: number, stopIdx: number) => {
    const key = `${dayNum}-${stopIdx}`;
    setCheckedStops(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const deleteChecked = () => {
    if (!editedDays) return;
    setEditedDays(prev => {
      if (!prev) return prev;
      return prev.map(day => {
        const newStops = day.stops
          .filter((_, idx) => !checkedStops.has(`${day.day}-${idx}`))
          .map((s, i) => ({ ...s, number: i + 1 }));
        return { ...day, stops: newStops, spots: newStops.length };
      });
    });
    setCheckedStops(new Set());
  };

  // --- Overview ---
  // Transport mode estimates (mock multipliers based on distance)
  const getTransportOptions = (transport: { type: string; duration: string; distance: string }) => {
    const distKm = parseFloat(transport.distance.replace(/[^0-9.]/g, "")) || 1;
    const distM = Math.round(distKm * 1000);
    const steps = Math.round(distM * 1.3);
    return [
      { type: "walk" as const, duration: `${Math.round(distKm * 12)} min`, distance: `${steps.toLocaleString()} steps`, distSub: transport.distance },
      { type: "drive" as const, duration: `${Math.max(1, Math.round(distKm * 2))} min`, distance: transport.distance, distSub: "" },
      { type: "bus" as const, duration: `${Math.round(distKm * 4)} min`, distance: transport.distance, distSub: "" },
      { type: "metro" as const, duration: `${Math.max(2, Math.round(distKm * 3))} min`, distance: transport.distance, distSub: "" },
    ];
  };

  const changeTransport = (dayNum: number, stopIdx: number, newType: "walk" | "drive" | "bus" | "metro") => {
    const days = editedDays || trip.days;
    const day = days.find(d => d.day === dayNum);
    if (!day) return;
    const stop = day.stops[stopIdx];
    if (!stop?.transport) return;

    const options = getTransportOptions(stop.transport);
    const selected = options.find(o => o.type === newType);
    if (!selected) return;

    const newDays = (editedDays || trip.days).map(d => {
      if (d.day !== dayNum) return d;
      return {
        ...d,
        stops: d.stops.map((s, i) => {
          if (i !== stopIdx || !s.transport) return s;
          return { ...s, transport: { type: newType, duration: selected.duration, distance: selected.type === "walk" ? selected.distSub : selected.distance } };
        }),
      };
    });

    if (!editedDays) {
      setEditedDays(newDays.map(d => ({ ...d, stops: d.stops.map(s => ({ ...s })) })));
    } else {
      setEditedDays(newDays);
    }
    setTransportPicker(null);
  };

  const renderOverview = () => (
    <div className="space-y-3">
      {currentDays.map((day, idx) => (
        <div key={day.day} className="bg-gray-50 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            {/* Reorder arrows in edit mode */}
            {editMode && (
              <div className="flex flex-col gap-1">
                <ArrowUp disabled={idx === 0} onClick={() => moveDayUp(idx)} />
                <ArrowDown disabled={idx === currentDays.length - 1} onClick={() => moveDayDown(idx)} />
              </div>
            )}

            <button
              onClick={() => setActiveTab(day.day)}
              className="flex-1 text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white bg-black px-2 py-0.5 rounded-full">Day {day.day}</span>
                  <span className="text-sm font-semibold text-gray-900">{day.city}</span>
                </div>
                <span className="text-xs text-gray-500">{day.distance} · {day.stops.length} spots</span>
              </div>
              <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                {day.stops.map((stop, i) => (
                  <div key={i} className="w-12 h-12 rounded-lg bg-gray-200 flex-shrink-0 flex items-center justify-center">
                    <span className="text-[9px] text-gray-400 text-center leading-tight px-0.5">{stop.name.split(" ")[0]}</span>
                  </div>
                ))}
              </div>
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  // --- Day timeline ---
  const renderDayTimeline = (day: TripDay) => (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-gray-900">{day.city}</span>
        <span className="text-xs text-gray-500">{day.distance} · {day.stops.length} spots</span>
      </div>

      <div className="relative">
        {day.stops.map((stop, i) => {
          const checked = checkedStops.has(`${day.day}-${i}`);

          return (
            <div key={`${day.day}-${i}`}>
              <div className="flex gap-3">
                {/* Number */}
                <div className="flex flex-col items-center">
                  <div className={`w-7 h-7 rounded-full text-xs flex items-center justify-center font-bold flex-shrink-0 ${
                    editMode && checked ? "bg-black text-white" : "bg-gray-200 text-gray-500"
                  }`}>
                    {stop.number}
                  </div>
                  {!editMode && i < day.stops.length - 1 && <div className="w-px flex-1 bg-gray-200 my-1" />}
                </div>

                {/* Card */}
                <div className="flex-1 pb-2">
                  {editMode ? (
                    <div className={`flex items-center gap-2 bg-gray-50 rounded-xl p-3 border-2 transition-colors ${checked ? "border-black" : "border-transparent"}`}>
                      {/* Up/Down arrows */}
                      <div className="flex flex-col gap-1">
                        <ArrowUp disabled={i === 0} onClick={() => moveStopUp(day.day, i)} />
                        <ArrowDown disabled={i === day.stops.length - 1} onClick={() => moveStopDown(day.day, i)} />
                      </div>

                      <div className="w-12 h-12 rounded-lg bg-gray-200 flex-shrink-0 flex items-center justify-center">
                        <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
                        </svg>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900">{stop.name}</p>
                        <span className="inline-block text-[10px] px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full mt-1">{stop.category}</span>
                      </div>

                      {/* Checkbox */}
                      <button
                        onClick={() => toggleCheck(day.day, i)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${checked ? "bg-black border-black" : "border-gray-300"}`}
                      >
                        {checked && <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedStop(stop)}
                      className="w-full bg-gray-50 rounded-xl p-3 flex gap-3 text-left active:bg-gray-100 transition-colors"
                    >
                      <div className="w-16 h-16 rounded-lg bg-gray-200 flex-shrink-0 flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900">{stop.name}</p>
                        <span className="inline-block text-[10px] px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full mt-1">{stop.category}</span>
                      </div>
                    </button>
                  )}
                </div>
              </div>

              {/* Transport pill */}
              {!editMode && stop.transport && (
                <div className="flex gap-3 mb-2">
                  <div className="flex flex-col items-center w-7"><div className="w-px flex-1 bg-gray-200" /></div>
                  <div className="flex-1 py-1">
                    {saved ? (
                      <button
                        onClick={() => setTransportPicker({ dayNum: day.day, stopIdx: i })}
                        className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-3 py-1.5 active:bg-gray-50 transition-colors"
                      >
                        <TransportIcon type={stop.transport.type} />
                        <span className="text-xs text-gray-600">{stop.transport.duration} · {stop.transport.distance}</span>
                        <svg className="w-3 h-3 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
                      </button>
                    ) : (
                      <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-3 py-1.5">
                        <TransportIcon type={stop.transport.type} />
                        <span className="text-xs text-gray-600">{stop.transport.duration} · {stop.transport.distance}</span>
                      </div>
                    )}
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
      {/* Map */}
      <div className="absolute inset-0">
        <div className="w-full h-full bg-gray-200 flex items-center justify-center relative">
          <div className="absolute inset-0 opacity-30">
            <svg width="100%" height="100%"><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ccc" strokeWidth="0.5" /></pattern><rect width="100%" height="100%" fill="url(#grid)" /></svg>
          </div>
          <div className="relative z-10 flex flex-col items-center gap-1">
            {currentDays.map((day) => (
              <span key={day.day} className="text-[10px] font-bold text-white bg-black px-2 py-0.5 rounded-full">Day {day.day} · {day.distance}</span>
            ))}
          </div>

          <button onClick={() => { if (editMode) exitEditMode(); else router.back(); }} className="absolute top-4 left-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md z-20">
            <svg className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          </button>

          {!editMode ? (
            <button
              onClick={() => { if (saved) enterEditMode(); else toggleSavedTrip(trip.id); }}
              className="absolute top-4 right-4 bg-black text-white px-4 py-2.5 rounded-full flex items-center gap-2 shadow-md z-20 text-sm font-bold"
            >
              {saved ? (
                <><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>Edit</>
              ) : (
                <><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" /></svg>Save Trip</>
              )}
            </button>
          ) : (
            <button onClick={exitEditMode} className="absolute top-4 right-4 bg-black text-white px-4 py-2.5 rounded-full flex items-center gap-2 shadow-md z-20 text-sm font-bold">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>Done
            </button>
          )}
        </div>
      </div>

      {/* Bottom sheet */}
      <div ref={sheetRef} className="absolute left-0 right-0 bottom-0 bg-white rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)] flex flex-col transition-[top] duration-300 ease-out z-30" style={{ top: sheetTop }}>
        <div
          className="flex justify-center py-3 cursor-grab active:cursor-grabbing touch-none"
          onMouseDown={(e) => { handleDragStart(e.clientY); const up = (ev: MouseEvent) => { handleDragEnd(ev.clientY); window.removeEventListener("mouseup", up); }; window.addEventListener("mouseup", up); }}
          onTouchStart={(e) => { handleDragStart(e.touches[0].clientY); const end = (ev: TouchEvent) => { handleDragEnd(ev.changedTouches[0].clientY); window.removeEventListener("touchend", end); }; window.addEventListener("touchend", end); }}
        >
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-5 pb-3 flex gap-3">
          <div className="w-24 h-20 rounded-xl bg-gray-200 flex-shrink-0 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-gray-900 leading-tight">{trip.title}</h1>
            <p className="text-xs text-gray-500 mt-1">{currentDays.length} {currentDays.length === 1 ? "day" : "days"} · {totalSpots} spots</p>
            <p className="text-xs text-gray-400 mt-0.5">{trip.city}, {trip.country}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-5 mb-3">
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeTab === "overview" ? "bg-black text-white" : "bg-gray-100 text-gray-600"}`}
            >
              Overview
            </button>
            {currentDays.map((day) => (
              <button key={day.day} onClick={() => setActiveTab(day.day)} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeTab === day.day ? "bg-black text-white" : "bg-gray-100 text-gray-600"}`}>
                Day {day.day}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className={`flex-1 overflow-y-auto px-5 ${editMode && checkedStops.size > 0 ? "pb-28" : "pb-24"}`}>
          {activeTab === "overview"
            ? renderOverview()
            : renderDayTimeline(currentDays.find(d => d.day === activeTab) || currentDays[0])
          }
        </div>

        {/* Delete bar */}
        {editMode && checkedStops.size > 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-5 py-4 flex items-center justify-center z-10">
            <button onClick={deleteChecked} className="flex items-center gap-2 border-2 border-gray-300 rounded-full px-6 py-3 text-sm font-medium text-gray-900 active:bg-gray-50 transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /></svg>
              Delete
              <span className="w-5 h-5 bg-black text-white text-[10px] font-bold rounded-full flex items-center justify-center">{checkedStops.size}</span>
            </button>
          </div>
        )}
      </div>

      {/* Transport picker popup */}
      {transportPicker && (() => {
        const days = editedDays || trip.days;
        const day = days.find(d => d.day === transportPicker.dayNum);
        const stop = day?.stops[transportPicker.stopIdx];
        if (!stop?.transport) return null;
        const options = getTransportOptions(stop.transport);
        return (
          <div className="fixed inset-0 z-50 flex items-end justify-center">
            <div className="absolute inset-0 bg-black/50 animate-fade-in" onClick={() => setTransportPicker(null)} />
            <div className="relative w-full max-w-[430px] bg-white rounded-t-3xl animate-slide-up pb-6">
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 bg-gray-300 rounded-full" />
              </div>
              <div className="px-5 pb-3 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">How to get there</h3>
                <button onClick={() => setTransportPicker(null)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              </div>
              <p className="px-5 text-xs text-gray-500 mb-4">
                {stop.name} → {day!.stops[transportPicker.stopIdx + 1]?.name || "Next stop"}
              </p>
              <div className="px-5 grid grid-cols-2 gap-3">
                {options.map((opt) => {
                  const isActive = stop.transport!.type === opt.type;
                  return (
                    <button
                      key={opt.type}
                      onClick={() => changeTransport(transportPicker.dayNum, transportPicker.stopIdx, opt.type)}
                      className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-colors ${
                        isActive ? "border-black bg-gray-50" : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className={`mb-2 ${isActive ? "text-gray-900" : "text-gray-400"}`}>
                        <TransportIcon type={opt.type} />
                      </div>
                      <span className="text-sm font-bold text-gray-900 capitalize">{opt.type}</span>
                      <span className="text-xs text-gray-500 mt-0.5">{opt.duration}</span>
                      <span className="text-[10px] text-gray-400 mt-0.5">{opt.distance}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Spot detail popup — Google Maps style */}
      {selectedStop && !editMode && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/50 animate-fade-in" onClick={() => setSelectedStop(null)} />
          <div className="relative w-full max-w-[430px] bg-white rounded-t-3xl animate-slide-up max-h-[90vh] flex flex-col">
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Header — name, meta, close */}
            <div className="px-5 pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0 pr-3">
                  <h2 className="text-xl font-bold text-gray-900">{selectedStop.name}</h2>
                  <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mt-1">
                    {selectedStop.rating && (
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-semibold text-gray-900">{selectedStop.rating}</span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <svg key={s} className="w-3 h-3" viewBox="0 0 24 24" fill={s <= Math.round(selectedStop.rating!) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14 2 9.27l6.91-1.01z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">({selectedStop.reviewCount?.toLocaleString()})</span>
                      </div>
                    )}
                    {selectedStop.priceLevel && (
                      <span className="text-xs text-gray-500">{selectedStop.priceLevel}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">{selectedStop.category}</span>
                    {selectedStop.openingHours && (
                      <>
                        <span className="text-xs text-gray-300">·</span>
                        <span className="text-xs text-gray-500">{selectedStop.openingHours}</span>
                      </>
                    )}
                  </div>
                </div>
                <button onClick={() => setSelectedStop(null)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">
              {/* Photo gallery placeholder */}
              <div className="px-5 mb-4">
                <div className="flex gap-1.5 overflow-x-auto hide-scrollbar">
                  {Array.from({ length: selectedStop.photos || 3 }).map((_, i) => (
                    <div key={i} className={`${i === 0 ? "w-48 h-32" : "w-24 h-32"} rounded-xl bg-gray-100 flex-shrink-0 flex items-center justify-center`}>
                      <svg className="w-6 h-6 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
                      </svg>
                    </div>
                  ))}
                </div>
              </div>

              {/* About section */}
              <div className="px-5 pb-4">
                <h3 className="text-sm font-bold text-gray-900 mb-2">About</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{selectedStop.description}</p>
              </div>

              {/* Info rows */}
              <div className="px-5">
                {selectedStop.address && (
                  <div className="flex items-start gap-3 py-3 border-t border-gray-100">
                    <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" /><circle cx="12" cy="9" r="2.5" />
                    </svg>
                    <p className="text-sm text-gray-900 flex-1">{selectedStop.address}</p>
                  </div>
                )}
                {selectedStop.openingHours && (
                  <div className="flex items-center gap-3 py-3 border-t border-gray-100">
                    <svg className="w-5 h-5 text-gray-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                    </svg>
                    <p className="text-sm text-gray-900 flex-1">{selectedStop.openingHours}</p>
                  </div>
                )}
                {selectedStop.phone && (
                  <div className="flex items-center gap-3 py-3 border-t border-gray-100">
                    <svg className="w-5 h-5 text-gray-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                    </svg>
                    <p className="text-sm text-gray-900 flex-1">{selectedStop.phone}</p>
                  </div>
                )}
                {selectedStop.website && (
                  <div className="flex items-center gap-3 py-3 border-t border-gray-100">
                    <svg className="w-5 h-5 text-gray-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                    </svg>
                    <p className="text-sm text-gray-900 flex-1">{selectedStop.website}</p>
                  </div>
                )}
              </div>

              {/* Tips */}
              {selectedStop.tips && selectedStop.tips.length > 0 && (
                <div className="px-5 pt-4">
                  <h3 className="text-sm font-bold text-gray-900 mb-3">Tips from travelers</h3>
                  <div className="space-y-2">
                    {selectedStop.tips.map((tip, i) => (
                      <div key={i} className="flex gap-2.5 bg-gray-50 rounded-xl p-3">
                        <svg className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <p className="text-xs text-gray-600 leading-relaxed">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews */}
              {selectedStop.reviews && selectedStop.reviews.length > 0 && (
                <div className="px-5 pt-6 pb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-gray-900">Reviews</h3>
                    {selectedStop.rating && (
                      <div className="flex items-center gap-1">
                        <span className="text-lg font-bold text-gray-900">{selectedStop.rating}</span>
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14 2 9.27l6.91-1.01z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
                    {selectedStop.reviews.map((review, i) => (
                      <div key={i} className="w-64 flex-shrink-0 bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-white">{review.author.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-900">{review.author}</p>
                            <p className="text-[10px] text-gray-400">{review.timeAgo}</p>
                          </div>
                        </div>
                        <div className="flex gap-0.5 mb-2">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <svg key={s} className="w-3 h-3" viewBox="0 0 24 24" fill={s <= review.rating ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14 2 9.27l6.91-1.01z" />
                            </svg>
                          ))}
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed line-clamp-4">{review.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
