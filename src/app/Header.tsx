import React from 'react';
import WalletConnect from '@/components/WalletConnect';
import SwitchNetwork from '@/components/SwitchNetwork';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
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
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                My Wallet
              </h1>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a
              href="/terminal"
              className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              Terminal
            </a>
            <a
              href="#"
              className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              Dashboard
            </a>
            <a
              href="#"
              className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              Transactions
            </a>
            <a
              href="#"
              className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              Settings
            </a>
            <a
              href="#"
              className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              Help
            </a>
          </nav>

          {/* Wallet Connection & Network Switch */}
          <div className="flex items-center space-x-4">
            {/* Network Switcher */}
            <div className="hidden sm:block">
              <SwitchNetwork />
            </div>
            
            {/* Wallet Connect Component */}
            <div className="flex items-center">
              <WalletConnect />
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2 text-gray-600 hover:text-gray-900">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;