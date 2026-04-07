# Travel Up — Project Guidelines

## Design System

- **Color scheme**: Black & white only. No brand colors, no colored icons, no colored backgrounds. Use black, white, and shades of gray exclusively.
- **Selected states**: `bg-black text-white` for selected items. `border-black` for selected outlines.
- **Buttons**: Black fill with white text for primary actions. Gray border for secondary/unselected.
- **Icons**: Gray SVG strokes only. No emoji icons, no colored icon backgrounds.

## Search Modal (Airbnb-style)

- Accordion pattern with 3 collapsible sections: **Where**, **When**, **Who**
- Only one section expanded at a time; others show collapsed summary row
- No tabs at the top (no Trips/Experiences/Services) — this is purely a trip search
- **Where**: Search bar opens full-screen overlay with back arrow, type-ahead results using `searchCities()`, suggested cities from `mock.ts`
- **When**: Toggle between Dates (calendar picker with month nav) and Flexible (duration chips + month cards). Flexibility chips: Exact, ±1/2/3/7 days
- **Who**: Guest counter rows (Adults, Children, Infants) with +/- buttons
- Bottom bar: "Clear all" (underline link) + "Search" (black button with search icon)
- Max height: 95vh, scrollable content area

## Tech Stack

- Next.js 14.2 (App Router), React 18, TypeScript, TailwindCSS 3.4
- Mobile-first layout, max-width 430px centered
- State: React Context (`AppContext`) with SearchState including `cityId`, `cityName`, `duration`, `interests`, `budget`, `guests`, `checkIn`, `checkOut`
- Data: `src/data/mock.ts` — cities, trips, interests, budgetOptions, search/filter functions

## Responsive

- Container: `max-w-[430px]` on layout, BottomNav, and SearchModal
- Full-screen search overlay fills viewport on mobile
- Calendar grid uses `grid-cols-7` with aspect-square cells
- Overflow scrolling with `hide-scrollbar` utility class
