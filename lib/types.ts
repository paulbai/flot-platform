// Shared types across all verticals

export type Vertical = 'hotel' | 'restaurant' | 'travel' | 'store';

export interface OrderItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  image?: string;
  variant?: string;
  vertical: Vertical;
  siteSlug?: string;
}

export interface CartState {
  items: OrderItem[];
  addItem: (item: OrderItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  clearVertical: (vertical: Vertical) => void;
  clearSite: (siteSlug: string) => void;
  getTotal: () => number;
  getVerticalItems: (vertical: Vertical) => OrderItem[];
  getSiteItems: (siteSlug: string) => OrderItem[];
  getSiteTotal: (siteSlug: string) => number;
  getVerticals: () => Vertical[];
}

export interface CardData {
  number: string;
  expiry: string;
  cvv: string;
  name: string;
}

export interface TokenizeResult {
  token: string;
  last4: string;
}

export interface ChargePayload {
  token: string;
  amount: number;
  currency: string;
  customer: {
    email: string;
    name: string;
  };
  metadata?: Record<string, string>;
}

export interface ChargeResult {
  success: boolean;
  chargeId?: string;
  orderId?: string;
  error?: string;
}

export interface SaveResult {
  saved: boolean;
  profileId: string;
}

export interface SavedPayment {
  method: 'flot' | 'mobile-money' | 'card';
  last4: string;
  brand: string;
  expiry: string;
  profileId: string;
  /** For mobile money: the phone number */
  phone?: string;
  /** For mobile money: Orange or Afrimoney */
  provider?: string;
  /** For Flot: the email/username */
  flotId?: string;
}

export interface ExtraField {
  name: string;
  label: string;
  type: 'text' | 'select' | 'textarea' | 'checkbox' | 'number';
  required: boolean;
  options?: string[];
  placeholder?: string;
}

export interface FlotCheckoutProps {
  brandName: string;
  brandLogo?: string;
  accentColor: string;
  orderSummary: OrderItem[];
  currency: string;
  vertical: Vertical;
  extraFields?: ExtraField[];
  onSuccess: (result: ChargeResult) => void;
  onError: (error: string) => void;
  onClose: () => void;
}

// Hotel types
export interface Room {
  id: string;
  name: string;
  size: string;
  view: string;
  pricePerNight: number;
  maxGuests: number;
  amenities: string[];
  images: string[];
  available: boolean;
  description?: string;
}

// Restaurant types
export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  dietary: string[];
  popular: boolean;
}

export interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

// Travel types
export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
}

export interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  from: { code: string; time: string };
  to: { code: string; time: string };
  duration: string;
  stops: number;
  price: { economy: number; business: number; first: number | null };
  seatsLeft: number;
}

// Store types
export interface Product {
  id: string;
  category: 'clothing' | 'art' | 'accessories' | 'objects';
  name: string;
  artist: string | null;
  price: number;
  sizes: string[] | null;
  colors: string[] | null;
  images: string[];
  stock: number;
  badge: string | null;
  description?: string;
}
