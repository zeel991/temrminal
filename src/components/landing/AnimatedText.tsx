"use client";

import { useEffect, useState } from "react";

interface AnimatedTextProps {
  text: string;
  className?: string;
  tag?: "h1" | "h2" | "h3" | "p" | "span";
  animation?: "wave" | "fade-in" | "slide-up" | "typewriter";
  delay?: number;
}

export default function AnimatedText({ 
  text, 
  className = "", 
  tag: Tag = "p", 
  animation = "fade-in",
  delay = 0 
}: AnimatedTextProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    const target = document.getElementById(`animated-text-${Math.random().toString(36).substr(2, 9)}`);
    if (target) {
      observer.observe(target);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || animation !== "typewriter") return;

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= text.length) {
        setDisplayedText(text.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isVisible, animation, text]);

  const getAnimationClass = () => {
    if (!isVisible) return "opacity-0";
    
    switch (animation) {
      case "wave":
        return "animate-pulse";
      case "fade-in":
        return "opacity-100 transition-opacity duration-1000";
      case "slide-up":
        return "opacity-100 translate-y-0 transition-all duration-700";
      case "typewriter":
        return "opacity-100";
      default:
        return "opacity-100";
    }
  };

  const getAnimatedText = () => {
    if (animation === "typewriter") {
      return (
        <>
          {displayedText}
          {isVisible && displayedText.length < text.length && (
            <span className="animate-pulse">|</span>
          )}
        </>
      );
    }
    
    if (animation === "wave") {
      return text.split("").map((char, index) => (
        <span
          key={index}
          className="inline-block animate-pulse"
          style={{
            animationDelay: `${delay + index * 50}ms`,
          }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ));
    }
    
    return text;
  };

  const additionalStyles = animation === "slide-up" && !isVisible 
    ? { transform: "translateY(30px)" } 
    : {};

  const commonProps = {
    id: `animated-text-${Math.random().toString(36).substr(2, 9)}`,
    className: `${className} ${getAnimationClass()}`,
    style: {
      transitionDelay: `${delay}ms`,
      ...additionalStyles,
    }
  };

  switch (Tag) {
    case "h1":
      return <h1 {...commonProps}>{getAnimatedText()}</h1>;
    case "h2":
      return <h2 {...commonProps}>{getAnimatedText()}</h2>;
    case "h3":
      return <h3 {...commonProps}>{getAnimatedText()}</h3>;
    case "span":
      return <span {...commonProps}>{getAnimatedText()}</span>;
    default:
      return <p {...commonProps}>{getAnimatedText()}</p>;
  }
}