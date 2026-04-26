'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import type { SiteConfig } from '@/lib/types/customization';
import type { ExtraField } from '@/lib/types';
import { useCartStore } from '@/store/cartStore';
import FlotCheckout from '@/components/checkout/FlotCheckout';
import CustomerDetailsModal from '@/components/booking/CustomerDetailsModal';
import type { CustomerDetails } from '@/lib/orders/customer';
import { postOrder } from '@/lib/orders/post';

export default function SiteFloatingCart({ config }: { config: SiteConfig }) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [customer, setCustomer] = useState<CustomerDetails | null>(null);
  const items = useCartStore((s) => s.items);
  const clearSite = useCartStore((s) => s.clearSite);
  const accent = config.brand.accentColor;

  const siteItems = useMemo(() => items.filter((i) => i.siteSlug === config.slug), [items, config.slug]);
  const siteTotal = useMemo(() => siteItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0), [siteItems]);
  const itemCount = useMemo(() => siteItems.reduce((sum, i) => sum + i.quantity, 0), [siteItems]);

  // Restaurant takeaway / store delivery require name + phone + address before checkout.
  const requiresDeliveryDetails = config.vertical === 'restaurant' || config.vertical === 'store';

  const customerExtraFields: ExtraField[] = customer
    ? [
        { name: 'customerName', label: 'Name', type: 'text', required: false, placeholder: customer.name },
        { name: 'customerPhone', label: 'Phone', type: 'text', required: false, placeholder: customer.phone },
        {
          name: 'deliveryAddress',
          label: 'Delivery Address',
          type: 'textarea',
          required: false,
          placeholder: customer.address,
        },
      ]
    : [];

  if (itemCount === 0 && !showCheckout && !detailsOpen) return null;

  function handleCartClick() {
    if (requiresDeliveryDetails) {
      setDetailsOpen(true);
    } else {
      setShowCheckout(true);
    }
  }

  function handleDetailsSubmit(details: CustomerDetails) {
    setCustomer(details);
    setDetailsOpen(false);
    setShowCheckout(true);
  }

  async function persistOrder(result: { token?: string }): Promise<{ reference?: string }> {
    const items = siteItems.map((it) => ({
      name: it.name,
      description: it.description,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      imageUrl: it.image,
      variant: it.variant,
    }));

    const subtotal = siteTotal;
    const total = siteTotal;

    const details: Record<string, unknown> = {};
    if (customer?.address) details.deliveryAddress = customer.address;

    // Use the resilient wrapper — retries on network / 5xx, including the
    // notorious cold-start failure that was making first-attempt charges
    // appear to fail.
    const out = await postOrder({
      siteSlug: config.slug,
      status: 'confirmed',
      customer: {
        name: customer?.name ?? 'Guest',
        // Email is optional for restaurant/store; send empty string when not collected.
        email: customer?.email?.trim() ?? '',
        phone: customer?.phone ?? '+00000000000',
      },
      items,
      subtotal,
      total,
      currency: 'Le',
      paymentMethod: 'flot',
      paymentRef: result.token ?? null,
      details,
    });

    if (!out.ok) {
      throw new Error(out.error || 'Order persistence failed');
    }
    return { reference: out.reference };
  }

  return (
    <>
      {/* Floating cart button */}
      <AnimatePresence>
        {itemCount > 0 && !showCheckout && !detailsOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={handleCartClick}
            className="fixed bottom-6 right-4 sm:right-6 z-40 flex items-center gap-3 rounded-full px-5 sm:px-6 py-3.5 text-white shadow-2xl transition-transform hover:scale-105 safe-bottom"
            style={{ backgroundColor: accent }}
          >
            <div className="relative">
              <ShoppingCart size={20} />
              <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-white text-[10px] font-bold flex items-center justify-center"
                style={{ color: accent }}
              >
                {itemCount}
              </span>
            </div>
            <div className="text-right">
              <span className="text-sm font-semibold">Le{siteTotal.toLocaleString()}</span>
              <p className="text-[10px] opacity-70">${(siteTotal / 24).toFixed(2)}</p>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Customer details (restaurant takeaway / store delivery) */}
      <AnimatePresence>
        {detailsOpen && (
          <CustomerDetailsModal
            title={config.vertical === 'restaurant' ? 'Your Order Details' : 'Delivery Details'}
            subtitle={
              config.vertical === 'restaurant'
                ? 'Tell us where to deliver your order.'
                : 'Where should we send your order?'
            }
            requireAddress
            requireEmail={false}
            accentColor={accent}
            onSubmit={handleDetailsSubmit}
            onClose={() => setDetailsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Checkout modal */}
      <AnimatePresence>
        {showCheckout && (
          <FlotCheckout
            brandName={config.brand.businessName}
            accentColor={accent}
            orderSummary={siteItems}
            currency="Le"
            vertical={config.vertical}
            extraFields={customerExtraFields}
            onSuccess={async (result) => {
              const out = await persistOrder(result as { token?: string });
              clearSite(config.slug);
              setCustomer(null);
              return out;
            }}
            onError={() => {}}
            onClose={() => setShowCheckout(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
