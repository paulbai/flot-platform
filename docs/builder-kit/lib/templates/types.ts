export type HeroLayout =
  | 'classic'          // bg image + overlay + text (current default)
  | 'split'            // 50/50 image + text side-by-side
  | 'parallax'         // parallax scrolling background
  | 'minimal'          // no bg image, solid color + centered text
  | 'fullscreen-card'  // text in floating card over image
  | 'diagonal'         // diagonal clip-path divider
  | 'stacked'          // text above, image below
  | 'mosaic'           // multi-image grid hero
  | 'video-bg'         // same as classic but optimized for video
  | 'bold-type';       // oversized typography, minimal imagery

export type NavStyle =
  | 'glass'
  | 'solid'
  | 'transparent'
  | 'centered'         // logo center, links split left/right
  | 'minimal';         // logo + hamburger only

export type AboutLayout =
  | 'standard'         // header + image/mission + features grid
  | 'timeline'         // vertical timeline of milestones
  | 'cards-only'       // just feature cards, no image/mission
  | 'full-width-image' // big image behind, text overlay
  | 'zigzag';          // alternating image-text rows

export type GalleryLayout =
  | 'masonry'
  | 'carousel'         // horizontal scroll carousel
  | 'grid-uniform'     // equal-size grid
  | 'lightbox-focus'   // single large + thumbnails
  | 'filmstrip';       // horizontal strip with 3D perspective

export type TestimonialsLayout =
  | 'cards'            // 3-column cards (current)
  | 'single-slider'    // one at a time, auto-rotate
  | 'quote-wall'       // large quotes stacked vertically
  | 'minimal-inline';  // no cards, just text

export type ContactLayout =
  | 'split'            // info left, form right (current)
  | 'centered-form'    // form centered, no sidebar
  | 'card'             // form in floating card
  | 'map-focus';       // large map with overlay card

export type FooterLayout =
  | 'standard'
  | 'minimal'          // copyright + social only
  | 'centered'         // everything centered
  | 'mega';            // large multi-section footer

export type AnimationPreset =
  | 'fade-up'          // opacity + translateY (current)
  | 'fade-in'          // opacity only
  | 'slide-in'         // translateX entrances
  | 'scale-up'         // scale from 0.9
  | 'stagger-cascade'  // heavy stagger delays
  | 'none';

export type ThreeDEffect =
  | 'none'
  | 'tilt-cards'       // CSS perspective tilt on hover
  | 'parallax-layers'  // multi-layer parallax on scroll
  | 'float'            // subtle floating animation
  | 'flip-reveal'      // cards flip to reveal content
  | 'depth-scroll'     // translateZ changes on scroll
  | 'perspective-grid'; // gallery items with 3D rotation

export interface ThreeDConfig {
  hero: ThreeDEffect;
  cards: ThreeDEffect;
  gallery: ThreeDEffect;
  intensity: number; // 0-100
}

export type DesignFamily =
  | 'opulent'      // Gold/luxury: liquid glass, morphing elements, Bodoni Moda/Jost
  | 'ethereal'     // Ultra-minimal: extreme whitespace, hairline borders, fade-only
  | 'tropical'     // Organic/warm: flowing curves, wave dividers, nature gradients
  | 'brutalist'    // Raw/bold: sharp corners, heavy borders, oversized type, Space Mono
  | 'heritage'     // Classic/ornate: double borders, decorative frames, serif everything
  | 'deco'         // Geometric art-deco: gold lines, symmetric, geometric patterns
  | 'wabi-sabi'    // Japanese minimal: ink wash, asymmetric, calligraphic accents
  | 'coastal'      // Ocean/airy: layered waves, soft shadows, cool gradients
  | 'noir'         // Dark/cinematic: neon accents, glass cards, grid patterns, glow
  | 'electric';    // Bold/playful: color blocks, bouncy animations, Memphis shapes

export interface TemplateDefinition {
  id: string;
  name: string;
  vertical: 'hotel' | 'restaurant' | 'store' | 'travel';
  designFamily: DesignFamily;
  description: string;
  previewGradient: string; // CSS gradient for template card preview

  heroLayout: HeroLayout;
  navStyle: NavStyle;
  aboutLayout: AboutLayout;
  galleryLayout: GalleryLayout;
  testimonialsLayout: TestimonialsLayout;
  contactLayout: ContactLayout;
  footerLayout: FooterLayout;

  animationPreset: AnimationPreset;
  threeDEffects: ThreeDConfig;

  brandOverrides?: Partial<{
    accentColor: string;
    backgroundColor: string;
    textColor: string;
    headingFont: string;
    bodyFont: string;
  }>;

  heroOverrides?: Partial<{
    overlayOpacity: number;
    alignment: 'left' | 'center' | 'right';
  }>;

  sectionStyles: {
    borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
    cardStyle: 'flat' | 'elevated' | 'outlined' | 'glass';
    sectionSpacing: 'compact' | 'normal' | 'spacious';
  };
}
