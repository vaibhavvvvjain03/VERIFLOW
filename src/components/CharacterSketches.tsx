import React from 'react';

interface SketchProps {
  className?: string;
  width?: number | string;
  height?: number | string;
}

/**
 * "Veri" — The friendly Veriflow QA Scout & Browser Inspector.
 * Hand-drawn vector character sketches with consistent linework and palette.
 */

// 1. VeriHero: Veri holding a magnifying glass and testing clipboard
export const VeriHero: React.FC<SketchProps> = ({ width = 280, height = 280, className = '' }) => (
  <svg
    viewBox="0 0 320 320"
    width={width}
    height={height}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`veri-mascot-sketch ${className}`}
  >
    <defs>
      <linearGradient id="heroBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3B82F6" />
        <stop offset="100%" stopColor="#1D4ED8" />
      </linearGradient>
      <linearGradient id="heroAmberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FBBF24" />
        <stop offset="100%" stopColor="#F59E0B" />
      </linearGradient>
      <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="2" dy="4" stdDeviation="3" floodOpacity="0.08" />
      </filter>
    </defs>

    {/* Subtle ground shadow */}
    <ellipse cx="160" cy="295" rx="85" ry="12" fill="#E2E8F0" opacity="0.7" />

    {/* Left Arm holding Checklist */}
    <path
      d="M125 185 C100 195 80 215 85 240"
      stroke="#0F172A"
      strokeWidth="3.5"
      strokeLinecap="round"
    />
    {/* Clipboard */}
    <g transform="rotate(-10 90 235)">
      <rect x="55" y="195" width="55" height="75" rx="6" fill="#F8FAFC" stroke="#0F172A" strokeWidth="3" />
      <rect x="70" y="188" width="25" height="10" rx="3" fill="#E2E8F0" stroke="#0F172A" strokeWidth="2.5" />
      <line x1="65" y1="215" x2="95" y2="215" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="65" y1="228" x2="92" y2="228" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="65" y1="241" x2="85" y2="241" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M96 238 L99 242 L105 234" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="102" cy="255" r="3" fill="#3B82F6" />
    </g>

    {/* Body / Cobalt Sweater */}
    <path
      d="M120 180 C110 210 115 270 125 285 L195 285 C205 270 210 210 200 180 Z"
      fill="url(#heroBlueGrad)"
      stroke="#0F172A"
      strokeWidth="3.5"
      strokeLinejoin="round"
    />
    {/* Sweater details */}
    <line x1="160" y1="180" x2="160" y2="285" stroke="#1E40AF" strokeWidth="2" strokeDasharray="4 4" />
    <path d="M140 180 Q160 195 180 180" stroke="#FBBF24" strokeWidth="4" strokeLinecap="round" fill="none" />

    {/* Legs / Boots */}
    <rect x="135" y="285" width="18" height="15" rx="3" fill="#0F172A" />
    <rect x="168" y="285" width="18" height="15" rx="3" fill="#0F172A" />

    {/* Neck */}
    <rect x="148" y="160" width="24" height="22" fill="#FDE68A" stroke="#0F172A" strokeWidth="3" />

    {/* Head */}
    <circle cx="160" cy="120" r="50" fill="#FEF3C7" stroke="#0F172A" strokeWidth="3.5" />

    {/* Hair curls */}
    <path d="M115 110 Q120 75 160 75 Q200 75 205 110" fill="#0F172A" stroke="#0F172A" strokeWidth="3.5" />
    <path d="M110 120 C108 100 115 95 125 90" stroke="#0F172A" strokeWidth="3.5" strokeLinecap="round" />
    <path d="M210 120 C212 100 205 95 195 90" stroke="#0F172A" strokeWidth="3.5" strokeLinecap="round" />

    {/* Scout Cap */}
    <path
      d="M120 85 C125 55 195 55 200 85 Z"
      fill="url(#heroAmberGrad)"
      stroke="#0F172A"
      strokeWidth="3.5"
    />
    <path d="M108 85 Q160 78 212 85" stroke="#0F172A" strokeWidth="4.5" strokeLinecap="round" />
    {/* Cap button / star */}
    <circle cx="160" cy="68" r="6" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2" />

    {/* Round Glasses */}
    <circle cx="142" cy="122" r="14" fill="#FFFFFF" fillOpacity="0.85" stroke="#0F172A" strokeWidth="3" />
    <circle cx="178" cy="122" r="14" fill="#FFFFFF" fillOpacity="0.85" stroke="#0F172A" strokeWidth="3" />
    <line x1="156" y1="122" x2="164" y2="122" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />

    {/* Happy Eyes */}
    <circle cx="142" cy="122" r="4.5" fill="#0F172A" />
    <circle cx="140" cy="120" r="1.5" fill="#FFFFFF" />
    <circle cx="178" cy="122" r="4.5" fill="#0F172A" />
    <circle cx="176" cy="120" r="1.5" fill="#FFFFFF" />

    {/* Eyebrows */}
    <path d="M133 103 Q142 98 151 102" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M169 102 Q178 98 187 103" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />

    {/* Rosy Cheeks */}
    <circle cx="127" cy="132" r="6" fill="#FCA5A5" opacity="0.6" />
    <circle cx="193" cy="132" r="6" fill="#FCA5A5" opacity="0.6" />

    {/* Cheerful Smile */}
    <path d="M150 138 Q160 148 170 138" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" fill="none" />

    {/* Right Arm holding Giant Magnifying Glass */}
    <path
      d="M195 185 C220 195 235 185 245 165"
      stroke="#0F172A"
      strokeWidth="3.5"
      strokeLinecap="round"
    />
    {/* Magnifying Glass */}
    <g transform="translate(195, 80) rotate(-15)">
      {/* Handle */}
      <rect x="42" y="80" width="12" height="40" rx="4" fill="#B45309" stroke="#0F172A" strokeWidth="2.5" />
      {/* Rim */}
      <circle cx="48" cy="50" r="32" fill="#E0F2FE" fillOpacity="0.75" stroke="#0F172A" strokeWidth="4" />
      {/* Glass Glare */}
      <path d="M30 40 A22 22 0 0 1 66 40" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.9" />
      {/* Sparkle inside lens */}
      <path d="M48 42 L50 48 L56 50 L50 52 L48 58 L46 52 L40 50 L46 48 Z" fill="#F59E0B" />
    </g>
  </svg>
);

