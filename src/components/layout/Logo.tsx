export function Logo() {
  return (
    <div className="relative flex items-center justify-center">
      <svg width="76" height="76" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <clipPath id="circleClip">
            <circle cx="100" cy="100" r="100" />
          </clipPath>
          <linearGradient id="chrome" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#f0f0f0" />
            <stop offset="20%" stop-color="#ffffff" />
            <stop offset="40%" stop-color="#c0c0c0" />
            <stop offset="55%" stop-color="#e8e8e8" />
            <stop offset="75%" stop-color="#909090" />
            <stop offset="100%" stop-color="#b0b0b0" />
          </linearGradient>
          <linearGradient id="goldEdge" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#D4AF37" />
            <stop offset="25%" stop-color="#FFD700" />
            <stop offset="50%" stop-color="#FFF8DC" />
            <stop offset="75%" stop-color="#FFD700" />
            <stop offset="100%" stop-color="#B8860B" />
          </linearGradient>
          <radialGradient id="earth" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stop-color="#2dd4bf" />
            <stop offset="20%" stop-color="#0ea5e9" />
            <stop offset="45%" stop-color="#0284c7" />
            <stop offset="70%" stop-color="#0369a1" />
            <stop offset="90%" stop-color="#075985" />
            <stop offset="100%" stop-color="#082f49" />
          </radialGradient>
          <radialGradient id="space" cx="50%" cy="50%" r="50%">
            <stop offset="60%" stop-color="#0a1628" />
            <stop offset="85%" stop-color="#060e1a" />
            <stop offset="100%" stop-color="#02040a" />
          </radialGradient>
          <radialGradient id="flare" cx="30%" cy="22%" r="35%">
            <stop offset="0%" stop-color="rgba(255,255,255,0.45)" />
            <stop offset="30%" stop-color="rgba(255,200,100,0.1)" />
            <stop offset="60%" stop-color="rgba(100,180,255,0.04)" />
            <stop offset="100%" stop-color="rgba(255,255,255,0)" />
          </radialGradient>
          <radialGradient id="earthGlow" cx="30%" cy="25%" r="40%">
            <stop offset="0%" stop-color="rgba(255,255,255,0.12)" />
            <stop offset="50%" stop-color="rgba(255,255,255,0.03)" />
            <stop offset="100%" stop-color="rgba(255,255,255,0)" />
          </radialGradient>
          <filter id="textShadow">
            <feDropShadow dx="0" dy="2" stdDeviation="1.5" flood-color="rgba(0,0,0,0.5)" />
          </filter>
          <filter id="textShadowSub">
            <feDropShadow dx="0" dy="1.5" stdDeviation="1" flood-color="rgba(0,0,0,0.5)" />
          </filter>
          <filter id="svgGlow">
            <feDropShadow dx="0" dy="4" stdDeviation="12" flood-color="rgba(124,92,252,0.4)" />
            <feDropShadow dx="0" dy="0" stdDeviation="20" flood-color="rgba(236,72,153,0.2)" />
          </filter>
        </defs>

        <g clip-path="url(#circleClip)">
          <circle cx="100" cy="100" r="100" fill="url(#space)" />

          <circle cx="15" cy="12" r="0.7" fill="rgba(255,255,255,0.7)" />
          <circle cx="185" cy="20" r="0.5" fill="rgba(255,255,255,0.5)" />
          <circle cx="160" cy="8" r="1" fill="rgba(255,255,255,0.9)" />
          <circle cx="35" cy="30" r="0.4" fill="rgba(255,255,255,0.4)" />
          <circle cx="175" cy="45" r="0.6" fill="rgba(255,255,255,0.6)" />
          <circle cx="10" cy="55" r="0.8" fill="rgba(255,255,255,0.8)" />
          <circle cx="190" cy="70" r="0.45" fill="rgba(255,255,255,0.45)" />
          <circle cx="20" cy="95" r="0.5" fill="rgba(255,255,255,0.5)" />
          <circle cx="180" cy="110" r="0.7" fill="rgba(255,255,255,0.7)" />
          <circle cx="8" cy="130" r="0.4" fill="rgba(255,255,255,0.4)" />
          <circle cx="192" cy="145" r="0.6" fill="rgba(255,255,255,0.6)" />
          <circle cx="25" cy="160" r="0.5" fill="rgba(255,255,255,0.5)" />
          <circle cx="170" cy="175" r="0.8" fill="rgba(255,255,255,0.8)" />
          <circle cx="45" cy="185" r="0.4" fill="rgba(255,255,255,0.4)" />
          <circle cx="140" cy="190" r="0.6" fill="rgba(255,255,255,0.6)" />
          <circle cx="80" cy="5" r="0.5" fill="rgba(255,255,255,0.5)" />
          <circle cx="120" cy="195" r="0.5" fill="rgba(255,255,255,0.5)" />
          <circle cx="60" cy="195" r="0.3" fill="rgba(255,255,255,0.3)" />
          <circle cx="150" cy="3" r="0.4" fill="rgba(255,255,255,0.4)" />

          <ellipse cx="165" cy="160" rx="55" ry="30" fill="rgba(30,90,180,0.06)" transform="rotate(-25 165 160)" />
          <ellipse cx="35" cy="40" rx="45" ry="25" fill="rgba(60,40,160,0.05)" transform="rotate(15 35 40)" />

          <circle cx="100" cy="100" r="110" fill="url(#earth)" />

          <path d="M 72,70 Q 77,64 82,66 Q 88,68 90,74 Q 93,82 91,90 Q 89,96 85,100 Q 81,104 78,110 Q 76,106 74,98 Q 71,88 72,78 Z" fill="rgba(34,139,34,0.4)" />
          <path d="M 78,66 Q 84,60 88,62 Q 92,64 90,70 Q 85,72 81,70 Z" fill="rgba(34,139,34,0.35)" />

          <path d="M 82,112 Q 86,108 88,114 Q 90,120 89,126 Q 87,132 84,138 Q 82,142 80,140 Q 78,134 79,126 Q 80,118 82,112 Z" fill="rgba(34,139,34,0.35)" />

          <path d="M 110,68 Q 115,66 119,70 Q 122,74 120,82 Q 118,90 116,98 Q 114,110 112,118 Q 110,122 108,120 Q 107,114 108,104 Q 109,92 110,80 Z" fill="rgba(34,139,34,0.3)" />
          <path d="M 118,64 Q 123,62 127,66 Q 128,70 124,74 Q 120,72 118,68 Z" fill="rgba(34,139,34,0.25)" />

          <path d="M 75,74 Q 80,70 84,72 Q 86,76 84,80 Q 80,78 76,76 Z" fill="rgba(160,120,60,0.25)" />
          <path d="M 85,116 Q 88,112 90,116 Q 89,120 86,122 Z" fill="rgba(160,120,60,0.2)" />

          <circle cx="76" cy="82" r="1.2" fill="#FFD700" opacity="0.85" />
          <circle cx="80" cy="86" r="0.8" fill="#FFD700" opacity="0.6" />
          <circle cx="74" cy="90" r="1" fill="#FFD700" opacity="0.7" />
          <circle cx="78" cy="94" r="0.6" fill="#FFD700" opacity="0.5" />
          <circle cx="82" cy="80" r="0.7" fill="#FFD700" opacity="0.6" />
          <circle cx="84" cy="88" r="0.9" fill="#FFD700" opacity="0.7" />
          <circle cx="86" cy="92" r="0.5" fill="#FFD700" opacity="0.5" />
          <circle cx="72" cy="96" r="0.7" fill="#FFD700" opacity="0.6" />
          <circle cx="84" cy="118" r="0.8" fill="#FFD700" opacity="0.7" />
          <circle cx="88" cy="122" r="0.5" fill="#FFD700" opacity="0.5" />
          <circle cx="86" cy="126" r="0.6" fill="#FFD700" opacity="0.6" />
          <circle cx="82" cy="130" r="0.5" fill="#FFD700" opacity="0.5" />
          <circle cx="114" cy="100" r="0.9" fill="#FFD700" opacity="0.7" />
          <circle cx="116" cy="104" r="0.6" fill="#FFD700" opacity="0.5" />
          <circle cx="118" cy="96" r="0.7" fill="#FFD700" opacity="0.6" />
          <circle cx="112" cy="108" r="0.5" fill="#FFD700" opacity="0.4" />

          <circle cx="100" cy="100" r="110" fill="url(#earthGlow)" />
          <ellipse cx="84" cy="82" rx="16" ry="20" fill="rgba(255,255,255,0.05)" transform="rotate(-15 84 82)" />

          <circle cx="100" cy="100" r="110" fill="url(#flare)" />
          <circle cx="68" cy="67" r="2.5" fill="rgba(255,255,255,0.55)" />
          <circle cx="68" cy="67" r="6" fill="rgba(255,200,100,0.12)" />
          <circle cx="68" cy="67" r="12" fill="rgba(255,200,100,0.04)" />
          <ellipse cx="58" cy="60" rx="15" ry="1.5" fill="rgba(255,200,100,0.08)" transform="rotate(-30 58 60)" />

          <text x="100" y="116" text-anchor="middle" font-family="Inter, sans-serif" font-size="34" font-weight="900" fill="url(#chrome)" filter="url(#textShadow)">GLAMOURS</text>
          <text x="100" y="116" text-anchor="middle" font-family="Inter, sans-serif" font-size="34" font-weight="900" fill="none" stroke="url(#goldEdge)" stroke-width="1.5">GLAMOURS</text>

          <text x="100" y="175" text-anchor="middle" font-family="Inter, sans-serif" font-size="14" font-weight="700" fill="url(#chrome)" filter="url(#textShadowSub)">MULTIMARCA</text>
          <text x="100" y="175" text-anchor="middle" font-family="Inter, sans-serif" font-size="14" font-weight="700" fill="none" stroke="url(#goldEdge)" stroke-width="1">MULTIMARCA</text>
        </g>
      </svg>
    </div>
  )
}
