import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { MapPin, Plus } from "lucide-react";
import PlaceCard from "../components/current/PlaceCard";
import BottomNav from "../components/current/BottomNav";

const FILTER_CHIPS = ["All", "Spots", "Mocktails", "Events", "Cafés", "Wellness"];

export default function NearMe() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [showSuggest, setShowSuggest] = useState(false);
  const [suggestName, setSuggestName] = useState("");
  const [suggestNeighborhood, setSuggestNeighborhood] = useState("");
  const [suggestType, setSuggestType] = useState("Spots");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    loadPlaces();
  }, []);

  const loadPlaces = async () => {
    const data = await base44.entities.Place.filter({ status: "approved" });
    setPlaces(data);
    setLoading(false);
  };

  const filtered = filter === "All" ? places : places.filter(p => p.type === filter);

  const handleSuggest = async () => {
    if (!suggestName.trim()) return;
    const profiles = await base44.entities.UserProfile.list();
    const profile = profiles[0];
    const user = await base44.auth.me();
    await base44.entities.Place.create({
      name: suggestName,
      type: suggestType,
      neighborhood: suggestNeighborhood || "New York",
      city: "New York",
      tag: "Sober Friendly",
      status: "pending",
      suggested_by: user?.email || "",
      suggested_by_name: profile?.first_name || "",
      suggested_by_days: profile?.sobriety_date
        ? Math.floor((new Date() - new Date(profile.sobriety_date)) / (1000 * 60 * 60 * 24))
        : null,
    });
    setSuggestName("");
    setSuggestNeighborhood("");
    setShowSuggest(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: 'var(--bg)' }}>
      {/* Header */}
      <div className="px-6 pt-14 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-2xl font-medium" style={{ color: 'var(--text)' }}>Near Me</h1>
            <div className="flex items-center gap-1.5 mt-1">
              <MapPin size={12} style={{ color: 'var(--subtext)' }} />
              <span className="text-xs" style={{ color: 'var(--subtext)' }}>
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
                backgroundColor: filter === chip ? 'var(--accent)' : 'var(--card)',
                color: filter === chip ? '#fff' : 'var(--subtext)',
                border: `1px solid ${filter === chip ? 'var(--accent)' : 'var(--card-border)'}`,
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
              <div key={i} className="h-20 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--card)' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm" style={{ color: 'var(--subtext)' }}>No places found.</p>
          </div>
        ) : (
          filtered.map(place => <PlaceCard key={place.id} place={place} />)
        )}
      </div>

      {/* Suggest a place */}
      <div className="px-6 mt-6">
        {submitted ? (
          <div className="p-5 rounded-xl border text-center" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--card-border)' }}>
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>Thanks.</p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--subtext)' }}>
              We review every suggestion personally.{"\n"}If it's a fit, we'll add it within 48 hours.
            </p>
            <button onClick={() => setSubmitted(false)} className="mt-4 text-xs" style={{ color: 'var(--accent)' }}>
              Suggest another
            </button>
          </div>
        ) : !showSuggest ? (
          <button
            onClick={() => setShowSuggest(true)}
            className="w-full py-3 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 text-sm font-medium transition-colors"
            style={{ borderColor: 'var(--card-border)', color: 'var(--subtext)' }}
          >
            <Plus size={16} />
            Suggest a place
          </button>
        ) : (
          <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--card-border)' }}>
            <input
              type="text"
              value={suggestName}
              onChange={e => setSuggestName(e.target.value)}
              placeholder="Place name"
              className="w-full text-sm bg-transparent border-b pb-2 mb-3 focus:outline-none"
              style={{ borderColor: 'var(--card-border)', color: 'var(--text)' }}
            />
            <input
              type="text"
              value={suggestNeighborhood}
              onChange={e => setSuggestNeighborhood(e.target.value)}
              placeholder="Neighborhood"
              className="w-full text-sm bg-transparent border-b pb-2 mb-3 focus:outline-none"
              style={{ borderColor: 'var(--card-border)', color: 'var(--text)' }}
            />
            <select
              value={suggestType}
              onChange={e => setSuggestType(e.target.value)}
              className="w-full text-sm bg-transparent border-b pb-2 mb-4 focus:outline-none"
              style={{ borderColor: 'var(--card-border)', color: 'var(--text)', backgroundColor: 'var(--card)' }}
            >
              {["Spots", "Mocktails", "Events", "Cafés", "Wellness"].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                onClick={() => setShowSuggest(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-medium"
                style={{ color: 'var(--subtext)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSuggest}
                disabled={!suggestName.trim()}
                className="flex-1 py-2.5 rounded-xl text-xs font-medium disabled:opacity-30"
                style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
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