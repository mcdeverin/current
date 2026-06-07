import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { hapticLight } from "@/lib/haptics";
import { logPresence } from "@/lib/presence";

const CATEGORY_LABELS = {
  bar_order: "At the bar",
  home: "Make at home",
  na_beer: "NA beer",
  fifteen_sec: "15-second order",
};

export default function Mocktails() {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [activeCategory, setActiveCategory] = useState("bar_order");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecipes();
    logPresence("mocktails");
  }, []);

  const loadRecipes = async () => {
    try {
      const data = await base44.entities.MocktailRecipes.filter({ status: "approved" }, "sort_order", 100);
      setRecipes(data);
    } catch (err) {
      console.error("loadRecipes error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = recipes.filter(r => r.category === activeCategory);
  const categories = Object.keys(CATEGORY_LABELS).filter(c => recipes.some(r => r.category === c));

  if (selected) {
    return (
      <div className="min-h-screen pb-24" style={{ backgroundColor: 'var(--t-bg)' }}>
        <div className="px-6 max-w-lg mx-auto" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 72px)' }}>
          <button onClick={() => setSelected(null)} className="flex items-center gap-1 mb-8" style={{ color: 'var(--t-accent)' }}>
            <ChevronLeft size={18} strokeWidth={1.5} />
            <span className="text-sm">Mocktails</span>
          </button>

          <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: 'var(--t-accent)' }}>
            {CATEGORY_LABELS[selected.category]}
          </p>
          <h1 className="font-display text-3xl font-medium mb-2" style={{ color: 'var(--t-text)' }}>{selected.name}</h1>
          <p className="text-sm mb-6" style={{ color: 'var(--t-muted)', fontStyle: 'italic' }}>{selected.one_liner}</p>

          {selected.time_minutes && (
            <div className="flex items-center gap-1.5 mb-6">
              <Clock size={13} strokeWidth={1.5} style={{ color: 'var(--t-muted)' }} />
              <span className="text-xs" style={{ color: 'var(--t-muted)' }}>{selected.time_minutes} min</span>
              {selected.flavor_profile && (
                <span className="text-xs" style={{ color: 'var(--t-muted)' }}>· {selected.flavor_profile}</span>
              )}
            </div>
          )}

          {selected.order_script && (
            <div className="rounded-xl p-4 mb-6" style={{ backgroundColor: 'var(--t-card)', border: '1px solid var(--t-border)' }}>
              <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: 'var(--t-accent)' }}>Say this</p>
              <p className="text-sm font-display italic leading-relaxed" style={{ color: 'var(--t-text)' }}>"{selected.order_script}"</p>
            </div>
          )}

          {selected.ingredients?.length > 0 && (
            <div className="mb-6">
              <p className="text-[10px] uppercase tracking-widest mb-3" style={{ color: 'var(--t-muted)' }}>Ingredients</p>
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
              <p className="text-[10px] uppercase tracking-widest mb-3" style={{ color: 'var(--t-muted)' }}>Steps</p>
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: 'var(--t-bg)' }}>
      <div className="px-6 max-w-lg mx-auto" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 72px)' }}>
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 mb-6" style={{ color: 'var(--t-accent)' }}>
          <ChevronLeft size={18} strokeWidth={1.5} />
          <span className="text-sm">Mine</span>
        </button>

        <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: 'var(--t-accent)' }}>Drinks</p>
        <h1 className="font-display text-3xl font-medium mb-6" style={{ color: 'var(--t-text)' }}>Mocktails</h1>

        {/* Category tabs */}
        {categories.length > 1 && (
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {categories.map(c => (
              <button
                key={c}
                onClick={() => { hapticLight(); setActiveCategory(c); }}
                className="flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-colors"
                style={{
                  backgroundColor: activeCategory === c ? 'var(--t-accent)' : 'var(--t-card)',
                  color: activeCategory === c ? 'var(--t-bg)' : 'var(--t-muted)',
                  border: '1px solid var(--t-border)',
                }}
              >
                {CATEGORY_LABELS[c]}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center">
            <p className="text-sm" style={{ color: 'var(--t-muted)' }}>Loading…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-display italic text-lg mb-2" style={{ color: 'var(--t-text)' }}>Coming soon.</p>
            <p className="text-sm" style={{ color: 'var(--t-muted)' }}>We're adding more recipes here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(recipe => (
              <button
                key={recipe.id}
                onClick={() => { hapticLight(); setSelected(recipe); }}
                className="w-full rounded-xl p-4 text-left flex items-center justify-between"
                style={{ backgroundColor: 'var(--t-card)', border: '1px solid var(--t-border)' }}
              >
                <div>
                  <p className="text-sm font-medium mb-0.5" style={{ color: 'var(--t-text)' }}>{recipe.name}</p>
                  <p className="text-xs" style={{ color: 'var(--t-muted)' }}>{recipe.one_liner}</p>
                </div>
                <ChevronRight size={14} strokeWidth={1.5} style={{ color: 'var(--t-muted)', flexShrink: 0, marginLeft: 12 }} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}