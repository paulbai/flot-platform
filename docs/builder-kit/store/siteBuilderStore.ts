'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  SiteBuilderState,
  SiteConfig,
  Vertical,
  BrandConfig,
  BusinessInfo,
  SocialLinks,
  NavbarConfig,
  HeroSection,
  AboutSection,
  GallerySection,
  TestimonialsSection,
  ContactSection,
  PartnersSection,
  FooterConfig,
  SEOConfig,
} from '@/lib/types/customization';
import { rooms } from '@/lib/dummy-data/hotel';
import { menu } from '@/lib/dummy-data/restaurant';
import { products } from '@/lib/dummy-data/store';
import { airports, flights } from '@/lib/dummy-data/travel';
import { getTemplate, DEFAULT_TEMPLATE_IDS } from '@/lib/templates/registry';

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 48);
}

/* ── Vertical-specific defaults ── */

const verticalDefaults: Record<Vertical, {
  brand: Partial<BrandConfig>;
  hero: Partial<HeroSection>;
  about: Partial<AboutSection>;
  gallery: Partial<GallerySection>;
  testimonials: Partial<TestimonialsSection>;
  partners: Partial<PartnersSection>;
}> = {
  hotel: {
    brand: { accentColor: '#d4a96a', backgroundColor: '#0f0e0d', textColor: '#ffffff', headingFont: 'Playfair Display', bodyFont: 'Lato' },
    hero: {
      headline: 'Where rest becomes ritual.',
      subline: 'Luxury redefined for the modern traveler.',
      description: 'Experience unparalleled comfort in our meticulously designed suites with breathtaking views.',
      ctaText: 'Book Your Stay',
      ctaLink: '#rooms',
      backgroundImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&q=80',
    },
    about: {
      title: 'A Legacy of Hospitality',
      description: 'For over two decades, we have set the standard for luxury accommodation, blending timeless elegance with modern comfort.',
      mission: 'To create extraordinary experiences that inspire and rejuvenate our guests.',
      features: [
        { title: 'Spa & Wellness', description: 'Rejuvenate with our signature treatments', icon: 'Sparkles' },
        { title: 'Fine Dining', description: 'Michelin-starred cuisine at your table', icon: 'UtensilsCrossed' },
        { title: 'Concierge', description: 'Your every wish, around the clock', icon: 'Bell' },
        { title: 'Rooftop Pool', description: 'Infinity pool with panoramic views', icon: 'Waves' },
      ],
    },
    gallery: {
      title: 'Gallery',
      subtitle: 'A glimpse into the experience that awaits.',
      images: [
        { url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80', caption: 'Deluxe Suite' },
        { url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80', caption: 'Grand Penthouse' },
        { url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80', caption: 'Garden Villa' },
        { url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80', caption: 'Pool Area' },
        { url: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&q=80', caption: 'Spa Center' },
        { url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80', caption: 'Restaurant' },
      ],
    },
    testimonials: {
      title: 'Guest Experiences',
      subtitle: 'What our guests say about their stay.',
      items: [
        { name: 'Sarah Mitchell', role: 'Travel Blogger', quote: 'An absolutely extraordinary stay. The attention to detail is unmatched. From the welcome champagne to the handwritten note on the pillow.', avatar: '', rating: 5 },
        { name: 'James Chen', role: 'Business Traveler', quote: 'The penthouse suite exceeded every expectation. The private pool with city views is something I will never forget.', avatar: '', rating: 5 },
        { name: 'Amara Okafor', role: 'Luxury Consultant', quote: 'This is what hospitality should feel like. Impeccable service, stunning design, and a sense of calm that stays with you.', avatar: '', rating: 5 },
      ],
    },
    partners: {
      title: 'Trusted By',
      subtitle: 'Our esteemed partners',
      items: [
        { name: 'Marriott International', logoUrl: '' },
        { name: 'Hilton Hotels', logoUrl: '' },
        { name: 'Four Seasons', logoUrl: '' },
        { name: 'Ritz-Carlton', logoUrl: '' },
        { name: 'Hyatt Hotels', logoUrl: '' },
        { name: 'Accor Group', logoUrl: '' },
      ],
    },
  },
  restaurant: {
    brand: { accentColor: '#e85d3a', backgroundColor: '#0d0a08', textColor: '#ffffff', headingFont: 'Cormorant Garamond', bodyFont: 'Syne' },
    hero: {
      headline: 'Taste first. Pay after.',
      subline: 'A culinary journey through flavors.',
      description: 'Scan the QR at your table, browse the menu, order, and pay. All from your phone.',
      ctaText: 'View Menu',
      ctaLink: '#menu',
      backgroundImage: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1400&q=80',
    },
    about: {
      title: 'Our Story',
      description: 'Born from a passion for authentic flavors and seasonal ingredients, we bring the heart of Italian cooking to every plate.',
      mission: 'To serve food that tells a story: honest, seasonal, unforgettable.',
      features: [
        { title: 'Farm to Table', description: 'Locally sourced, seasonal ingredients', icon: 'Leaf' },
        { title: 'Wine Cellar', description: 'Curated selection of 200+ wines', icon: 'Wine' },
        { title: 'Private Dining', description: 'Intimate spaces for special occasions', icon: 'Users' },
        { title: 'Chef\'s Table', description: 'Watch the magic happen up close', icon: 'ChefHat' },
      ],
    },
    gallery: {
      title: 'The Experience',
      subtitle: 'From our kitchen to your table.',
      images: [
        { url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80', caption: 'Signature Dishes' },
        { url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80', caption: 'Main Dining' },
        { url: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80', caption: 'Bar Area' },
        { url: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&q=80', caption: 'Private Room' },
      ],
    },
    testimonials: {
      title: 'What Diners Say',
      subtitle: 'Experiences shared by our guests.',
      items: [
        { name: 'Elena Torres', role: 'Food Critic', quote: 'A masterclass in Italian cuisine. The lobster tagliatelle is the best I have had outside of Rome.', avatar: '', rating: 5 },
        { name: 'David Park', role: 'Regular Guest', quote: 'We come here every anniversary. The ambiance, the service, the food. Consistently perfect.', avatar: '', rating: 5 },
      ],
    },
    partners: {
      title: 'Our Partners',
      subtitle: 'Brands we work with',
      items: [
        { name: 'Michelin Guide', logoUrl: '' },
        { name: 'OpenTable', logoUrl: '' },
        { name: 'Uber Eats', logoUrl: '' },
        { name: 'DoorDash', logoUrl: '' },
        { name: 'Wine Spectator', logoUrl: '' },
        { name: 'James Beard Foundation', logoUrl: '' },
      ],
    },
  },
  store: {
    brand: { accentColor: '#8b5cf6', backgroundColor: '#faf9f7', textColor: '#111111', headingFont: 'Inter', bodyFont: 'Inter' },
    hero: {
      headline: 'Curated for the discerning eye.',
      subline: 'Fashion & Art, thoughtfully selected.',
      description: 'A curation of timeless pieces from independent designers and artists.',
      ctaText: 'Shop Now',
      ctaLink: '#products',
      backgroundImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80',
    },
    about: {
      title: 'Our Philosophy',
      description: 'We believe in slow fashion, timeless design, and supporting independent creators who pour their soul into every piece.',
      mission: 'To connect discerning buyers with exceptional craftsmanship.',
      features: [
        { title: 'Slow Fashion', description: 'Timeless pieces that last', icon: 'Heart' },
        { title: 'Independent Artists', description: 'Supporting creators worldwide', icon: 'Palette' },
        { title: 'Sustainable', description: 'Ethically sourced materials', icon: 'Leaf' },
        { title: 'Free Shipping', description: 'On orders over $200', icon: 'Truck' },
      ],
    },
    gallery: {
      title: 'Lookbook',
      subtitle: 'This season\'s editorial highlights.',
      images: [
        { url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80', caption: 'Linen Collection' },
        { url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&q=80', caption: 'Art Prints' },
        { url: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80', caption: 'Leather Goods' },
      ],
    },
    testimonials: {
      title: 'Happy Customers',
      subtitle: 'Hear from our community.',
      items: [
        { name: 'Claire Dubois', role: 'Interior Designer', quote: 'The quality of the art prints is museum-grade. I have ordered three times now and each piece is stunning.', avatar: '', rating: 5 },
        { name: 'Marcus Webb', role: 'Fashion Editor', quote: 'Finally, an online store that understands curation. Every item feels intentional and beautifully made.', avatar: '', rating: 5 },
      ],
    },
    partners: {
      title: 'Featured In',
      subtitle: 'As seen in',
      items: [
        { name: 'Vogue', logoUrl: '' },
        { name: 'GQ Magazine', logoUrl: '' },
        { name: 'Highsnobiety', logoUrl: '' },
        { name: 'Hypebeast', logoUrl: '' },
        { name: 'Complex', logoUrl: '' },
        { name: 'Elle Décor', logoUrl: '' },
      ],
    },
  },
  travel: {
    brand: { accentColor: '#4a9eff', backgroundColor: '#080d14', textColor: '#ffffff', headingFont: 'Space Grotesk', bodyFont: 'DM Sans' },
    hero: {
      headline: 'The world is closer than you think.',
      subline: 'Book smarter. Fly better.',
      description: 'Search flights, pick your seat, and book in under a minute.',
      ctaText: 'Search Flights',
      ctaLink: '#search',
      backgroundImage: 'https://images.unsplash.com/photo-1436491865332-7a61a109db05?w=1600&q=80',
    },
    about: {
      title: 'Why Travel With Us',
      description: 'We partner with the world\'s best airlines to bring you competitive fares, flexible booking, and a seamless experience from search to landing.',
      mission: 'To make world-class travel accessible to everyone.',
      features: [
        { title: 'Best Price Guarantee', description: 'We match or beat any fare', icon: 'Shield' },
        { title: 'Flexible Booking', description: 'Free changes up to 24h before', icon: 'RefreshCw' },
        { title: '24/7 Support', description: 'Help whenever you need it', icon: 'Headphones' },
        { title: 'Seat Selection', description: 'Choose your perfect seat', icon: 'Armchair' },
      ],
    },
    gallery: {
      title: 'Destinations',
      subtitle: 'Popular routes we fly.',
      images: [
        { url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80', caption: 'Paris' },
        { url: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800&q=80', caption: 'New York' },
        { url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80', caption: 'Dubai' },
        { url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80', caption: 'Tokyo' },
      ],
    },
    testimonials: {
      title: 'Traveler Reviews',
      subtitle: 'From our frequent flyers.',
      items: [
        { name: 'Nina Petrova', role: 'Digital Nomad', quote: 'The booking process is incredibly smooth. I found and booked a business class flight to Tokyo in under 2 minutes.', avatar: '', rating: 5 },
        { name: 'Tom Hartley', role: 'Frequent Flyer', quote: 'Best seat selection interface I have used. Plus the prices are consistently lower than other booking sites.', avatar: '', rating: 5 },
      ],
    },
    partners: {
      title: 'Airline Partners',
      subtitle: 'We work with the best',
      items: [
        { name: 'Emirates', logoUrl: '' },
        { name: 'Singapore Airlines', logoUrl: '' },
        { name: 'Lufthansa', logoUrl: '' },
        { name: 'Qatar Airways', logoUrl: '' },
        { name: 'British Airways', logoUrl: '' },
        { name: 'Air France', logoUrl: '' },
      ],
    },
  },
};

function createDefaultSite(vertical: Vertical, name: string, ownerEmail = '', templateId?: string): SiteConfig {
  const id = uid();
  const slug = slugify(name);
  const vd = verticalDefaults[vertical];
  const resolvedTemplateId = templateId || DEFAULT_TEMPLATE_IDS[vertical] || '';
  const tmpl = getTemplate(resolvedTemplateId);

  const site: SiteConfig = {
    id,
    slug,
    vertical,
    templateId: resolvedTemplateId,
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    customDomain: '',
    ownerEmail,
    merchantId: '',

    brand: {
      businessName: name,
      tagline: vd.hero.subline || '',
      logoUrl: null,
      accentColor: tmpl?.brandOverrides?.accentColor || vd.brand.accentColor || '#a88567',
      backgroundColor: tmpl?.brandOverrides?.backgroundColor || vd.brand.backgroundColor || '#080808',
      textColor: tmpl?.brandOverrides?.textColor || vd.brand.textColor || '#ffffff',
      headingFont: tmpl?.brandOverrides?.headingFont || vd.brand.headingFont || 'Inter',
      bodyFont: tmpl?.brandOverrides?.bodyFont || vd.brand.bodyFont || 'Inter',
    },
    businessInfo: {
      phone: '', email: '', address: '', city: '', country: '', postalCode: '', hours: '', founded: '', description: '',
    },
    social: {
      website: '', instagram: '', facebook: '', twitter: '', tiktok: '', linkedin: '', youtube: '', whatsapp: '', tripadvisor: '',
    },
    seo: {
      metaTitle: name,
      metaDescription: vd.hero.description || '',
      ogImage: vd.hero.backgroundImage || '',
      favicon: '',
    },
    navbar: {
      showLogo: true,
      ctaText: vd.hero.ctaText || 'Get Started',
      ctaLink: vd.hero.ctaLink || '#',
      links: [
        { label: 'Home', href: '#hero' },
        { label: 'About', href: '#about' },
        { label: 'Gallery', href: '#gallery' },
        { label: 'Contact', href: '#contact' },
      ],
      style: 'glass',
    },
    hero: {
      headline: vd.hero.headline || '',
      subline: vd.hero.subline || '',
      description: vd.hero.description || '',
      ctaText: vd.hero.ctaText || 'Get Started',
      ctaLink: vd.hero.ctaLink || '#',
      secondaryCtaText: 'Learn More',
      secondaryCtaLink: '#about',
      backgroundImage: vd.hero.backgroundImage || '',
      overlayOpacity: tmpl?.heroOverrides?.overlayOpacity ?? 60,
      alignment: tmpl?.heroOverrides?.alignment || 'left',
    },
    about: {
      enabled: true,
      title: vd.about.title || 'About Us',
      description: vd.about.description || '',
      image: '',
      mission: vd.about.mission || '',
      features: vd.about.features || [],
    },
    gallery: {
      enabled: true,
      title: vd.gallery?.title || 'Gallery',
      subtitle: vd.gallery?.subtitle || '',
      images: vd.gallery?.images || [],
    },
    testimonials: {
      enabled: true,
      title: vd.testimonials?.title || 'Testimonials',
      subtitle: vd.testimonials?.subtitle || '',
      items: vd.testimonials?.items || [],
    },
    contact: {
      enabled: true,
      title: 'Get in Touch',
      subtitle: 'We would love to hear from you.',
      showMap: false,
      mapEmbed: '',
      showForm: true,
      formFields: ['name', 'email', 'phone', 'message'],
    },
    partners: {
      enabled: true,
      title: vd.partners?.title || 'Trusted By',
      subtitle: vd.partners?.subtitle || '',
      items: vd.partners?.items || [],
    },
    footer: {
      copyrightText: `© ${new Date().getFullYear()} ${name}. All rights reserved.`,
      columns: [
        { title: 'Quick Links', links: [{ label: 'Home', href: '#hero' }, { label: 'About', href: '#about' }, { label: 'Contact', href: '#contact' }] },
        { title: 'Legal', links: [{ label: 'Privacy Policy', href: '#' }, { label: 'Terms of Service', href: '#' }] },
      ],
      showSocial: true,
      showNewsletter: true,
      newsletterHeadline: 'Stay in the loop',
      bottomText: 'Powered by Flot',
    },
  };

  // Add vertical-specific content
  if (vertical === 'hotel') {
    site.hotelContent = {
      rooms: JSON.parse(JSON.stringify(rooms)),
      services: [
        { name: 'Spa & Wellness', desc: 'Rejuvenate with our signature treatments', iconName: 'Sparkles' },
        { name: 'Fine Dining', desc: 'Michelin-starred cuisine at your table', iconName: 'UtensilsCrossed' },
        { name: 'Concierge', desc: 'Your every wish, around the clock', iconName: 'Bell' },
      ],
      checkoutFields: ['arrivalTime', 'specialRequests'],
    };
  } else if (vertical === 'restaurant') {
    site.restaurantContent = {
      categories: JSON.parse(JSON.stringify(menu.categories)),
      checkoutFields: ['tableNumber', 'tip'],
    };
  } else if (vertical === 'store') {
    site.storeContent = {
      products: JSON.parse(JSON.stringify(products)),
      categoryLabels: { clothing: 'Clothing', art: 'Art Prints', accessories: 'Accessories', objects: 'Objects' },
    };
  } else if (vertical === 'travel') {
    site.travelContent = {
      airports: JSON.parse(JSON.stringify(airports)),
      flights: JSON.parse(JSON.stringify(flights)),
      checkoutFields: ['passengerName', 'passportNumber'],
    };
  }

  return site;
}

/* ── API helpers ── */

async function apiGet<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function apiPost<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function apiPatch(url: string, body: unknown): Promise<void> {
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
}

async function apiDelete(url: string): Promise<void> {
  const res = await fetch(url, { method: 'DELETE' });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
}

const saveTimers = new Map<string, NodeJS.Timeout>();

function debouncedSave(id: string, getSite: (id: string) => SiteConfig | undefined) {
  const existing = saveTimers.get(id);
  if (existing) clearTimeout(existing);
  saveTimers.set(id, setTimeout(() => {
    const site = getSite(id);
    if (site) {
      apiPatch(`/api/sites/${id}`, site).catch(console.error);
    }
    saveTimers.delete(id);
  }, 1000));
}

export const useSiteBuilderStore = create<SiteBuilderState>()(
  persist(
    (set, get) => ({
      sites: [],
      activeSiteId: null,

      createSite: (vertical, name, ownerEmail, templateId) => {
        const site = createDefaultSite(vertical, name, ownerEmail, templateId);
        set((s) => ({ sites: [...s.sites, site], activeSiteId: site.id }));
        apiPost('/api/sites', site).catch(console.error);
        return site.id;
      },

      deleteSite: (id) => {
        set((s) => ({
          sites: s.sites.filter((site) => site.id !== id),
          activeSiteId: s.activeSiteId === id ? null : s.activeSiteId,
        }));
        apiDelete(`/api/sites/${id}`).catch(console.error);
      },

      duplicateSite: (id) => {
        const original = get().sites.find((s) => s.id === id);
        if (!original) return '';
        const newSite: SiteConfig = {
          ...JSON.parse(JSON.stringify(original)),
          id: uid(),
          slug: original.slug + '-copy',
          status: 'draft' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          brand: { ...original.brand, businessName: original.brand.businessName + ' (Copy)' },
        };
        set((s) => ({ sites: [...s.sites, newSite] }));
        apiPost('/api/sites', newSite).catch(console.error);
        return newSite.id;
      },

      setActiveSite: (id) => set({ activeSiteId: id }),

      updateSite: (id, data) => {
        set((s) => ({
          sites: s.sites.map((site) =>
            site.id === id ? { ...site, ...data, updatedAt: new Date().toISOString() } : site
          ),
        }));
        debouncedSave(id, (sid) => get().getSite(sid));
      },

      updateBrand: (id, data) => {
        set((s) => ({
          sites: s.sites.map((site) =>
            site.id === id ? { ...site, brand: { ...site.brand, ...data }, updatedAt: new Date().toISOString() } : site
          ),
        }));
        debouncedSave(id, (sid) => get().getSite(sid));
      },

      updateBusinessInfo: (id, data) => {
        set((s) => ({
          sites: s.sites.map((site) =>
            site.id === id ? { ...site, businessInfo: { ...site.businessInfo, ...data }, updatedAt: new Date().toISOString() } : site
          ),
        }));
        debouncedSave(id, (sid) => get().getSite(sid));
      },

      updateSocial: (id, data) => {
        set((s) => ({
          sites: s.sites.map((site) =>
            site.id === id ? { ...site, social: { ...site.social, ...data }, updatedAt: new Date().toISOString() } : site
          ),
        }));
        debouncedSave(id, (sid) => get().getSite(sid));
      },

      updateSEO: (id, data) => {
        set((s) => ({
          sites: s.sites.map((site) =>
            site.id === id ? { ...site, seo: { ...site.seo, ...data }, updatedAt: new Date().toISOString() } : site
          ),
        }));
        debouncedSave(id, (sid) => get().getSite(sid));
      },

      updateNavbar: (id, data) => {
        set((s) => ({
          sites: s.sites.map((site) =>
            site.id === id ? { ...site, navbar: { ...site.navbar, ...data }, updatedAt: new Date().toISOString() } : site
          ),
        }));
        debouncedSave(id, (sid) => get().getSite(sid));
      },

      updateHero: (id, data) => {
        set((s) => ({
          sites: s.sites.map((site) =>
            site.id === id ? { ...site, hero: { ...site.hero, ...data }, updatedAt: new Date().toISOString() } : site
          ),
        }));
        debouncedSave(id, (sid) => get().getSite(sid));
      },

      updateAbout: (id, data) => {
        set((s) => ({
          sites: s.sites.map((site) =>
            site.id === id ? { ...site, about: { ...site.about, ...data }, updatedAt: new Date().toISOString() } : site
          ),
        }));
        debouncedSave(id, (sid) => get().getSite(sid));
      },

      updateGallery: (id, data) => {
        set((s) => ({
          sites: s.sites.map((site) =>
            site.id === id ? { ...site, gallery: { ...site.gallery, ...data }, updatedAt: new Date().toISOString() } : site
          ),
        }));
        debouncedSave(id, (sid) => get().getSite(sid));
      },

      updateTestimonials: (id, data) => {
        set((s) => ({
          sites: s.sites.map((site) =>
            site.id === id ? { ...site, testimonials: { ...site.testimonials, ...data }, updatedAt: new Date().toISOString() } : site
          ),
        }));
        debouncedSave(id, (sid) => get().getSite(sid));
      },

      updateContact: (id, data) => {
        set((s) => ({
          sites: s.sites.map((site) =>
            site.id === id ? { ...site, contact: { ...site.contact, ...data }, updatedAt: new Date().toISOString() } : site
          ),
        }));
        debouncedSave(id, (sid) => get().getSite(sid));
      },

      updatePartners: (id, data) => {
        set((s) => ({
          sites: s.sites.map((site) =>
            site.id === id ? { ...site, partners: { ...site.partners, ...data }, updatedAt: new Date().toISOString() } : site
          ),
        }));
        debouncedSave(id, (sid) => get().getSite(sid));
      },

      updateFooter: (id, data) => {
        set((s) => ({
          sites: s.sites.map((site) =>
            site.id === id ? { ...site, footer: { ...site.footer, ...data }, updatedAt: new Date().toISOString() } : site
          ),
        }));
        debouncedSave(id, (sid) => get().getSite(sid));
      },

      updateHotelContent: (id, data) => {
        set((s) => ({
          sites: s.sites.map((site) =>
            site.id === id ? { ...site, hotelContent: { ...site.hotelContent!, ...data }, updatedAt: new Date().toISOString() } : site
          ),
        }));
        debouncedSave(id, (sid) => get().getSite(sid));
      },

      updateRestaurantContent: (id, data) => {
        set((s) => ({
          sites: s.sites.map((site) =>
            site.id === id ? { ...site, restaurantContent: { ...site.restaurantContent!, ...data }, updatedAt: new Date().toISOString() } : site
          ),
        }));
        debouncedSave(id, (sid) => get().getSite(sid));
      },

      updateStoreContent: (id, data) => {
        set((s) => ({
          sites: s.sites.map((site) =>
            site.id === id ? { ...site, storeContent: { ...site.storeContent!, ...data }, updatedAt: new Date().toISOString() } : site
          ),
        }));
        debouncedSave(id, (sid) => get().getSite(sid));
      },

      updateTravelContent: (id, data) => {
        set((s) => ({
          sites: s.sites.map((site) =>
            site.id === id ? { ...site, travelContent: { ...site.travelContent!, ...data }, updatedAt: new Date().toISOString() } : site
          ),
        }));
        debouncedSave(id, (sid) => get().getSite(sid));
      },

      updateTemplate: (id, templateId) => {
        const tmpl = getTemplate(templateId);
        if (!tmpl) return;
        set((s) => ({
          sites: s.sites.map((site) => {
            if (site.id !== id) return site;
            return {
              ...site,
              templateId,
              brand: {
                ...site.brand,
                ...(tmpl.brandOverrides || {}),
                businessName: site.brand.businessName,
                tagline: site.brand.tagline,
                logoUrl: site.brand.logoUrl,
              },
              hero: {
                ...site.hero,
                overlayOpacity: tmpl.heroOverrides?.overlayOpacity ?? site.hero.overlayOpacity,
                alignment: tmpl.heroOverrides?.alignment || site.hero.alignment,
              },
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
        debouncedSave(id, (sid) => get().getSite(sid));
      },

      publishSite: (id) => {
        set((s) => ({
          sites: s.sites.map((site) =>
            site.id === id ? { ...site, status: 'published', updatedAt: new Date().toISOString() } : site
          ),
        }));
        const site = get().getSite(id);
        if (site) apiPatch(`/api/sites/${id}`, site).catch(console.error);
      },

      unpublishSite: (id) => {
        set((s) => ({
          sites: s.sites.map((site) =>
            site.id === id ? { ...site, status: 'draft', updatedAt: new Date().toISOString() } : site
          ),
        }));
        const site = get().getSite(id);
        if (site) apiPatch(`/api/sites/${id}`, site).catch(console.error);
      },

      getSite: (id) => get().sites.find((s) => s.id === id),
      getSiteBySlug: (slug) => get().sites.find((s) => s.slug === slug),

      fetchSites: async () => {
        try {
          const sites = await apiGet<SiteConfig[]>('/api/sites');
          set({ sites });
        } catch (err) {
          console.error('Failed to fetch sites:', err);
        }
      },

      syncSite: async (id) => {
        try {
          const site = await apiGet<SiteConfig>(`/api/sites/${id}`);
          set((s) => ({
            sites: s.sites.map((existing) => existing.id === id ? site : existing),
          }));
        } catch (err) {
          console.error('Failed to sync site:', err);
        }
      },
    }),
    {
      name: 'flot-site-builder',
      partialize: (state) => ({
        sites: state.sites,
        activeSiteId: state.activeSiteId,
      }),
    }
  )
);
