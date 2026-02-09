"use client";

import { useEffect, useState, Suspense } from "react";
import dynamic from "next/dynamic";
import PixelBlast from "@/components/landing/PixelBlast";

// Lazy load heavy components
const Hero = dynamic(() => import("@/components/landing/Hero"), {
  loading: () => <div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-xl text-[#b366ff]">Loading Hero...</div></div>
});

const CTA = dynamic(() => import("@/components/landing/CTA"), {
  loading: () => <div className="py-20 flex items-center justify-center"><div className="animate-pulse text-xl text-[#b366ff]">Loading CTA...</div></div>
});

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <main className="min-h-screen bg-[#000] text-[#b366ff]">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-pulse text-xl">Loading...</div>
        </div>
      </main>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Background Layer - MUST be first */}
      <div className="fixed inset-0 z-0">
        <PixelBlast 
          color="#B19EEF"
          pixelSize={6}
          variant="square"
          enableRipples={true}
          transparent={true}
          speed={0.3}
          autoPauseOffscreen={true}
          antialias={false}
          patternDensity={0.8}
        />
      </div>

      {/* Content Layer - MUST have higher z-index */}
      <main className="relative z-10 min-h-screen text-[#b366ff]">
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-xl text-[#b366ff]">Loading...</div></div>}>
          <Hero />
        </Suspense>
      </main>
    </div>
  );
}