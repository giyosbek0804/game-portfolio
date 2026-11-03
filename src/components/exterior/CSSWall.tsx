import React from "react";

interface CSSWallProps {
  textureUrl?: string;
  wallColor?: string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * CSSWall represents the exterior wall of the house.
 * It uses CSS custom properties and inline style overrides so textures can easily
 * be swapped later without touching component logic.
 */
export const CSSWall: React.FC<CSSWallProps> = ({
  textureUrl,
  wallColor,
  className = "",
  children,
}) => {
  const dynamicStyle: React.CSSProperties = {
    backgroundColor: wallColor || "var(--wall-color)",
    backgroundImage: textureUrl
      ? `url(${textureUrl})`
      : "var(--wall-texture, var(--wall-pattern))",
    backgroundSize: textureUrl ? "cover" : "auto",
    backgroundRepeat: textureUrl ? "no-repeat" : "repeat",
  };

  return (
    <div
      className={`relative border-b-8 border-stone-900 shadow-2xl transition-colors duration-300 ${className}`}
      style={dynamicStyle}
      aria-label="House exterior wall"
    >
      {/* Subtle brick / siding horizontal lines */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />

      {/* Decorative wall trim & siding header */}
      <div className="absolute top-0 left-0 right-0 h-3 bg-stone-800/80 border-b border-black/40" />

      {children}
    </div>
  );
};

