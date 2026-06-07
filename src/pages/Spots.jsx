import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Check, MapPin, X } from "lucide-react";
import { Geolocation } from "@capacitor/geolocation";
import BottomNav from "../components/current/BottomNav";
import PullToRefresh from "../components/current/PullToRefresh";
import { logPresence } from "@/lib/presence";
import { hapticLight } from "@/lib/haptics";

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
          width: 100,
          height: 100,
          borderRadius: 12,
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
        width: 100,
        height: 100,
        borderRadius: 12,
        border: "1px solid var(--t-border)",
        background: `linear-gradient(135deg, hsl(${h}, 18%, 22%), hsl(${h}, 22%, 32%))`,
        position: "relative",
        flexShrink: 0,
        overflow: "hidden",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        padding: 6,
      }}
    >
      <span
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "10px",
          fontWeight: 500,
          color: "rgba(255,255,255,0.6)",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        Photo
      </span>
    </div>
  );
}

function SpotCard({ place, distance, isOpen }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 14,
        padding: 12,
        borderRadius: 14,
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

export default function Spots() {
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

  // Location permission state — 3-layer pattern, never spends the OS prompt cold.
  // 'idle'     → button visible, no prompt shown yet this session
  // 'priming'  → our own pre-prompt sheet is up; OS dialog hasn't fired
  // 'granted'  → coords resolved; cards show distance + "Using your location · stop"
  // 'denied'   → OS denied (or user said no this session). Quiet inline hint, no re-nag.
  const [locationStatus, setLocationStatus] = useState("idle");

  useEffect(() => {
    loadPlaces();
    logPresence("spots");
  }, [cityFilter]);

  // On mount, silently check OS permission state. If already granted from a prior
  // session, auto-fetch position (no prompt). If denied at OS level, mark denied so
  // we don't show the "Use my location" button anymore. Never call requestPermissions
  // here — that'd defeat the whole point.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const perm = await Geolocation.checkPermissions();
        if (!alive) return;
        if (perm.location === "granted") {
          try {
            const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
            if (!alive) return;
            setUserLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
            setLocationStatus("granted");
          } catch {
            setLocationStatus("idle");
          }
        } else if (perm.location === "denied") {
          setLocationStatus("denied");
        } else if (sessionStorage.getItem("spots_location_dismissed") === "1") {
          // User said "Not now" earlier in this session — don't re-nag, but keep
          // the button visible so they can change their mind without leaving Spots.
          setLocationStatus("idle");
        }
      } catch {
        // Web browser without geolocation, or capacitor not initialized — leave idle.
      }
    })();
    return () => { alive = false; };
  }, []);

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

  // Step 1: user tapped "Use my location" — show our priming sheet, not the OS prompt
  const openLocationPriming = () => {
    hapticLight();
    setLocationStatus("priming");
  };

  // Step 2: user tapped "Not now" on our sheet — record it, never call the OS
  const declineLocationPriming = () => {
    sessionStorage.setItem("spots_location_dismissed", "1");
    setLocationStatus("idle");
  };

  // Step 2 (alt): user tapped "Use my location" on our sheet — NOW trigger the OS dialog
  const confirmLocationPriming = async () => {
    hapticLight();
    try {
      const permResult = await Geolocation.requestPermissions();
      if (permResult.location === "denied") {
        setLocationStatus("denied");
        return;
      }
      const position = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
      setUserLocation({ lat: position.coords.latitude, lon: position.coords.longitude });
      setLocationStatus("granted");
    } catch {
      setLocationStatus("denied");
    }
  };

  // User chose to stop using location — clear coords, return to idle (no OS call).
  // Note: this doesn't revoke OS permission, just stops using it in this session.
  const stopUsingLocation = () => {
    hapticLight();
    setUserLocation(null);
    setLocationStatus("idle");
    sessionStorage.setItem("spots_location_dismissed", "1");
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
          <p className="text-[10px] uppercase tracking-widest font-medium mb-2" style={{ color: "var(--t-accent)" }}>
            The Field Guide
          </p>
          <h1
            className="font-display font-medium mb-4"
            style={{ fontSize: 40, color: "var(--t-text)", lineHeight: 1.05, letterSpacing: "-0.02em" }}
          >
            Places that don't<br />need a drink.
          </h1>

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

            {/* Vertical separator before location button */}
            {locationStatus !== "denied" && (
              <div style={{ width: 1, height: 16, backgroundColor: "var(--t-border)", margin: "0 4px" }} />
            )}

            {/* Location button — state-aware. Hidden entirely when denied (no re-nag). */}
            {locationStatus === "granted" ? (
              <button
                onClick={stopUsingLocation}
                style={{
                  padding: "5px 12px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  backgroundColor: "var(--t-accent-bg)",
                  color: "var(--t-accent)",
                  border: "1px solid var(--t-accent)",
                }}
                aria-label="Stop using location"
              >
                <MapPin size={11} strokeWidth={1.7} />
                Using your location
                <X size={11} strokeWidth={2} style={{ opacity: 0.7 }} />
              </button>
            ) : locationStatus !== "denied" && (
              <button
                onClick={openLocationPriming}
                style={{
                  padding: "5px 12px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  backgroundColor: "transparent",
                  color: "var(--t-muted)",
                  border: "1px solid var(--t-border)",
                }}
              >
                <MapPin size={11} strokeWidth={1.7} />
                Use my location
              </button>
            )}
          </div>

          {/* Quiet denied hint — appears only when OS-denied. No re-nag, no big banner. */}
          {locationStatus === "denied" && (
            <p className="text-[11px] mt-3" style={{ color: "var(--t-muted)" }}>
              Location's off — pick a city, or turn it on in Settings →
            </p>
          )}
        </div>

        {/* Location priming sheet — our own UI, BEFORE the OS dialog fires.
            "Not now" costs nothing (we haven't burned the OS prompt yet);
            tapping the primary CTA is what actually triggers it. */}
        {locationStatus === "priming" && (
          <div
            className="fixed inset-0 z-[100] flex items-end justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
            onClick={declineLocationPriming}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg pb-8"
              style={{
                backgroundColor: "var(--t-card)",
                borderTop: "1px solid var(--t-border)",
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
                paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 24px)",
              }}
            >
              {/* Drag handle */}
              <div className="w-10 h-1 rounded-full mx-auto mt-3 mb-5" style={{ backgroundColor: "var(--t-border)" }} />
              <div className="px-6">
                <p className="font-display font-medium" style={{ fontSize: 22, color: "var(--t-text)", lineHeight: 1.2 }}>
                  See what's closest?
                </p>
                <p className="text-sm mt-3 leading-relaxed" style={{ color: "var(--t-muted)" }}>
                  We'll sort spots by distance. Your location never leaves your phone — we don't store it.
                </p>
                <div className="flex gap-2 mt-6">
                  <button
                    onClick={declineLocationPriming}
                    className="flex-1 py-3 rounded-xl text-sm font-medium"
                    style={{ color: "var(--t-muted)", backgroundColor: "transparent" }}
                  >
                    Not now
                  </button>
                  <button
                    onClick={confirmLocationPriming}
                    className="flex-1 py-3 rounded-xl text-sm font-medium"
                    style={{ backgroundColor: "var(--t-accent)", color: "var(--t-bg)" }}
                  >
                    Use my location
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
                  Suggest A Spot
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