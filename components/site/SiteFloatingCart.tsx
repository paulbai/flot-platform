'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import type { SiteConfig } from '@/lib/types/customization';
import type { ExtraField } from '@/lib/types';
import { useCartStore } from '@/store/cartStore';
import FlotCheckout from '@/components/checkout/FlotCheckout';
import CustomerDetailsModal from '@/components/booking/CustomerDetailsModal';
import OrderTypeModal, { type RestaurantOrderType } from '@/components/booking/OrderTypeModal';
import type { CustomerDetails } from '@/lib/orders/customer';
import { postOrder } from '@/lib/orders/post';

export default function SiteFloatingCart({ config }: { config: SiteConfig }) {
  // Modal stack states. Only one of these is open at any time:
  //   - `orderTypeOpen`: restaurant only — Dine In / Takeaway / Delivery picker
  //   - `detailsOpen`:    address + name + phone form (restaurant Delivery, or store)
  //   - `showCheckout`:   the FlotCheckout payment flow
  const [orderTypeOpen, setOrderTypeOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [customer, setCustomer] = useState<CustomerDetails | null>(null);
  const [orderType, setOrderType] = useState<RestaurantOrderType | null>(null);

  const items = useCartStore((s) => s.items);
  const clearSite = useCartStore((s) => s.clearSite);
  const accent = config.brand.accentColor;

  const siteItems = useMemo(() => items.filter((i) => i.siteSlug === config.slug), [items, config.slug]);
  const siteTotal = useMemo(() => siteItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0), [siteItems]);
  const itemCount = useMemo(() => siteItems.reduce((sum, i) => sum + i.quantity, 0), [siteItems]);

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

  const isRestaurant = config.vertical === 'restaurant';
  const isStore = config.vertical === 'store';

  const anyModalOpen = orderTypeOpen || detailsOpen || showCheckout;
  if (itemCount === 0 && !anyModalOpen) return null;

  function handleCartClick() {
    if (isRestaurant) {
      // Restaurant always asks for the order type first.
      setOrderTypeOpen(true);
    } else if (isStore) {
      // Store delivery — go straight to delivery details.
      setDetailsOpen(true);
    } else {
      setShowCheckout(true);
    }
  }

  function handleOrderTypeSelect(type: RestaurantOrderType) {
    setOrderType(type);
    setOrderTypeOpen(false);
    if (type === 'delivery') {
      // Delivery needs name + phone + address.
      setDetailsOpen(true);
    } else {
      // Dine In and Takeaway skip the form and go straight to checkout.
      setShowCheckout(true);
    }
  }

  function handleDetailsSubmit(details: CustomerDetails) {
    setCustomer(details);
    setDetailsOpen(false);
    setShowCheckout(true);
  }

  function resetFlow() {
    setOrderType(null);
    setCustomer(null);
  }

  async function persistOrder(result: { token?: string }): Promise<{ reference?: string }> {
    const orderItems = siteItems.map((it) => ({
      name: it.name,
      description: it.description,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      imageUrl: it.image,
      variant: it.variant,
    }));

    const subtotal = siteTotal;
    const total = siteTotal;

    // Stamp the vertical-specific bits into the order's `details` blob.
    const details: Record<string, unknown> = {};
    if (orderType) details.orderType = orderType;
    if (customer?.address) details.deliveryAddress = customer.address;

    const out = await postOrder({
      siteSlug: config.slug,
      status: 'confirmed',
      customer: {
        name: customer?.name?.trim() || 'Guest',
        email: customer?.email?.trim() ?? '',
        // Phone is optional for dine-in/takeaway; for delivery the buyer types
        // it with spaces ("+232 76 000 000") which the server regex rejects.
        // Strip every non-digit/+ before sending so the server validation
        // (^\+?[1-9]\d{6,14}$) is satisfied either way.
        phone: (customer?.phone ?? '').replace(/[^\d+]/g, ''),
      },
      items: orderItems,
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
        {itemCount > 0 && !anyModalOpen && (
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

      {/* Step 1 — Restaurant only: Dine In / Takeaway / Delivery */}
      <AnimatePresence>
        {orderTypeOpen && (
          <OrderTypeModal
            brandName={config.brand.businessName}
            accentColor={accent}
            onSelect={handleOrderTypeSelect}
            onClose={() => setOrderTypeOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Step 2 — Customer details (only when needed):
          - Restaurant Delivery (came via order-type picker)
          - Store delivery (direct from cart click) */}
      <AnimatePresence>
        {detailsOpen && (
          <CustomerDetailsModal
            title={isRestaurant ? 'Delivery Details' : 'Delivery Details'}
            subtitle={
              isRestaurant
                ? 'Tell us where to deliver your order.'
                : 'Where should we send your order?'
            }
            requireAddress
            requireEmail={false}
            accentColor={accent}
            onSubmit={handleDetailsSubmit}
            onClose={() => {
              setDetailsOpen(false);
              // If the buyer cancels at the details step but had picked Delivery,
              // bounce back to the order-type picker so they can re-choose.
              if (isRestaurant && orderType === 'delivery') {
                setOrderType(null);
                setOrderTypeOpen(true);
              }
            }}
          />
        )}
      </AnimatePresence>

      {/* Step 3 — Checkout */}
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
              resetFlow();
              return out;
            }}
            onError={() => {}}
            onClose={() => {
              setShowCheckout(false);
              // Don't auto-reset orderType here — buyer might re-open and continue.
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
