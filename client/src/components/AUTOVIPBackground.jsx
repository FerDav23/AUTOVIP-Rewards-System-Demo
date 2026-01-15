import React from "react";
import { motion } from "framer-motion";

/**
 * Gear built from:
 * - a base circle
 * - N rotated rounded-rect teeth
 * - a center hole circle
 *
 * This produces a clean "icon-like" gear similar to your reference image.
 */
function Gear({
  top,
  left,
  right,
  bottom,
  size = 120,
  duration = 10,
  reverse = false,
  opacity = 0.25,
  color = "#cf0000",
  teeth = 8,

  // Shape tuning (defaults match a typical gear icon)
  baseRadius = 72,
  holeRadius = 42,
  toothWidth = 34,
  toothLength = 26,
  toothRound = 7,
  toothOverlap = 12,
  holeColor = "transparent",
}) {
  const style = {
    position: "absolute",
    width: size,
    height: size,
    ...(top !== undefined && { top: `${top}%` }),
    ...(left !== undefined && { left: `${left}%` }),
    ...(right !== undefined && { right: `${right}%` }),
    ...(bottom !== undefined && { bottom: `${bottom}%` }),
    pointerEvents: "none",
    zIndex: 0,
    opacity: opacity,
  };

  const cx = 100;
  const cy = 100;

  // Place a tooth at the top, then rotate it around the center
  const toothHeight = toothLength + toothOverlap;
  const toothX = cx - toothWidth / 2;
  const toothY = cy - (baseRadius + toothLength); // start above the base circle

  return (
    <motion.div
      style={style}
      animate={{ rotate: reverse ? -360 : 360 }}
      transition={{ repeat: Infinity, duration, ease: "linear" }}
    >
      <svg width="100%" height="100%" viewBox="0 0 200 200">
        {/* Define clip path to cut hole from gear */}
        <defs>
          <clipPath id={`gearClip-${top}-${left}-${right}-${bottom}`}>
            <rect x="0" y="0" width="200" height="200" />
            <circle cx={cx} cy={cy} r={holeRadius} />
          </clipPath>
          <mask id={`gearMask-${top}-${left}-${right}-${bottom}`}>
            <rect x="0" y="0" width="200" height="200" fill="white" />
            <circle cx={cx} cy={cy} r={holeRadius} fill="black" />
          </mask>
        </defs>
        
        {/* Single unified gear shape using mask to cut hole */}
        <g mask={`url(#gearMask-${top}-${left}-${right}-${bottom})`}>
          {/* Teeth */}
          {Array.from({ length: teeth }).map((_, i) => {
            const angle = (360 / teeth) * i;
            return (
              <rect
                key={i}
                x={toothX}
                y={toothY + toothOverlap / 2}
                width={toothWidth}
                height={toothHeight}
                rx={toothRound}
                ry={toothRound}
                fill={color}
                transform={`rotate(${angle} ${cx} ${cy})`}
              />
            );
          })}
          {/* Base gear body */}
          <circle cx={cx} cy={cy} r={baseRadius} fill={color} />
        </g>
      </svg>
    </motion.div>
  );
}

// Floating particles with enhanced animations
function Particle({ top, left, delay = 0, duration = 3, color = "#cf0000", size = 6 }) {
  return (
    <motion.div
      style={{
        position: "absolute",
        top: `${top}%`,
        left: `${left}%`,
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color}ff, ${color}80)`,
        opacity: 0.4,
        boxShadow: `0 0 ${size * 2}px ${color}80, 0 0 ${size * 4}px ${color}40`,
        pointerEvents: "none",
        zIndex: 0,
      }}
      animate={{
        y: [-10, -40, -10],
        x: [-5, 5, -5],
        opacity: [0, 0.8, 0],
        scale: [0, 1.5, 0],
      }}
      transition={{ repeat: Infinity, duration, delay, ease: "easeInOut" }}
    />
  );
}

// Animated gradient orbs for background depth
function GradientOrb({ top, left, size = 200, delay = 0, duration = 20 }) {
  return (
    <motion.div
      style={{
        position: "absolute",
        top: `${top}%`,
        left: `${left}%`,
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle, rgba(207, 0, 0, 0.06) 0%, rgba(207, 0, 0, 0.02) 50%, transparent 100%)`,
        pointerEvents: "none",
        zIndex: 0,
        filter: "blur(60px)",
      }}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.3, 0.5, 0.3],
        x: [0, 20, 0],
        y: [0, 15, 0],
      }}
      transition={{ repeat: Infinity, duration, delay, ease: "easeInOut" }}
    />
  );
}

// Floating line accent
function FloatingLine({ top, left, width = 100, delay = 0, duration = 15, angle = 0 }) {
  return (
    <motion.div
      style={{
        position: "absolute",
        top: `${top}%`,
        left: `${left}%`,
        width: width,
        height: 2,
        background: "linear-gradient(90deg, transparent, rgba(207, 0, 0, 0.25), transparent)",
        borderRadius: 2,
        pointerEvents: "none",
        zIndex: 0,
        transform: `rotate(${angle}deg)`,
      }}
      animate={{
        opacity: [0.2, 0.5, 0.2],
        scaleX: [1, 1.3, 1],
        x: [-20, 20, -20],
      }}
      transition={{ repeat: Infinity, duration, delay, ease: "easeInOut" }}
    />
  );
}

