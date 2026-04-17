'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ArrowLeft, Minus, Plus, Heart, Check } from 'lucide-react';
import NavBar from '@/components/layout/NavBar';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { useStoreData } from '@/lib/hooks/useCustomizedData';
import { useCartStore } from '@/store/cartStore';
import { leonesOf } from '@/lib/currency';
import type { CustomerDetails } from '@/store/bookingStore';

const CartDrawer = dynamic(() => import('@/components/cart/CartDrawer'), { ssr: false });
const FlotCheckout = dynamic(() => import('@/components/checkout/FlotCheckout'), { ssr: false });
const CustomerDetailsModal = dynamic(() => import('@/components/booking/CustomerDetailsModal'), { ssr: false });

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { products, brand } = useStoreData();
  const product = products.find((p) => p.id === params.id);

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails | null>(null);

  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items).filter((i) => i.vertical === 'store');

  if (!product) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#faf9f7' }}>
        <p className="text-[var(--text-md)] text-[#666]">Product not found.</p>
      </main>
    );
  }

  const handleAddToCart = () => {
    const variant = [selectedSize, selectedColor].filter(Boolean).join(' / ') || undefined;
    addItem({
      id: product.id,
      name: product.name,
      quantity,
      unitPrice: product.price,
      image: product.images[0],
      variant,
      vertical: 'store',
    });
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      setCartOpen(true);
    }, 800);
  };

  const colorSwatchMap: Record<string, string> = {
    Ecru: '#f5f1e8',
    Slate: '#6b7280',
    Noir: '#1a1a1a',
    Ivory: '#fffff0',
    Sage: '#9caf88',
    Tan: '#d2b48c',
    Black: '#111111',
    Forest: '#228b22',
    Amber: '#ffbf00',
    Vetiver: '#6b705c',
    Hinoki: '#c8b88a',
  };

  return (
    <main id="main-content" className="min-h-screen" style={{ backgroundColor: '#faf9f7', color: '#111111' }}>
      <NavBar />

      <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto pb-24">
        {/* Back navigation */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => router.push('/store')}
          className="flex items-center gap-2 text-[var(--text-xs)] font-body font-semibold uppercase tracking-[0.15em] mb-8 hover:opacity-60 transition-opacity cursor-pointer"
          style={{ color: '#666' }}
        >
          <ArrowLeft size={14} />
          Back to Store
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-16">
          {/* Image — 60% width */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-3"
          >
            <div className="relative aspect-[3/4] rounded-sm overflow-hidden">
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 60vw"
                priority
              />
              {product.badge && (
                <div className="absolute top-4 left-4">
                  <Badge color="var(--fashion)">{product.badge}</Badge>
                </div>
              )}
            </div>
          </motion.div>

          {/* Product details — 40% width */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-2 lg:sticky lg:top-24 lg:self-start"
          >
            {/* Artist/Brand */}
            {product.artist && (
              <p className="text-[var(--text-xs)] font-body font-semibold uppercase tracking-[0.2em] mb-2" style={{ color: 'var(--fashion)' }}>
                {product.artist}
              </p>
            )}

            {/* Name */}
            <h1 className="font-display text-[var(--text-xl)] font-medium leading-tight mb-2" style={{ color: '#111' }}>
              {product.name}
            </h1>

            {/* Price */}
            <p className="font-display text-[var(--text-lg)] mb-1" style={{ color: '#333' }}>
              ${product.price}
            </p>
            <p className="text-[var(--text-xs)] font-mono mb-6" style={{ color: '#999' }}>{leonesOf(product.price)}</p>

            {/* Description */}
            {product.description && (
              <p className="text-[var(--text-sm)] font-body leading-relaxed mb-8" style={{ color: '#555' }}>
                {product.description}
              </p>
            )}

            {/* Size selector */}
            {product.sizes && (
              <div className="mb-6">
                <label className="block text-[var(--text-xs)] font-body font-semibold uppercase tracking-wider mb-3" style={{ color: '#666' }}>
                  Size
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className="px-4 py-2 text-[var(--text-xs)] font-body font-semibold uppercase tracking-wider border rounded-sm transition-all duration-mid cursor-pointer"
                      style={{
                        borderColor: selectedSize === size ? 'var(--fashion)' : '#ddd',
                        backgroundColor: selectedSize === size ? 'var(--fashion)' : 'transparent',
                        color: selectedSize === size ? '#fff' : '#555',
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color selector */}
            {product.colors && (
              <div className="mb-6">
                <label className="block text-[var(--text-xs)] font-body font-semibold uppercase tracking-wider mb-3" style={{ color: '#666' }}>
                  Color {selectedColor && <span className="normal-case tracking-normal font-normal">- {selectedColor}</span>}
                </label>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className="w-8 h-8 rounded-full border-2 transition-all duration-mid cursor-pointer"
                      style={{
                        backgroundColor: colorSwatchMap[color] || '#ccc',
                        borderColor: selectedColor === color ? 'var(--fashion)' : 'transparent',
                        boxShadow: selectedColor === color ? '0 0 0 2px #faf9f7, 0 0 0 4px var(--fashion)' : 'inset 0 0 0 1px rgba(0,0,0,0.1)',
                      }}
                      aria-label={color}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-8">
              <label className="block text-[var(--text-xs)] font-body font-semibold uppercase tracking-wider mb-3" style={{ color: '#666' }}>
                Quantity
              </label>
              <div className="inline-flex items-center border rounded-sm" style={{ borderColor: '#ddd' }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 hover:bg-black/5 transition-colors cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <span className="w-10 text-center text-[var(--text-sm)] font-mono">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 hover:bg-black/5 transition-colors cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <Button
                variant="accent"
                size="lg"
                accentColor="var(--fashion)"
                className="flex-1"
                onClick={handleAddToCart}
              >
                <AnimatePresence mode="wait">
                  {added ? (
                    <motion.span key="added" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                      <Check size={16} /> Added
                    </motion.span>
                  ) : (
                    <motion.span key="add" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      Add to Cart
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
              <button
                className="p-3 border rounded-sm hover:bg-black/5 transition-colors cursor-pointer"
                style={{ borderColor: '#ddd' }}
                aria-label="Save for later"
              >
                <Heart size={20} style={{ color: '#999' }} />
              </button>
            </div>

            {/* Stock indicator */}
            {product.stock <= 5 && product.stock > 0 && (
              <p className="text-[var(--text-xs)] font-body" style={{ color: 'var(--fashion)' }}>
                Only {product.stock} left in stock
              </p>
            )}
          </motion.div>
        </div>
      </div>

      {/* Cart drawer */}
      <AnimatePresence>
        {cartOpen && (
          <CartDrawer
            isOpen={cartOpen}
            onClose={() => setCartOpen(false)}
            onCheckout={() => {
              setCartOpen(false);
              setDetailsOpen(true);
            }}
          />
        )}
      </AnimatePresence>

      {/* Customer Details Modal */}
      <AnimatePresence>
        {detailsOpen && (
          <CustomerDetailsModal
            title="Delivery Details"
            subtitle="Where should we send your order?"
            requireAddress
            accentColor={brand.accentColor}
            onSubmit={(details) => {
              setCustomerDetails(details);
              setDetailsOpen(false);
              setCheckoutOpen(true);
            }}
            onClose={() => setDetailsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Flot Checkout */}
      <AnimatePresence>
        {checkoutOpen && cartItems.length > 0 && (
          <FlotCheckout
            brandName={brand.businessName}
            accentColor={brand.accentColor}
            orderSummary={cartItems}
            currency="USD"
            vertical="store"
            extraFields={customerDetails ? [
              { name: 'customerName', label: 'Name', type: 'text' as const, required: false, placeholder: customerDetails.name },
              { name: 'customerPhone', label: 'Phone', type: 'text' as const, required: false, placeholder: customerDetails.phone },
              { name: 'deliveryAddress', label: 'Delivery Address', type: 'textarea' as const, required: false, placeholder: customerDetails.address },
            ] : []}
            onSuccess={() => { setCheckoutOpen(false); setCustomerDetails(null); }}
            onError={() => {}}
            onClose={() => setCheckoutOpen(false)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
