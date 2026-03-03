import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { MapPin, Plus } from "lucide-react";
import PlaceCard from "../components/current/PlaceCard";
import BottomNav from "../components/current/BottomNav";

const FILTER_CHIPS = ["All", "Soft Bar", "Event", "Mocktails", "Café", "Sober Friendly"];

export default function NearMe() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [showSuggest, setShowSuggest] = useState(false);
  const [suggestName, setSuggestName] = useState("");
  const [suggestNeighborhood, setSuggestNeighborhood] = useState("");
  const [suggestType, setSuggestType] = useState("Café");

  useEffect(() => {
    loadPlaces();
  }, []);

  const loadPlaces = async () => {
    const data = await base44.entities.Place.list();
    setPlaces(data);
    setLoading(false);
  };

  const filtered = filter === "All" ? places : places.filter(p => p.type === filter);

  const handleSuggest = async () => {
    if (!suggestName.trim()) return;
    await base44.entities.Place.create({
      name: suggestName,
      type: suggestType,
      neighborhood: suggestNeighborhood || "New York",
      city: "New York",
      tag: "Sober Friendly",
      emoji: "📍",
      approved: false,
    });
    setSuggestName("");
    setSuggestNeighborhood("");
    setShowSuggest(false);
    loadPlaces();
  };

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: '#f0f2ee' }}>
      {/* Header */}
      <div className="px-6 pt-14 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-2xl font-medium" style={{ color: '#0f1219' }}>Near Me</h1>
            <div className="flex items-center gap-1.5 mt-1">
              <MapPin size={12} style={{ color: '#6a7280' }} />
              <span className="text-xs" style={{ color: '#6a7280' }}>
                New York · {filtered.length} places
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter chips */}
      <div className="px-6 pb-4 overflow-x-auto">
        <div className="flex gap-2">
          {FILTER_CHIPS.map(chip => (
            <button
              key={chip}
              onClick={() => setFilter(chip)}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all"
              style={{
                backgroundColor: filter === chip ? '#0f1219' : '#ffffff',
                color: filter === chip ? '#f0f2ee' : '#6a7280',
                border: `1px solid ${filter === chip ? '#0f1219' : '#e2e6e0'}`,
              }}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Places list */}
      <div className="px-6">
        {loading ? (
          <div className="space-y-4 mt-4">
            {[1,2,3].map(i => (
              <div key={i} className="h-20 rounded-xl animate-pulse" style={{ backgroundColor: '#d8e0d9' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm" style={{ color: '#6a7280' }}>No places found.</p>
          </div>
        ) : (
          filtered.map(place => <PlaceCard key={place.id} place={place} />)
        )}
      </div>

      {/* Suggest a place */}
      <div className="px-6 mt-6">
        {!showSuggest ? (
          <button
            onClick={() => setShowSuggest(true)}
            className="w-full py-3 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 text-sm font-medium transition-colors"
            style={{ borderColor: '#b8c9ba', color: '#6a7280' }}
          >
            <Plus size={16} />
            Suggest a place
          </button>
        ) : (
          <div className="p-4 rounded-xl border" style={{ backgroundColor: '#fff', borderColor: '#dde4de' }}>
            <input
              type="text"
              value={suggestName}
              onChange={e => setSuggestName(e.target.value)}
              placeholder="Place name"
              className="w-full text-sm bg-transparent border-b pb-2 mb-3 focus:outline-none"
              style={{ borderColor: '#dde4de' }}
            />
            <input
              type="text"
              value={suggestNeighborhood}
              onChange={e => setSuggestNeighborhood(e.target.value)}
              placeholder="Neighborhood"
              className="w-full text-sm bg-transparent border-b pb-2 mb-3 focus:outline-none"
              style={{ borderColor: '#dde4de' }}
            />
            <select
              value={suggestType}
              onChange={e => setSuggestType(e.target.value)}
              className="w-full text-sm bg-transparent border-b pb-2 mb-4 focus:outline-none"
              style={{ borderColor: '#dde4de' }}
            >
              {["Soft Bar", "Event", "Mocktails", "Café", "Sober Friendly"].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                onClick={() => setShowSuggest(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-medium"
                style={{ color: '#6a7280' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSuggest}
                disabled={!suggestName.trim()}
                className="flex-1 py-2.5 rounded-xl text-xs font-medium text-white disabled:opacity-30"
                style={{ backgroundColor: '#8aab8e', color: '#0f1219' }}
              >
                Submit
              </button>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}