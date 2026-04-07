"use client";

import { useApp } from "@/context/AppContext";
import { getTripById } from "@/data/mock";
import { TripCard } from "@/components/TripCard";

export default function WishlistPage() {
  const { state } = useApp();
  const saved = state.savedTrips.map(getTripById).filter(Boolean);

  return (
    <div className="px-5 pt-12">
      <h1 className="text-2xl font-bold text-gray-900">Wishlist</h1>
      <p className="text-sm text-gray-500 mt-1">
        Trips you&apos;ve saved for later
      </p>

      <div className="flex flex-col gap-4 mt-6">
        {saved.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <p className="text-sm text-gray-500">No saved trips yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Tap the heart on any trip to save it here
            </p>
          </div>
        ) : (
          saved.map((trip) => trip && <TripCard key={trip.id} trip={trip} />)
        )}
      </div>
    </div>
  );
}
