'use client';

import type { DesignFamily } from '@/lib/templates/types';

export default function TemplateStyles({ family }: { family: DesignFamily }) {
  return <style dangerouslySetInnerHTML={{ __html: getCSS(family) }} />;
}

function getCSS(family: DesignFamily): string {
  const sel = `[data-family="${family}"]`;
  switch (family) {
    case 'opulent':
      return opulentCSS(sel);
    case 'ethereal':
      return etherealCSS(sel);
    case 'tropical':
      return tropicalCSS(sel);
    case 'brutalist':
      return brutalistCSS(sel);
    case 'heritage':
      return heritageCSS(sel);
    case 'deco':
      return decoCSS(sel);
    case 'wabi-sabi':
      return wabiSabiCSS(sel);
    case 'coastal':
      return coastalCSS(sel);
    case 'noir':
      return noirCSS(sel);
    case 'electric':
      return electricCSS(sel);
    default:
      return '';
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   1. OPULENT — Luxury / Gold
   ═══════════════════════════════════════════════════════════════════════════ */
function opulentCSS(s: string): string {
  return `
    @import url('https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,wght@0,400;0,700;0,900;1,400&family=Jost:wght@300;400;500&display=swap');

    ${s} h1, ${s} h2, ${s} h3 {
      font-family: 'Bodoni Moda', 'Didot', 'Times New Roman', serif;
      letter-spacing: 0.04em;
      font-weight: 700;
    }

    ${s} h2 {
      position: relative;
      padding-bottom: 16px;
    }

    ${s} h2::after {
      content: '';
      display: block;
      width: 40px;
      height: 2px;
      background: var(--accent);
      margin-top: 12px;
    }

    ${s} .site-section h2::before {
      content: '';
      display: block;
      width: 60px;
      height: 1px;
      background: var(--accent);
      margin-bottom: 20px;
    }

    ${s} p, ${s} span, ${s} a, ${s} li {
      font-family: 'Jost', 'Helvetica Neue', sans-serif;
      font-weight: 300;
    }

    ${s} .site-card {
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(201, 168, 76, 0.3);
      border-radius: 16px;
      transition: transform 0.5s cubic-bezier(0.23, 1, 0.32, 1),
                  box-shadow 0.5s cubic-bezier(0.23, 1, 0.32, 1);
      overflow: hidden;
    }

    ${s} .site-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 20px 60px rgba(201, 168, 76, 0.15),
                  0 8px 24px rgba(0, 0, 0, 0.12);
    }

    ${s} .site-section {
      position: relative;
    }

    ${s} .site-section::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 60%;
      height: 60%;
      background: radial-gradient(ellipse at top right, var(--accent), transparent 70%);
      opacity: 0.05;
      pointer-events: none;
      z-index: 0;
    }

    ${s} .site-section:nth-child(even) {
      background-color: rgba(201, 168, 76, 0.02);
    }

    ${s} .site-hero {
      position: relative;
    }

    ${s} .site-hero h1 {
      font-weight: 900;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    ${s} .site-hero p {
      text-transform: uppercase;
      letter-spacing: 0.12em;
      font-size: 0.85em;
      opacity: 0.8;
    }
  `;
}

/* ═══════════════════════════════════════════════════════════════════════════
   2. ETHEREAL — Ultra-Minimal
   ═══════════════════════════════════════════════════════════════════════════ */
function etherealCSS(s: string): string {
  return `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&display=swap');

    ${s} h1, ${s} h2, ${s} h3 {
      font-family: 'Cormorant Garamond', 'Garamond', 'Georgia', serif;
      font-weight: 400;
      line-height: 1.3;
      letter-spacing: 0.01em;
    }

    ${s} h1 {
      font-weight: 300;
      line-height: 1.2;
    }

    ${s} h2 {
      position: relative;
      padding-top: 40px;
    }

    ${s} h2::before {
      content: '';
      display: block;
      width: 40px;
      height: 0.5px;
      background: currentColor;
      opacity: 0.3;
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
    }

    ${s} .site-card {
      border: none;
      border-radius: 0;
      box-shadow: none;
      background: transparent;
      border-bottom: 0.5px solid rgba(0, 0, 0, 0.08);
      padding-bottom: 2rem;
      transition: opacity 0.6s ease;
      opacity: 0.85;
    }

    ${s} .site-card:hover {
      opacity: 1;
      transform: none;
      box-shadow: none;
    }

    ${s} .site-section {
      padding-top: 9rem;
      padding-bottom: 9rem;
    }

    @media (min-width: 640px) {
      ${s} .site-section {
        padding-top: 12rem;
        padding-bottom: 12rem;
      }
    }

    ${s} .site-section > * {
      max-width: 42rem;
      margin-left: auto;
      margin-right: auto;
    }

    ${s} .site-hero {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    ${s} .site-hero h1 {
      font-size: clamp(2.5rem, 6vw, 5rem);
      font-weight: 300;
    }

    ${s} .site-hero p {
      font-size: 1rem;
      opacity: 0.5;
      letter-spacing: 0.06em;
    }

    ${s} p {
      line-height: 1.9;
      font-size: 0.95rem;
    }

    ${s} img {
      border-radius: 0;
    }
  `;
}

/* ═══════════════════════════════════════════════════════════════════════════
   3. TROPICAL — Organic / Warm
   ═══════════════════════════════════════════════════════════════════════════ */
function tropicalCSS(s: string): string {
  return `
    @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&display=swap');

    ${s} h1, ${s} h2, ${s} h3 {
      font-family: 'DM Serif Display', 'Georgia', serif;
    }

    ${s} h1 {
      font-size: clamp(3rem, 7vw, 6rem);
    }

    ${s} .site-card {
      border-radius: 24px;
      background: linear-gradient(135deg, color-mix(in srgb, var(--accent) 3%, transparent), transparent);
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
      border: none;
      transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1),
                  box-shadow 0.4s ease;
      overflow: hidden;
    }

    ${s} .site-card:hover {
      transform: scale(1.03) rotate(-1deg);
      box-shadow: 0 30px 80px rgba(0, 0, 0, 0.14);
    }

    ${s} .site-section {
      position: relative;
      overflow: hidden;
    }

    ${s} .site-section::before {
      content: '';
      position: absolute;
      width: 400px;
      height: 400px;
      border-radius: 50%;
      background: var(--accent);
      opacity: 0.04;
      filter: blur(80px);
      top: -100px;
      right: -100px;
      pointer-events: none;
      z-index: 0;
    }

    ${s} .site-section::after {
      content: '';
      position: absolute;
      width: 300px;
      height: 300px;
      border-radius: 50%;
      background: var(--accent);
      opacity: 0.03;
      filter: blur(60px);
      bottom: -80px;
      left: -60px;
      pointer-events: none;
      z-index: 0;
    }

    ${s} .site-section:nth-child(odd)::before {
      left: -100px;
      right: auto;
      top: auto;
      bottom: -100px;
    }

    ${s} .site-hero {
      position: relative;
      overflow: hidden;
    }

    ${s} .site-hero::before {
      content: '';
      position: absolute;
      width: 600px;
      height: 600px;
      border-radius: 50%;
      background: var(--accent);
      opacity: 0.06;
      filter: blur(120px);
      top: -200px;
      left: 50%;
      transform: translateX(-50%);
      pointer-events: none;
    }

    ${s} img {
      border-radius: 20px;
    }

    ${s} button, ${s} a[role="button"] {
      border-radius: 999px;
    }

    @media (prefers-reduced-motion: reduce) {
      ${s} .site-card:hover {
        transform: none;
      }
    }
  `;
}

/* ═══════════════════════════════════════════════════════════════════════════
   4. BRUTALIST — Raw / Bold
   ═══════════════════════════════════════════════════════════════════════════ */
function brutalistCSS(s: string): string {
  return `
    @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap');

    ${s} {
      font-family: 'Space Mono', 'Courier New', monospace !important;
    }

    ${s} h1, ${s} h2, ${s} h3, ${s} h4, ${s} h5, ${s} h6 {
      font-family: 'Space Mono', 'Courier New', monospace;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      font-weight: 700;
    }

    ${s} h1 {
      font-size: clamp(4rem, 12vw, 10rem);
      line-height: 0.9;
      overflow: hidden;
    }

    ${s} h2 {
      font-size: clamp(2.5rem, 6vw, 5rem);
      line-height: 0.95;
    }

    ${s} p, ${s} span, ${s} a, ${s} li {
      font-family: 'Space Mono', 'Courier New', monospace;
      letter-spacing: 0.02em;
    }

    ${s} .site-card {
      border: 3px solid var(--accent);
      border-radius: 0;
      box-shadow: none;
      background: transparent;
      transition: none;
    }

    ${s} .site-card:hover {
      background: var(--accent);
      color: white;
      transform: none;
      box-shadow: none;
    }

    ${s} .site-section {
      border-top: 3px solid currentColor;
      position: relative;
    }

    ${s} .site-section::before {
      content: '';
      position: absolute;
      inset: 0;
      background:
        repeating-linear-gradient(0deg, transparent, transparent 49px, rgba(0,0,0,0.03) 49px, rgba(0,0,0,0.03) 50px),
        repeating-linear-gradient(90deg, transparent, transparent 49px, rgba(0,0,0,0.03) 49px, rgba(0,0,0,0.03) 50px);
      pointer-events: none;
      z-index: 0;
    }

    ${s} .site-hero {
      border-bottom: 6px solid currentColor;
      position: relative;
    }

    ${s} img {
      border-radius: 0;
      border: 3px solid currentColor;
    }

    ${s} button, ${s} a[role="button"] {
      border-radius: 0;
      border: 3px solid currentColor;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      font-family: 'Space Mono', monospace;
      font-weight: 700;
    }

    ${s} button:hover, ${s} a[role="button"]:hover {
      background: currentColor;
    }
  `;
}

/* ═══════════════════════════════════════════════════════════════════════════
   5. HERITAGE — Classic / Ornate
   ═══════════════════════════════════════════════════════════════════════════ */
function heritageCSS(s: string): string {
  return `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&display=swap');

    ${s} h1, ${s} h2, ${s} h3 {
      font-family: 'Playfair Display', 'Georgia', serif;
      font-weight: 700;
    }

    ${s} h1 {
      font-weight: 900;
    }

    ${s} h2 {
      position: relative;
      text-align: center;
      padding-top: 32px;
    }

    ${s} h2::before {
      content: '\\25C6';
      display: block;
      text-align: center;
      font-size: 0.5em;
      color: var(--accent);
      margin-bottom: 16px;
      letter-spacing: 0.3em;
    }

    ${s} .site-hero p,
    ${s} .site-section h3 {
      font-family: 'Playfair Display', 'Georgia', serif;
      font-style: italic;
    }

    ${s} .site-card {
      border: 1px solid rgba(0, 0, 0, 0.1);
      box-shadow: inset 0 0 0 4px rgba(0, 0, 0, 0.02),
                  0 4px 20px rgba(0, 0, 0, 0.06);
      border-radius: 4px;
      background: color-mix(in srgb, var(--accent) 2%, white);
      transition: transform 0.3s ease, box-shadow 0.3s ease, filter 0.3s ease;
      position: relative;
    }

    ${s} .site-card::before,
    ${s} .site-card::after {
      content: '';
      position: absolute;
      width: 20px;
      height: 20px;
      border-color: var(--accent);
      border-style: solid;
      opacity: 0.3;
    }

    ${s} .site-card::before {
      top: 8px;
      left: 8px;
      border-width: 1px 0 0 1px;
    }

    ${s} .site-card::after {
      bottom: 8px;
      right: 8px;
      border-width: 0 1px 1px 0;
    }

    ${s} .site-card:hover {
      transform: translateY(-4px);
      filter: brightness(1.02);
      box-shadow: inset 0 0 0 4px rgba(0, 0, 0, 0.02),
                  0 12px 32px rgba(0, 0, 0, 0.1);
    }

    ${s} .site-section {
      position: relative;
    }

    ${s} .site-section::before {
      content: '';
      position: absolute;
      inset: 0;
      background:
        repeating-linear-gradient(
          45deg,
          transparent,
          transparent 10px,
          rgba(0, 0, 0, 0.008) 10px,
          rgba(0, 0, 0, 0.008) 11px
        ),
        repeating-linear-gradient(
          -45deg,
          transparent,
          transparent 10px,
          rgba(0, 0, 0, 0.008) 10px,
          rgba(0, 0, 0, 0.008) 11px
        );
      pointer-events: none;
      z-index: 0;
    }

    ${s} .site-hero h1 {
      font-weight: 900;
      font-size: clamp(3rem, 7vw, 6rem);
    }

    ${s} hr, ${s} .divider {
      border: none;
      height: 1px;
      background: linear-gradient(to right, transparent, var(--accent), transparent);
      margin: 2rem auto;
      max-width: 200px;
    }

    ${s} img {
      border-radius: 4px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    }
  `;
}

/* ═══════════════════════════════════════════════════════════════════════════
   6. DECO — Art Deco / Geometric
   ═══════════════════════════════════════════════════════════════════════════ */
function decoCSS(s: string): string {
  return `
    @import url('https://fonts.googleapis.com/css2?family=Poiret+One&family=Raleway:wght@300;400;500;600&display=swap');

    ${s} h1, ${s} h2, ${s} h3 {
      font-family: 'Poiret One', 'Century Gothic', sans-serif;
      text-transform: uppercase;
      letter-spacing: 0.25em;
      font-weight: 400;
    }

    ${s} p, ${s} span, ${s} a, ${s} li {
      font-family: 'Raleway', 'Helvetica Neue', sans-serif;
      font-weight: 400;
      letter-spacing: 0.03em;
    }

    ${s} h2 {
      display: flex;
      align-items: center;
      gap: 24px;
      text-align: center;
      justify-content: center;
    }

    ${s} h2::before,
    ${s} h2::after {
      content: '';
      flex: 0 0 60px;
      height: 1px;
      background: var(--accent);
    }

    ${s} h1 {
      font-size: clamp(2.5rem, 6vw, 5.5rem);
      letter-spacing: 0.3em;
    }

    ${s} .site-card {
      clip-path: polygon(
        12px 0, calc(100% - 12px) 0,
        100% 12px, 100% calc(100% - 12px),
        calc(100% - 12px) 100%, 12px 100%,
        0 calc(100% - 12px), 0 12px
      );
      border: none;
      box-shadow: none;
      background: color-mix(in srgb, var(--accent) 4%, white);
      transition: outline-color 0.4s ease, box-shadow 0.4s ease;
      position: relative;
      padding: 2px;
    }

    ${s} .site-card::before {
      content: '';
      position: absolute;
      inset: 0;
      clip-path: polygon(
        12px 0, calc(100% - 12px) 0,
        100% 12px, 100% calc(100% - 12px),
        calc(100% - 12px) 100%, 12px 100%,
        0 calc(100% - 12px), 0 12px
      );
      border: 1px solid transparent;
      transition: border-color 0.4s ease;
      pointer-events: none;
    }

    ${s} .site-card:hover::before {
      border-color: var(--accent);
    }

    ${s} .site-card:hover {
      box-shadow: inset 0 0 30px rgba(201, 168, 76, 0.06);
    }

    ${s} .site-section {
      position: relative;
      overflow: hidden;
    }

    ${s} .site-section::before {
      content: '';
      position: absolute;
      inset: 0;
      background:
        repeating-linear-gradient(
          60deg,
          transparent,
          transparent 40px,
          rgba(0, 0, 0, 0.015) 40px,
          rgba(0, 0, 0, 0.015) 41px
        ),
        repeating-linear-gradient(
          -60deg,
          transparent,
          transparent 40px,
          rgba(0, 0, 0, 0.015) 40px,
          rgba(0, 0, 0, 0.015) 41px
        );
      pointer-events: none;
      z-index: 0;
    }

    ${s} .site-section:nth-child(even)::after {
      content: '\\25C6';
      display: block;
      text-align: center;
      position: absolute;
      bottom: -8px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 1rem;
      color: var(--accent);
      z-index: 1;
    }

    ${s} .site-hero {
      text-align: center;
    }

    ${s} .site-hero p {
      text-transform: uppercase;
      letter-spacing: 0.2em;
      font-size: 0.85em;
    }

    ${s} img {
      border-radius: 0;
    }

    ${s} button, ${s} a[role="button"] {
      letter-spacing: 0.15em;
      text-transform: uppercase;
      border-radius: 0;
    }
  `;
}

/* ═══════════════════════════════════════════════════════════════════════════
   7. WABI-SABI — Japanese Minimal
   ═══════════════════════════════════════════════════════════════════════════ */
function wabiSabiCSS(s: string): string {
  return `
    @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@200;300;400&display=swap');

    ${s} {
      background-color: #faf8f5 !important;
    }

    ${s} h1, ${s} h2, ${s} h3 {
      font-family: 'Noto Serif JP', 'Hiragino Mincho ProN', serif;
      font-weight: 200;
      letter-spacing: 0.06em;
    }

    ${s} h1 {
      font-size: clamp(2.5rem, 5vw, 4.5rem);
      margin-top: 4rem;
      line-height: 1.4;
    }

    ${s} h2 {
      text-align: left;
      margin-top: 5rem;
      margin-bottom: 2.5rem;
      font-weight: 300;
    }

    ${s} .site-card {
      background: transparent;
      border: none;
      border-radius: 0;
      box-shadow: none;
      border-left: 3px solid color-mix(in srgb, var(--accent) 30%, transparent);
      padding-left: 1.5rem;
      transition: border-color 0.6s ease, padding-left 0.6s ease;
    }

    ${s} .site-card:hover {
      border-left-color: var(--accent);
      padding-left: calc(1.5rem + 4px);
      transform: none;
      box-shadow: none;
    }

    ${s} .site-section {
      padding-top: 6rem;
      padding-bottom: 6rem;
      position: relative;
    }

    ${s} .site-section > * {
      text-align: left;
    }

    ${s} .site-section h2 {
      position: relative;
    }

    ${s} .site-section h2::before {
      content: '';
      position: absolute;
      top: -28px;
      left: 0;
      width: 60px;
      height: 1px;
      background: var(--accent);
      opacity: 0.4;
    }

    ${s} .site-hero {
      text-align: left;
      position: relative;
      overflow: hidden;
    }

    ${s} .site-hero::after {
      content: '';
      position: absolute;
      top: 15%;
      right: 8%;
      width: 200px;
      height: 200px;
      background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cpath d='M40 160 Q60 40 100 80 Q140 120 160 40' fill='none' stroke='%23000' stroke-width='1.5' opacity='0.06'/%3E%3C/svg%3E") no-repeat center;
      background-size: contain;
      pointer-events: none;
      opacity: 0.5;
    }

    ${s} p {
      line-height: 2;
      font-size: 0.9rem;
      max-width: 36rem;
    }

    ${s} img {
      border-radius: 2px;
      opacity: 0.95;
    }

    ${s} button, ${s} a[role="button"] {
      border-radius: 0;
      background: transparent;
      border: 1px solid currentColor;
      letter-spacing: 0.1em;
      font-weight: 300;
    }
  `;
}

/* ═══════════════════════════════════════════════════════════════════════════
   8. COASTAL — Ocean / Airy
   ═══════════════════════════════════════════════════════════════════════════ */
function coastalCSS(s: string): string {
  return `
    @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400&family=Open+Sans:wght@300;400;500;600&display=swap');

    ${s} h1, ${s} h2, ${s} h3 {
      font-family: 'Lora', 'Georgia', serif;
      font-weight: 600;
    }

    ${s} p, ${s} span, ${s} a, ${s} li {
      font-family: 'Open Sans', 'Helvetica Neue', sans-serif;
      font-weight: 400;
      line-height: 1.8;
    }

    ${s} h1 {
      font-size: clamp(2.5rem, 6vw, 5rem);
      line-height: 1.2;
    }

    ${s} h2 {
      position: relative;
      padding-bottom: 16px;
    }

    ${s} h2::after {
      content: '';
      display: block;
      width: 60px;
      height: 2px;
      margin-top: 12px;
      background: var(--accent);
      border-radius: 2px;
      /* Wavy effect via multiple box-shadows */
      box-shadow:
        0 4px 0 0 var(--accent),
        10px 2px 0 0 var(--accent),
        20px 4px 0 0 var(--accent),
        30px 2px 0 0 var(--accent),
        40px 4px 0 0 var(--accent),
        50px 2px 0 0 var(--accent);
      height: 1.5px;
      width: 8px;
    }

    ${s} .site-card {
      border-radius: 20px;
      box-shadow: 0 8px 30px rgba(0, 80, 140, 0.08);
      border: none;
      background: rgba(255, 255, 255, 0.9);
      transition: transform 0.4s ease, box-shadow 0.4s ease;
      overflow: hidden;
    }

    ${s} .site-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 16px 48px rgba(0, 80, 140, 0.12);
    }

    ${s} .site-section {
      position: relative;
      overflow: hidden;
    }

    ${s} .site-section::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 100%;
      background: linear-gradient(
        180deg,
        color-mix(in srgb, var(--accent) 3%, transparent) 0%,
        transparent 50%
      );
      pointer-events: none;
      z-index: 0;
    }

    ${s} .site-section:nth-child(even)::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      right: 0;
      height: 40px;
      background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 40'%3E%3Cpath d='M0 20 Q150 0 300 20 Q450 40 600 20 Q750 0 900 20 Q1050 40 1200 20 V40 H0 Z' fill='white' opacity='0.5'/%3E%3Cpath d='M0 25 Q150 10 300 25 Q450 40 600 25 Q750 10 900 25 Q1050 40 1200 25 V40 H0 Z' fill='white' opacity='0.3'/%3E%3C/svg%3E") repeat-x bottom;
      pointer-events: none;
      z-index: 1;
    }

    ${s} .site-hero {
      position: relative;
      overflow: hidden;
    }

    ${s} .site-hero::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 80px;
      background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 80'%3E%3Cpath d='M0 40 Q150 10 300 40 Q450 70 600 40 Q750 10 900 40 Q1050 70 1200 40 V80 H0 Z' fill='white' opacity='0.6'/%3E%3Cpath d='M0 50 Q150 25 300 50 Q450 75 600 50 Q750 25 900 50 Q1050 75 1200 50 V80 H0 Z' fill='white' opacity='0.4'/%3E%3Cpath d='M0 60 Q150 40 300 60 Q450 80 600 60 Q750 40 900 60 Q1050 80 1200 60 V80 H0 Z' fill='white' opacity='0.2'/%3E%3C/svg%3E") repeat-x bottom;
      background-size: 1200px 80px;
      pointer-events: none;
    }

    ${s} img {
      border-radius: 16px;
    }

    ${s} button, ${s} a[role="button"] {
      border-radius: 999px;
      letter-spacing: 0.03em;
    }
  `;
}

/* ═══════════════════════════════════════════════════════════════════════════
   9. NOIR — Dark / Cinematic
   ═══════════════════════════════════════════════════════════════════════════ */
function noirCSS(s: string): string {
  return `
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Sora:wght@300;400;500&display=swap');

    ${s} {
      background-color: #0a0a0a !important;
      color: #e8e8e8 !important;
    }

    ${s} h1, ${s} h2, ${s} h3 {
      font-family: 'Outfit', 'Inter', sans-serif;
      font-weight: 700;
      letter-spacing: -0.01em;
      color: #ffffff;
    }

    ${s} p, ${s} span, ${s} a, ${s} li {
      font-family: 'Sora', 'Inter', sans-serif;
      font-weight: 300;
      color: #b0b0b0;
    }

    ${s} h1 {
      font-size: clamp(3rem, 8vw, 6rem);
      font-weight: 800;
    }

    ${s} h2 {
      position: relative;
      padding-top: 20px;
    }

    ${s} h2::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 40px;
      height: 2px;
      background: var(--accent);
    }

    ${s} .site-card {
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-bottom: 3px solid var(--accent);
      border-radius: 12px;
      transition: box-shadow 0.4s ease, transform 0.4s ease;
    }

    ${s} .site-card:hover {
      box-shadow: 0 4px 20px color-mix(in srgb, var(--accent) 40%, transparent);
      transform: translateY(-4px);
    }

    ${s} .site-section {
      position: relative;
      overflow: hidden;
      background-color: #0a0a0a;
    }

    ${s} .site-section::before {
      content: '';
      position: absolute;
      inset: 0;
      background:
        radial-gradient(circle 1px at center, rgba(255, 255, 255, 0.08) 0%, transparent 1px);
      background-size: 24px 24px;
      pointer-events: none;
      z-index: 0;
    }

    ${s} .site-section::after {
      content: '';
      position: absolute;
      inset: 0;
      background: repeating-linear-gradient(
        0deg,
        transparent,
        transparent 2px,
        rgba(255, 255, 255, 0.01) 2px,
        rgba(255, 255, 255, 0.01) 4px
      );
      pointer-events: none;
      z-index: 0;
    }

    ${s} .site-section:nth-child(even) {
      background-color: #0f0f0f;
    }

    ${s} .site-hero {
      background-color: #050505;
      position: relative;
    }

    ${s} .site-hero::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 200px;
      background: linear-gradient(to top, #0a0a0a, transparent);
      pointer-events: none;
    }

    ${s} img {
      border-radius: 8px;
      opacity: 0.9;
    }

    ${s} button, ${s} a[role="button"] {
      border-radius: 6px;
      border: 1px solid rgba(255, 255, 255, 0.15);
      letter-spacing: 0.05em;
    }

    @media (prefers-reduced-motion: reduce) {
      ${s} .site-card:hover {
        transform: none;
      }
    }
  `;
}

/* ═══════════════════════════════════════════════════════════════════════════
   10. ELECTRIC — Bold / Playful
   ═══════════════════════════════════════════════════════════════════════════ */
function electricCSS(s: string): string {
  return `
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap');

    ${s} h1, ${s} h2, ${s} h3 {
      font-family: 'Sora', 'Inter', sans-serif;
      font-weight: 800;
    }

    ${s} h1 {
      font-size: clamp(3rem, 8vw, 7rem);
      line-height: 0.95;
      transform: rotate(-1deg);
    }

    ${s} h2 {
      display: inline-block;
      background: var(--accent);
      color: white;
      padding: 4px 16px;
      transform: rotate(-1deg);
      line-height: 1.4;
    }

    ${s} h3 {
      transform: rotate(0.5deg);
    }

    ${s} .site-card {
      border: 2px solid currentColor;
      border-radius: 12px;
      box-shadow: 6px 6px 0 var(--accent);
      background: white;
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
                  box-shadow 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      position: relative;
      overflow: visible;
    }

    ${s} .site-card:hover {
      transform: rotate(-2deg) translateY(-4px);
      box-shadow: 8px 8px 0 var(--accent);
    }

    ${s} .site-section {
      position: relative;
      overflow: hidden;
    }

    ${s} .site-section:nth-child(even) {
      background: var(--accent);
      color: white;
    }

    ${s} .site-section:nth-child(even) .site-card {
      border-color: white;
      box-shadow: 6px 6px 0 rgba(0, 0, 0, 0.2);
    }

    ${s} .site-section:nth-child(even) h2 {
      background: white;
      color: var(--accent);
    }

    /* Floating geometric shapes */
    ${s} .site-section::before {
      content: '';
      position: absolute;
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: var(--accent);
      opacity: 0.1;
      top: 10%;
      right: 5%;
      animation: electric-float-1 8s ease-in-out infinite;
      pointer-events: none;
      z-index: 0;
    }

    ${s} .site-section::after {
      content: '';
      position: absolute;
      width: 60px;
      height: 60px;
      background: var(--accent);
      opacity: 0.08;
      bottom: 15%;
      left: 8%;
      transform: rotate(45deg);
      animation: electric-float-2 10s ease-in-out infinite;
      pointer-events: none;
      z-index: 0;
    }

    ${s} .site-section:nth-child(even)::before {
      background: white;
      opacity: 0.15;
    }

    ${s} .site-section:nth-child(even)::after {
      background: white;
      opacity: 0.1;
    }

    ${s} .site-hero {
      position: relative;
      overflow: hidden;
    }

    ${s} .site-hero::before {
      content: '';
      position: absolute;
      width: 200px;
      height: 200px;
      border-radius: 50%;
      border: 4px solid var(--accent);
      opacity: 0.12;
      top: -40px;
      right: -40px;
      animation: electric-spin 20s linear infinite;
      pointer-events: none;
    }

    ${s} .site-hero::after {
      content: '';
      position: absolute;
      width: 0;
      height: 0;
      border-left: 60px solid transparent;
      border-right: 60px solid transparent;
      border-bottom: 100px solid var(--accent);
      opacity: 0.07;
      bottom: 10%;
      left: 5%;
      animation: electric-float-1 12s ease-in-out infinite;
      pointer-events: none;
    }

    ${s} img {
      border-radius: 12px;
      border: 2px solid currentColor;
    }

    ${s} button, ${s} a[role="button"] {
      border-radius: 12px;
      font-weight: 700;
      letter-spacing: 0.02em;
      border: 2px solid currentColor;
      box-shadow: 3px 3px 0 currentColor;
      transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
                  box-shadow 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    ${s} button:hover, ${s} a[role="button"]:hover {
      transform: translateY(-2px);
      box-shadow: 5px 5px 0 currentColor;
    }

    @keyframes electric-float-1 {
      0%, 100% { transform: translate(0, 0) rotate(0deg); }
      25% { transform: translate(10px, -20px) rotate(5deg); }
      50% { transform: translate(-5px, -10px) rotate(-3deg); }
      75% { transform: translate(15px, -25px) rotate(7deg); }
    }

    @keyframes electric-float-2 {
      0%, 100% { transform: translate(0, 0) rotate(45deg); }
      33% { transform: translate(-15px, 15px) rotate(55deg); }
      66% { transform: translate(10px, -10px) rotate(35deg); }
    }

    @keyframes electric-spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @media (prefers-reduced-motion: reduce) {
      ${s} .site-section::before,
      ${s} .site-section::after,
      ${s} .site-hero::before,
      ${s} .site-hero::after {
        animation: none;
      }
      ${s} .site-card:hover {
        transform: none;
      }
      ${s} h1, ${s} h2, ${s} h3 {
        transform: none;
      }
    }
  `;
}
