"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const BANNER_KEY = "launch_banner_dismissed_v1";

export default function LaunchBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(BANNER_KEY)) {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    localStorage.setItem(BANNER_KEY, "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="bg-indigo-600 text-white text-sm px-4 py-2.5 flex items-center justify-center gap-3 relative">
      <span className="font-semibold">🚀 Founder&rsquo;s Deal:</span>
      <span>
        First 100 customers get <strong>50% off forever</strong> — use code{" "}
        <span className="font-mono bg-white/20 px-1.5 py-0.5 rounded text-xs tracking-wide">
          LAUNCH50
        </span>{" "}
        at checkout.
      </span>
      <Link href="/pricing" className="underline font-medium whitespace-nowrap">
        Claim offer →
      </Link>
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
}
