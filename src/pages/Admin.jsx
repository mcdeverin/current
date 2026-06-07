import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Check, X } from "lucide-react";
import moment from "moment";

export default function Admin() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const user = await base44.auth.me();
    if (user?.role === "admin") {
      setIsAdmin(true);
      loadPending();
    }
    setChecking(false);
  };

  const loadPending = async () => {
    const data = await base44.entities.Places.filter({ status: "pending" }, "-created_date");
    setPending(data);
    setLoading(false);
  };

  const handleApprove = async (place) => {
    await base44.entities.Places.update(place.id, {
      status: "approved",
      tag: place.tag || "Sober Friendly",
      emoji: place.emoji || "📍",
    });
    setPending(prev => prev.filter(p => p.id !== place.id));
  };

  const handleDecline = async (place) => {
    await base44.entities.Places.update(place.id, { status: "declined" });
    setPending(prev => prev.filter(p => p.id !== place.id));
  };

  if (checking) {
    return <div className="min-h-screen" style={{ backgroundColor: 'var(--t-bg)' }} />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--t-bg)' }}>
        <p className="text-sm" style={{ color: 'var(--t-muted)' }}>Not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16" style={{ backgroundColor: 'var(--t-bg)' }}>
      <div className="px-6 pt-14 pb-6 max-w-lg mx-auto">
        <p className="text-[10px] uppercase tracking-widest font-medium mb-1" style={{ color: '#8aab8e' }}>
          Admin
        </p>
        <h1 className="font-display text-2xl font-medium mb-8" style={{ color: 'var(--t-text)' }}>
          Place Queue
        </h1>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--t-border)' }} />
            ))}
          </div>
        ) : pending.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-display text-lg mb-2" style={{ color: 'var(--t-text)' }}>All clear.</p>
            <p className="text-sm" style={{ color: 'var(--t-muted)' }}>No pending suggestions.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map(place => (
              <div
                key={place.id}
                className="rounded-xl p-4 border"
                style={{ backgroundColor: 'var(--t-card)', borderColor: 'var(--t-border)' }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-medium leading-tight" style={{ color: 'var(--t-text)' }}>
                      {place.name}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--t-muted)' }}>
                      {place.type} · {place.neighborhood}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {place.suggested_by_name && (
                        <span className="text-[11px]" style={{ color: 'var(--t-muted)' }}>
                          {place.suggested_by_name}
                          {place.suggested_by_days != null && ` · ${place.suggested_by_days}d`}
                        </span>
                      )}
                      <span className="text-[11px]" style={{ color: 'var(--t-muted)' }}>
                        · {moment(place.created_date).fromNow()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleDecline(place)}
                      className="w-9 h-9 rounded-lg flex items-center justify-center border transition-all active:scale-95"
                      style={{ borderColor: 'var(--t-border)', color: 'var(--t-muted)' }}
                    >
                      <X size={16} />
                    </button>
                    <button
                      onClick={() => handleApprove(place)}
                      className="w-9 h-9 rounded-lg flex items-center justify-center transition-all active:scale-95"
                      style={{ backgroundColor: '#8aab8e', color: '#fff' }}
                    >
                      <Check size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}