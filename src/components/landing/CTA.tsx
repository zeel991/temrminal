"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";

export default function CTA() {
  const { isConnected } = useAccount();
  const router = useRouter();
  const [email, setEmail] = useState("");

  const handleGetStarted = () => {
    if (isConnected) {
      router.push("/terminal");
    } else {
      // Trigger wallet connection or scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter signup
    console.log("Email submitted:", email);
    setEmail("");
    // Show success message
  };

  return (
    <section id="cta" className="py-20 bg-gradient-to-b from-purple-900/10 to-[#000] relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#b366ff]/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-2000" />
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Main CTA Content */}
        <div className="text-center mb-16">
          {/* Title */}
          <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-[#b366ff] via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Ready to Start Trading?
            </span>
          </h2>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-[#b366ff]/80 mb-8 max-w-3xl mx-auto leading-relaxed">
            Join thousands of traders leveraging prediction markets for maximum returns
          </p>

          {/* Main CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={handleGetStarted}
              className="bg-[#b366ff] text-black px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[#b366ff]/90 transform hover:scale-105 transition-all duration-200 shadow-lg shadow-[#b366ff]/25"
            >
              {isConnected ? "Enter Trading Terminal" : "Connect Wallet & Start"}
            </button>
            <a
              href="#features"
              className="border border-[#b366ff] px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[#b366ff]/10 transform hover:scale-105 transition-all duration-200"
            >
              Learn More
            </a>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          {/* Left Column - Benefits */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white mb-6">
              Why Choose Our Platform?
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-6 h-6 bg-[#b366ff] rounded-full flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                  <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-1">
                    Advanced Leverage Options
                  </h4>
                  <p className="text-[#b366ff]/80">
                    Up to 10x leverage with intelligent risk management
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-6 h-6 bg-[#b366ff] rounded-full flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                  <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-1">
                    Real-Time Price Feeds
                  </h4>
                  <p className="text-[#b366ff]/80">
                    Live market data from Pyth Network for informed decisions
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-6 h-6 bg-[#b366ff] rounded-full flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                  <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-1">
                    Secure & Reliable
                  </h4>
                  <p className="text-[#b366ff]/80">
                    Enterprise-grade security with 24/7 monitoring
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Newsletter Signup */}
          <div className="bg-[#b366ff]/5 border border-[#b366ff]/20 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-white mb-4">
              Stay Updated
            </h3>
            <p className="text-[#b366ff]/80 mb-6">
              Get the latest market insights and platform updates delivered to your inbox
            </p>
            
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full px-4 py-3 bg-[#000]/50 border border-[#b366ff]/30 rounded-lg text-white placeholder-[#b366ff]/50 focus:border-[#b366ff] focus:outline-none transition-colors"
              />
              <button
                type="submit"
                className="w-full bg-[#b366ff] text-black px-6 py-3 rounded-lg font-semibold hover:bg-[#b366ff]/90 transition-colors"
              >
                Subscribe to Newsletter
              </button>
            </form>

            {/* Social Proof */}
            <div className="mt-6 pt-6 border-t border-[#b366ff]/20">
              <div className="flex items-center justify-center space-x-6 text-sm text-[#b366ff]/60">
                <div className="flex items-center">
                  <span className="text-2xl mr-2">👥</span>
                  <span>10,000+ Traders</span>
                </div>
                <div className="flex items-center">
                  <span className="text-2xl mr-2">⭐</span>
                  <span>4.9 Rating</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Final Stats Bar */}
        <div className="bg-[#000]/50 backdrop-blur-sm border border-[#b366ff]/20 rounded-xl p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-2xl font-bold text-white mb-1">$2.8M+</div>
              <div className="text-sm text-[#b366ff]/80">Trading Volume</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white mb-1">50+</div>
              <div className="text-sm text-[#b366ff]/80">Markets</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white mb-1">99.9%</div>
              <div className="text-sm text-[#b366ff]/80">Uptime</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white mb-1">24/7</div>
              <div className="text-sm text-[#b366ff]/80">Support</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}