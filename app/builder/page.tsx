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
} from 'lucide-react';
import { useSiteBuilderStore } from '@/store/siteBuilderStore';
import type { Vertical } from '@/lib/types/customization';

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
  const { sites, createSite, deleteSite } = useSiteBuilderStore();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setHydrated(true); }, []);

  const userEmail = session?.user?.email ?? '';
  const mySites = useMemo(
    () => sites.filter((s) => s.ownerEmail === userEmail),
    [sites, userEmail]
  );

  const [showCreate, setShowCreate] = useState(false);
  const [step, setStep] = useState<'vertical' | 'name'>('vertical');
  const [selectedVertical, setSelectedVertical] = useState<Vertical | null>(null);
  const [businessName, setBusinessName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Auto-open create modal if ?create=<vertical> is in URL
  useEffect(() => {
    const createParam = searchParams.get('create') as Vertical | null;
    if (createParam && ['hotel', 'restaurant', 'store'].includes(createParam)) {
      setSelectedVertical(createParam);
      setStep('name');
      setShowCreate(true);
    }
  }, [searchParams]);

  function handleCreateSite() {
    if (!selectedVertical || !businessName.trim()) return;
    const id = createSite(selectedVertical, businessName.trim(), userEmail);
    setShowCreate(false);
    setStep('vertical');
    setSelectedVertical(null);
    setBusinessName('');
    router.push(`/builder/${id}`);
  }

  function handleDelete(id: string) {
    deleteSite(id);
    setDeleteConfirm(null);
  }

  function closeModal() {
    setShowCreate(false);
    setStep('vertical');
    setSelectedVertical(null);
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
              className="group relative bg-[#111] border border-[#1e1e1e] rounded-xl p-5 hover:border-[#333] transition-colors"
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
              <div className="flex items-center gap-1.5 text-[11px] text-[#555]">
                <Clock className="w-3 h-3" />
                <span>Updated {timeAgo(site.updatedAt)}</span>
              </div>

              {/* Hover actions */}
              <div className="absolute inset-0 bg-[#111]/90 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push(`/builder/${site.id}`)}
                  className="flex items-center gap-1.5 bg-white text-black px-3 py-2 rounded-lg text-xs font-medium"
                >
                  <Pencil className="w-3 h-3" />
                  Edit
                </motion.button>

                {site.status === 'published' && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.open(`/site/${site.slug}`, '_blank')}
                    className="flex items-center gap-1.5 bg-[#222] text-white px-3 py-2 rounded-lg text-xs font-medium border border-[#333]"
                  >
                    <Eye className="w-3 h-3" />
                    Preview
                  </motion.button>
                )}

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setDeleteConfirm(site.id)}
                  className="flex items-center gap-1.5 bg-red-500/10 text-red-400 px-3 py-2 rounded-lg text-xs font-medium border border-red-500/20"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#111] border border-[#222] rounded-xl p-6 w-full max-w-sm"
            >
              <h3 className="text-sm font-semibold mb-2">Delete this site?</h3>
              <p className="text-xs text-[#888] mb-6">
                This action cannot be undone. The site and all its content will be permanently removed.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="text-xs text-[#888] hover:text-white transition-colors px-3 py-2"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg px-4 py-2 text-xs font-medium hover:bg-red-500/20 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
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
              className="bg-[#111] border border-[#222] rounded-xl p-6 w-full max-w-lg"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">
                  {step === 'vertical' ? 'Choose a Vertical' : 'Name Your Business'}
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
                        setStep('name');
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
              ) : (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <button
                      onClick={() => setStep('vertical')}
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
