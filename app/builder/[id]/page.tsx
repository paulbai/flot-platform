'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Eye,
  Globe,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  X,
  GripVertical,
  Palette,
  Building2,
  Share2,
  Navigation,
  Image as ImageIcon,
  Megaphone,
  MessageSquareQuote,
  Mail,
  PanelBottom,
  Search,
  Star,
  Hotel,
  UtensilsCrossed,
  ShoppingBag,
  Plane,
  Info,
  Sparkles,
  Heart,
  Leaf,
  Shield,
  Gem,
  Coffee,
  Utensils,
  MapPin,
  Clock,
  Award,
  Zap as ZapIcon,
  Target,
  Users as UsersIcon,
  Globe as GlobeIcon,
  Smile,
  Sun,
  Moon,
  Flame,
  Music,
  Camera,
  Wifi,
  Phone,
  Mail as MailIcon,
  Home as HomeIcon,
  BookOpen,
  Briefcase,
  TrendingUp,
  ThumbsUp,
  CheckCircle,
  type LucideIcon,
} from 'lucide-react';
import { useSiteBuilderStore } from '@/store/siteBuilderStore';
import SiteRenderer from '@/components/site/SiteRenderer';
import ImageUploader from '@/components/customization/ImageUploader';
import ColorPicker from '@/components/customization/ColorPicker';
import type { Vertical } from '@/lib/types/customization';

/* ─── Shared Styles ─── */

const inputClass =
  'bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#555] focus:border-[#666] outline-none w-full';
const labelClass = 'block text-xs text-[#888] uppercase tracking-wider mb-1.5';
const sectionHeaderClass = 'text-sm font-semibold text-white';

/* ─── Font options ─── */

