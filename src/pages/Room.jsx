import React from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/current/BottomNav";
import PullToRefresh from "@/components/current/PullToRefresh";

export default function Room() {
  const navigate = useNavigate();

  return (
    <PullToRefresh onRefresh={() => {}}>
      <div className="min-h-screen pb-24" style={{ backgroundColor: "var(--t-bg)", paddingTop: "calc(env(safe-area-inset-top,0px) + 72px)" }}>
        <div className="px-6">
          <h1 className="font-display text-2xl font-medium mb-2" style={{ color: "var(--t-text)" }}>The Room</h1>
          <p className="text-sm" style={{ color: "var(--t-muted)" }}>Daily community prompt — coming soon</p>
        </div>
        <BottomNav />
      </div>
    </PullToRefresh>
  );
}