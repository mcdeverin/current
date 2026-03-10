import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { MapPin, Plus } from "lucide-react";
import PlaceCard from "../components/current/PlaceCard";
import BottomNav from "../components/current/BottomNav";
import PullToRefresh from "../components/current/PullToRefresh";

const FILTER_CHIPS = ["All", "Spots", "Mocktails", "Events", "Cafés", "Wellness"];

const DAY_KEYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

function isPlaceOpenNow(place) {
  const now = new Date();
  const day = DAY_KEYS[now.getDay()];
  const openStr = place[`${day}_open`];
  const closeStr = place[`${day}_close`];
  if (!openStr || !closeStr) return false;
  const [oh, om] = openStr.split(":").map(Number);
  const [ch, cm] = closeStr.split(":").map(Number);
  const cur = now.getHours() * 60 + now.getMinutes();
  const open = oh * 60 + om;
  const close = ch * 60 + cm;
  // handle midnight crossover (e.g. close = 00:00 treated as next day)
  if (close <= open) return cur >= open || cur < close;
  return cur >= open && cur < close;
}

function getDistanceMi(lat1, lon1, lat2, lon2) {
  const R = 3958.8;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

export default function NearMe() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [cityFilter, setCityFilter] = useState("NYC");
  const [showSuggest, setShowSuggest] = useState(false);
  const [suggestName, setSuggestName] = useState("");
  const [suggestNeighborhood, setSuggestNeighborhood] = useState("");
  const [suggestType, setSuggestType] = useState("Spots");
  const [submitted, setSubmitted] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationDismissed, setLocationDismissed] = useState(false);
  const [openNow, setOpenNow] = useState(false);

  const requestLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => setLocationDismissed(true)
    );
    setLocationDismissed(true);
  };

  useEffect(() => {
    loadPlaces();
  }, [cityFilter]);

  const loadPlaces = async () => {
    setLoading(true);
    const entity = cityFilter === "LA" ? base44.entities.PlacesLA : base44.entities.Places;
    const data = await entity.filter({ status: "approved" });
    setPlaces(data);
    setLoading(false);
  };

  const filtered = places
    .filter(p => filter === "All" || p.type === filter)
    .map(p => ({
      ...p,
      _distance: (userLocation && p.latitude && p.longitude)
        ? getDistanceMi(userLocation.lat, userLocation.lon, p.latitude, p.longitude)
        : null,
      _isOpen: isPlaceOpenNow(p),
    }))
    .filter(p => !openNow || p._isOpen)
    .sort((a, b) => {
      if (a._distance != null && b._distance != null) return a._distance - b._distance;
      return 0;
    });

  const openSuggest = async () => {
    const isAuth = await base44.auth.isAuthenticated();
    if (!isAuth) {
      base44.auth.redirectToLogin(window.location.href);
      return;
    }
    setShowSuggest(true);
  };

  const handleSuggest = async () => {
    if (!suggestName.trim()) return;
    // Check for duplicates
    const existing = await base44.entities.Places.filter({ name: suggestName.trim() });
    if (existing.length > 0) {
      alert("This place has already been suggested.");
      return;
    }
    // Get user profile for context
    const profiles = await base44.entities.UserProfile.list();
    const profile = profiles[0];
    const user = await base44.auth.me();
    await base44.entities.Places.create({
      name: suggestName,
      type: suggestType,
      neighborhood: suggestNeighborhood || "New York",
      city: "New York",
      tag: "Sober Friendly",
      emoji: "📍",
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
    <PullToRefresh onRefresh={loadPlaces}>
    <div className="min-h-screen pb-24" style={{ backgroundColor: '#0f1219' }}>
      {/* Header */}
      <div className="px-6 pt-10 pb-3">
        <h1 className="font-display text-2xl font-medium mb-3" style={{ color: '#e8eaf0' }}>Spots</h1>
        <div className="flex gap-2 mb-1">
          {["NYC", "LA"].map(city => (
            <button
              key={city}
              onClick={() => setCityFilter(city)}
              className="px-4 py-1.5 rounded-full text-xs font-medium transition-all"
              style={{
                backgroundColor: cityFilter === city ? '#6F8FA4' : '#161b24',
                color: cityFilter === city ? '#0f1219' : '#6a7280',
                border: `1px solid ${cityFilter === city ? '#6F8FA4' : '#232a35'}`,
              }}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Location prompt + Open now */}
      <div className="px-6 pb-3 flex items-center justify-between gap-3">
        {userLocation ? (
          <button
            onClick={() => setUserLocation(null)}
            className="text-xs font-medium"
            style={{ color: '#6F8FA4' }}
          >
            Stop using location
          </button>
        ) : (
          <button
            onClick={requestLocation}
            className="text-xs font-medium"
            style={{ color: '#6F8FA4' }}
          >
            Use current location
          </button>
        )}
        <button
          onClick={() => setOpenNow(v => !v)}
          className="text-xs font-medium"
          style={{ color: openNow ? '#e8eaf0' : '#6F8FA4' }}
        >
          {openNow ? '✓ Open now' : 'Open now'}
        </button>
      </div>

      {/* Filter chips */}
      <div 
        className="px-6 pb-4 overflow-x-auto" 
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onScroll={(e) => e.currentTarget.style.scrollBehavior = 'smooth'}
      >
        <style>{`.filter-chips::-webkit-scrollbar { display: none; }`}</style>
        <div className="flex gap-2">
          {FILTER_CHIPS.map(chip => (
            <button
              key={chip}
              onClick={() => setFilter(chip)}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all"
              style={{
                backgroundColor: filter === chip ? '#6F8FA4' : '#161b24',
                color: filter === chip ? '#0f1219' : '#6a7280',
                border: `1px solid ${filter === chip ? '#6F8FA4' : '#232a35'}`,
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
              <div key={i} className="h-20 rounded-xl animate-pulse" style={{ backgroundColor: '#232a35' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm" style={{ color: '#6a7280' }}>No places found.</p>
          </div>
        ) : (
          filtered.map(place => <PlaceCard key={place.id} place={place} distance={place._distance} isOpen={place._isOpen} />)
        )}
      </div>

      {/* Suggest a place */}
      <div className="px-6 mt-6">
        {submitted ? (
          <div className="p-5 rounded-xl border text-center" style={{ backgroundColor: '#161b24', borderColor: '#232a35' }}>
            <p className="text-sm font-medium mb-1" style={{ color: '#e8eaf0' }}>Thanks.</p>
            <p className="text-sm leading-relaxed" style={{ color: '#6a7280' }}>
              We review every suggestion personally.{"\n"}If it's a fit, we'll add it within 48 hours.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="mt-4 text-xs"
              style={{ color: '#6F8FA4' }}
            >
              Suggest another
            </button>
          </div>
        ) : !showSuggest ? (
          <button
            onClick={openSuggest}
            className="w-full py-3 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 text-sm font-medium transition-colors"
            style={{ borderColor: '#232a35', color: '#6a7280' }}
          >
            <Plus size={16} />
            Suggest a place
          </button>
        ) : (
          <div className="p-4 rounded-xl border" style={{ backgroundColor: '#161b24', borderColor: '#232a35' }}>
            <input
              type="text"
              value={suggestName}
              onChange={e => setSuggestName(e.target.value)}
              placeholder="Place name"
              className="w-full text-sm bg-transparent border-b pb-2 mb-3 focus:outline-none placeholder-gray-600"
              style={{ borderColor: '#232a35', color: '#e8eaf0' }}
            />
            <input
              type="text"
              value={suggestNeighborhood}
              onChange={e => setSuggestNeighborhood(e.target.value)}
              placeholder="Neighborhood"
              className="w-full text-sm bg-transparent border-b pb-2 mb-3 focus:outline-none placeholder-gray-600"
              style={{ borderColor: '#232a35', color: '#e8eaf0' }}
            />
            <select
              value={suggestType}
              onChange={e => setSuggestType(e.target.value)}
              className="w-full text-sm bg-transparent border-b pb-2 mb-4 focus:outline-none"
              style={{ borderColor: '#232a35', color: '#e8eaf0', colorScheme: 'dark' }}
            >
              {["Spots", "Mocktails", "Events", "Cafés", "Wellness"].map(t => (
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
                className="flex-1 py-2.5 rounded-xl text-xs font-medium disabled:opacity-30"
                style={{ backgroundColor: '#6F8FA4', color: '#0f1219' }}
              >
                Submit
              </button>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
    </PullToRefresh>
  );
}