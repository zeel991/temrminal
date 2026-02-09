"use client";

import React, { useState } from "react";
import WalletConnect from "@/components/WalletConnect";
import SwitchNetwork from "@/components/SwitchNetwork";
import Link from "next/link";

const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-[#000] shadow-sm border-b border-[#b366ff]/30">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#b366ff] to-[#8b45d6] rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-[#b366ff] font-mono tracking-wider">
                PREDICTION TERMINAL
              </h1>
            </div>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
              <Link
                href="/"
                className="text-[#b366ff]/70 hover:text-[#b366ff] transition-colors duration-200 text-sm font-mono uppercase tracking-wider"
              >
                Home
              </Link>
          </nav>

          {/* Wallet Connection & Network Switch */}
          <div className="flex items-center space-x-4">
            {/* Network Switcher */}

            {/* Wallet Connect Component */}
            <div className="flex items-center">
              <WalletConnect />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#b366ff]/70 hover:text-[#b366ff]"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#b366ff]/20 py-4">
            <nav className="flex flex-col space-y-3">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[#b366ff]/70 hover:text-[#b366ff] transition-colors duration-200 text-sm font-mono uppercase tracking-wider px-4 py-2"
              >
                Home
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
