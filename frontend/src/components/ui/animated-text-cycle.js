import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * AnimatedTextCycle
 * Cycles through words with blur-fade-slide animation + auto-width spring.
 *
 * Props:
 *  words    {string[]}         — list of words/phrases to cycle
 *  colors   {string[]}        — optional per-word inline style color/gradient
 *  interval {number}          — ms between words (default 3000)
 *  className {string}         — extra classes on each word span
 *  style    {React.CSSProperties} — base style on each word span
 */
export default function AnimatedTextCycle({
  words,
  colors = [],
  interval = 3000,
  className = "",
  style = {},
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [width, setWidth] = useState("auto");
  const measureRef = useRef(null);

  // Measure width of current word
  useEffect(() => {
    if (measureRef.current) {
      const elements = measureRef.current.children;
      if (elements.length > currentIndex) {
        const newWidth = elements[currentIndex].getBoundingClientRect().width;
        setWidth(`${newWidth}px`);
      }
    }
  }, [currentIndex]);

  // Advance word on interval
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % words.length);
    }, interval);
    return () => clearInterval(timer);
  }, [interval, words.length]);

  const containerVariants = {
    hidden:  { y: -22, opacity: 0, filter: "blur(10px)" },
    visible: { y: 0,   opacity: 1, filter: "blur(0px)",
      transition: { duration: 0.42, ease: "easeOut" } },
    exit:    { y: 22,  opacity: 0, filter: "blur(10px)",
      transition: { duration: 0.3, ease: "easeIn" } },
  };

  // Compose per-word inline style (supports gradient colour strings)
  const wordStyle = (i) => {
    const base = { whiteSpace: "nowrap", ...style };
    const color = colors[i];
    if (!color) return base;
    // gradient string
    if (color.includes("gradient")) {
      return {
        ...base,
        backgroundImage: color,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        WebkitTextFillColor: "transparent",
      };
    }
    // plain css color
    return { ...base, color };
  };

  return (
    <>
      {/* Hidden measurement container */}
      <div
        ref={measureRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          opacity: 0,
          pointerEvents: "none",
          visibility: "hidden",
          top: 0,
          left: 0,
        }}
      >
        {words.map((word, i) => (
          <span key={i} className={`font-bold ${className}`} style={wordStyle(i)}>
            {word}
          </span>
        ))}
      </div>

      {/* Spring-width animated container */}
      <motion.span
        className="relative inline-block overflow-visible"
        animate={{
          width,
          transition: { type: "spring", stiffness: 150, damping: 15, mass: 1.2 },
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={currentIndex}
            className={`inline-block font-bold ${className}`}
            style={wordStyle(currentIndex)}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {words[currentIndex]}
          </motion.span>
        </AnimatePresence>
      </motion.span>
    </>
  );
}
