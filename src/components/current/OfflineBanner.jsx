import React, { useState, useEffect } from "react";
import { Capacitor } from "@capacitor/core";

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let listener;
    const setup = async () => {
      try {
        const { Network } = await (new Function('p', 'return import(p)'))("@capacitor/network");
        const status = await Network.getStatus();
        setIsOffline(!status.connected);
        listener = await Network.addListener("networkStatusChange", (s) => {
          setIsOffline(!s.connected);
        });
      } catch {}
    };
    setup();

    return () => { if (listener) listener.remove(); };
  }, []);

  if (!isOffline) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[200] text-center py-2 text-xs font-medium"
      style={{
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 8px)",
        backgroundColor: "#7a2020",
        color: "#e8eaf0",
      }}
    >
      You're offline. Some features may not work.
    </div>
  );
}