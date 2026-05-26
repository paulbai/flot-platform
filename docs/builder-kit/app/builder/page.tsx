'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Hotel,
  UtensilsCrossed,
  ShoppingBag,
  Plane,
  Pencil,
  Eye,
  Trash2,
  X,
  ArrowRight,
  Globe,
  Clock,
  Package,
} from 'lucide-react';
import { useSiteBuilderStore } from '@/store/siteBuilderStore';
import { getTemplatesForVertical } from '@/lib/templates/registry';
import type { TemplateDefinition } from '@/lib/templates/types';
import type { Vertical } from '@/lib/types/customization';
import { useAllSitesOrderNotifications } from '@/lib/hooks/useOrderNotifications';

const verticals: { key: Vertical; label: string; icon: React.ReactNode; color: string; comingSoon?: boolean }[] = [
  { key: 'hotel', label: 'Hotel', icon: <Hotel className="w-6 h-6" />, color: '#d4a96a' },
  { key: 'restaurant', label: 'Restaurant', icon: <UtensilsCrossed className="w-6 h-6" />, color: '#e85d3a' },
  { key: 'store', label: 'Store', icon: <ShoppingBag className="w-6 h-6" />, color: '#8b5cf6' },
  { key: 'travel', label: 'Travel', icon: <Plane className="w-6 h-6" />, color: '#4a9eff', comingSoon: true },
];

function verticalIcon(v: Vertical) {
  const match = verticals.find((x) => x.key === v);
  return match?.icon ?? null;
}

function verticalColor(v: Vertical) {
  return verticals.find((x) => x.key === v)?.color ?? '#888';
}

