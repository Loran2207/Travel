"use client";

import { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { getTripById } from "@/data/mock";
import { TripCard } from "@/components/TripCard";

export default function MyTripsPage() {
  const { state } = useApp();
  const [tab, setTab] = useState<"saved" | "completed">("saved");

  const savedTrips = state.savedTrips
    .map((id) => getTripById(id))
    .filter(Boolean);

  return (
    <div className="px-5 pt-12">
      <h1 className="text-2xl font-bold text-gray-900">My Trips</h1>

      {/* Tabs */}
      <div className="flex gap-0 mt-5 border-b border-gray-200">
        <button
          onClick={() => setTab("saved")}
          className={`flex-1 pb-3 text-sm font-medium text-center border-b-2 transition-colors ${
            tab === "saved"
              ? "border-black text-black"
              : "border-transparent text-gray-400"
          }`}
        >
          Saved
        </button>
        <button
          onClick={() => setTab("completed")}
          className={`flex-1 pb-3 text-sm font-medium text-center border-b-2 transition-colors ${
            tab === "completed"
              ? "border-black text-black"
              : "border-transparent text-gray-400"
          }`}
        >
          Completed
        </button>
      </div>

      {/* Content */}
      <div className="mt-5">
        {tab === "saved" && (
          <>
            {savedTrips.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-lg mx-auto mb-4 border border-gray-200" />
                <p className="text-sm text-gray-500 mb-4">
                  No saved trips yet
                </p>
                <Link
                  href="/explore"
                  className="text-sm font-medium text-gray-900 hover:underline"
                >
                  Start exploring →
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-4 pb-4">
                {savedTrips.map(
                  (trip) =>
                    trip && (
                      <TripCard key={trip.id} trip={trip} compact />
                    )
                )}
              </div>
            )}
          </>
        )}

        {tab === "completed" && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-lg mx-auto mb-4 border border-gray-200" />
            <p className="text-sm text-gray-500">
              No completed trips yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
