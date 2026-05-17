import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Check } from "lucide-react";
import { Geolocation } from "@capacitor/geolocation";
import BottomNav from "../components/current/BottomNav";
import PullToRefresh from "../components/current/PullToRefresh";

const FILTER_CHIPS = ["All", "Spots", "Mocktails", "Events", "Cafés", "Wellness"];
const DAY_KEYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

// Deterministic hue from name string
function nameToHue(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
  return Math.abs(h) % 360;
}

// Category hue override per spec
const CATEGORY_HUES = { "Cafés": 210, Mocktails: 24, Spots: 168, Wellness: 280, Events: 40 };

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
  if (close <= open) return cur >= open || cur < close;
  return cur >= open && cur < close;
}

function isOpenTonight(place) {
  const now = new Date();
  const day = DAY_KEYS[now.getDay()];
  const closeStr = place[`${day}_close`];
  if (!closeStr) return false;
  const [ch, cm] = closeStr.split(":").map(Number);
  const closeMin = ch * 60 + cm;
  // "open after 8pm tonight" = closes after 20:00
  return closeMin > 20 * 60 || closeMin === 0; // midnight = 0 treated as next-day
}

function getDistanceMi(lat1, lon1, lat2, lon2) {
  const R = 3958.8;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function PhotoPlaceholder({ place }) {
  const h = CATEGORY_HUES[place.type] ?? nameToHue(place.name ?? "");
  const photoUrl = place.photo_url || place.profile_image;

  if (photoUrl) {
    return (
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: 8,
          border: "1px solid var(--t-border)",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <img src={photoUrl} alt={place.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
    );
  }

  return (
    <div
      style={{
        width: 80,
        height: 80,
        borderRadius: 8,
        border: "1px solid var(--t-border)",
        background: `linear-gradient(135deg, hsl(${h}, 18%, 22%), hsl(${h}, 22%, 32%))`,
        position: "relative",
        flexShrink: 0,
        overflow: "hidden",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 5,
          left: 5,
          fontFamily: "'JetBrains Mono', 'Courier New', monospace",
          fontSize: 7,
          color: "rgba(255,255,255,0.55)",
          letterSpacing: "0.05em",
        }}
      >
        PHOTO
      </span>
    </div>
  );
}

function SpotCard({ place, distance, isOpen }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        padding: 10,
        borderRadius: 12,
        backgroundColor: "var(--t-card)",
        border: "1px solid var(--t-border)",
        marginBottom: 12,
      }}
    >
      <PhotoPlaceholder place={place} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "2px 0", minWidth: 0 }}>
        {/* Top */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
            <span
              style={{
                fontSize: 14,
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500,
                color: "var(--t-text)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {place.name}
            </span>
            <span
              style={{
                flexShrink: 0,
                fontSize: 9.5,
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                padding: "2px 6px",
                borderRadius: 999,
                ...(isOpen
                  ? { color: "var(--t-accent)", backgroundColor: "var(--t-accent-bg)", border: "1px solid var(--t-accent)" }
                  : { color: "var(--t-muted)", backgroundColor: "transparent", border: "1px solid var(--t-border)" }),
              }}
            >
              {isOpen ? "Open" : "Closed"}
            </span>
          </div>
          <p
            style={{
              fontSize: 11.5,
              color: "var(--t-muted)",
              marginTop: 3,
              fontFamily: "'DM Sans', sans-serif",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {place.neighborhood} · {place.type}
          </p>
        </div>

        {/* Bottom */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
          {place.tag && (
            <span
              style={{
                fontSize: 10,
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500,
                color: "var(--t-accent)",
                backgroundColor: "var(--t-card-alt)",
                padding: "2px 7px",
                borderRadius: 999,
              }}
            >
              {place.tag}
            </span>
          )}
          {distance != null && (
            <span
              style={{
                fontSize: 10.5,
                color: "var(--t-muted)",
                fontFamily: "'DM Sans', sans-serif",
                marginLeft: "auto",
              }}
            >
              {distance.toFixed(1)} mi
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SpotsV2() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [cityFilter, setCityFilter] = useState("NYC");
  const [filter, setFilter] = useState("All");
  const [openNow, setOpenNow] = useState(false);
  const [showSuggest, setShowSuggest] = useState(false);
  const [suggestName, setSuggestName] = useState("");
  const [suggestNeighborhood, setSuggestNeighborhood] = useState("");
  const [suggestType, setSuggestType] = useState("Spots");
  const [showTypeSheet, setShowTypeSheet] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadPlaces();
  }, [cityFilter]);

  const loadPlaces = async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const entity = cityFilter === "LA" ? base44.entities.PlacesLA : base44.entities.Places;
      const data = await entity.filter({ status: "approved" });
      setPlaces(data);
    } catch {
      setLoadError(true);
    }
    setLoading(false);
  };

  const requestLocation = async () => {
    try {
      const permResult = await Geolocation.requestPermissions();
      if (permResult.location === "denied") return;
      const position = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
      setUserLocation({ lat: position.coords.latitude, lon: position.coords.longitude });
    } catch {}
  };

  const filtered = places
    .filter(p => filter === "All" || filter === "tonight" || p.type === filter)
    .filter(p => filter !== "tonight" || isOpenTonight(p))
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
    if (!isAuth) { base44.auth.redirectToLogin(window.location.href); return; }
    setShowSuggest(true);
  };

  const handleSuggest = async () => {
    if (!suggestName.trim() || isSaving) return;
    setIsSaving(true);
    try {
      const existing = await base44.entities.Places.filter({ name: suggestName.trim() });
      if (existing.length > 0) { alert("This place has already been suggested."); setIsSaving(false); return; }
      const profiles = await base44.entities.UserProfile.list();
      const profile = profiles[0];
      const user = await base44.auth.me();
      await base44.entities.Places.create({
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
      setSuggestName(""); setSuggestNeighborhood(""); setShowSuggest(false); setSubmitted(true);
    } catch (err) { console.error(err); }
    finally { setIsSaving(false); }
  };

  return (
    <PullToRefresh onRefresh={loadPlaces}>
      <div className="min-h-screen pb-24" style={{ backgroundColor: "var(--t-bg)" }}>

        {/* Type sheet overlay */}
        {showTypeSheet && (
          <div className="fixed inset-0 z-50" style={{ backgroundColor: "rgba(0,0,0,0.6)" }} onClick={() => setShowTypeSheet(false)}>
            <div
              className="absolute bottom-0 left-0 right-0 rounded-t-2xl pb-8"
              style={{ backgroundColor: "var(--t-card)", borderTop: "1px solid var(--t-border)" }}
              onClick={e => e.stopPropagation()}
            >
              <div className="w-10 h-1 rounded-full mx-auto mt-3 mb-5" style={{ backgroundColor: "var(--t-border)" }} />
              <p className="text-xs uppercase tracking-widest font-medium text-center mb-4" style={{ color: "var(--t-muted)" }}>Type</p>
              {["Spots", "Mocktails", "Events", "Cafés", "Wellness"].map(t => (
                <button
                  key={t}
                  onClick={() => { setSuggestType(t); setShowTypeSheet(false); }}
                  className="w-full flex items-center justify-between px-6 py-4 border-b text-sm font-medium"
                  style={{ borderColor: "var(--t-border)", color: suggestType === t ? "var(--t-accent)" : "var(--t-text)" }}
                >
                  {t}
                  {suggestType === t && <Check size={16} style={{ color: "var(--t-accent)" }} />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Header */}
        <div
          className="px-6"
          style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 72px)", paddingBottom: 12 }}
        >
          <div className="mb-3">
            <h1
              className="font-display"
              style={{ fontSize: 24, fontWeight: 500, color: "var(--t-text)" }}
            >
              Spots
            </h1>
          </div>

          {/* Single filter row: city | open now | tonight */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            {["NYC", "LA"].map(city => (
              <button
                key={city}
                onClick={() => setCityFilter(city)}
                style={{
                  padding: "5px 14px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 500,
                  transition: "all 0.15s ease",
                  ...(cityFilter === city
                    ? { backgroundColor: "var(--t-accent)", color: "var(--t-bg)", border: "1px solid var(--t-accent)" }
                    : { backgroundColor: "transparent", color: "var(--t-muted)", border: "1px solid var(--t-border)" }),
                }}
              >
                {city}
              </button>
            ))}

            <button
              onClick={() => setOpenNow(v => !v)}
              style={{
                padding: "5px 14px",
                borderRadius: 999,
                fontSize: 12,
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500,
                transition: "all 0.15s ease",
                ...(openNow
                  ? { backgroundColor: "var(--t-accent)", color: "var(--t-bg)", border: "1px solid var(--t-accent)" }
                  : { backgroundColor: "transparent", color: "var(--t-muted)", border: "1px solid var(--t-border)" }),
              }}
            >
              Open now
            </button>

            <button
              onClick={() => setFilter(filter === "tonight" ? "All" : "tonight")}
              style={{
                padding: "5px 14px",
                borderRadius: 999,
                fontSize: 12,
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500,
                transition: "all 0.15s ease",
                ...(filter === "tonight"
                  ? { backgroundColor: "var(--t-accent)", color: "var(--t-bg)", border: "1px solid var(--t-accent)" }
                  : { backgroundColor: "transparent", color: "var(--t-muted)", border: "1px solid var(--t-border)" }),
              }}
            >
              Tonight
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 mt-1">
            {loadError ? (
              <div className="text-center py-16">
                <p style={{ fontSize: 13, color: "var(--t-muted)", marginBottom: 8 }}>Couldn't load places.</p>
                <button onClick={loadPlaces} style={{ fontSize: 12, color: "var(--t-accent)" }}>Try again</button>
              </div>
            ) : loading ? (
              <div>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{ height: 100, borderRadius: 12, marginBottom: 12, backgroundColor: "var(--t-border)", opacity: 0.4 }} className="animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16">
                <p style={{ fontSize: 13, color: "var(--t-muted)" }}>No places found.</p>
              </div>
            ) : (
              filtered.map(place => (
                <SpotCard key={place.id} place={place} distance={place._distance} isOpen={place._isOpen} />
              ))
            )}

            {/* Suggest */}
            <div style={{ marginTop: 8, marginBottom: 8 }}>
              {submitted ? (
                <div
                  style={{
                    padding: 20,
                    borderRadius: 12,
                    border: "1px solid var(--t-border)",
                    backgroundColor: "var(--t-card)",
                    textAlign: "center",
                  }}
                >
                  <p style={{ fontSize: 14, fontWeight: 500, color: "var(--t-text)", marginBottom: 4 }}>Thanks.</p>
                  <p style={{ fontSize: 13, color: "var(--t-muted)", lineHeight: 1.5 }}>
                    We review every suggestion personally.{"\n"}If it's a fit, we'll add it within 48 hours.
                  </p>
                  <button onClick={() => setSubmitted(false)} style={{ marginTop: 14, fontSize: 12, color: "var(--t-accent)" }}>
                    Suggest another
                  </button>
                </div>
              ) : !showSuggest ? (
                <button
                  onClick={openSuggest}
                  style={{
                    width: "100%",
                    padding: "12px 0",
                    borderRadius: 12,
                    border: "2px dashed var(--t-border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    fontSize: 13,
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 500,
                    color: "var(--t-muted)",
                    backgroundColor: "transparent",
                  }}
                >
                  <Plus size={15} />
                  Suggest a place
                </button>
              ) : (
                <div
                  style={{
                    padding: 16,
                    borderRadius: 12,
                    border: "1px solid var(--t-border)",
                    backgroundColor: "var(--t-card)",
                  }}
                >
                  <input
                    type="text"
                    value={suggestName}
                    onChange={e => setSuggestName(e.target.value)}
                    placeholder="Place name"
                    style={{
                      width: "100%",
                      fontSize: 13,
                      backgroundColor: "transparent",
                      borderBottom: "1px solid var(--t-border)",
                      paddingBottom: 8,
                      marginBottom: 12,
                      color: "var(--t-text)",
                      outline: "none",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  />
                  <input
                    type="text"
                    value={suggestNeighborhood}
                    onChange={e => setSuggestNeighborhood(e.target.value)}
                    placeholder="Neighborhood"
                    style={{
                      width: "100%",
                      fontSize: 13,
                      backgroundColor: "transparent",
                      borderBottom: "1px solid var(--t-border)",
                      paddingBottom: 8,
                      marginBottom: 12,
                      color: "var(--t-text)",
                      outline: "none",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  />
                  <button
                    onClick={() => setShowTypeSheet(true)}
                    style={{
                      width: "100%",
                      fontSize: 13,
                      textAlign: "left",
                      borderBottom: "1px solid var(--t-border)",
                      paddingBottom: 8,
                      marginBottom: 16,
                      display: "flex",
                      justifyContent: "space-between",
                      color: "var(--t-text)",
                      fontFamily: "'DM Sans', sans-serif",
                      backgroundColor: "transparent",
                    }}
                  >
                    <span>{suggestType}</span>
                    <span style={{ color: "var(--t-muted)", fontSize: 10 }}>▼</span>
                  </button>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => setShowSuggest(false)}
                      style={{ flex: 1, padding: "10px 0", borderRadius: 12, fontSize: 12, color: "var(--t-muted)", fontFamily: "'DM Sans', sans-serif", backgroundColor: "transparent" }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSuggest}
                      disabled={!suggestName.trim() || isSaving}
                      style={{
                        flex: 1,
                        padding: "10px 0",
                        borderRadius: 4,
                        fontSize: 12,
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: 500,
                        backgroundColor: "var(--t-accent)",
                        color: "var(--t-bg)",
                        opacity: (!suggestName.trim() || isSaving) ? 0.3 : 1,
                      }}
                    >
                      {isSaving ? "..." : "Submit"}
                    </button>
                  </div>
                </div>
              )}
            </div>
        </div>

        <BottomNav />
      </div>
    </PullToRefresh>
  );
}