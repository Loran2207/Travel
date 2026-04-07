"use client";

import Link from "next/link";
import { Trip } from "@/data/mock";

interface TripCardProps {
  trip: Trip;
  compact?: boolean;
}

export function TripCard({ trip, compact = false }: TripCardProps) {
  const imageHeight = compact ? "h-[120px]" : "h-[180px]";

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div
        className={`w-full ${imageHeight} bg-gray-200 flex items-center justify-center`}
      >
        <span className="text-gray-500 text-sm">
          📍 {trip.city}
        </span>
      </div>
      <div className="p-3">
        <h3 className="font-bold text-sm text-gray-900">{trip.title}</h3>
        <div className="flex flex-wrap gap-1 mt-1.5">
          {trip.categories.map((cat) => (
            <span
              key={cat}
              className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full border border-gray-200"
            >
              {cat}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
          <span>⭐ {trip.rating}</span>
          <span>·</span>
          <span>📍 {trip.places} places</span>
          <span>·</span>
          <span>🚶 {trip.steps} steps</span>
          <span>·</span>
          <span>💰 ${trip.pricePerPerson}/person</span>
        </div>
        <div className="mt-2 text-right">
          <Link
            href={`/trip/${trip.id}`}
            className="text-xs font-medium text-gray-900 hover:underline"
          >
            View trip →
          </Link>
        </div>
      </div>
    </div>
  );
}
