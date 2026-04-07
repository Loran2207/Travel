"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getTripById } from "@/data/mock";
import { useApp } from "@/context/AppContext";

export default function TripDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toggleSavedTrip, isTripSaved } = useApp();
  const [imageIndex, setImageIndex] = useState(0);

  const trip = getTripById(params.id as string);

  if (!trip) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Trip not found</p>
      </div>
    );
  }

  const saved = isTripSaved(trip.id);

  const cycleImage = () => {
    setImageIndex((prev) => (prev + 1) % trip.imageCount);
  };

  return (
    <div className="relative">
      {/* Image placeholder */}
      <div
        className="relative w-full h-[240px] bg-gray-200 cursor-pointer"
        onClick={cycleImage}
      >
        <div className="absolute top-4 left-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.back();
            }}
            className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm shadow"
          >
            ←
          </button>
        </div>
        <div className="absolute top-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded">
          {imageIndex + 1} / {trip.imageCount}
        </div>
        {/* Floating actions */}
        <div className="absolute top-4 right-16 flex gap-2">
          <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm shadow">
            ↗
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSavedTrip(trip.id);
            }}
            className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm shadow"
          >
            {saved ? "♥" : "♡"}
          </button>
        </div>
        <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
          Image {imageIndex + 1}
        </div>
      </div>

      {/* Content card */}
      <div className="bg-white -mt-4 rounded-t-2xl relative z-10 px-5 pt-5 pb-24">
        <h1 className="text-xl font-bold text-gray-900">{trip.title}</h1>
        <p className="text-sm text-gray-500 mt-1">
          {trip.city}, {trip.country}
        </p>

        {/* Stats row */}
        <div className="flex items-center justify-between mt-4 py-3 border-y border-gray-200 text-xs text-gray-600">
          <div className="text-center flex-1">
            <p className="font-bold text-gray-900">
              ⭐ {trip.rating}
            </p>
            <p>{trip.reviewCount} reviews</p>
          </div>
          <div className="w-px h-8 bg-gray-200" />
          <div className="text-center flex-1">
            <p className="font-bold text-gray-900">
              📍 {trip.places}
            </p>
            <p>places</p>
          </div>
          <div className="w-px h-8 bg-gray-200" />
          <div className="text-center flex-1">
            <p className="font-bold text-gray-900">
              🚶 {trip.steps}
            </p>
            <p>steps</p>
          </div>
        </div>

        {/* Overview */}
        <div className="mt-4">
          <p className="text-sm text-gray-600 leading-relaxed">
            {trip.description}
          </p>
        </div>

        <div className="h-px bg-gray-200 my-4" />

        {/* Route info */}
        <div>
          <h2 className="text-base font-bold text-gray-900 mb-3">
            Route info
          </h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p>🚗 By car: {trip.carDistance} total</p>
            <p>🚶 On foot: {trip.footSteps}</p>
            <p>⏱ Estimated time: {trip.estimatedTime}</p>
          </div>
        </div>

        <div className="h-px bg-gray-200 my-4" />

        {/* Day schedule */}
        <div>
          <h2 className="text-base font-bold text-gray-900 mb-4">
            Day schedule
          </h2>
          <div className="relative pl-8">
            {/* Timeline line */}
            <div className="absolute left-3 top-2 bottom-2 w-px bg-gray-300" />

            {trip.stops.map((stop, i) => (
              <div key={i} className="relative mb-6 last:mb-0">
                {/* Circle */}
                <div className="absolute -left-5 top-0.5 w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center font-bold">
                  {stop.number}
                </div>

                <div>
                  <p className="text-xs text-gray-400">{stop.time}</p>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">
                    {stop.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stop.description}
                  </p>
                  {stop.walkToNext && (
                    <p className="text-xs text-gray-400 mt-2">
                      🚶 {stop.walkToNext}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="h-px bg-gray-200 my-4" />

        {/* View on map */}
        <button className="w-full py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-900">
          View on Map
        </button>
      </div>

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-white border-t border-gray-200 px-5 py-3 z-50 flex items-center justify-between">
        <p className="text-base font-bold text-gray-900">
          ${trip.pricePerPerson}{" "}
          <span className="text-xs font-normal text-gray-500">/ person</span>
        </p>
        <button
          onClick={() => toggleSavedTrip(trip.id)}
          className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-colors ${
            saved
              ? "bg-gray-200 text-gray-700"
              : "bg-black text-white"
          }`}
        >
          {saved ? "Saved ✓" : "Save to My Trips"}
        </button>
      </div>
    </div>
  );
}
