import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Copy, Check } from "lucide-react";
import { hapticLight } from "@/lib/haptics";

const FILTER_CHIPS = ["All", "Bar order", "Home", "Zero-proof", "15-second"];

export default function Mocktails() {
  const [drinks, setDrinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    base44.entities.Drink.filter({ status: "approved" }).then(d => {
      setDrinks(d);
      setLoading(false);
    });
  }, []);

  const quickDrink = drinks.find(d => d.quick);

  const filtered = drinks.filter(d => {
    if (filter === "All") return true;
    if (filter === "Bar order") return d.kind === "bar_order";
    if (filter === "Home") return d.kind === "home_recipe";
    if (filter === "Zero-proof") return d.kind === "zero_proof";
    if (filter === "15-second") return d.quick;
    return true;
  });

  const copyScript = async (text) => {
    hapticLight();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const kindLabel = (kind) => kind === "bar_order" ? "BAR" : kind === "home_recipe" ? "HOME" : "ZERO";

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: 'var(--t-bg)', paddingTop: 'calc(env(safe-area-inset-top, 0px) + 72px)' }}>
      <div className="px-6 max-w-lg mx-auto">
        <p className="text-[10px] uppercase tracking-widest font-medium mb-2" style={{ color: 'var(--t-muted)' }}>Going out tonight?</p>
        <p className="font-display text-[26px] mb-6" style={{ color: 'var(--t-text)' }}>Something to hold.</p>

        {/* Hero card */}
        {quickDrink && (
          <div className="rounded-xl p-5 mb-6 border" style={{
            background: 'linear-gradient(135deg, rgba(110,143,163,0.18), rgba(110,143,163,0.05))',
            borderColor: 'var(--t-border)',
          }}>
            <p className="text-[10px] uppercase tracking-widest font-medium mb-1" style={{ color: 'var(--t-accent)' }}>Last-minute</p>
            <p className="font-display text-[18px] mb-2" style={{ color: 'var(--t-text)' }}>Order with confidence</p>
            <p className="font-display text-[15px] italic leading-relaxed mb-3" style={{ color: 'var(--t-text-warm)' }}>
              {quickDrink.recipe}
            </p>
            <p className="text-[11px]" style={{ color: 'var(--t-muted)' }}>Reads like a real order. Tastes like one too.</p>
          </div>
        )}

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4" style={{ scrollbarWidth: 'none' }}>
          {FILTER_CHIPS.map(chip => (
            <button
              key={chip}
              onClick={() => setFilter(chip)}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all"
              style={{
                backgroundColor: filter === chip ? 'var(--t-accent)' : 'var(--t-card)',
                color: filter === chip ? 'var(--t-bg)' : 'var(--t-muted)',
                border: `1px solid ${filter === chip ? 'var(--t-accent)' : 'var(--t-border)'}`,
              }}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-16 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--t-border)' }} />)}
          </div>
        ) : (
          filtered.map(drink => (
            <button
              key={drink.id}
              onClick={() => { hapticLight(); setSelected(drink); }}
              className="w-full flex items-center justify-between py-4 border-b text-left"
              style={{ borderColor: 'var(--t-border)' }}
            >
              <div className="flex-1 min-w-0 pr-3">
                <div className="flex items-center gap-2 mb-0.5">
                  {drink.emoji && <span>{drink.emoji}</span>}
                  <p className="text-sm font-medium" style={{ color: 'var(--t-text)' }}>{drink.name}</p>
                </div>
                <p className="text-[11.5px]" style={{ color: 'var(--t-muted)' }}>{drink.short}</p>
              </div>
              <span
                className="text-[9.5px] font-medium px-2 py-0.5 rounded-full border flex-shrink-0"
                style={{ borderColor: 'var(--t-accent)', color: 'var(--t-accent)' }}
              >
                {kindLabel(drink.kind)}
              </span>
            </button>
          ))
        )}
      </div>

      {/* Detail sheet */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} onClick={() => setSelected(null)}>
          <div
            className="w-full rounded-t-2xl px-6 pt-4 pb-10 max-h-[80vh] overflow-y-auto"
            style={{ backgroundColor: 'var(--t-card)', borderTop: '1px solid var(--t-border)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1.5 rounded-full mx-auto mb-5" style={{ backgroundColor: 'var(--t-border)' }} />
            <p className="text-[10px] uppercase tracking-widest font-medium mb-1" style={{ color: 'var(--t-accent)' }}>
              {kindLabel(selected.kind)}
            </p>
            <p className="font-display text-xl mb-1" style={{ color: 'var(--t-text)' }}>{selected.name}</p>
            <p className="text-sm mb-4" style={{ color: 'var(--t-muted)' }}>{selected.short}</p>

            {selected.kind === "bar_order" ? (
              <>
                <p className="font-display text-[15px] italic leading-relaxed mb-4" style={{ color: 'var(--t-text-warm)' }}>
                  "{selected.recipe}"
                </p>
                <button
                  onClick={() => copyScript(selected.recipe)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
                  style={{ backgroundColor: 'var(--t-accent-bg)', border: '1px solid var(--t-accent)', color: 'var(--t-accent)' }}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copied" : "Tap to copy"}
                </button>
              </>
            ) : (
              <>
                {selected.ingredients?.length > 0 && (
                  <div className="mb-4">
                    <p className="text-[10px] uppercase tracking-widest font-medium mb-2" style={{ color: 'var(--t-muted)' }}>Ingredients</p>
                    {selected.ingredients.map((ing, i) => (
                      <p key={i} className="text-sm py-1.5 border-b" style={{ color: 'var(--t-text)', borderColor: 'var(--t-border)' }}>
                        {ing}
                      </p>
                    ))}
                  </div>
                )}
                <p className="text-[10px] uppercase tracking-widest font-medium mb-2" style={{ color: 'var(--t-muted)' }}>Recipe</p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--t-text)' }}>{selected.recipe}</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}