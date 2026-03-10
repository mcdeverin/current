import React, { useState, useEffect } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

function daysInMonth(month, year) {
  return new Date(year, month, 0).getDate();
}

const selectStyle = {
  backgroundColor: "var(--t-bg)",
  color: "var(--t-text)",
  borderColor: "var(--t-border)",
  fontSize: "16px",
  WebkitAppearance: "none",
  MozAppearance: "none",
  appearance: "none",
};

export default function DatePickerDrawer({ open, onClose, value, onSelect }) {
  const today = new Date();

  const parseValue = () => {
    if (value) {
      const [y, m, d] = value.split("-").map(Number);
      return { year: y, month: m, day: d };
    }
    return { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate() };
  };

  const [sel, setSel] = useState(parseValue);

  useEffect(() => {
    if (open) setSel(parseValue());
  }, [open]);

  const currentYear = today.getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear - i);
  const numDays = daysInMonth(sel.month, sel.year);
  const days = Array.from({ length: numDays }, (_, i) => i + 1);

  const handleMonth = (m) => {
    const md = daysInMonth(Number(m), sel.year);
    setSel(prev => ({ ...prev, month: Number(m), day: Math.min(prev.day, md) }));
  };

  const handleYear = (y) => {
    const md = daysInMonth(sel.month, Number(y));
    setSel(prev => ({ ...prev, year: Number(y), day: Math.min(prev.day, md) }));
  };

  const handleConfirm = () => {
    const d = String(sel.day).padStart(2, "0");
    const m = String(sel.month).padStart(2, "0");
    onSelect(`${sel.year}-${m}-${d}`);
    onClose();
  };

  const isValid = (() => {
    const picked = new Date(sel.year, sel.month - 1, sel.day);
    return picked <= today;
  })();

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent style={{ backgroundColor: "var(--t-card)", borderColor: "var(--t-border)" }}>
        <DrawerHeader className="pb-2">
          <DrawerTitle className="text-center text-base font-display font-medium" style={{ color: "var(--t-text)" }}>
            Select your start date
          </DrawerTitle>
        </DrawerHeader>
        <div className="px-6 pb-8">
          <div className="flex gap-3 mb-6">
            {/* Month */}
            <div className="flex-[2]">
              <p className="text-[10px] uppercase tracking-widest mb-1.5 text-center" style={{ color: "var(--t-muted)" }}>Month</p>
              <select
                value={sel.month}
                onChange={e => handleMonth(e.target.value)}
                className="w-full py-3 px-2 rounded-xl border text-center focus:outline-none"
                style={selectStyle}
              >
                {MONTHS.map((m, i) => (
                  <option key={m} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
            {/* Day */}
            <div className="flex-1">
              <p className="text-[10px] uppercase tracking-widest mb-1.5 text-center" style={{ color: "var(--t-muted)" }}>Day</p>
              <select
                value={sel.day}
                onChange={e => setSel(prev => ({ ...prev, day: Number(e.target.value) }))}
                className="w-full py-3 px-2 rounded-xl border text-center focus:outline-none"
                style={selectStyle}
              >
                {days.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            {/* Year */}
            <div className="flex-[1.5]">
              <p className="text-[10px] uppercase tracking-widest mb-1.5 text-center" style={{ color: "var(--t-muted)" }}>Year</p>
              <select
                value={sel.year}
                onChange={e => handleYear(e.target.value)}
                className="w-full py-3 px-2 rounded-xl border text-center focus:outline-none"
                style={selectStyle}
              >
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleConfirm}
            disabled={!isValid}
            className="w-full py-3.5 rounded-xl text-sm font-medium transition-all disabled:opacity-30"
            style={{ backgroundColor: "var(--t-accent)", color: "var(--t-bg)" }}
          >
            Set date
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 mt-1 text-sm"
            style={{ color: "var(--t-muted)" }}
          >
            Cancel
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}