import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { hapticLight } from "@/lib/haptics";
import { logPresence } from "@/lib/presence";
import { getDayOfYear } from "@/lib/dates";
import BottomNav from "@/components/current/BottomNav";
import { MOCKTAIL_SEEDS } from "@/components/current/mocktailSeeds";

const CATEGORY_LABELS = {
  bar_order: "Bar order",
  home: "Home",
  na_beer: "NA beer",
  fifteen_sec: "15 seconds",
};

// Hard-coded "ONE LINE" rotation — copy from spec §6.10.
const ONE_LINERS = [
  "I'm off it for a bit — feeling good, actually.",
  "Not tonight, but I'll take a club soda.",
  "I'm driving.",
  "Doing a dry month.",
  "I sleep better without it.",
  "Soda for me, thanks.",
];

function pickOneLiner(seed = 0) {
  const idx = (getDayOfYear() + seed) % ONE_LINERS.length;
  return ONE_LINERS[idx];
}

export default function Mocktails() {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [nearestSpot, setNearestSpot] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [oneLinerSeed, setOneLinerSeed] = useState(0);

  useEffect(() => {
    loadData();
    logPresence("mocktails");
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.MocktailRecipes.filter({ status: "approved" }, "sort_order", 100);
      // Fall back to local seed list if no approved rows in Base44 yet.
      // Lets the page stay alive pre-seed; once the entity is populated,
      // the real rows win.
      setRecipes((data && data.length > 0) ? data : MOCKTAIL_SEEDS);
    } catch (err) {
      console.error("loadRecipes error:", err);
      setRecipes(MOCKTAIL_SEEDS);
    }
    try {
      // Try NYC first, fall back to LA, fall back to nothing
      const nyc = await base44.entities.Places.filter({ status: "approved", type: "Mocktails" }, "", 1);
      const la = nyc.length === 0
        ? await base44.entities.PlacesLA.filter({ status: "approved", type: "Mocktails" }, "", 1)
        : [];
      setNearestSpot(nyc[0] || la[0] || null);
    } catch {
      setNearestSpot(null);
    }
    setLoading(false);
  };

  // Daily-rotated bar_order recipe (with two more for the alt chips)
  const barOrders = recipes.filter(r => r.category === "bar_order");
  const dailyBar = barOrders.length > 0 ? barOrders[getDayOfYear() % barOrders.length] : null;

  // Filtered list (excluding the "All" sentinel)
  const filterableCategories = Object.keys(CATEGORY_LABELS);
  const filtered = activeFilter === "All"
    ? recipes
    : recipes.filter(r => r.category === activeFilter);

  // ── DETAIL SHEET ────────────────────────────────────────────────────────────
  if (selected) {
    const isBar = selected.category === "bar_order" || selected.category === "na_beer";
    return (
      <div className="min-h-screen pb-24" style={{ backgroundColor: 'var(--t-bg)' }}>
        <div className="px-6 max-w-lg mx-auto" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 72px)' }}>
          <button onClick={() => setSelected(null)} className="flex items-center gap-1 mb-8" style={{ color: 'var(--t-accent)' }}>
            <ChevronLeft size={18} strokeWidth={1.5} />
            <span className="text-sm">Mocktails</span>
          </button>

          <p className="text-[10px] uppercase tracking-widest font-medium mb-1" style={{ color: 'var(--t-accent)' }}>
            {CATEGORY_LABELS[selected.category]}
          </p>
          <h1 className="font-display text-3xl font-medium mb-2" style={{ color: 'var(--t-text)' }}>{selected.name}</h1>
          <p className="font-display italic mb-6" style={{ fontSize: 15, color: 'var(--t-text-warm)' }}>{selected.one_liner}</p>

          {isBar && selected.order_script && (
            <div
              className="rounded-xl p-4 mb-6"
              style={{ backgroundColor: 'var(--t-accent-bg)', border: '1px solid var(--t-accent)' }}
            >
              <p className="text-[10px] uppercase tracking-widest font-medium mb-2" style={{ color: 'var(--t-accent)' }}>Say this</p>
              <p className="font-display italic" style={{ fontSize: 16, color: 'var(--t-text)', lineHeight: 1.45 }}>
                “{selected.order_script}”
              </p>
            </div>
          )}

          {!isBar && (
            <>
              {selected.time_minutes && (
                <p className="text-xs mb-4" style={{ color: 'var(--t-muted)' }}>
                  {selected.time_minutes} min{selected.flavor_profile ? ` · ${selected.flavor_profile}` : ""}
                </p>
              )}
              {selected.ingredients?.length > 0 && (
                <div className="mb-6">
                  <p className="text-[10px] uppercase tracking-widest font-medium mb-3" style={{ color: 'var(--t-muted)' }}>Ingredients</p>
                  <ul className="space-y-2">
                    {selected.ingredients.map((ing, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span style={{ color: 'var(--t-accent)', marginTop: 2 }}>·</span>
                        <span className="text-sm" style={{ color: 'var(--t-text)' }}>{ing}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {selected.steps?.length > 0 && (
                <div className="mb-6">
                  <p className="text-[10px] uppercase tracking-widest font-medium mb-3" style={{ color: 'var(--t-muted)' }}>Steps</p>
                  <ol className="space-y-3">
                    {selected.steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="font-display text-lg font-medium leading-none mt-0.5" style={{ color: 'var(--t-accent)', minWidth: 18, fontVariantNumeric: 'tabular-nums' }}>{i + 1}</span>
                        <span className="text-sm leading-relaxed" style={{ color: 'var(--t-text)' }}>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </>
          )}
        </div>
        <BottomNav />
      </div>
    );
  }

  // ── MAIN ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: 'var(--t-bg)' }}>
      <div className="px-6 max-w-lg mx-auto" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 72px)' }}>
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 mb-6" style={{ color: 'var(--t-accent)' }}>
          <ChevronLeft size={18} strokeWidth={1.5} />
          <span className="text-sm">Mine</span>
        </button>

        <p className="text-[10px] uppercase tracking-widest font-medium mb-1" style={{ color: 'var(--t-accent)' }}>
          Going out tonight?
        </p>
        <h1 className="font-display font-medium mb-6" style={{ fontSize: 24, color: 'var(--t-text)' }}>
          Something to hold.
        </h1>

        {/* N°01 — A PLACE */}
        <KitCard num="N°01" label="A place">
          {nearestSpot ? (
            <>
              <p className="font-display" style={{ fontSize: 18, color: 'var(--t-text)' }}>{nearestSpot.name}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--t-muted)' }}>
                {nearestSpot.type || "Mocktails"} · {nearestSpot.neighborhood || "—"}
              </p>
              <p className="font-display italic mt-3" style={{ fontSize: 13, color: 'var(--t-text-warm)' }}>
                A real menu, not an afterthought.
              </p>
              <button
                onClick={() => { hapticLight(); navigate("/Spots"); }}
                className="mt-3 text-xs font-medium"
                style={{ color: 'var(--t-accent)' }}
              >
                More like this →
              </button>
            </>
          ) : (
            <>
              <p className="font-display italic" style={{ fontSize: 15, color: 'var(--t-text-warm)' }}>
                Anywhere with a "No-Proof Bar" tag.
              </p>
              <button
                onClick={() => { hapticLight(); navigate("/Spots"); }}
                className="mt-3 text-xs font-medium"
                style={{ color: 'var(--t-accent)' }}
              >
                Open Spots →
              </button>
            </>
          )}
        </KitCard>

        {/* N°02 — A DRINK BY NAME */}
        <KitCard num="N°02" label="A drink by name">
          {dailyBar ? (
            <>
              <p className="font-display" style={{ fontSize: 18, color: 'var(--t-text)' }}>{dailyBar.name}</p>
              {dailyBar.flavor_profile && (
                <p className="text-xs mt-1" style={{ color: 'var(--t-muted)' }}>{dailyBar.flavor_profile}</p>
              )}
              {dailyBar.order_script && (
                <div
                  className="mt-3 rounded-lg p-3"
                  style={{ backgroundColor: 'var(--t-accent-bg)', border: '1px solid var(--t-accent)' }}
                >
                  <p className="font-display italic" style={{ fontSize: 14, color: 'var(--t-text)', lineHeight: 1.4 }}>
                    “{dailyBar.order_script}”
                  </p>
                </div>
              )}
              {barOrders.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                  {barOrders.slice(0, 3).map(r => (
                    <button
                      key={r.id}
                      onClick={() => { hapticLight(); setSelected(r); }}
                      className="flex-shrink-0 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider"
                      style={{ border: '1px solid var(--t-border)', color: 'var(--t-muted)', backgroundColor: 'transparent' }}
                    >
                      {r.name}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="font-display italic" style={{ fontSize: 15, color: 'var(--t-muted)' }}>
              {loading ? "—" : "Recipes coming. Check back tomorrow."}
            </p>
          )}
        </KitCard>

        {/* N°03 — ONE LINE */}
        <KitCard num="N°03" label="One line">
          <p className="font-display italic" style={{ fontSize: 17, color: 'var(--t-text)', lineHeight: 1.4 }}>
            “{pickOneLiner(oneLinerSeed)}”
          </p>
          <p className="text-xs mt-3" style={{ color: 'var(--t-muted)' }}>
            Non-apologetic. Four seconds.
          </p>
          <button
            onClick={() => { hapticLight(); setOneLinerSeed(s => s + 1); }}
            className="mt-3 text-xs font-medium"
            style={{ color: 'var(--t-accent)' }}
          >
            Try another →
          </button>
        </KitCard>

        {/* Serif rule */}
        <div className="flex items-center gap-3 mt-10 mb-6">
          <div style={{ flex: 1, height: 1, backgroundColor: 'var(--t-border)' }} />
          <p className="font-display italic" style={{ fontSize: 13, color: 'var(--t-muted)' }}>recipes</p>
          <div style={{ flex: 1, height: 1, backgroundColor: 'var(--t-border)' }} />
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {["All", ...filterableCategories].map(c => (
            <button
              key={c}
              onClick={() => { hapticLight(); setActiveFilter(c); }}
              className="flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-medium"
              style={{
                backgroundColor: activeFilter === c ? 'var(--t-accent)' : 'transparent',
                color: activeFilter === c ? 'var(--t-bg)' : 'var(--t-muted)',
                border: `1px solid ${activeFilter === c ? 'var(--t-accent)' : 'var(--t-border)'}`,
              }}
            >
              {c === "All" ? c : CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>

        {/* Recipe list */}
        {filtered.length === 0 ? (
          <p className="text-sm text-center py-8" style={{ color: 'var(--t-muted)' }}>
            {loading ? "Loading…" : "No recipes here yet."}
          </p>
        ) : (
          <div className="space-y-2">
            {filtered.map(r => (
              <button
                key={r.id}
                onClick={() => { hapticLight(); setSelected(r); }}
                className="w-full rounded-xl p-4 text-left flex items-center justify-between"
                style={{ backgroundColor: 'var(--t-card)', border: '1px solid var(--t-border)' }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: 'var(--t-text)' }}>{r.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--t-muted)' }}>{r.one_liner}</p>
                </div>
                <span
                  className="ml-3 flex-shrink-0 px-2 py-0.5 text-[10px] uppercase tracking-widest font-medium rounded-full"
                  style={{ color: 'var(--t-accent)', border: '1px solid var(--t-accent)' }}
                >
                  {CATEGORY_LABELS[r.category]}
                </span>
                <ChevronRight size={14} strokeWidth={1.5} style={{ color: 'var(--t-muted)', marginLeft: 6 }} />
              </button>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}

function KitCard({ num, label, children }) {
  return (
    <div
      className="mb-3"
      style={{
        padding: 18,
        borderRadius: 12,
        backgroundColor: 'var(--t-card)',
        border: '1px solid var(--t-border)',
      }}
    >
      <div className="flex items-baseline justify-between mb-3">
        <span
          className="font-display"
          style={{ fontSize: 13, color: 'var(--t-muted)', letterSpacing: '0.05em' }}
        >
          {num}
        </span>
        <span
          className="text-[10px] uppercase tracking-widest font-medium"
          style={{ color: 'var(--t-accent)' }}
        >
          {label}
        </span>
      </div>
      {children}
    </div>
  );
}