// 2. VeriUrl: Veri pointing at the URL address bar
export const VeriUrl: React.FC<SketchProps> = ({ width = 160, height = 160, className = '' }) => (
  <svg
    viewBox="0 0 200 200"
    width={width}
    height={height}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`veri-mascot-sketch ${className}`}
  >
    {/* Ground */}
    <ellipse cx="100" cy="185" rx="55" ry="8" fill="#E2E8F0" opacity="0.6" />

    {/* Body */}
    <path d="M75 110 C68 130 72 165 78 175 L122 175 C128 165 132 130 125 110 Z" fill="#3B82F6" stroke="#0F172A" strokeWidth="3" />
    <rect x="85" y="175" width="12" height="10" rx="2" fill="#0F172A" />
    <rect x="105" y="175" width="12" height="10" rx="2" fill="#0F172A" />

    {/* Head */}
    <circle cx="100" cy="70" r="34" fill="#FEF3C7" stroke="#0F172A" strokeWidth="3" />
    {/* Cap */}
    <path d="M72 50 C76 30 124 30 128 50 Z" fill="#F59E0B" stroke="#0F172A" strokeWidth="3" />
    <path d="M66 50 Q100 45 134 50" stroke="#0F172A" strokeWidth="3.5" strokeLinecap="round" />

    {/* Glasses & Face */}
    <circle cx="89" cy="72" r="10" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.5" />
    <circle cx="111" cy="72" r="10" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.5" />
    <line x1="99" y1="72" x2="101" y2="72" stroke="#0F172A" strokeWidth="2.5" />
    <circle cx="89" cy="72" r="3" fill="#0F172A" />
    <circle cx="111" cy="72" r="3" fill="#0F172A" />
    <path d="M94 84 Q100 90 106 84" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" fill="none" />

    {/* Pointing Arm pointing UP-RIGHT */}
    <path d="M125 115 C145 105 155 85 168 65" stroke="#0F172A" strokeWidth="3.5" strokeLinecap="round" />
    <circle cx="170" cy="62" r="5" fill="#FEF3C7" stroke="#0F172A" strokeWidth="2.5" />
    {/* Little globe icon near finger */}
    <g transform="translate(165, 30)">
      <circle cx="14" cy="14" r="12" fill="#EFF6FF" stroke="#2563EB" strokeWidth="2" />
      <ellipse cx="14" cy="14" rx="5" ry="12" stroke="#2563EB" strokeWidth="1.5" fill="none" />
      <line x1="2" y1="14" x2="26" y2="14" stroke="#2563EB" strokeWidth="1.5" />
    </g>
  </svg>
);

