"use client";

import { useState } from "react";

interface Card3DProps {
  children: React.ReactNode;
  title: string;
  icon: string;
  className?: string;
}

export default function Card3D({ children, title, icon, className = "" }: Card3DProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`relative group cursor-pointer transition-all duration-300 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: isHovered ? "translateY(-10px) rotateX(5deg)" : "translateY(0) rotateX(0)",
        transformStyle: "preserve-3d",
      }}
    >
      {/* Card with 3D effect */}
      <div className="relative bg-[#b366ff]/5 border border-[#b366ff]/20 rounded-xl p-6 backdrop-blur-sm transition-all duration-300 group-hover:bg-[#b366ff]/10 group-hover:border-[#b366ff]/40">
        {/* Floating icon */}
        <div 
          className="text-4xl mb-4 transition-transform duration-300"
          style={{
            transform: isHovered ? "translateY(-5px) scale(1.1)" : "translateY(0) scale(1)",
          }}
        >
          {icon}
        </div>
        
        {/* Title */}
        <h3 className="text-xl font-bold text-white mb-3">
          {title}
        </h3>
        
        {/* Content */}
        <div className="text-[#b366ff]/80 leading-relaxed">
          {children}
        </div>

        {/* Hover glow effect */}
        <div 
          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background: "radial-gradient(circle at center, rgba(179, 102, 255, 0.1) 0%, transparent 70%)",
            filter: "blur(20px)",
          }}
        />
      </div>
    </div>
  );
}