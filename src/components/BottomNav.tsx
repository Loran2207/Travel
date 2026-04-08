"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function BottomNav() {
  const pathname = usePathname();

  const isExplore = pathname === "/" || pathname === "/explore";
  const isMyTrips = pathname === "/my-trips";
  const isProfile = pathname === "/profile";

  // Hide nav on detail/results pages
  const hideOn = ["/results", "/trip"];
  if (hideOn.some((p) => pathname.startsWith(p))) return null;

  const items = [
    {
      href: "/explore",
      label: "Explore",
      active: isExplore,
      icon: (active: boolean) => (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5}>
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      ),
    },
    {
      href: "/my-trips",
      label: "My Trips",
      active: isMyTrips,
      icon: (active: boolean) => (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 2 : 1.5}>
          <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
        </svg>
      ),
    },
    {
      href: "/profile",
      label: "Profile",
      active: isProfile,
      icon: (active: boolean) => (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5}>
          <circle cx="12" cy="8" r="4" />
          <path d="M20 21a8 8 0 1 0-16 0" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-gray-200 z-40">
      <div className="flex items-center justify-around h-14 px-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center gap-0.5 min-w-[56px] py-1 ${
              item.active ? "text-black" : "text-gray-400"
            }`}
          >
            {item.icon(item.active)}
            <span className={`text-[10px] ${item.active ? "font-bold" : "font-normal"}`}>
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
