"use client";

import { useState } from "react";

interface Feature {
  name: string;
  included: boolean;
}

interface PricingPlan {
  name: string;
  price: string;
  description: string;
  features: Feature[];
  highlighted?: boolean;
  buttonText: string;
}

const pricingPlans: PricingPlan[] = [
  {
    name: "Starter",
    price: "Free",
    description: "Perfect for getting started with prediction markets",
    buttonText: "Get Started",
    features: [
      { name: "Basic prediction markets", included: true },
      { name: "Up to 3 open positions", included: true },
      { name: "2x maximum leverage", included: true },
      { name: "Basic analytics", included: true },
      { name: "Email support", included: true },
      { name: "Advanced risk management", included: false },
      { name: "API access", included: false },
      { name: "Priority support", included: false },
      { name: "Custom strategies", included: false },
    ]
  },
  {
    name: "Pro",
    price: "$49",
    description: "For serious traders looking to maximize returns",
    buttonText: "Go Pro",
    highlighted: true,
    features: [
      { name: "All prediction markets", included: true },
      { name: "Unlimited positions", included: true },
      { name: "5x maximum leverage", included: true },
      { name: "Advanced analytics dashboard", included: true },
      { name: "Priority email support", included: true },
      { name: "Advanced risk management", included: true },
      { name: "Basic API access", included: true },
      { name: "Priority support", included: true },
      { name: "Custom strategies", included: false },
    ]
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For institutions and power users",
    buttonText: "Contact Sales",
    features: [
      { name: "All prediction markets", included: true },
      { name: "Unlimited positions", included: true },
      { name: "10x maximum leverage", included: true },
      { name: "Enterprise analytics", included: true },
      { name: "24/7 dedicated support", included: true },
      { name: "Custom risk parameters", included: true },
      { name: "Full API access", included: true },
      { name: "Dedicated account manager", included: true },
      { name: "Custom strategy development", included: true },
    ]
  }
];

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section className="py-20 bg-[#000] relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-l from-[#b366ff]/5 via-transparent to-purple-500/5" />
      
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-[#b366ff] to-purple-400 bg-clip-text text-transparent">
              Choose Your Plan
            </span>
          </h2>
          <p className="text-xl text-[#b366ff]/80 max-w-3xl mx-auto mb-8">
            Select the perfect plan for your trading needs and start maximizing your returns
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4">
            <span className={`text-lg ${!isAnnual ? 'text-white' : 'text-[#b366ff]/60'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#b366ff]/20 transition-colors focus:outline-none"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-[#b366ff] transition-transform ${
                  isAnnual ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-lg ${isAnnual ? 'text-white' : 'text-[#b366ff]/60'}`}>
              Annual (Save 20%)
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {pricingPlans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-[#b366ff]/5 border rounded-xl p-8 transition-all duration-300 hover:transform hover:scale-105 ${
                plan.highlighted
                  ? 'border-[#b366ff] shadow-2xl shadow-[#b366ff]/20 bg-[#b366ff]/10'
                  : 'border-[#b366ff]/20 hover:border-[#b366ff]/40'
              }`}
            >
              {/* Popular Badge */}
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-[#b366ff] text-black px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Plan Name */}
              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              
              {/* Price */}
              <div className="mb-4">
                <div className="text-4xl font-bold text-white">
                  {plan.price}
                  {plan.price !== "Free" && plan.price !== "Custom" && !isAnnual && (
                    <span className="text-lg text-[#b366ff]/80">/month</span>
                  )}
                  {plan.price !== "Free" && plan.price !== "Custom" && isAnnual && (
                    <span className="text-lg text-[#b366ff]/80">/year</span>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-[#b366ff]/80 mb-6">{plan.description}</p>

              {/* CTA Button */}
              <button
                className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 mb-8 ${
                  plan.highlighted
                    ? 'bg-[#b366ff] text-black hover:bg-[#b366ff]/90'
                    : 'bg-[#b366ff]/10 text-[#b366ff] border border-[#b366ff]/30 hover:bg-[#b366ff]/20'
                }`}
              >
                {plan.buttonText}
              </button>

              {/* Features List */}
              <ul className="space-y-3">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    {feature.included ? (
                      <svg className="w-5 h-5 text-[#b366ff] mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-[#b366ff]/30 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    )}
                    <span className={`text-sm ${feature.included ? 'text-white' : 'text-[#b366ff]/50'}`}>
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="text-center">
          <p className="text-[#b366ff]/80 mb-4">
            All plans include secure wallet integration and real-time price feeds
          </p>
          <div className="flex justify-center items-center gap-6 text-sm text-[#b366ff]/60">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              30-day money-back guarantee
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
              Cancel anytime
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}