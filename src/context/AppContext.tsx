"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface SearchState {
  cityId: string;
  cityName: string;
  duration: number;
  interests: string[];
  budget: string;
  guests: number;
  checkIn: string;
  checkOut: string;
}

interface AppState {
  search: SearchState;
  savedTrips: string[];
  completedTrips: string[];
}

interface AppContextType {
  state: AppState;
  setSearch: (search: Partial<SearchState>) => void;
  resetSearch: () => void;
  toggleSavedTrip: (tripId: string) => void;
  isTripSaved: (tripId: string) => boolean;
}

const defaultSearch: SearchState = {
  cityId: "",
  cityName: "",
  duration: 2,
  interests: [],
  budget: "",
  guests: 0,
  checkIn: "",
  checkOut: "",
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    search: { ...defaultSearch },
    savedTrips: [],
    completedTrips: [],
  });

  const setSearch = (partial: Partial<SearchState>) => {
    setState((prev) => ({
      ...prev,
      search: { ...prev.search, ...partial },
    }));
  };

  const resetSearch = () => {
    setState((prev) => ({
      ...prev,
      search: { ...defaultSearch },
    }));
  };

  const toggleSavedTrip = (tripId: string) => {
    setState((prev) => ({
      ...prev,
      savedTrips: prev.savedTrips.includes(tripId)
        ? prev.savedTrips.filter((id) => id !== tripId)
        : [...prev.savedTrips, tripId],
    }));
  };

  const isTripSaved = (tripId: string) => state.savedTrips.includes(tripId);

  return (
    <AppContext.Provider
      value={{ state, setSearch, resetSearch, toggleSavedTrip, isTripSaved }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
