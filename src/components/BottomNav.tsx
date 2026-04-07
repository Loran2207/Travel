"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { SearchModal } from "./SearchModal";

export function BottomNav() {
  const pathname = usePathname();
  const [showSearch, setShowSearch] = useState(false);

  const isExplore = pathname === "/" || pathname === "/explore";
  const isMyTrips = pathname === "/my-trips";

  return (
    <>
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-white border-t border-gray-200 z-40">
        <div className="flex items-center justify-around h-16 px-4">
          {/* Explore */}
          <Link
            href="/explore"
            className={`flex flex-col items-center gap-1 ${isExplore ? "text-black" : "text-gray-400"}`}
          >
            <div
              className={`w-6 h-6 border-2 rounded ${isExplore ? "border-black" : "border-gray-400"}`}
            />
            <span
              className={`text-xs ${isExplore ? "font-bold" : "font-normal"}`}
            >
              Explore
            </span>
            {isExplore && (
              <div className="w-6 h-0.5 bg-black rounded-full -mt-0.5" />
            )}
          </Link>

          {/* Search button */}
          <button
            onClick={() => setShowSearch(true)}
            className="flex flex-col items-center gap-1 -mt-6"
          >
            <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center">
              <span className="text-white text-xl">⌕</span>
            </div>
            <span className="text-xs text-gray-500">Search</span>
          </button>

          {/* My Trips */}
          <Link
            href="/my-trips"
            className={`flex flex-col items-center gap-1 ${isMyTrips ? "text-black" : "text-gray-400"}`}
          >
            <div
              className={`w-6 h-6 border-2 rounded ${isMyTrips ? "border-black bg-black" : "border-gray-400"}`}
            />
            <span
              className={`text-xs ${isMyTrips ? "font-bold" : "font-normal"}`}
            >
              My Trips
            </span>
            {isMyTrips && (
              <div className="w-6 h-0.5 bg-black rounded-full -mt-0.5" />
            )}
          </Link>
        </div>
      </nav>

      {showSearch && <SearchModal onClose={() => setShowSearch(false)} />}
    </>
  );
}