// 3. VeriVoice: Veri wearing headphones and speaking into a mic
export const VeriVoice: React.FC<SketchProps> = ({ width = 160, height = 160, className = '' }) => (
  <svg
    viewBox="0 0 200 200"
    width={width}
    height={height}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`veri-mascot-sketch ${className}`}
  >
    {/* Ground */}
    <ellipse cx="100" cy="185" rx="55" ry="8" fill="#E2E8F0" opacity="0.6" />

    {/* Body */}
    <path d="M75 115 C70 135 72 165 78 175 L122 175 C128 165 130 135 125 115 Z" fill="#3B82F6" stroke="#0F172A" strokeWidth="3" />
    <rect x="85" y="175" width="12" height="10" rx="2" fill="#0F172A" />
    <rect x="105" y="175" width="12" height="10" rx="2" fill="#0F172A" />

    {/* Head */}
    <circle cx="100" cy="72" r="34" fill="#FEF3C7" stroke="#0F172A" strokeWidth="3" />

    {/* Headphones over ears */}
    <path d="M66 70 C66 38 134 38 134 70" stroke="#0F172A" strokeWidth="4" strokeLinecap="round" fill="none" />
    <rect x="62" y="60" width="10" height="24" rx="5" fill="#F59E0B" stroke="#0F172A" strokeWidth="2.5" />
    <rect x="128" y="60" width="10" height="24" rx="5" fill="#F59E0B" stroke="#0F172A" strokeWidth="2.5" />

    {/* Eyes & Big Talking Mouth */}
    <circle cx="89" cy="70" r="10" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.5" />
    <circle cx="111" cy="70" r="10" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.5" />
    <line x1="99" y1="70" x2="101" y2="70" stroke="#0F172A" strokeWidth="2.5" />
    <circle cx="90" cy="69" r="3" fill="#0F172A" />
    <circle cx="112" cy="69" r="3" fill="#0F172A" />
    {/* Open talking smile */}
    <path d="M92 84 Q100 96 108 84 Z" fill="#DC2626" stroke="#0F172A" strokeWidth="2.5" />

    {/* Microphone Stand & Soundwaves */}
    <g transform="translate(130, 85)">
      <rect x="10" y="15" width="12" height="20" rx="6" fill="#475569" stroke="#0F172A" strokeWidth="2" />
      <path d="M6 25 Q6 37 16 37 Q26 37 26 25" stroke="#0F172A" strokeWidth="2.5" fill="none" />
      <line x1="16" y1="37" x2="16" y2="52" stroke="#0F172A" strokeWidth="2.5" />
      <ellipse cx="16" cy="54" rx="10" ry="3" fill="#0F172A" />
      {/* Soundwaves */}
      <path d="M-2 15 Q-6 22 -2 29" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M-8 10 Q-14 22 -8 34" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />
    </g>
  </svg>
);

// 4. VeriInspect: Veri looking intently through a magnifying glass at a green check
export const VeriInspect: React.FC<SketchProps> = ({ width = 160, height = 160, className = '' }) => (
  <svg
    viewBox="0 0 200 200"
    width={width}
    height={height}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`veri-mascot-sketch ${className}`}
  >
    {/* Ground */}
    <ellipse cx="100" cy="185" rx="55" ry="8" fill="#E2E8F0" opacity="0.6" />

    {/* Body */}
    <path d="M75 110 C70 130 72 165 78 175 L122 175 C128 165 130 130 125 110 Z" fill="#3B82F6" stroke="#0F172A" strokeWidth="3" />
    <rect x="85" y="175" width="12" height="10" rx="2" fill="#0F172A" />
    <rect x="105" y="175" width="12" height="10" rx="2" fill="#0F172A" />

    {/* Head */}
    <circle cx="95" cy="70" r="32" fill="#FEF3C7" stroke="#0F172A" strokeWidth="3" />
    {/* Cap */}
    <path d="M68 50 C72 32 118 32 122 50 Z" fill="#F59E0B" stroke="#0F172A" strokeWidth="3" />
    <path d="M62 50 Q95 45 128 50" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />

    {/* Eye wide open looking through glass */}
    <circle cx="85" cy="70" r="8" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2" />
    <circle cx="85" cy="70" r="3" fill="#0F172A" />

    {/* Giant Magnifying Glass held in front of second eye */}
    <circle cx="120" cy="72" r="24" fill="#ECFDF5" stroke="#0F172A" strokeWidth="3.5" />
    <circle cx="120" cy="72" r="9" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.5" />
    <circle cx="120" cy="72" r="4.5" fill="#0F172A" />
    <circle cx="118" cy="70" r="1.5" fill="#FFFFFF" />
    {/* Green check mark magnified inside */}
    <path d="M128 62 L132 66 L138 58" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    {/* Magnifier handle */}
    <rect x="135" y="88" width="8" height="25" rx="3" fill="#B45309" stroke="#0F172A" strokeWidth="2" transform="rotate(-30 135 88)" />

    <path d="M85 85 Q92 92 100 86" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
  </svg>
);

