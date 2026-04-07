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
        <div className="flex items-center gap-1.5 text-gray-500 text-sm">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
            <circle cx="12" cy="9" r="2.5" />
          </svg>
          {trip.city}
        </div>
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
        <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500 flex-wrap">
          <span className="flex items-center gap-0.5">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14 2 9.27l6.91-1.01z"/></svg>
            {trip.rating}
          </span>
          <span>·</span>
          <span>{trip.places} places</span>
          <span>·</span>
          <span>{trip.steps} steps</span>
          <span>·</span>
          <span>${trip.pricePerPerson}/person</span>
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