const fontOptions = [
  // Sans-serif
  { value: 'Inter', label: 'Inter', category: 'Sans-serif' },
  { value: 'DM Sans', label: 'DM Sans', category: 'Sans-serif' },
  { value: 'Syne', label: 'Syne', category: 'Sans-serif' },
  { value: 'Space Grotesk', label: 'Space Grotesk', category: 'Sans-serif' },
  { value: 'Poppins', label: 'Poppins', category: 'Sans-serif' },
  { value: 'Montserrat', label: 'Montserrat', category: 'Sans-serif' },
  { value: 'Raleway', label: 'Raleway', category: 'Sans-serif' },
  { value: 'Open Sans', label: 'Open Sans', category: 'Sans-serif' },
  { value: 'Lato', label: 'Lato', category: 'Sans-serif' },
  { value: 'Nunito', label: 'Nunito', category: 'Sans-serif' },
  { value: 'Work Sans', label: 'Work Sans', category: 'Sans-serif' },
  { value: 'Outfit', label: 'Outfit', category: 'Sans-serif' },
  { value: 'Manrope', label: 'Manrope', category: 'Sans-serif' },
  { value: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans', category: 'Sans-serif' },
  // Serif
  { value: 'Playfair Display', label: 'Playfair Display', category: 'Serif' },
  { value: 'Cormorant Garamond', label: 'Cormorant Garamond', category: 'Serif' },
  { value: 'Lora', label: 'Lora', category: 'Serif' },
  { value: 'Merriweather', label: 'Merriweather', category: 'Serif' },
  { value: 'EB Garamond', label: 'EB Garamond', category: 'Serif' },
  { value: 'Libre Baskerville', label: 'Libre Baskerville', category: 'Serif' },
  { value: 'DM Serif Display', label: 'DM Serif Display', category: 'Serif' },
  { value: 'Fraunces', label: 'Fraunces', category: 'Serif' },
  // Display
  { value: 'Bebas Neue', label: 'Bebas Neue', category: 'Display' },
  { value: 'Oswald', label: 'Oswald', category: 'Display' },
  { value: 'Anton', label: 'Anton', category: 'Display' },
  { value: 'Archivo Black', label: 'Archivo Black', category: 'Display' },
  // Mono
  { value: 'JetBrains Mono', label: 'JetBrains Mono', category: 'Monospace' },
  { value: 'Fira Code', label: 'Fira Code', category: 'Monospace' },
  { value: 'IBM Plex Mono', label: 'IBM Plex Mono', category: 'Monospace' },
];

/* ─── Tiny Components ─── */

function SectionAccordion({
  title,
  icon,
  open,
  onToggle,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-[#1a1a1a]">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2.5 px-4 py-3.5 hover:bg-[#111] transition-colors"
      >
        <span className="text-[#666]">{icon}</span>
        <span className={sectionHeaderClass}>{title}</span>
        <span className="ml-auto text-[#555]">
          {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-5 space-y-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between cursor-pointer group">
      <span className="text-xs text-[#aaa] group-hover:text-white transition-colors">{label}</span>
      <div
        className={`w-9 h-5 rounded-full relative transition-colors ${
          checked ? 'bg-emerald-500' : 'bg-[#333]'
        }`}
        onClick={() => onChange(!checked)}
      >
        <div
          className={`w-3.5 h-3.5 bg-white rounded-full absolute top-[3px] transition-transform ${
            checked ? 'translate-x-[18px]' : 'translate-x-[3px]'
          }`}
        />
      </div>
    </label>
  );
}

/* ─── Icon Picker ─── */

const availableIcons: { name: string; icon: LucideIcon }[] = [
  { name: 'Sparkles', icon: Sparkles },
  { name: 'Heart', icon: Heart },
  { name: 'Leaf', icon: Leaf },
  { name: 'Shield', icon: Shield },
  { name: 'Star', icon: Star },
  { name: 'Gem', icon: Gem },
  { name: 'Coffee', icon: Coffee },
  { name: 'Utensils', icon: Utensils },
  { name: 'MapPin', icon: MapPin },
  { name: 'Clock', icon: Clock },
  { name: 'Award', icon: Award },
  { name: 'Zap', icon: ZapIcon },
  { name: 'Target', icon: Target },
  { name: 'Users', icon: UsersIcon },
  { name: 'Globe', icon: GlobeIcon },
  { name: 'Smile', icon: Smile },
  { name: 'Sun', icon: Sun },
  { name: 'Moon', icon: Moon },
  { name: 'Flame', icon: Flame },
  { name: 'Music', icon: Music },
  { name: 'Camera', icon: Camera },
  { name: 'Wifi', icon: Wifi },
  { name: 'Phone', icon: Phone },
  { name: 'Mail', icon: MailIcon },
  { name: 'Home', icon: HomeIcon },
  { name: 'BookOpen', icon: BookOpen },
  { name: 'Briefcase', icon: Briefcase },
  { name: 'TrendingUp', icon: TrendingUp },
  { name: 'ThumbsUp', icon: ThumbsUp },
  { name: 'CheckCircle', icon: CheckCircle },
];

function IconPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const CurrentIcon = availableIcons.find((i) => i.name === value)?.icon || Sparkles;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`${inputClass} !py-1.5 flex items-center gap-2 cursor-pointer`}
      >
        <CurrentIcon className="w-4 h-4 text-white" />
        <span className="text-sm">{value || 'Choose icon'}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute z-50 top-full mt-1 left-0 right-0 bg-[#111] border border-[#333] rounded-lg p-2 grid grid-cols-6 gap-1 max-h-48 overflow-y-auto shadow-xl"
          >
            {availableIcons.map((item) => {
              const Icon = item.icon;
              const isSelected = value === item.name;
              return (
                <button
                  key={item.name}
                  type="button"
                  title={item.name}
                  onClick={() => { onChange(item.name); setOpen(false); }}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    isSelected ? 'bg-white/20 ring-1 ring-white/40' : 'hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4 text-white" />
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Vertical labels ─── */

const verticalSectionLabel: Record<Vertical, string> = {
  hotel: 'Rooms & Services',
  restaurant: 'Menu',
  store: 'Products',
  travel: 'Flights',
};

const verticalSectionIcon: Record<Vertical, React.ReactNode> = {
  hotel: <Hotel className="w-4 h-4" />,
  restaurant: <UtensilsCrossed className="w-4 h-4" />,
  store: <ShoppingBag className="w-4 h-4" />,
  travel: <Plane className="w-4 h-4" />,
};

/* ─── Available form field options for Contact ─── */
const contactFieldOptions = ['name', 'email', 'phone', 'message', 'subject', 'company'] as const;

/* ─── Main Editor Page ─── */

export default function SiteEditorPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setHydrated(true); }, []);

  const site = useSiteBuilderStore((s) => s.getSite(id));
  const {
    updateBrand,
    updateBusinessInfo,
    updateSocial,
    updateNavbar,
    updateHero,
    updateAbout,
    updateGallery,
    updateTestimonials,
    updateContact,
    updateFooter,
    updateSEO,
    updateSite,
    updateHotelContent,
    updateRestaurantContent,
    updateStoreContent,
    publishSite,
    unpublishSite,
  } = useSiteBuilderStore();

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ brand: true });
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishSlug, setPublishSlug] = useState('');
  const [slugError, setSlugError] = useState('');

  const toggle = useCallback(
    (key: string) =>
      setOpenSections((prev) => ({ ...prev, [key]: !prev[key] })),
    []
  );

  const isOpen = useCallback(
    (key: string) => !!openSections[key],
    [openSections]
  );

  // Memoized live site config for the preview renderer
  const liveConfig = useMemo(() => site, [site]);

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!site) {
    return (
      <div className="flex items-center justify-center h-[80vh] text-[#888] text-sm">
        Site not found.{' '}
        <button onClick={() => router.push('/builder')} className="ml-2 underline text-white">
          Go back
        </button>
      </div>
    );
  }

  /* ─── Publish helpers ─── */

  function openPublish() {
    setPublishSlug(site!.slug);
    setSlugError('');
    setShowPublishModal(true);
  }

  function validateSlug(s: string) {
    const cleaned = s.toLowerCase().replace(/[^a-z0-9-]/g, '');
    return cleaned;
  }

  function handlePublish() {
    const clean = validateSlug(publishSlug);
    if (!clean) {
      setSlugError('Slug cannot be empty');
      return;
    }
    // Check uniqueness
    const existing = useSiteBuilderStore.getState().getSiteBySlug(clean);
    if (existing && existing.id !== id) {
      setSlugError('This slug is already taken');
      return;
    }
    updateSite(id, { slug: clean });
    publishSite(id);
    setShowPublishModal(false);
  }

  /* ─── Shortcut updaters ─── */

  const b = (field: string, value: string | boolean | null) => updateBrand(id, { [field]: value });
  const bi = (field: string, value: string) => updateBusinessInfo(id, { [field]: value });
  const so = (field: string, value: string) => updateSocial(id, { [field]: value });
  const nv = (field: string, value: unknown) => updateNavbar(id, { [field]: value });
  const hr = (field: string, value: unknown) => updateHero(id, { [field]: value });
  const ab = (field: string, value: unknown) => updateAbout(id, { [field]: value });
  const gl = (field: string, value: unknown) => updateGallery(id, { [field]: value });
  const te = (field: string, value: unknown) => updateTestimonials(id, { [field]: value });
  const ct = (field: string, value: unknown) => updateContact(id, { [field]: value });
  const ft = (field: string, value: unknown) => updateFooter(id, { [field]: value });
  const se = (field: string, value: string) => updateSEO(id, { [field]: value });

  // Build font preview URL for the sidebar
  const editorFontsUrl = (() => {
    const fonts = new Set<string>();
    if (site.brand.headingFont) fonts.add(site.brand.headingFont);
    if (site.brand.bodyFont) fonts.add(site.brand.bodyFont);
    if (fonts.size === 0) return '';
    const params = Array.from(fonts).map((f) => `family=${f.replace(/ /g, '+')}:wght@300;400;500;600;700;800`).join('&');
    return `https://fonts.googleapis.com/css2?${params}&display=swap`;
  })();

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      {/* Load Google Fonts for sidebar preview */}
      {editorFontsUrl && (
        <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          {/* eslint-disable-next-line @next/next/no-page-custom-font */}
          <link rel="stylesheet" href={editorFontsUrl} />
        </>
      )}
      {/* ─── Top Bar ─── */}
      <div className="h-12 border-b border-[#1a1a1a] bg-[#0a0a0a] flex items-center px-4 gap-3 shrink-0">
        <button
          onClick={() => router.push('/builder')}
          className="text-[#888] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <span className="text-sm font-medium truncate max-w-[180px]">{site.brand.businessName}</span>

        <span
          className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
            site.status === 'published'
              ? 'bg-emerald-500/10 text-emerald-400'
              : 'bg-yellow-500/10 text-yellow-500'
          }`}
        >
          {site.status}
        </span>

        <div className="ml-auto flex items-center gap-2">
          {site.status === 'published' && (
            <button
              onClick={() => window.open(`/site/${site.slug}`, '_blank')}
              className="flex items-center gap-1.5 text-xs text-[#888] hover:text-white transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              Preview
            </button>
          )}

          {site.status === 'published' ? (
            <button
              onClick={() => unpublishSite(id)}
              className="text-xs text-red-400 hover:text-red-300 transition-colors px-3 py-1.5 rounded-lg border border-red-500/20 hover:border-red-500/40"
            >
              Unpublish
            </button>
          ) : null}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openPublish}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
              site.status === 'published'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-white text-black hover:bg-white/90'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            {site.status === 'published' ? 'Update Slug' : 'Go Live'}
          </motion.button>
        </div>
      </div>

      {/* ─── Main Area ─── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ─── Sidebar ─── */}
        <aside className="w-[320px] shrink-0 border-r border-[#1a1a1a] bg-[#0a0a0a] overflow-y-auto">
          {/* Site header */}
          <div className="px-4 py-3 border-b border-[#1a1a1a]">
            <h2 className="text-sm font-semibold truncate">{site.brand.businessName}</h2>
            <p className="text-[10px] text-[#555] mt-0.5 capitalize">{site.vertical} site</p>
          </div>

          {/* ─── 1. BRAND ─── */}
          <SectionAccordion title="Brand" icon={<Palette className="w-4 h-4" />} open={isOpen('brand')} onToggle={() => toggle('brand')}>
            <Field label="Business Name">
              <input className={inputClass} value={site.brand.businessName} onChange={(e) => b('businessName', e.target.value)} />
            </Field>
            <Field label="Tagline">
              <input className={inputClass} value={site.brand.tagline} onChange={(e) => b('tagline', e.target.value)} placeholder="A short tagline..." />
            </Field>
            <Field label="Logo">
              <ImageUploader value={site.brand.logoUrl} onChange={(url) => b('logoUrl', url)} label="Upload logo" />
            </Field>
            <ColorPicker label="Accent Color" value={site.brand.accentColor} onChange={(v) => b('accentColor', v)} />
            <ColorPicker label="Background Color" value={site.brand.backgroundColor} onChange={(v) => b('backgroundColor', v)} />
            <ColorPicker label="Text Color" value={site.brand.textColor} onChange={(v) => b('textColor', v)} />

            {/* Font Selection */}
            <div className="pt-2 border-t border-[#1a1a1a]">
              <p className="text-[10px] text-[#555] uppercase tracking-widest mb-3 mt-2">Typography</p>
            </div>
            <Field label="Heading Font">
              <select
                className={`${inputClass} cursor-pointer`}
                value={site.brand.headingFont || 'Inter'}
                onChange={(e) => b('headingFont', e.target.value)}
                style={{ fontFamily: `"${site.brand.headingFont || 'Inter'}", sans-serif` }}
              >
                {['Sans-serif', 'Serif', 'Display', 'Monospace'].map((category) => (
                  <optgroup key={category} label={category}>
                    {fontOptions.filter((f) => f.category === category).map((f) => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </Field>
            <Field label="Body Font">
              <select
                className={`${inputClass} cursor-pointer`}
                value={site.brand.bodyFont || 'Inter'}
                onChange={(e) => b('bodyFont', e.target.value)}
                style={{ fontFamily: `"${site.brand.bodyFont || 'Inter'}", sans-serif` }}
              >
                {['Sans-serif', 'Serif', 'Display', 'Monospace'].map((category) => (
                  <optgroup key={category} label={category}>
                    {fontOptions.filter((f) => f.category === category).map((f) => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </Field>

            {/* Font Preview */}
            <div className="rounded-lg border border-[#222] bg-[#0a0a0a] p-4 space-y-2">
              <p className="text-[10px] text-[#555] uppercase tracking-widest mb-2">Preview</p>
              <p className="text-lg font-bold" style={{ fontFamily: `"${site.brand.headingFont || 'Inter'}", serif` }}>
                {site.brand.businessName || 'Heading Font'}
              </p>
              <p className="text-sm opacity-70" style={{ fontFamily: `"${site.brand.bodyFont || 'Inter'}", sans-serif` }}>
                {site.brand.tagline || 'This is how your body text will look on the published site.'}
              </p>
            </div>
          </SectionAccordion>

          {/* ─── 2. BUSINESS INFO ─── */}
          <SectionAccordion title="Business Info" icon={<Building2 className="w-4 h-4" />} open={isOpen('business')} onToggle={() => toggle('business')}>
            <Field label="Phone">
              <input className={inputClass} value={site.businessInfo.phone} onChange={(e) => bi('phone', e.target.value)} placeholder="+1 234 567 890" />
            </Field>
            <Field label="Email">
              <input className={inputClass} value={site.businessInfo.email} onChange={(e) => bi('email', e.target.value)} placeholder="hello@example.com" />
            </Field>
            <Field label="Address">
              <input className={inputClass} value={site.businessInfo.address} onChange={(e) => bi('address', e.target.value)} placeholder="123 Main St" />
            </Field>
            <Field label="City">
              <input className={inputClass} value={site.businessInfo.city} onChange={(e) => bi('city', e.target.value)} />
            </Field>
            <Field label="Country">
              <input className={inputClass} value={site.businessInfo.country} onChange={(e) => bi('country', e.target.value)} />
            </Field>
            <Field label="Postal Code">
              <input className={inputClass} value={site.businessInfo.postalCode} onChange={(e) => bi('postalCode', e.target.value)} />
            </Field>
            <Field label="Hours">
              <input className={inputClass} value={site.businessInfo.hours} onChange={(e) => bi('hours', e.target.value)} placeholder="Mon-Fri 9am-5pm" />
            </Field>
            <Field label="Founded Year">
              <input className={inputClass} value={site.businessInfo.founded} onChange={(e) => bi('founded', e.target.value)} placeholder="2020" />
            </Field>
            <Field label="Description">
              <textarea className={`${inputClass} min-h-[80px] resize-y`} value={site.businessInfo.description} onChange={(e) => bi('description', e.target.value)} placeholder="A brief description of your business..." />
            </Field>
          </SectionAccordion>

          {/* ─── 3. SOCIAL LINKS ─── */}
          <SectionAccordion title="Social Links" icon={<Share2 className="w-4 h-4" />} open={isOpen('social')} onToggle={() => toggle('social')}>
            {(['instagram', 'facebook', 'twitter', 'tiktok', 'linkedin', 'youtube', 'whatsapp', 'tripadvisor'] as const).map((platform) => (
              <Field key={platform} label={platform}>
                <input className={inputClass} value={site.social[platform]} onChange={(e) => so(platform, e.target.value)} placeholder={`https://${platform}.com/...`} />
              </Field>
            ))}
          </SectionAccordion>

          {/* ─── 4. NAVBAR ─── */}
          <SectionAccordion title="Navbar" icon={<Navigation className="w-4 h-4" />} open={isOpen('navbar')} onToggle={() => toggle('navbar')}>
            <Toggle label="Show Logo" checked={site.navbar.showLogo} onChange={(v) => nv('showLogo', v)} />
            <Field label="CTA Text">
              <input className={inputClass} value={site.navbar.ctaText} onChange={(e) => nv('ctaText', e.target.value)} />
            </Field>
            <Field label="CTA Link">
              <input className={inputClass} value={site.navbar.ctaLink} onChange={(e) => nv('ctaLink', e.target.value)} />
            </Field>
            <Field label="Style">
              <select className={inputClass} value={site.navbar.style} onChange={(e) => nv('style', e.target.value)}>
                <option value="transparent">Transparent</option>
                <option value="solid">Solid</option>
                <option value="glass">Glass</option>
              </select>
            </Field>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={labelClass}>Nav Links</label>
                <button
                  onClick={() =>
                    nv('links', [...site.navbar.links, { label: 'New Link', href: '#' }])
                  }
                  className="text-[10px] text-[#888] hover:text-white flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3 h-3" /> Add
                </button>
              </div>
              <div className="space-y-2">
                {site.navbar.links.map((link, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <GripVertical className="w-3 h-3 text-[#444] shrink-0" />
                    <input
                      className={`${inputClass} !py-1.5`}
                      value={link.label}
                      onChange={(e) => {
                        const updated = [...site.navbar.links];
                        updated[i] = { ...updated[i], label: e.target.value };
                        nv('links', updated);
                      }}
                      placeholder="Label"
                    />
                    <input
                      className={`${inputClass} !py-1.5`}
                      value={link.href}
                      onChange={(e) => {
                        const updated = [...site.navbar.links];
                        updated[i] = { ...updated[i], href: e.target.value };
                        nv('links', updated);
                      }}
                      placeholder="#section"
                    />
                    <button
                      onClick={() => {
                        const updated = site.navbar.links.filter((_, idx) => idx !== i);
                        nv('links', updated);
                      }}
                      className="text-[#555] hover:text-red-400 transition-colors shrink-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </SectionAccordion>

          {/* ─── 5. HERO ─── */}
          <SectionAccordion title="Hero" icon={<Megaphone className="w-4 h-4" />} open={isOpen('hero')} onToggle={() => toggle('hero')}>
            <Field label="Headline">
              <input className={inputClass} value={site.hero.headline} onChange={(e) => hr('headline', e.target.value)} />
            </Field>
            <Field label="Subline">
              <input className={inputClass} value={site.hero.subline} onChange={(e) => hr('subline', e.target.value)} />
            </Field>
            <Field label="Description">
              <textarea className={`${inputClass} min-h-[60px] resize-y`} value={site.hero.description} onChange={(e) => hr('description', e.target.value)} />
            </Field>
            <Field label="CTA Text">
              <input className={inputClass} value={site.hero.ctaText} onChange={(e) => hr('ctaText', e.target.value)} />
            </Field>
            <Field label="CTA Link">
              <input className={inputClass} value={site.hero.ctaLink} onChange={(e) => hr('ctaLink', e.target.value)} />
            </Field>
            <Field label="Secondary CTA Text">
              <input className={inputClass} value={site.hero.secondaryCtaText} onChange={(e) => hr('secondaryCtaText', e.target.value)} />
            </Field>
            <Field label="Secondary CTA Link">
              <input className={inputClass} value={site.hero.secondaryCtaLink} onChange={(e) => hr('secondaryCtaLink', e.target.value)} />
            </Field>
            <Field label="Background Image">
              <input className={`${inputClass} mb-2`} value={site.hero.backgroundImage} onChange={(e) => hr('backgroundImage', e.target.value)} placeholder="https://..." />
              <ImageUploader value={site.hero.backgroundImage || null} onChange={(url) => hr('backgroundImage', url)} label="Or upload" />
            </Field>
            <Field label={`Overlay Opacity (${site.hero.overlayOpacity}%)`}>
              <input
                type="range"
                min={0}
                max={100}
                value={site.hero.overlayOpacity}
                onChange={(e) => hr('overlayOpacity', Number(e.target.value))}
                className="w-full accent-white h-1.5"
              />
            </Field>
            <Field label="Alignment">
              <select className={inputClass} value={site.hero.alignment} onChange={(e) => hr('alignment', e.target.value)}>
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </Field>
          </SectionAccordion>

          {/* ─── 6. ABOUT ─── */}
          <SectionAccordion title="About" icon={<Info className="w-4 h-4" />} open={isOpen('about')} onToggle={() => toggle('about')}>
            <Toggle label="Enable About Section" checked={site.about.enabled} onChange={(v) => ab('enabled', v)} />
            <Field label="Title">
              <input className={inputClass} value={site.about.title} onChange={(e) => ab('title', e.target.value)} />
            </Field>
            <Field label="Description">
              <textarea className={`${inputClass} min-h-[80px] resize-y`} value={site.about.description} onChange={(e) => ab('description', e.target.value)} />
            </Field>
            <Field label="Mission">
              <textarea className={`${inputClass} min-h-[60px] resize-y`} value={site.about.mission} onChange={(e) => ab('mission', e.target.value)} />
            </Field>
            <Field label="About Image">
              <ImageUploader value={site.about.image || null} onChange={(url) => ab('image', url)} label="Upload image" />
            </Field>

            {/* Features list */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={labelClass}>Features</label>
                <button
                  onClick={() =>
                    ab('features', [...site.about.features, { title: '', description: '', icon: 'Star' }])
                  }
                  className="text-[10px] text-[#888] hover:text-white flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3 h-3" /> Add
                </button>
              </div>
              <div className="space-y-3">
                {site.about.features.map((feat, i) => (
                  <div key={i} className="bg-[#0a0a0a] border border-[#1e1e1e] rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[#555]">Feature {i + 1}</span>
                      <button
                        onClick={() => {
                          const updated = site.about.features.filter((_, idx) => idx !== i);
                          ab('features', updated);
                        }}
                        className="text-[#555] hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <input
                      className={`${inputClass} !py-1.5`}
                      placeholder="Title"
                      value={feat.title}
                      onChange={(e) => {
                        const updated = [...site.about.features];
                        updated[i] = { ...updated[i], title: e.target.value };
                        ab('features', updated);
                      }}
                    />
                    <input
                      className={`${inputClass} !py-1.5`}
                      placeholder="Description"
                      value={feat.description}
                      onChange={(e) => {
                        const updated = [...site.about.features];
                        updated[i] = { ...updated[i], description: e.target.value };
                        ab('features', updated);
                      }}
                    />
                    <IconPicker
                      value={feat.icon}
                      onChange={(v) => {
                        const updated = [...site.about.features];
                        updated[i] = { ...updated[i], icon: v };
                        ab('features', updated);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </SectionAccordion>

          {/* ─── 7. GALLERY ─── */}
          <SectionAccordion title="Gallery" icon={<ImageIcon className="w-4 h-4" />} open={isOpen('gallery')} onToggle={() => toggle('gallery')}>
            <Toggle label="Enable Gallery" checked={site.gallery.enabled} onChange={(v) => gl('enabled', v)} />
            <Field label="Title">
              <input className={inputClass} value={site.gallery.title} onChange={(e) => gl('title', e.target.value)} />
            </Field>
            <Field label="Subtitle">
              <input className={inputClass} value={site.gallery.subtitle} onChange={(e) => gl('subtitle', e.target.value)} />
            </Field>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={labelClass}>Images</label>
                <button
                  onClick={() =>
                    gl('images', [...site.gallery.images, { url: '', caption: '' }])
                  }
                  className="text-[10px] text-[#888] hover:text-white flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3 h-3" /> Add
                </button>
              </div>
              <div className="space-y-3">
                {site.gallery.images.map((img, i) => (
                  <div key={i} className="bg-[#0a0a0a] border border-[#1e1e1e] rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[#555]">Image {i + 1}</span>
                      <button
                        onClick={() => {
                          const updated = site.gallery.images.filter((_, idx) => idx !== i);
                          gl('images', updated);
                        }}
                        className="text-[#555] hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <input
                      className={`${inputClass} !py-1.5`}
                      placeholder="Image URL"
                      value={img.url}
                      onChange={(e) => {
                        const updated = [...site.gallery.images];
                        updated[i] = { ...updated[i], url: e.target.value };
                        gl('images', updated);
                      }}
                    />
                    <input
                      className={`${inputClass} !py-1.5`}
                      placeholder="Caption"
                      value={img.caption}
                      onChange={(e) => {
                        const updated = [...site.gallery.images];
                        updated[i] = { ...updated[i], caption: e.target.value };
                        gl('images', updated);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </SectionAccordion>

          {/* ─── 8. TESTIMONIALS ─── */}
          <SectionAccordion title="Testimonials" icon={<MessageSquareQuote className="w-4 h-4" />} open={isOpen('testimonials')} onToggle={() => toggle('testimonials')}>
            <Toggle label="Enable Testimonials" checked={site.testimonials.enabled} onChange={(v) => te('enabled', v)} />
            <Field label="Title">
              <input className={inputClass} value={site.testimonials.title} onChange={(e) => te('title', e.target.value)} />
            </Field>
            <Field label="Subtitle">
              <input className={inputClass} value={site.testimonials.subtitle} onChange={(e) => te('subtitle', e.target.value)} />
            </Field>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={labelClass}>Testimonial Cards</label>
                <button
                  onClick={() =>
                    te('items', [
                      ...site.testimonials.items,
                      { name: '', role: '', quote: '', rating: 5, avatar: '' },
                    ])
                  }
                  className="text-[10px] text-[#888] hover:text-white flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3 h-3" /> Add
                </button>
              </div>
              <div className="space-y-3">
                {site.testimonials.items.map((item, i) => (
                  <div key={i} className="bg-[#0a0a0a] border border-[#1e1e1e] rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[#555]">Testimonial {i + 1}</span>
                      <button
                        onClick={() => {
                          const updated = site.testimonials.items.filter((_, idx) => idx !== i);
                          te('items', updated);
                        }}
                        className="text-[#555] hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <input
                      className={`${inputClass} !py-1.5`}
                      placeholder="Name"
                      value={item.name}
                      onChange={(e) => {
                        const updated = [...site.testimonials.items];
                        updated[i] = { ...updated[i], name: e.target.value };
                        te('items', updated);
                      }}
                    />
                    <input
                      className={`${inputClass} !py-1.5`}
                      placeholder="Role"
                      value={item.role}
                      onChange={(e) => {
                        const updated = [...site.testimonials.items];
                        updated[i] = { ...updated[i], role: e.target.value };
                        te('items', updated);
                      }}
                    />
                    <textarea
                      className={`${inputClass} !py-1.5 min-h-[50px] resize-y`}
                      placeholder="Quote"
                      value={item.quote}
                      onChange={(e) => {
                        const updated = [...site.testimonials.items];
                        updated[i] = { ...updated[i], quote: e.target.value };
                        te('items', updated);
                      }}
                    />
                    <div className="flex items-center gap-2">
                      <label className="text-[10px] text-[#555]">Rating</label>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => {
                              const updated = [...site.testimonials.items];
                              updated[i] = { ...updated[i], rating: star };
                              te('items', updated);
                            }}
                            className={`transition-colors ${
                              star <= item.rating ? 'text-yellow-400' : 'text-[#333]'
                            }`}
                          >
                            <Star className="w-3.5 h-3.5 fill-current" />
                          </button>
                        ))}
                      </div>
                    </div>
                    <input
                      className={`${inputClass} !py-1.5`}
                      placeholder="Avatar URL (optional)"
                      value={item.avatar}
                      onChange={(e) => {
                        const updated = [...site.testimonials.items];
                        updated[i] = { ...updated[i], avatar: e.target.value };
                        te('items', updated);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </SectionAccordion>

          {/* ─── 9. CONTACT ─── */}
          <SectionAccordion title="Contact" icon={<Mail className="w-4 h-4" />} open={isOpen('contact')} onToggle={() => toggle('contact')}>
            <Toggle label="Enable Contact Section" checked={site.contact.enabled} onChange={(v) => ct('enabled', v)} />
            <Field label="Title">
              <input className={inputClass} value={site.contact.title} onChange={(e) => ct('title', e.target.value)} />
            </Field>
            <Field label="Subtitle">
              <input className={inputClass} value={site.contact.subtitle} onChange={(e) => ct('subtitle', e.target.value)} />
            </Field>
            <Toggle label="Show Map" checked={site.contact.showMap} onChange={(v) => ct('showMap', v)} />
            {site.contact.showMap && (
              <Field label="Map Embed URL or Code">
                <textarea
                  className={`${inputClass} min-h-[60px] resize-y font-mono text-[11px]`}
                  value={site.contact.mapEmbed}
                  onChange={(e) => {
                    let val = e.target.value;
                    // Extract src URL from pasted <iframe> embed code
                    const srcMatch = val.match(/src=["']([^"']+)["']/);
                    if (srcMatch) val = srcMatch[1];
                    ct('mapEmbed', val);
                  }}
                  placeholder='Paste Google Maps embed URL or full <iframe> code'
                />
              </Field>
            )}
            <Toggle label="Show Form" checked={site.contact.showForm} onChange={(v) => ct('showForm', v)} />
            {site.contact.showForm && (
              <div>
                <label className={labelClass}>Form Fields</label>
                <div className="space-y-1.5">
                  {contactFieldOptions.map((field) => (
                    <label key={field} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={site.contact.formFields.includes(field)}
                        onChange={(e) => {
                          const fields = e.target.checked
                            ? [...site.contact.formFields, field]
                            : site.contact.formFields.filter((f) => f !== field);
                          ct('formFields', fields);
                        }}
                        className="accent-white w-3.5 h-3.5"
                      />
                      <span className="text-xs text-[#aaa] group-hover:text-white capitalize transition-colors">
                        {field}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </SectionAccordion>

          {/* ─── 10. FOOTER ─── */}
          <SectionAccordion title="Footer" icon={<PanelBottom className="w-4 h-4" />} open={isOpen('footer')} onToggle={() => toggle('footer')}>
            <Field label="Copyright Text">
              <input className={inputClass} value={site.footer.copyrightText} onChange={(e) => ft('copyrightText', e.target.value)} />
            </Field>
            <Toggle label="Show Newsletter" checked={site.footer.showNewsletter} onChange={(v) => ft('showNewsletter', v)} />
            {site.footer.showNewsletter && (
              <Field label="Newsletter Headline">
                <input className={inputClass} value={site.footer.newsletterHeadline} onChange={(e) => ft('newsletterHeadline', e.target.value)} />
              </Field>
            )}
            <Toggle label="Show Social Links" checked={site.footer.showSocial} onChange={(v) => ft('showSocial', v)} />
            <Field label="Bottom Text">
              <input className={inputClass} value={site.footer.bottomText} onChange={(e) => ft('bottomText', e.target.value)} />
            </Field>

            {/* Link Columns */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={labelClass}>Link Columns</label>
                <button
                  onClick={() =>
                    ft('columns', [...site.footer.columns, { title: 'New Column', links: [] }])
                  }
                  className="text-[10px] text-[#888] hover:text-white flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3 h-3" /> Add Column
                </button>
              </div>
              <div className="space-y-3">
                {site.footer.columns.map((col, ci) => (
                  <div key={ci} className="bg-[#0a0a0a] border border-[#1e1e1e] rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <input
                        className={`${inputClass} !py-1 !text-xs font-medium`}
                        placeholder="Column title"
                        value={col.title}
                        onChange={(e) => {
                          const updated = [...site.footer.columns];
                          updated[ci] = { ...updated[ci], title: e.target.value };
                          ft('columns', updated);
                        }}
                      />
                      <button
                        onClick={() => {
                          const updated = site.footer.columns.filter((_, idx) => idx !== ci);
                          ft('columns', updated);
                        }}
                        className="text-[#555] hover:text-red-400 transition-colors ml-2 shrink-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    {col.links.map((link, li) => (
                      <div key={li} className="flex items-center gap-1.5">
                        <input
                          className={`${inputClass} !py-1 flex-1`}
                          placeholder="Label"
                          value={link.label}
                          onChange={(e) => {
                            const updated = [...site.footer.columns];
                            const links = [...updated[ci].links];
                            links[li] = { ...links[li], label: e.target.value };
                            updated[ci] = { ...updated[ci], links };
                            ft('columns', updated);
                          }}
                        />
                        <input
                          className={`${inputClass} !py-1 flex-1`}
                          placeholder="URL"
                          value={link.href}
                          onChange={(e) => {
                            const updated = [...site.footer.columns];
                            const links = [...updated[ci].links];
                            links[li] = { ...links[li], href: e.target.value };
                            updated[ci] = { ...updated[ci], links };
                            ft('columns', updated);
                          }}
                        />
                        <button
                          onClick={() => {
                            const updated = [...site.footer.columns];
                            updated[ci] = {
                              ...updated[ci],
                              links: updated[ci].links.filter((_, idx) => idx !== li),
                            };
                            ft('columns', updated);
                          }}
                          className="text-[#555] hover:text-red-400 transition-colors shrink-0"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const updated = [...site.footer.columns];
                        updated[ci] = {
                          ...updated[ci],
                          links: [...updated[ci].links, { label: '', href: '#' }],
                        };
                        ft('columns', updated);
                      }}
                      className="text-[10px] text-[#888] hover:text-white flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3 h-3" /> Add Link
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </SectionAccordion>

          {/* ─── 11. SEO ─── */}
          <SectionAccordion title="SEO" icon={<Search className="w-4 h-4" />} open={isOpen('seo')} onToggle={() => toggle('seo')}>
            <Field label="Meta Title">
              <input className={inputClass} value={site.seo.metaTitle} onChange={(e) => se('metaTitle', e.target.value)} />
            </Field>
            <Field label="Meta Description">
              <textarea className={`${inputClass} min-h-[60px] resize-y`} value={site.seo.metaDescription} onChange={(e) => se('metaDescription', e.target.value)} />
            </Field>
            <Field label="OG Image URL">
              <input className={inputClass} value={site.seo.ogImage} onChange={(e) => se('ogImage', e.target.value)} placeholder="https://..." />
            </Field>
          </SectionAccordion>

          {/* ─── 12. VERTICAL CONTENT ─── */}
          <SectionAccordion
            title={verticalSectionLabel[site.vertical]}
            icon={verticalSectionIcon[site.vertical]}
            open={isOpen('vertical')}
            onToggle={() => toggle('vertical')}
          >
            {/* ── Hotel Rooms ── */}
            {site.vertical === 'hotel' && site.hotelContent && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className={labelClass}>Rooms ({site.hotelContent.rooms.length})</label>
                  <button
                    onClick={() => {
                      const newRoom = {
                        id: Date.now().toString(36),
                        name: '',
                        size: '',
                        view: 'King Bed',
                        pricePerNight: 0,
                        maxGuests: 2,
                        amenities: [],
                        images: [],
                        available: true,
                        description: '',
                      };
                      updateHotelContent(id, { rooms: [...site.hotelContent!.rooms, newRoom] });
                    }}
                    className="text-[10px] text-[#888] hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3 h-3" /> Add Room
                  </button>
                </div>
                {site.hotelContent.rooms.map((room, ri) => (
                  <div key={room.id} className="bg-[#0a0a0a] border border-[#1e1e1e] rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[#555]">Room {ri + 1}</span>
                      <button
                        onClick={() => {
                          const updated = site.hotelContent!.rooms.filter((_, idx) => idx !== ri);
                          updateHotelContent(id, { rooms: updated });
                        }}
                        className="text-[#555] hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <input className={`${inputClass} !py-1.5`} placeholder="Room name" value={room.name}
                      onChange={(e) => { const u = [...site.hotelContent!.rooms]; u[ri] = { ...u[ri], name: e.target.value }; updateHotelContent(id, { rooms: u }); }} />
                    <div className="grid grid-cols-2 gap-2">
                      <input className={`${inputClass} !py-1.5`} type="number" placeholder="Price/night" value={room.pricePerNight || ''}
                        onChange={(e) => { const u = [...site.hotelContent!.rooms]; u[ri] = { ...u[ri], pricePerNight: Number(e.target.value) }; updateHotelContent(id, { rooms: u }); }} />
                      <input className={`${inputClass} !py-1.5`} type="number" placeholder="Max guests" value={room.maxGuests || ''}
                        onChange={(e) => { const u = [...site.hotelContent!.rooms]; u[ri] = { ...u[ri], maxGuests: Number(e.target.value) }; updateHotelContent(id, { rooms: u }); }} />
                    </div>
                    <select className={`${inputClass} !py-1.5`} value={room.view}
                      onChange={(e) => { const u = [...site.hotelContent!.rooms]; u[ri] = { ...u[ri], view: e.target.value }; updateHotelContent(id, { rooms: u }); }}>
                      <option value="King Bed">King Bed</option>
                      <option value="Queen Bed">Queen Bed</option>
                      <option value="Twin Beds">Twin Beds</option>
                      <option value="Double Bed">Double Bed</option>
                      <option value="Ocean View">Ocean View</option>
                      <option value="City View">City View</option>
                      <option value="Garden View">Garden View</option>
                    </select>
                    <input className={`${inputClass} !py-1.5`} placeholder="Image URL" value={room.images?.[0] || ''}
                      onChange={(e) => { const u = [...site.hotelContent!.rooms]; u[ri] = { ...u[ri], images: [e.target.value] }; updateHotelContent(id, { rooms: u }); }} />
                    <textarea className={`${inputClass} !py-1.5 resize-none`} rows={2} placeholder="Description (optional)" value={room.description || ''}
                      onChange={(e) => { const u = [...site.hotelContent!.rooms]; u[ri] = { ...u[ri], description: e.target.value }; updateHotelContent(id, { rooms: u }); }} />
                  </div>
                ))}
              </div>
            )}

            {/* ── Restaurant Menu ── */}
            {site.vertical === 'restaurant' && site.restaurantContent && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className={labelClass}>Categories</label>
                  <button
                    onClick={() => {
                      const newCat = { id: Date.now().toString(36), name: 'New Category', items: [] };
                      updateRestaurantContent(id, { categories: [...site.restaurantContent!.categories, newCat] });
                    }}
                    className="text-[10px] text-[#888] hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3 h-3" /> Add Category
                  </button>
                </div>
                {site.restaurantContent.categories.map((cat, ci) => (
                  <div key={cat.id} className="bg-[#0a0a0a] border border-[#1e1e1e] rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <input className={`${inputClass} !py-1 !text-xs font-medium`} placeholder="Category name" value={cat.name}
                        onChange={(e) => { const u = [...site.restaurantContent!.categories]; u[ci] = { ...u[ci], name: e.target.value }; updateRestaurantContent(id, { categories: u }); }} />
                      <button onClick={() => { const u = site.restaurantContent!.categories.filter((_, idx) => idx !== ci); updateRestaurantContent(id, { categories: u }); }}
                        className="text-[#555] hover:text-red-400 transition-colors shrink-0">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    {/* Items in this category */}
                    {cat.items.map((item, ii) => (
                      <div key={item.id} className="border border-[#1a1a1a] rounded-lg p-2 space-y-1.5 ml-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] text-[#444]">Item {ii + 1}</span>
                          <button onClick={() => {
                            const u = [...site.restaurantContent!.categories];
                            u[ci] = { ...u[ci], items: u[ci].items.filter((_, idx) => idx !== ii) };
                            updateRestaurantContent(id, { categories: u });
                          }} className="text-[#555] hover:text-red-400 transition-colors">
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        </div>
                        <input className={`${inputClass} !py-1 !text-xs`} placeholder="Item name" value={item.name}
                          onChange={(e) => { const u = [...site.restaurantContent!.categories]; u[ci] = { ...u[ci], items: u[ci].items.map((it, idx) => idx === ii ? { ...it, name: e.target.value } : it) }; updateRestaurantContent(id, { categories: u }); }} />
                        <div className="grid grid-cols-2 gap-1.5">
                          <input className={`${inputClass} !py-1 !text-xs`} type="number" placeholder="Price" value={item.price || ''}
                            onChange={(e) => { const u = [...site.restaurantContent!.categories]; u[ci] = { ...u[ci], items: u[ci].items.map((it, idx) => idx === ii ? { ...it, price: Number(e.target.value) } : it) }; updateRestaurantContent(id, { categories: u }); }} />
                          <select className={`${inputClass} !py-1 !text-xs`} value={item.dietary?.[0] || ''}
                            onChange={(e) => { const u = [...site.restaurantContent!.categories]; u[ci] = { ...u[ci], items: u[ci].items.map((it, idx) => idx === ii ? { ...it, dietary: e.target.value ? [e.target.value] : [] } : it) }; updateRestaurantContent(id, { categories: u }); }}>
                            <option value="">No dietary tag</option>
                            <option value="Vegan">Vegan</option>
                            <option value="Vegetarian">Vegetarian</option>
                            <option value="Gluten-Free">Gluten-Free</option>
                          </select>
                        </div>
                        <input className={`${inputClass} !py-1 !text-xs`} placeholder="Description (optional)" value={item.description || ''}
                          onChange={(e) => { const u = [...site.restaurantContent!.categories]; u[ci] = { ...u[ci], items: u[ci].items.map((it, idx) => idx === ii ? { ...it, description: e.target.value } : it) }; updateRestaurantContent(id, { categories: u }); }} />
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const newItem = { id: Date.now().toString(36), name: '', price: 0, description: '', dietary: [] as string[], popular: false };
                        const u = [...site.restaurantContent!.categories];
                        u[ci] = { ...u[ci], items: [...u[ci].items, newItem] };
                        updateRestaurantContent(id, { categories: u });
                      }}
                      className="text-[10px] text-[#888] hover:text-white flex items-center gap-1 transition-colors ml-2"
                    >
                      <Plus className="w-3 h-3" /> Add Item
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* ── Store Products ── */}
            {site.vertical === 'store' && site.storeContent && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className={labelClass}>Products ({site.storeContent.products.length})</label>
                  <button
                    onClick={() => {
                      const cats = Object.keys(site.storeContent!.categoryLabels);
                      const newProduct = {
                        id: Date.now().toString(36),
                        category: (cats[0] || 'clothing') as 'clothing' | 'art' | 'accessories' | 'objects',
                        name: '',
                        artist: null,
                        price: 0,
                        sizes: null,
                        colors: null,
                        images: [],
                        stock: 10,
                        badge: null,
                        description: '',
                      };
                      updateStoreContent(id, { products: [...site.storeContent!.products, newProduct] });
                    }}
                    className="text-[10px] text-[#888] hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3 h-3" /> Add Product
                  </button>
                </div>
                {/* Category Labels */}
                <div>
                  <label className={`${labelClass} !mb-2`}>Category Labels</label>
                  {Object.entries(site.storeContent.categoryLabels).map(([key, label]) => (
                    <div key={key} className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] text-[#555] w-20 shrink-0">{key}</span>
                      <input className={`${inputClass} !py-1.5`} value={label}
                        onChange={(e) => { updateStoreContent(id, { categoryLabels: { ...site.storeContent!.categoryLabels, [key]: e.target.value } }); }} />
                    </div>
                  ))}
                </div>
                {/* Product list */}
                {site.storeContent.products.map((product, pi) => (
                  <div key={product.id} className="bg-[#0a0a0a] border border-[#1e1e1e] rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[#555]">Product {pi + 1}</span>
                      <button
                        onClick={() => { const u = site.storeContent!.products.filter((_, idx) => idx !== pi); updateStoreContent(id, { products: u }); }}
                        className="text-[#555] hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <input className={`${inputClass} !py-1.5`} placeholder="Product name" value={product.name}
                      onChange={(e) => { const u = [...site.storeContent!.products]; u[pi] = { ...u[pi], name: e.target.value }; updateStoreContent(id, { products: u }); }} />
                    <div className="grid grid-cols-2 gap-2">
                      <input className={`${inputClass} !py-1.5`} type="number" placeholder="Price" value={product.price || ''}
                        onChange={(e) => { const u = [...site.storeContent!.products]; u[pi] = { ...u[pi], price: Number(e.target.value) }; updateStoreContent(id, { products: u }); }} />
                      <select className={`${inputClass} !py-1.5`} value={product.category}
                        onChange={(e) => { const u = [...site.storeContent!.products]; u[pi] = { ...u[pi], category: e.target.value as 'clothing' | 'art' | 'accessories' | 'objects' }; updateStoreContent(id, { products: u }); }}>
                        {Object.keys(site.storeContent!.categoryLabels).map((k) => (
                          <option key={k} value={k}>{site.storeContent!.categoryLabels[k]}</option>
                        ))}
                      </select>
                    </div>
                    <input className={`${inputClass} !py-1.5`} placeholder="Image URL" value={product.images?.[0] || ''}
                      onChange={(e) => { const u = [...site.storeContent!.products]; u[pi] = { ...u[pi], images: [e.target.value] }; updateStoreContent(id, { products: u }); }} />
                    <input className={`${inputClass} !py-1.5`} placeholder="Sizes (comma-separated, e.g. S,M,L,XL)" value={product.sizes?.join(',') || ''}
                      onChange={(e) => { const u = [...site.storeContent!.products]; u[pi] = { ...u[pi], sizes: e.target.value ? e.target.value.split(',').map(s => s.trim()) : null }; updateStoreContent(id, { products: u }); }} />
                    <textarea className={`${inputClass} !py-1.5 resize-none`} rows={2} placeholder="Description (optional)" value={product.description || ''}
                      onChange={(e) => { const u = [...site.storeContent!.products]; u[pi] = { ...u[pi], description: e.target.value }; updateStoreContent(id, { products: u }); }} />
                  </div>
                ))}
              </div>
            )}

            {/* ── Travel ── */}
            {site.vertical === 'travel' && (
              <div className="space-y-2">
                <p className="text-[10px] text-[#555]">
                  Flight search and booking management coming soon.
                </p>
              </div>
            )}
          </SectionAccordion>
        </aside>

        {/* ─── Preview Area ─── */}
        <div className="flex-1 bg-[#050505] overflow-hidden relative">
          <div className="absolute top-3 right-3 z-10">
            {site.status === 'published' && (
              <button
                onClick={() => window.open(`/site/${site.slug}`, '_blank')}
                className="flex items-center gap-1.5 bg-[#111] border border-[#222] text-xs text-[#888] hover:text-white px-3 py-1.5 rounded-lg transition-colors"
              >
                <Eye className="w-3 h-3" />
                Preview Full Page
              </button>
            )}
          </div>

          <div className="w-full h-full overflow-auto">
            <div
              className="origin-top-left"
              style={{
                transform: 'scale(0.5)',
                width: '200%',
                height: '200%',
              }}
            >
              {liveConfig && <SiteRenderer config={liveConfig} />}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Publish Modal ─── */}
      <AnimatePresence>
        {showPublishModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowPublishModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#111] border border-[#222] rounded-xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold">
                  {site.status === 'published' ? 'Update Site Slug' : 'Publish Your Site'}
                </h3>
                <button
                  onClick={() => setShowPublishModal(false)}
                  className="text-[#888] hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-[#888] mb-4">
                Choose a URL slug for your site. It will be available at{' '}
                <span className="text-white font-mono">/site/{publishSlug || '...'}</span>
              </p>

              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-[#555] font-mono">/site/</span>
                <input
                  className={inputClass}
                  value={publishSlug}
                  onChange={(e) => {
                    const cleaned = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                    setPublishSlug(cleaned);
                    setSlugError('');
                  }}
                  placeholder="my-site"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handlePublish()}
                />
              </div>

              {slugError && <p className="text-xs text-red-400 mt-1 mb-3">{slugError}</p>}

              <div className="flex justify-end gap-3 mt-5">
                <button
                  onClick={() => setShowPublishModal(false)}
                  className="text-xs text-[#888] hover:text-white transition-colors px-3 py-2"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePublish}
                  className="bg-white text-black px-4 py-2 rounded-lg text-xs font-medium hover:bg-white/90 transition-colors"
                >
                  {site.status === 'published' ? 'Update' : 'Publish'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