// 5. VeriSuccess: Veri celebrating with green checkmark banner
export const VeriSuccess: React.FC<SketchProps> = ({ width = 140, height = 140, className = '' }) => (
  <svg
    viewBox="0 0 160 160"
    width={width}
    height={height}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`veri-mascot-sketch ${className}`}
  >
    {/* Confetti stars */}
    <path d="M25 35 L28 40 L34 41 L29 45 L31 51 L25 47 L19 51 L21 45 L16 41 L22 40 Z" fill="#F59E0B" />
    <path d="M135 30 L137 34 L142 35 L138 38 L140 43 L135 40 L130 43 L132 38 L128 35 L133 34 Z" fill="#3B82F6" />
    <circle cx="35" cy="80" r="3" fill="#10B981" />
    <circle cx="130" cy="95" r="4" fill="#F59E0B" />

    {/* Body */}
    <path d="M60 95 C55 115 58 135 62 145 L98 145 C102 135 105 115 100 95 Z" fill="#3B82F6" stroke="#0F172A" strokeWidth="2.5" />
    <rect x="68" y="145" width="10" height="8" rx="2" fill="#0F172A" />
    <rect x="84" y="145" width="10" height="8" rx="2" fill="#0F172A" />

    {/* Head */}
    <circle cx="80" cy="60" r="28" fill="#FEF3C7" stroke="#0F172A" strokeWidth="2.5" />
    {/* Cap */}
    <path d="M56 42 C60 26 100 26 104 42 Z" fill="#F59E0B" stroke="#0F172A" strokeWidth="2.5" />
    <path d="M52 42 Q80 38 108 42" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />

    {/* Happy closed arched eyes (^_^) */}
    <path d="M68 60 Q73 54 78 60" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <path d="M84 60 Q89 54 94 60" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    {/* Big happy mouth */}
    <path d="M72 68 Q80 80 88 68 Z" fill="#DC2626" stroke="#0F172A" strokeWidth="2" />

    {/* Raised Arms holding Check Banner */}
    <path d="M60 100 C45 85 40 60 52 48" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
    <path d="M100 100 C115 85 120 60 108 48" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />

    {/* Green Badge held high */}
    <circle cx="80" cy="20" r="14" fill="#10B981" stroke="#0F172A" strokeWidth="2.5" />
    <path d="M74 20 L78 24 L86 16" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 6. VeriEmpty: Veri resting with a warm tea mug waiting for URL input
