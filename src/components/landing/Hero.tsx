"use client";

import { useEffect, useState, memo } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({ 
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  display: "swap",
});

const Hero = memo(function Hero() {
  const { isConnected } = useAccount();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <div className="animate-pulse text-xl text-[#b366ff]">Loading...</div>
      </div>
    );
  }

  return (
    <section className="min-h-screen flex items-center justify-center relative bg-transparent">
        {/* Optional: Add a subtle gradient overlay without blocking the background */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#000]/20 to-transparent pointer-events-none" />
        
        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
          {/* Hero Title with Playfair Display */}
          <div className="relative inline-block">
            {/* Blurred black background - multiple layers for smooth blur */}
            <div className="absolute inset-0 bg-black/60 blur-3xl transform scale-110" />
            <div className="absolute inset-0 bg-black/40 blur-2xl transform scale-105" />
            <div className="absolute inset-0 bg-black/30 blur-xl" />
            
            {/* Text content */}
            <h1 className={`${playfair.className} relative text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight px-8 py-6`}>
              <span className="text-white drop-shadow-2xl">
                Prediction Markets
              </span>
              <br />
              <span className="text-white drop-shadow-2xl">Reimagined</span>
              <br />
              <span className={`${playfair.className} text-3xl md:text-4xl lg:text-5xl text-white drop-shadow-2xl block mt-4`}>
                Coming Soon
              </span>
            </h1>
          </div>
        </div>
      </section>
  );
});

export default Hero;