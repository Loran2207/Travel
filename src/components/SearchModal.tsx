"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { cities, interests, budgetOptions, searchCities } from "@/data/mock";

interface SearchModalProps {
  onClose: () => void;
}

export function SearchModal({ onClose }: SearchModalProps) {
  const router = useRouter();
  const { setSearch } = useApp();
  const [step, setStep] = useState(1);
  const [query, setQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState({ id: "", name: "" });
  const [duration, setDuration] = useState(2);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedBudget, setSelectedBudget] = useState("");

  const filteredCities =
    query.length > 0
      ? searchCities(query)
      : cities.slice(0, 5);

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSearch = () => {
    setSearch({
      cityId: selectedCity.id,
      cityName: selectedCity.name,
      duration,
      interests: selectedInterests,
      budget: selectedBudget,
    });
    onClose();
    router.push("/results");
  };

  const handleBack = () => {
    if (step === 1) {
      onClose();
    } else {
      setStep(step - 1);
    }
  };

  const dots = (
    <div className="flex justify-center gap-1.5 mb-4">
      {[1, 2, 3, 4].map((d) => (
        <div
          key={d}
          className={`w-2 h-2 rounded-full ${d === step ? "bg-black" : "bg-gray-300"}`}
        />
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/40 animate-fade-in"
        onClick={onClose}
      />
      <div className="relative w-full max-w-[390px] bg-white rounded-t-2xl animate-slide-up min-h-[70vh] max-h-[90vh] overflow-y-auto">
        <div className="p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <button onClick={handleBack} className="text-gray-500 text-sm">
              {step === 1 ? "✕ Close" : "← Back"}
            </button>
            <span className="text-xs text-gray-400">
              Step {step} of 4
            </span>
          </div>

          {dots}

          {/* Step 1: Destination */}
          {step === 1 && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold mb-4">Where?</h2>
              <input
                type="text"
                autoFocus
                placeholder="Search destinations"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black"
              />
              <div className="mt-4">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">
                  Suggested
                </p>
                {filteredCities.map((city) => (
                  <button
                    key={city.id}
                    onClick={() => {
                      setSelectedCity({ id: city.id, name: city.name });
                      setStep(2);
                    }}
                    className="flex items-center justify-between w-full py-3 border-b border-gray-100 text-left"
                  >
                    <div>
                      <span className="text-sm font-medium">{city.name}</span>
                      <span className="text-xs text-gray-400 ml-2">
                        {city.country}
                      </span>
                    </div>
                    <span className="text-gray-300">→</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Duration */}
          {step === 2 && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold mb-6">How long?</h2>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={`flex-1 py-3 rounded-lg text-sm font-medium border transition-colors ${
                      duration === d
                        ? "bg-black text-white border-black"
                        : "bg-white text-gray-700 border-gray-300"
                    }`}
                  >
                    {d === 5 ? "5+" : d} {d === 1 ? "day" : "days"}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setStep(3)}
                className="w-full mt-8 py-3 bg-black text-white rounded-lg text-sm font-medium"
              >
                Next
              </button>
            </div>
          )}

          {/* Step 3: Interests */}
          {step === 3 && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold mb-6">What interests you?</h2>
              <div className="grid grid-cols-2 gap-2">
                {interests.map((interest) => {
                  const selected = selectedInterests.includes(interest);
                  return (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={`py-3 px-4 rounded-lg text-sm font-medium border transition-colors ${
                        selected
                          ? "border-black text-black bg-gray-50"
                          : "border-gray-300 text-gray-500"
                      }`}
                    >
                      {interest}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setStep(4)}
                className="w-full mt-6 py-3 bg-black text-white rounded-lg text-sm font-medium"
              >
                Next
              </button>
            </div>
          )}

          {/* Step 4: Budget */}
          {step === 4 && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold mb-6">Budget per person</h2>
              <div className="grid grid-cols-2 gap-3">
                {budgetOptions.map((opt) => {
                  const selected = selectedBudget === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setSelectedBudget(opt.value)}
                      className={`p-4 rounded-lg border text-left transition-colors ${
                        selected
                          ? "border-black bg-gray-50"
                          : "border-gray-300"
                      }`}
                    >
                      <p className="text-sm font-bold">{opt.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {opt.description}
                      </p>
                    </button>
                  );
                })}
              </div>
              <button
                onClick={handleSearch}
                className="w-full mt-8 py-3.5 bg-black text-white rounded-lg text-sm font-bold"
              >
                Search
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