export const VeriEmpty: React.FC<SketchProps> = ({ width = 180, height = 180, className = '' }) => (
  <svg
    viewBox="0 0 200 200"
    width={width}
    height={height}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`veri-mascot-sketch ${className}`}
  >
    {/* Ground */}
    <ellipse cx="100" cy="180" rx="70" ry="8" fill="#E2E8F0" opacity="0.6" />

    {/* Small Desk */}
    <rect x="50" y="145" width="100" height="8" rx="2" fill="#E2E8F0" stroke="#0F172A" strokeWidth="2.5" />
    <line x1="60" y1="153" x2="60" y2="180" stroke="#0F172A" strokeWidth="2.5" />
    <line x1="140" y1="153" x2="140" y2="180" stroke="#0F172A" strokeWidth="2.5" />

    {/* Tea Mug with Steam */}
    <rect x="68" y="130" width="16" height="16" rx="3" fill="#F59E0B" stroke="#0F172A" strokeWidth="2" />
    <path d="M84 134 Q90 138 84 142" stroke="#0F172A" strokeWidth="2" fill="none" />
    <path d="M74 125 Q76 120 74 116" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    <path d="M78 126 Q80 121 78 117" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" fill="none" />

    {/* Open Laptop */}
    <polygon points="105,145 135,145 130,125 110,125" fill="#3B82F6" stroke="#0F172A" strokeWidth="2" />
    <line x1="100" y1="145" x2="140" y2="145" stroke="#0F172A" strokeWidth="2.5" />

    {/* Veri Behind Desk */}
    <path d="M85 115 C80 128 82 145 85 145 L125 145 C128 145 130 128 125 115 Z" fill="#3B82F6" stroke="#0F172A" strokeWidth="2.5" />
    <circle cx="105" cy="85" r="28" fill="#FEF3C7" stroke="#0F172A" strokeWidth="2.5" />
    <path d="M80 68 C84 52 126 52 130 68 Z" fill="#F59E0B" stroke="#0F172A" strokeWidth="2.5" />
    <path d="M76 68 Q105 64 134 68" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />

    {/* Thoughtful Eyes looking at laptop */}
    <circle cx="97" cy="88" r="8" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2" />
    <circle cx="115" cy="88" r="8" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2" />
    <circle cx="99" cy="90" r="3" fill="#0F172A" />
    <circle cx="117" cy="90" r="3" fill="#0F172A" />
    <path d="M103 100 Q108 104 113 100" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" fill="none" />
  </svg>
);

// 7. VeriLogoBadge: Compact, memorable mascot face badge for brand logo and headers
export const VeriLogoBadge: React.FC<{ size?: number | string; className?: string }> = ({
  size = 34,
  className = '',
}) => (
  <svg
    viewBox="0 0 100 100"
    width={size}
    height={size}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`veri-logo-badge ${className}`}
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
  >
    <defs>
      <linearGradient id="logoBadgeCap" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FBBF24" />
        <stop offset="100%" stopColor="#F59E0B" />
      </linearGradient>
      <linearGradient id="logoBadgeSweater" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3B82F6" />
        <stop offset="100%" stopColor="#1D4ED8" />
      </linearGradient>
    </defs>

    {/* Circular Badge Container */}
    <circle cx="50" cy="50" r="47" fill="#FEF3C7" stroke="#0F172A" strokeWidth="3.5" />

    {/* Blue Sweater Base */}
    <path
      d="M20 84 C25 68 75 68 80 84 C72 95 28 95 20 84 Z"
      fill="url(#logoBadgeSweater)"
      stroke="#0F172A"
      strokeWidth="3"
    />
    <path d="M40 72 Q50 80 60 72" stroke="#FBBF24" strokeWidth="3" fill="none" strokeLinecap="round" />

    {/* Head */}
    <circle cx="50" cy="46" r="26" fill="#FEF3C7" stroke="#0F172A" strokeWidth="3" />

    {/* Hair curls */}
    <path d="M25 45 C23 38 27 34 32 32" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M75 45 C77 38 73 34 68 32" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />

    {/* Amber Scout Cap */}
    <path
      d="M30 30 C33 14 67 14 70 30 Z"
      fill="url(#logoBadgeCap)"
      stroke="#0F172A"
      strokeWidth="3"
    />
    <path d="M22 31 Q50 25 78 31" stroke="#0F172A" strokeWidth="3.5" strokeLinecap="round" />
    <circle cx="50" cy="21" r="3.5" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.5" />

    {/* Round Spectacles */}
    <circle cx="41" cy="47" r="7.5" fill="#FFFFFF" fillOpacity="0.9" stroke="#0F172A" strokeWidth="2.5" />
    <circle cx="59" cy="47" r="7.5" fill="#FFFFFF" fillOpacity="0.9" stroke="#0F172A" strokeWidth="2.5" />
    <line x1="48.5" y1="47" x2="51.5" y2="47" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />

    {/* Eyes */}
    <circle cx="42" cy="47" r="2.5" fill="#0F172A" />
    <circle cx="60" cy="47" r="2.5" fill="#0F172A" />
    <circle cx="43" cy="46" r="0.8" fill="#FFFFFF" />
    <circle cx="61" cy="46" r="0.8" fill="#FFFFFF" />

    {/* Rosy Cheeks */}
    <ellipse cx="32" cy="53" rx="3.5" ry="2" fill="#FCA5A5" opacity="0.6" />
    <ellipse cx="68" cy="53" rx="3.5" ry="2" fill="#FCA5A5" opacity="0.6" />

    {/* Smile */}
    <path d="M46 56 Q50 61 54 56" stroke="#0F172A" strokeWidth="2.2" strokeLinecap="round" fill="none" />
  </svg>
);

