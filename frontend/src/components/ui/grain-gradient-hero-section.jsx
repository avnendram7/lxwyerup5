import React from "react";
import { GrainGradient, grainGradientPresets } from '@paper-design/shaders-react';
import { Button } from './button';

export default function GrainHeroSection({
  title,
  subtitle,
  ctaLabel,
  onCtaClick,
  children,
  className,
  style,
  innerRef
}) {
  const professionalPreset = {
    ...grainGradientPresets[0],
    colors: ["#000000", "#1e3a8a", "#0f172a", "#3b82f6", "#ffffff"]
  };

  return (
    <section 
      ref={innerRef}
      className={className || "relative min-h-screen flex items-center justify-center overflow-hidden"}
      style={style}
    >
      <GrainGradient
        {...professionalPreset}
        style={{ position: "absolute", inset: 0, zIndex: 0 }}
      />
      
      <div className="relative z-10 w-full flex flex-col items-center justify-center h-full">
        {children ? (
          children
        ) : (
          <div className="text-center px-6 sm:px-8 max-w-4xl mx-auto">
            <h1 
              role="heading" 
              className="text-4xl sm:text-6xl font-bold text-white mb-6"
            >
              {title}
            </h1>
            
            <p className="max-w-2xl text-lg sm:text-xl text-gray-200 mx-auto mb-8">
              {subtitle}
            </p>
            
            <Button 
              onClick={onCtaClick}
              size="lg"
              className="text-lg px-8 py-3 bg-white text-black hover:bg-gray-100"
            >
              {ctaLabel}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
