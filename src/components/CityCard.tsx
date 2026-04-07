"use client";

interface CityCardProps {
  name: string;
  country: string;
  onClick?: () => void;
}

export function CityCard({ name, country, onClick }: CityCardProps) {
  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 w-[140px] text-left"
    >
      <div className="w-[140px] h-[100px] bg-gray-200 rounded-lg border border-gray-300" />
      <p className="mt-1.5 text-sm font-medium text-gray-900">{name}</p>
      <p className="text-xs text-gray-500">{country}</p>
    </button>
  );
}
