"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export function GoToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-all hover:bg-primary/90 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      aria-label="العودة للأعلى"
    >
      <ArrowUp className="h-6 w-6" />
    </button>
  );
}
