export default function BuilderDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { sites, createSite, deleteSite, fetchSites } = useSiteBuilderStore();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setHydrated(true); }, []);

  // User identifier: email or phone
  const userId = session?.user?.email || (session?.user?.name?.startsWith('+') ? session.user.name : '') || '';

  // Fetch sites from API when user is authenticated
  useEffect(() => {
    if (userId) {
      fetchSites();
    }
  }, [userId, fetchSites]);

  const mySites = useMemo(
    () => sites.filter((s) => s.ownerEmail === userId),
    [sites, userId]
  );

  // Per-site notification counts. Polls every 30s and on tab focus.
  const mySiteIds = useMemo(() => mySites.map((s) => s.id), [mySites]);
  const { countsBySite } = useAllSitesOrderNotifications(mySiteIds);

  const [showCreate, setShowCreate] = useState(false);
  const [step, setStep] = useState<'vertical' | 'template' | 'name'>('vertical');
  const [selectedVertical, setSelectedVertical] = useState<Vertical | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  // Type-to-confirm input — user must type the site's business name exactly
  // before the Delete button enables. Resets every time the modal opens.
  const [deleteTypeInput, setDeleteTypeInput] = useState('');

  const templates: TemplateDefinition[] = useMemo(
    () => (selectedVertical ? getTemplatesForVertical(selectedVertical) : []),
    [selectedVertical]
  );

  // Auto-open create modal if ?create=<vertical> is in URL
  useEffect(() => {
    const createParam = searchParams.get('create') as Vertical | null;
    const templateParam = searchParams.get('template');
    if (createParam && ['hotel', 'restaurant', 'store'].includes(createParam)) {
      setSelectedVertical(createParam);
      if (templateParam) {
        setSelectedTemplate(templateParam);
        setStep('name');
      } else {
        setStep('template');
      }
      setShowCreate(true);
    }
  }, [searchParams]);

  function handleCreateSite() {
    if (!selectedVertical || !businessName.trim()) return;
    const id = createSite(selectedVertical, businessName.trim(), userId, selectedTemplate || undefined);
    setShowCreate(false);
    setStep('vertical');
    setSelectedVertical(null);
    setSelectedTemplate(null);
    setBusinessName('');
    router.push(`/builder/${id}`);
  }

  function handleDelete(id: string) {
    deleteSite(id);
    setDeleteConfirm(null);
    setDeleteTypeInput('');
  }

  function closeModal() {
    setShowCreate(false);
    setStep('vertical');
    setSelectedVertical(null);
    setSelectedTemplate(null);
    setBusinessName('');
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  }

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Sites</h1>
          <p className="text-sm text-[#888] mt-1">
            {mySites.length === 0
              ? 'Create your first site to get started.'
              : `${mySites.length} site${mySites.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-white text-black px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-white/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create New Site
        </motion.button>
      </div>

      {/* Sites Grid */}
      {mySites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#111] border border-[#222] flex items-center justify-center mb-4">
            <Globe className="w-7 h-7 text-[#444]" />
          </div>
          <p className="text-[#888] text-sm">No sites yet. Click &quot;Create New Site&quot; to begin.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mySites.map((site) => (
            <motion.div
              key={site.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="relative bg-[#111] border border-[#1e1e1e] rounded-xl p-5 hover:border-[#333] transition-colors flex flex-col"
            >
              {/* Vertical badge */}
              <div className="flex items-center justify-between mb-3">
                <div
                  className="flex items-center gap-2 text-xs font-medium px-2.5 py-1 rounded-full"
                  style={{
                    backgroundColor: verticalColor(site.vertical) + '18',
                    color: verticalColor(site.vertical),
                  }}
                >
                  <span className="w-3.5 h-3.5">{verticalIcon(site.vertical)}</span>
                  <span className="capitalize">{site.vertical}</span>
                </div>

                <span
                  className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    site.status === 'published'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-yellow-500/10 text-yellow-500'
                  }`}
                >
                  {site.status}
                </span>
              </div>

              {/* Name + accent */}
              <div className="flex items-center gap-2.5 mb-2">
                <div
                  className="w-3 h-3 rounded-full shrink-0 border border-white/10"
                  style={{ backgroundColor: site.brand.accentColor }}
                />
                <h3 className="text-sm font-semibold truncate">{site.brand.businessName}</h3>
              </div>

              {/* Slug / URL */}
              {site.status === 'published' ? (
                <p className="text-xs text-emerald-400/70 truncate mb-3">
                  /site/{site.slug}
                </p>
              ) : (
                <p className="text-xs text-[#555] truncate mb-3">
                  /{site.slug}
                </p>
              )}

              {/* Last updated */}
              <div className="flex items-center gap-1.5 text-[11px] text-[#555] mb-4">
                <Clock className="w-3 h-3" />
                <span>Updated {timeAgo(site.updatedAt)}</span>
              </div>

              {/* Always-visible action row — no hover required. Edit / Orders / Preview
                  are the three primary actions; Delete is set apart on the right. */}
              <div className="mt-auto pt-3 border-t border-[#1e1e1e] flex items-center gap-2">
                <button
                  onClick={() => router.push(`/builder/${site.id}`)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-2 min-h-[44px] rounded-lg bg-white text-black text-xs font-semibold hover:bg-white/90 transition-colors"
                  title="Edit site"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </button>

                <button
                  onClick={() => router.push(`/builder/${site.id}/orders`)}
                  className="relative flex-1 flex items-center justify-center gap-1.5 px-2 min-h-[44px] rounded-lg border border-[#333] bg-[#1a1a1a] hover:bg-[#222] hover:border-[#444] transition-colors text-xs font-medium"
                  title={countsBySite[site.id] ? `${countsBySite[site.id]} new order${countsBySite[site.id] === 1 ? '' : 's'}` : 'View orders'}
                >
                  <Package className="w-3.5 h-3.5" style={{ color: site.brand.accentColor }} />
                  Orders
                  {countsBySite[site.id] > 0 && (
                    <span
                      className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full text-[10px] font-bold bg-orange-500 text-white border-2 border-[#111]"
                      aria-label={`${countsBySite[site.id]} new orders`}
                    >
                      {countsBySite[site.id] > 99 ? '99+' : countsBySite[site.id]}
                    </span>
                  )}
                </button>

                {site.status === 'published' && (
                  <button
                    onClick={() => window.open(`/site/${site.slug}`, '_blank')}
                    // Hide the "Preview" label on the smallest phones — keep the eye icon as
                    // a square button so the row never overflows at 320px wide.
                    className="flex items-center justify-center gap-1.5 px-2 min-h-[44px] min-w-[44px] sm:flex-1 rounded-lg border border-[#333] bg-[#1a1a1a] hover:bg-[#222] hover:border-[#444] transition-colors text-xs font-medium"
                    title="Open published site in a new tab"
                    aria-label="Preview site"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Preview</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    // Reset the type-to-confirm input every time the modal
                    // opens, so the previous typed value can't accidentally
                    // satisfy a different site's check.
                    setDeleteTypeInput('');
                    setDeleteConfirm(site.id);
                  }}
                  className="flex items-center justify-center min-w-[44px] min-h-[44px] rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors shrink-0"
                  title="Delete site"
                  aria-label="Delete site"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Delete Confirmation — type-to-confirm guardrail.
          Cancel is large + visually safe; Delete only enables when the buyer
          types the exact business name. Stops mis-tap deletions cold. */}
      <AnimatePresence>
        {deleteConfirm && (() => {
          const siteToDelete = mySites.find((s) => s.id === deleteConfirm);
          const expectedName = siteToDelete?.brand.businessName.trim() || '';
          const typedNormalized = deleteTypeInput.trim();
          const namesMatch = expectedName.length > 0 && typedNormalized === expectedName;

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4"
              style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
              onClick={() => { setDeleteConfirm(null); setDeleteTypeInput(''); }}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#111] border border-red-500/20 rounded-2xl p-6 w-full max-w-md"
                role="dialog"
                aria-modal="true"
                aria-labelledby="delete-confirm-title"
              >
                {/* Icon + heading */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                    <Trash2 className="w-5 h-5 text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 id="delete-confirm-title" className="text-base font-semibold text-white">
                      Delete this site?
                    </h3>
                    <p className="text-sm text-[#888] mt-1">
                      This is permanent — the site, its content, and its order history will be gone.
                    </p>
                  </div>
                </div>

                {/* What's being deleted */}
                {siteToDelete && (
                  <div className="bg-[#0a0a0a] border border-[#222] rounded-lg px-4 py-3 mb-4">
                    <p className="text-xs uppercase tracking-wider text-[#666] mb-1">Site</p>
                    <p className="text-sm font-semibold text-white truncate">{siteToDelete.brand.businessName}</p>
                    <p className="text-xs text-[#888] truncate font-mono mt-0.5">/site/{siteToDelete.slug}</p>
                  </div>
                )}

                {/* Type-to-confirm */}
                <label className="block mb-4">
                  <span className="text-xs text-[#888] block mb-1.5">
                    Type <span className="font-mono font-semibold text-white">{expectedName}</span> to confirm:
                  </span>
                  <input
                    type="text"
                    value={deleteTypeInput}
                    onChange={(e) => setDeleteTypeInput(e.target.value)}
                    placeholder={expectedName}
                    autoComplete="off"
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck={false}
                    className="w-full px-3 py-2.5 rounded-lg bg-[#1a1a1a] border border-[#333] text-white text-sm placeholder:text-[#444] focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 outline-none transition-colors"
                  />
                </label>

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3">
                  <button
                    onClick={() => { setDeleteConfirm(null); setDeleteTypeInput(''); }}
                    className="flex-1 sm:flex-none min-h-[44px] px-5 rounded-lg border border-[#333] bg-[#1a1a1a] hover:bg-[#222] hover:border-[#444] text-sm font-medium text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(deleteConfirm)}
                    disabled={!namesMatch}
                    className="flex-1 sm:flex-none min-h-[44px] px-5 rounded-lg bg-red-500/15 text-red-300 border border-red-500/30 hover:bg-red-500/25 hover:border-red-500/50 text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-red-500/15 disabled:hover:border-red-500/30"
                    title={namesMatch ? 'Delete site permanently' : 'Type the site name to enable'}
                  >
                    Delete site
                  </button>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#111] border border-[#222] rounded-xl p-4 sm:p-6 w-[calc(100%-2rem)] max-w-lg mx-auto max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">
                  {step === 'vertical'
                    ? 'Choose a Vertical'
                    : step === 'template'
                      ? 'Choose a Template'
                      : 'Name Your Business'}
                </h2>
                <button onClick={closeModal} className="text-[#888] hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {step === 'vertical' ? (
                <div className="grid grid-cols-2 gap-3">
                  {verticals.map((v) => (
                    <motion.button
                      key={v.key}
                      whileHover={v.comingSoon ? undefined : { scale: 1.02 }}
                      whileTap={v.comingSoon ? undefined : { scale: 0.98 }}
                      onClick={() => {
                        if (v.comingSoon) return;
                        setSelectedVertical(v.key);
                        setStep('template');
                      }}
                      className={`relative flex flex-col items-center gap-3 p-6 rounded-xl border bg-[#0a0a0a] transition-colors ${
                        v.comingSoon
                          ? 'border-[#222] opacity-50 cursor-not-allowed'
                          : 'border-[#222] hover:border-[#444] cursor-pointer'
                      }`}
                    >
                      {v.comingSoon && (
                        <span className="absolute top-2 right-2 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500">
                          Coming Soon
                        </span>
                      )}
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: v.color + '18', color: v.color }}
                      >
                        {v.icon}
                      </div>
                      <span className="text-sm font-medium">{v.label}</span>
                    </motion.button>
                  ))}
                </div>
              ) : step === 'template' ? (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <button
                      onClick={() => {
                        setStep('vertical');
                        setSelectedTemplate(null);
                      }}
                      className="text-xs text-[#888] hover:text-white transition-colors"
                    >
                      &larr; Back
                    </button>
                    <div
                      className="flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: verticalColor(selectedVertical!) + '18',
                        color: verticalColor(selectedVertical!),
                      }}
                    >
                      <span className="capitalize">{selectedVertical}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {templates.map((tpl) => {
                      const isSelected = selectedTemplate === tpl.id;
                      const accentColor = verticalColor(selectedVertical!);
                      return (
                        <motion.button
                          key={tpl.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setSelectedTemplate(tpl.id);
                            setStep('name');
                          }}
                          className="flex flex-col rounded-xl border bg-[#0a0a0a] overflow-hidden text-left transition-colors"
                          style={{
                            borderColor: isSelected ? accentColor : '#222',
                            borderWidth: isSelected ? 2 : 1,
                          }}
                        >
                          {/* Gradient preview bar */}
                          <div
                            className="w-full h-20 shrink-0"
                            style={{ background: tpl.previewGradient }}
                          />
                          <div className="p-3">
                            <h4 className="text-xs font-semibold mb-1 truncate">{tpl.name}</h4>
                            <p className="text-[11px] text-[#888] line-clamp-2 leading-relaxed">
                              {tpl.description}
                            </p>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <button
                      onClick={() => setStep('template')}
                      className="text-xs text-[#888] hover:text-white transition-colors"
                    >
                      &larr; Back
                    </button>
                    <div
                      className="flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: verticalColor(selectedVertical!) + '18',
                        color: verticalColor(selectedVertical!),
                      }}
                    >
                      <span className="capitalize">{selectedVertical}</span>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. The Grand Hotel, Sushi Bar, My Store..."
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateSite()}
                    className="bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-sm text-white placeholder:text-[#555] focus:border-[#666] outline-none w-full mb-4"
                  />

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleCreateSite}
                    disabled={!businessName.trim()}
                    className="w-full flex items-center justify-center gap-2 bg-white text-black px-4 py-3 rounded-lg text-sm font-medium hover:bg-white/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    Create Site
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
