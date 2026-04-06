'use client';

import type { DesignFamily } from '@/lib/templates/types';

interface SectionDividerProps {
  family: DesignFamily;
  accentColor: string;
  bgColor: string;
  nextBgColor: string;
  flip?: boolean;
  className?: string;
}

export default function SectionDivider({
  family,
  accentColor,
  bgColor,
  nextBgColor,
  flip = false,
  className = '',
}: SectionDividerProps) {
  const wrapperStyle: React.CSSProperties = {
    position: 'relative',
    zIndex: 10,
    marginTop: '-1px',
    width: '100%',
    lineHeight: 0,
    transform: flip ? 'scaleY(-1)' : undefined,
  };

  const svgStyle: React.CSSProperties = {
    width: '100%',
    height: 'auto',
    display: 'block',
  };

  switch (family) {
    // ── 1. Opulent: Elegant S-curve ──────────────────────────────────────
    case 'opulent':
      return (
        <div style={wrapperStyle} className={className}>
          <svg
            viewBox="0 0 1440 80"
            preserveAspectRatio="none"
            style={svgStyle}
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="1440" height="80" fill={nextBgColor} />
            <path
              d="M0,0 L0,40 C180,80 360,0 540,40 C720,80 900,0 1080,40 C1260,80 1380,20 1440,40 L1440,0 Z"
              fill={bgColor}
            />
            <path
              d="M0,38 C180,78 360,-2 540,38 C720,78 900,-2 1080,38 C1260,78 1380,18 1440,38"
              fill="none"
              stroke={accentColor}
              strokeWidth="1.5"
              strokeOpacity="0.5"
            />
          </svg>
        </div>
      );

    // ── 2. Ethereal: No divider ──────────────────────────────────────────
    case 'ethereal':
      return null;

    // ── 3. Tropical: Organic multi-layered wave ──────────────────────────
    case 'tropical':
      return (
        <div style={wrapperStyle} className={className}>
          <svg
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
            style={svgStyle}
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="1440" height="120" fill={nextBgColor} />
            <path
              d="M0,0 L0,60 C120,100 240,20 360,60 C480,100 600,20 720,60 C840,100 960,20 1080,60 C1200,100 1320,20 1440,60 L1440,0 Z"
              fill={accentColor}
              opacity="0.3"
            />
            <path
              d="M0,0 L0,50 C160,90 320,10 480,50 C640,90 800,10 960,50 C1120,90 1280,10 1440,50 L1440,0 Z"
              fill={accentColor}
              opacity="0.6"
            />
            <path
              d="M0,0 L0,40 C200,80 400,0 600,40 C800,80 1000,0 1200,40 C1350,70 1400,20 1440,40 L1440,0 Z"
              fill={bgColor}
            />
          </svg>
        </div>
      );

    // ── 4. Brutalist: Sharp diagonal ─────────────────────────────────────
    case 'brutalist':
      return (
        <div style={wrapperStyle} className={className}>
          <svg
            viewBox="0 0 1440 60"
            preserveAspectRatio="none"
            style={svgStyle}
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="1440" height="60" fill={nextBgColor} />
            <polygon points="0,0 1440,0 1440,40 0,0" fill={bgColor} />
          </svg>
        </div>
      );

    // ── 5. Heritage: Ornamental line with centered diamond ───────────────
    case 'heritage':
      return (
        <div style={wrapperStyle} className={className}>
          <svg
            viewBox="0 0 1440 40"
            preserveAspectRatio="none"
            style={svgStyle}
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="1440" height="40" fill={nextBgColor} />
            {/* Top half background fill */}
            <rect width="1440" height="20" fill={bgColor} />
            {/* Left line */}
            <line
              x1="120"
              y1="20"
              x2="680"
              y2="20"
              stroke={accentColor}
              strokeWidth="1"
              strokeOpacity="0.7"
            />
            {/* Right line */}
            <line
              x1="760"
              y1="20"
              x2="1320"
              y2="20"
              stroke={accentColor}
              strokeWidth="1"
              strokeOpacity="0.7"
            />
            {/* Centered diamond */}
            <polygon
              points="720,10 732,20 720,30 708,20"
              fill={accentColor}
            />
            {/* Small decorative dots */}
            <circle cx="680" cy="20" r="2" fill={accentColor} opacity="0.5" />
            <circle cx="760" cy="20" r="2" fill={accentColor} opacity="0.5" />
            <circle cx="120" cy="20" r="1.5" fill={accentColor} opacity="0.3" />
            <circle cx="1320" cy="20" r="1.5" fill={accentColor} opacity="0.3" />
          </svg>
        </div>
      );

    // ── 6. Deco: Chevron / zigzag pattern ────────────────────────────────
    case 'deco': {
      const chevronCount = 18;
      const segmentWidth = 1440 / chevronCount;
      let chevronPath = 'M0,0 L0,0 ';
      for (let i = 0; i < chevronCount; i++) {
        const xLeft = i * segmentWidth;
        const xMid = xLeft + segmentWidth / 2;
        const xRight = xLeft + segmentWidth;
        chevronPath += `L${xMid},50 L${xRight},0 `;
      }
      chevronPath += 'L1440,0 Z';

      return (
        <div style={wrapperStyle} className={className}>
          <svg
            viewBox="0 0 1440 60"
            preserveAspectRatio="none"
            style={svgStyle}
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="1440" height="60" fill={nextBgColor} />
            <path d={chevronPath} fill={bgColor} />
            {/* Accent stroke chevrons, offset slightly */}
            <path
              d={chevronPath}
              fill="none"
              stroke={accentColor}
              strokeWidth="1"
              strokeOpacity="0.4"
            />
          </svg>
        </div>
      );
    }

    // ── 7. Wabi-Sabi: Irregular brush stroke ─────────────────────────────
    case 'wabi-sabi':
      return (
        <div style={wrapperStyle} className={className}>
          <svg
            viewBox="0 0 1440 30"
            preserveAspectRatio="none"
            style={svgStyle}
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="1440" height="30" fill={nextBgColor} />
            <path
              d="M0,0 L0,12 C30,14 58,18 120,16 C200,13 260,19 340,15 C400,12 460,17 540,14 C610,11 670,18 740,16 C810,13 870,19 960,15 C1040,12 1100,17 1180,14 C1240,11 1300,16 1360,13 C1400,11 1420,14 1440,12 L1440,0 Z"
              fill={bgColor}
            />
            <path
              d="M20,13 C80,17 150,11 260,16 C370,20 430,10 540,15 C650,19 720,9 830,14 C940,18 1010,11 1120,15 C1230,19 1300,12 1420,14"
              fill="none"
              stroke={accentColor}
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeOpacity="0.6"
              strokeDasharray="8 4 2 4"
            />
          </svg>
        </div>
      );

    // ── 8. Coastal: Layered multi-wave ocean surf ────────────────────────
    case 'coastal':
      return (
        <div style={wrapperStyle} className={className}>
          <svg
            viewBox="0 0 1440 140"
            preserveAspectRatio="none"
            style={svgStyle}
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="1440" height="140" fill={nextBgColor} />
            {/* Wave layer 4 — deepest, most transparent */}
            <path
              d="M0,0 L0,100 C120,130 240,70 360,100 C480,130 600,70 720,100 C840,130 960,70 1080,100 C1200,130 1360,80 1440,100 L1440,0 Z"
              fill={accentColor}
              opacity="0.15"
            />
            {/* Wave layer 3 */}
            <path
              d="M0,0 L0,80 C180,120 300,40 480,80 C660,120 780,40 960,80 C1140,120 1260,40 1440,80 L1440,0 Z"
              fill={accentColor}
              opacity="0.25"
            />
            {/* Wave layer 2 */}
            <path
              d="M0,0 L0,60 C160,95 320,25 480,60 C640,95 800,25 960,60 C1120,95 1280,25 1440,60 L1440,0 Z"
              fill={accentColor}
              opacity="0.45"
            />
            {/* Wave layer 1 — top, most opaque, uses bgColor */}
            <path
              d="M0,0 L0,45 C200,75 400,15 600,45 C800,75 1000,15 1200,45 C1330,65 1400,30 1440,45 L1440,0 Z"
              fill={bgColor}
            />
          </svg>
        </div>
      );

    // ── 9. Noir: Subtle gradient fade ────────────────────────────────────
    case 'noir':
      return (
        <div
          style={{
            ...wrapperStyle,
            height: '40px',
            background: `linear-gradient(to bottom, ${bgColor}, ${nextBgColor})`,
          }}
          className={className}
        />
      );

    // ── 10. Electric: Zigzag torn-paper edge ─────────────────────────────
    case 'electric': {
      // Generate an irregular zigzag that mimics torn paper
      const points: string[] = ['0,0'];
      const steps = 36;
      const stepWidth = 1440 / steps;
      for (let i = 0; i <= steps; i++) {
        const x = i * stepWidth;
        // Alternate high/low with some variation
        const baseY = i % 2 === 0 ? 12 : 42;
        const jitter = ((i * 7 + 3) % 11) - 5; // pseudo-random jitter -5..+5
        points.push(`${x},${baseY + jitter}`);
      }
      points.push('1440,0');
      const tornPath = `M${points.join(' L')} Z`;

      return (
        <div style={wrapperStyle} className={className}>
          <svg
            viewBox="0 0 1440 50"
            preserveAspectRatio="none"
            style={svgStyle}
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="1440" height="50" fill={nextBgColor} />
            <path d={tornPath} fill={bgColor} />
            <path
              d={tornPath}
              fill="none"
              stroke={accentColor}
              strokeWidth="2"
              strokeLinejoin="bevel"
            />
          </svg>
        </div>
      );
    }

    default:
      return null;
  }
}