// Hexagon shape for modern tech feel
function HexagonShape({ top, left, size = 80, delay = 0, duration = 20, color = "#cf0000" }) {
  return (
    <motion.div
      style={{
        position: "absolute",
        top: `${top}%`,
        left: `${left}%`,
        width: size,
        height: size,
        pointerEvents: "none",
        zIndex: 0,
      }}
      animate={{
        rotate: [0, 60, 0],
        opacity: [0.08, 0.15, 0.08],
        scale: [1, 1.1, 1],
      }}
      transition={{ repeat: Infinity, duration, delay, ease: "easeInOut" }}
    >
      <svg width="100%" height="100%" viewBox="0 0 100 100">
        <polygon
          points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5"
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          opacity="0.6"
        />
      </svg>
    </motion.div>
  );
}

// Diagonal stripe accent
function DiagonalStripe({ top, left, width = 200, delay = 0, duration = 25, color = "#8b0000" }) {
  return (
    <motion.div
      style={{
        position: "absolute",
        top: `${top}%`,
        left: `${left}%`,
        width: width,
        height: 1,
        background: `linear-gradient(90deg, transparent, ${color}40, transparent)`,
        transform: "rotate(-45deg)",
        transformOrigin: "left center",
        pointerEvents: "none",
        zIndex: 0,
      }}
      animate={{
        opacity: [0.1, 0.3, 0.1],
        scaleX: [0.8, 1.2, 0.8],
      }}
      transition={{ repeat: Infinity, duration, delay, ease: "easeInOut" }}
    />
  );
}

// Corner accent - decorative corner element
function CornerAccent({ position = "top-left", size = 120, color = "#cf0000" }) {
  const positionStyles = {
    "top-left": { top: 0, left: 0 },
    "top-right": { top: 0, right: 0, transform: "scaleX(-1)" },
    "bottom-left": { bottom: 0, left: 0, transform: "scaleY(-1)" },
    "bottom-right": { bottom: 0, right: 0, transform: "scale(-1)" },
  };

  return (
    <motion.div
      style={{
        position: "absolute",
        ...positionStyles[position],
        width: size,
        height: size,
        pointerEvents: "none",
        zIndex: 0,
      }}
      animate={{
        opacity: [0.06, 0.12, 0.06],
      }}
      transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
    >
      <svg width="100%" height="100%" viewBox="0 0 100 100">
        <path
          d="M0,0 L100,0 L100,10 L10,10 L10,100 L0,100 Z"
          fill={color}
        />
        <path
          d="M0,25 L60,25 L60,35 L10,35 L10,60 L0,60 Z"
          fill={color}
          opacity="0.5"
        />
      </svg>
    </motion.div>
  );
}

// Pulsing ring
function PulsingRing({ top, left, size = 60, delay = 0, duration = 4, color = "#cf0000" }) {
  return (
    <motion.div
      style={{
        position: "absolute",
        top: `${top}%`,
        left: `${left}%`,
        width: size,
        height: size,
        borderRadius: "50%",
        border: `2px solid ${color}`,
        pointerEvents: "none",
        zIndex: 0,
      }}
      animate={{
        scale: [0.8, 1.5, 0.8],
        opacity: [0.3, 0, 0.3],
      }}
      transition={{ repeat: Infinity, duration, delay, ease: "easeOut" }}
    />
  );
}

// Main background component
export default function AUTOVIPBackground() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        background: "#ffffff",
        overflow: "hidden",
      }}
    >
      {/* Gears - Red */}
      <Gear top={8} left={5} size={140} duration={12} opacity={0.18} color="#cf0000" />
      <Gear bottom={12} right={8} size={110} duration={15} reverse opacity={0.15} color="#cf0000" />
      <Gear top={50} right={3} size={90} duration={18} opacity={0.14} color="#cf0000" />
      <Gear top={25} right={12} size={100} duration={14} reverse opacity={0.16} color="#cf0000" />
      <Gear bottom={30} left={8} size={85} duration={16} opacity={0.15} color="#cf0000" />
      <Gear top={60} left={15} size={95} duration={20} reverse opacity={0.13} color="#cf0000" />
    </div>
  );
}

/**
 * NOTE:
 * - Make sure framer-motion is installed: npm i framer-motion
 * - Put this background inside a parent with position: relative
 *   and place your content above it with a higher z-index.
 *
 * Example usage:
 *
 * <div style={{ position: "relative", minHeight: "100vh" }}>
 *   <AUTOVIPBackground />
 *   <div style={{ position: "relative", zIndex: 1 }}>
 *     ...your content...
 *   </div>
 * </div>
 */