// 8. VeriWaving: Charming full-body mascot waving enthusiastically for the landing entrance animation
export const VeriWaving: React.FC<SketchProps> = ({ width = 240, height = 240, className = '' }) => (
  <svg
    viewBox="0 0 240 240"
    width={width}
    height={height}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`veri-mascot-waving ${className}`}
  >
    <defs>
      <linearGradient id="waveBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3B82F6" />
        <stop offset="100%" stopColor="#1D4ED8" />
      </linearGradient>
      <linearGradient id="waveAmberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FBBF24" />
        <stop offset="100%" stopColor="#F59E0B" />
      </linearGradient>
    </defs>

    {/* Ground Shadow */}
    <ellipse cx="120" cy="225" rx="65" ry="9" fill="#E2E8F0" opacity="0.7" />

    {/* Left Arm at Side */}
    <path d="M95 135 C80 150 78 175 85 185" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
    <circle cx="85" cy="188" r="6" fill="#FEF3C7" stroke="#0F172A" strokeWidth="2.5" />

    {/* Animated Right Arm Waving Hand */}
    <g className="veri-waving-arm-group" style={{ transformOrigin: '145px 135px' }}>
      <path d="M145 135 C165 125 180 95 175 75" stroke="#0F172A" strokeWidth="3.5" strokeLinecap="round" />
      {/* Waving Palm */}
      <circle cx="176" cy="68" r="9" fill="#FEF3C7" stroke="#0F172A" strokeWidth="2.8" />
      {/* Fingers */}
      <path d="M172 60 L172 53" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M176 59 L178 51" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M181 60 L184 54" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
      {/* Waving Motion lines */}
      <path d="M192 60 Q196 68 192 76" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M197 58 Q202 68 197 78" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" fill="none" />
    </g>

    {/* Body / Cobalt Sweater */}
    <path
      d="M90 130 C82 155 86 200 95 215 L145 215 C154 200 158 155 150 130 Z"
      fill="url(#waveBlueGrad)"
      stroke="#0F172A"
      strokeWidth="3.5"
      strokeLinejoin="round"
    />
    {/* Yellow Collar */}
    <path d="M105 130 Q120 142 135 130" stroke="#FBBF24" strokeWidth="3.5" strokeLinecap="round" fill="none" />

    {/* Legs / Boots */}
    <rect x="100" y="215" width="16" height="12" rx="3" fill="#0F172A" />
    <rect x="124" y="215" width="16" height="12" rx="3" fill="#0F172A" />

    {/* Head */}
    <circle cx="120" cy="85" r="38" fill="#FEF3C7" stroke="#0F172A" strokeWidth="3.5" />

    {/* Hair curls */}
    <path d="M86 78 Q90 52 120 52 Q150 52 154 78" fill="#0F172A" stroke="#0F172A" strokeWidth="3" />
    <path d="M82 85 C80 70 85 66 93 62" stroke="#0F172A" strokeWidth="2.8" strokeLinecap="round" />
    <path d="M158 85 C160 70 155 66 147 62" stroke="#0F172A" strokeWidth="2.8" strokeLinecap="round" />

    {/* Amber Cap with White Star */}
    <path
      d="M90 58 C94 36 146 36 150 58 Z"
      fill="url(#waveAmberGrad)"
      stroke="#0F172A"
      strokeWidth="3.2"
    />
    <path d="M80 58 Q120 52 160 58" stroke="#0F172A" strokeWidth="3.8" strokeLinecap="round" />
    <circle cx="120" cy="45" r="4.5" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.5" />

    {/* Round Glasses */}
    <circle cx="106" cy="86" r="11" fill="#FFFFFF" fillOpacity="0.85" stroke="#0F172A" strokeWidth="2.8" />
    <circle cx="134" cy="86" r="11" fill="#FFFFFF" fillOpacity="0.85" stroke="#0F172A" strokeWidth="2.8" />
    <line x1="117" y1="86" x2="123" y2="86" stroke="#0F172A" strokeWidth="2.8" strokeLinecap="round" />

    {/* Big Happy Eyes (^_^) */}
    <path d="M101 86 Q106 80 111 86" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <path d="M129 86 Q134 80 139 86" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" fill="none" />

    {/* Rosy Cheeks */}
    <ellipse cx="96" cy="94" rx="5" ry="3" fill="#FCA5A5" opacity="0.65" />
    <ellipse cx="144" cy="94" rx="5" ry="3" fill="#FCA5A5" opacity="0.65" />

    {/* Big Joyful Open Smile */}
    <path d="M112 95 Q120 108 128 95 Z" fill="#DC2626" stroke="#0F172A" strokeWidth="2" />
  </svg>
);

