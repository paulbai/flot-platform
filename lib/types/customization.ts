import type { Room, MenuCategory, Product, Airport, Flight } from '../types';

export type Vertical = 'hotel' | 'restaurant' | 'travel' | 'store';

/* ── Shared page section configs ── */

export interface BusinessInfo {
  phone: string;
  email: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  hours: string;
  founded: string;
  description: string;
}

export interface SocialLinks {
  website: string;
  instagram: string;
  facebook: string;
  twitter: string;
  tiktok: string;
  linkedin: string;
  youtube: string;
  whatsapp: string;
  tripadvisor: string;
}

export interface NavbarConfig {
  showLogo: boolean;
  ctaText: string;
  ctaLink: string;
  links: { label: string; href: string }[];
  style: 'transparent' | 'solid' | 'glass';
}

export interface HeroSection {
  headline: string;
  subline: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  backgroundImage: string;
  overlayOpacity: number; // 0-100
  alignment: 'left' | 'center' | 'right';
}

export interface AboutSection {
  enabled: boolean;
  title: string;
  description: string;
  image: string;
  mission: string;
  features: { title: string; description: string; icon: string }[];
}

export interface GallerySection {
  enabled: boolean;
  title: string;
  subtitle: string;
  images: { url: string; caption: string }[];
}

export interface TestimonialItem {
  name: string;
  role: string;
  quote: string;
  avatar: string;
  rating: number; // 1-5
}

export interface TestimonialsSection {
  enabled: boolean;
  title: string;
  subtitle: string;
  items: TestimonialItem[];
}

export interface ContactSection {
  enabled: boolean;
  title: string;
  subtitle: string;
  showMap: boolean;
  mapEmbed: string;
  showForm: boolean;
  formFields: string[]; // e.g. ['name', 'email', 'phone', 'message']
}

export interface PartnerItem {
  name: string;
  logoUrl: string;
}

export interface PartnersSection {
  enabled: boolean;
  title: string;
  subtitle: string;
  items: PartnerItem[];
}

export interface FooterConfig {
  copyrightText: string;
  columns: { title: string; links: { label: string; href: string }[] }[];
  showSocial: boolean;
  showNewsletter: boolean;
  newsletterHeadline: string;
  bottomText: string;
}

export interface SEOConfig {
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
  favicon: string;
}

export interface BrandConfig {
  businessName: string;
  tagline: string;
  logoUrl: string | null;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  headingFont: string;
  bodyFont: string;
}

/* ── Per-vertical content configs ── */

export interface HotelContent {
  rooms: Room[];
  services: { name: string; desc: string; iconName: string }[];
  checkoutFields: string[];
}

export interface RestaurantContent {
  categories: MenuCategory[];
  checkoutFields: string[];
}

export interface StoreContent {
  products: Product[];
  categoryLabels: Record<string, string>;
}

export interface TravelContent {
  airports: Airport[];
  flights: Flight[];
  checkoutFields: string[];
}

/* ── Site config (one per published site) ── */

export interface SiteConfig {
  id: string;
  slug: string;
  vertical: Vertical;
  templateId: string;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
  customDomain: string;
  ownerEmail: string;

  brand: BrandConfig;
  businessInfo: BusinessInfo;
  social: SocialLinks;
  seo: SEOConfig;

  navbar: NavbarConfig;
  hero: HeroSection;
  about: AboutSection;
  gallery: GallerySection;
  testimonials: TestimonialsSection;
  contact: ContactSection;
  partners: PartnersSection;
  footer: FooterConfig;

  // Vertical-specific content
  hotelContent?: HotelContent;
  restaurantContent?: RestaurantContent;
  storeContent?: StoreContent;
  travelContent?: TravelContent;
}

/* ── Store state ── */

export interface SiteBuilderState {
  sites: SiteConfig[];
  activeSiteId: string | null;

  // Site management
  createSite: (vertical: Vertical, name: string, ownerEmail?: string, templateId?: string) => string; // returns id
  deleteSite: (id: string) => void;
  duplicateSite: (id: string) => string;
  setActiveSite: (id: string | null) => void;

  // Update helpers
  updateSite: (id: string, data: Partial<SiteConfig>) => void;
  updateBrand: (id: string, data: Partial<BrandConfig>) => void;
  updateBusinessInfo: (id: string, data: Partial<BusinessInfo>) => void;
  updateSocial: (id: string, data: Partial<SocialLinks>) => void;
  updateSEO: (id: string, data: Partial<SEOConfig>) => void;
  updateNavbar: (id: string, data: Partial<NavbarConfig>) => void;
  updateHero: (id: string, data: Partial<HeroSection>) => void;
  updateAbout: (id: string, data: Partial<AboutSection>) => void;
  updateGallery: (id: string, data: Partial<GallerySection>) => void;
  updateTestimonials: (id: string, data: Partial<TestimonialsSection>) => void;
  updateContact: (id: string, data: Partial<ContactSection>) => void;
  updatePartners: (id: string, data: Partial<PartnersSection>) => void;
  updateFooter: (id: string, data: Partial<FooterConfig>) => void;
  updateHotelContent: (id: string, data: Partial<HotelContent>) => void;
  updateRestaurantContent: (id: string, data: Partial<RestaurantContent>) => void;
  updateStoreContent: (id: string, data: Partial<StoreContent>) => void;
  updateTravelContent: (id: string, data: Partial<TravelContent>) => void;

  updateTemplate: (id: string, templateId: string) => void;

  publishSite: (id: string) => void;
  unpublishSite: (id: string) => void;

  getSite: (id: string) => SiteConfig | undefined;
  getSiteBySlug: (slug: string) => SiteConfig | undefined;
}

/* ── Legacy types (used by demo vertical pages + old customization store) ── */

export interface HotelConfig {
  brand: BrandConfig;
  heroImage: string;
  heroHeadline: string;
  heroSubline: string;
  rooms: Room[];
  services: { name: string; desc: string; iconName: string }[];
}

export interface RestaurantConfig {
  brand: BrandConfig;
  heroImage: string;
  heroHeadline: string;
  heroSubline: string;
  heroDescription: string;
  categories: MenuCategory[];
}

export interface StoreConfig {
  brand: BrandConfig;
  heroLabel: string;
  products: Product[];
}

export interface TravelConfig {
  brand: BrandConfig;
  heroHeadline: string;
  heroSubline: string;
  heroDescription: string;
  airports: Airport[];
  flights: Flight[];
}

export interface CustomizationState {
  hotel: HotelConfig;
  restaurant: RestaurantConfig;
  store: StoreConfig;
  travel: TravelConfig;

  updateHotelBrand: (brand: Partial<BrandConfig>) => void;
  updateRestaurantBrand: (brand: Partial<BrandConfig>) => void;
  updateStoreBrand: (brand: Partial<BrandConfig>) => void;
  updateTravelBrand: (brand: Partial<BrandConfig>) => void;

  updateHotel: (data: Partial<Omit<HotelConfig, 'brand'>>) => void;
  updateRestaurant: (data: Partial<Omit<RestaurantConfig, 'brand'>>) => void;
  updateStore: (data: Partial<Omit<StoreConfig, 'brand'>>) => void;
  updateTravel: (data: Partial<Omit<TravelConfig, 'brand'>>) => void;

  resetVertical: (vertical: Vertical) => void;
  resetAll: () => void;
}