// 8. VeriBrandLogo: Creative brand logo combining Veri the mascot with the Veriflow wordmark
export const VeriBrandLogo: React.FC<{ size?: number; showBadge?: boolean; className?: string }> = ({
  size = 36,
  showBadge = true,
  className = '',
}) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.65rem',
      textDecoration: 'none',
      userSelect: 'none',
    }}
    className={`veri-brand-logo-group ${className}`}
  >
    {/* Mascot Icon Container */}
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: 'var(--bg-lavender-subtle, #f5f3ff)',
        border: '1.5px solid var(--border-ink, #0f172a)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        boxShadow: '0 2px 0 var(--border-ink, #0f172a)',
        flexShrink: 0,
        transition: 'transform 0.15s ease',
      }}
    >
      <svg viewBox="0 0 100 100" width={size * 1.15} height={size * 1.15} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="logoAmber" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>
        {/* Face */}
        <circle cx="50" cy="55" r="32" fill="#FEF3C7" stroke="#0F172A" strokeWidth="3.5" />
        {/* Cap */}
        <path d="M22 36 C26 14 74 14 78 36 Z" fill="url(#logoAmber)" stroke="#0F172A" strokeWidth="3" />
        <path d="M16 36 Q50 30 84 36" stroke="#0F172A" strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="50" cy="24" r="3.5" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.5" />
        {/* Round Inspector Glasses */}
        <circle cx="38" cy="54" r="9" fill="#FFFFFF" fillOpacity="0.85" stroke="#0F172A" strokeWidth="2.5" />
        <circle cx="62" cy="54" r="9" fill="#FFFFFF" fillOpacity="0.85" stroke="#0F172A" strokeWidth="2.5" />
        <line x1="47" y1="54" x2="53" y2="54" stroke="#0F172A" strokeWidth="2.5" />
        {/* Happy Eyes */}
        <path d="M34 54 Q38 49 42 54" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M58 54 Q62 49 66 54" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Cheeks */}
        <circle cx="28" cy="61" r="3" fill="#FCA5A5" opacity="0.8" />
        <circle cx="72" cy="61" r="3" fill="#FCA5A5" opacity="0.8" />
        {/* Smile */}
        <path d="M44 63 Q50 72 56 63" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      </svg>
    </div>

    {/* Brand Wordmark & Tagline */}
    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.05 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        <span
          style={{
            fontFamily: 'var(--font-heading, "Outfit", sans-serif)',
            fontSize: '1.28rem',
            fontWeight: 900,
            letterSpacing: '-0.035em',
            color: 'var(--text-ink, #0f172a)',
          }}
        >
          Veriflow
        </span>
        {showBadge && (
          <span
            style={{
              fontSize: '0.62rem',
              fontWeight: 800,
              padding: '0.12rem 0.4rem',
              borderRadius: 'var(--radius-pill, 9999px)',
              backgroundColor: 'var(--bg-lavender-subtle, #ede9fe)',
              color: 'var(--bg-lavender-deep, #6d28d9)',
              border: '1px solid var(--border-hairline, rgba(0,0,0,0.1))',
              letterSpacing: '0.04em',
            }}
          >
            AI SCOUT
          </span>
        )}
      </div>
      <span
        style={{
          fontSize: '0.62rem',
          fontWeight: 700,
          color: 'var(--text-muted, #64748b)',
          letterSpacing: '0.07em',
          textTransform: 'uppercase',
          marginTop: '0.15rem',
        }}
      >
        Voice Browser Testing
      </span>
    </div>
  </div>
);

