'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { useCustomizationStore } from '@/store/customizationStore';
import type { Product } from '@/lib/types';

const inputClass =
  'bg-[#111] border border-[#333] rounded px-3 py-2 text-sm text-white focus:border-[#666] outline-none w-full';

const CATEGORY_OPTIONS: Product['category'][] = ['clothing', 'art', 'accessories', 'objects'];

function ProductCard({
  product,
  onUpdate,
  onDelete,
}: {
  product: Product;
  onUpdate: (data: Partial<Product>) => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="bg-[#1a1a1a] border border-[#333] rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#222] transition-colors"
      >
        <div className="flex items-center gap-2 text-sm text-white">
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          <span className="font-medium">{product.name || 'Untitled Product'}</span>
          {product.badge && (
            <span className="text-[10px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded">
              {product.badge}
            </span>
          )}
        </div>
        <span className="text-xs text-gray-500">${product.price}</span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-[#333] pt-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Name</label>
              <input
                className={inputClass}
                value={product.name}
                onChange={(e) => onUpdate({ name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Category</label>
              <select
                className={inputClass}
                value={product.category}
                onChange={(e) => onUpdate({ category: e.target.value as Product['category'] })}
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Artist</label>
              <input
                className={inputClass}
                value={product.artist || ''}
                onChange={(e) => onUpdate({ artist: e.target.value || null })}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Price</label>
              <input
                type="number"
                step="0.01"
                className={inputClass}
                value={product.price}
                onChange={(e) => onUpdate({ price: Number(e.target.value) })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Description</label>
            <textarea
              className={`${inputClass} resize-none`}
              rows={2}
              value={product.description || ''}
              onChange={(e) => onUpdate({ description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Badge</label>
              <input
                className={inputClass}
                value={product.badge || ''}
                onChange={(e) => onUpdate({ badge: e.target.value || null })}
                placeholder="e.g. New, Sale"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Stock</label>
              <input
                type="number"
                className={inputClass}
                value={product.stock}
                onChange={(e) => onUpdate({ stock: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Image URL</label>
              <input
                className={inputClass}
                value={product.images[0] || ''}
                onChange={(e) => onUpdate({ images: [e.target.value, ...product.images.slice(1)] })}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Sizes (comma separated)</label>
              <input
                className={inputClass}
                value={product.sizes?.join(', ') || ''}
                onChange={(e) => {
                  const val = e.target.value.trim();
                  onUpdate({ sizes: val ? val.split(',').map((s) => s.trim()).filter(Boolean) : null });
                }}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Colors (comma separated)</label>
              <input
                className={inputClass}
                value={product.colors?.join(', ') || ''}
                onChange={(e) => {
                  const val = e.target.value.trim();
                  onUpdate({ colors: val ? val.split(',').map((s) => s.trim()).filter(Boolean) : null });
                }}
              />
            </div>
          </div>

          <div className="pt-2">
            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-red-400">Are you sure?</span>
                <button
                  type="button"
                  onClick={onDelete}
                  className="px-3 py-1 bg-red-500/20 text-red-400 text-xs rounded hover:bg-red-500/30 transition-colors"
                >
                  Yes, delete
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="px-3 py-1 bg-[#333] text-gray-400 text-xs rounded hover:bg-[#444] transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                <Trash2 size={12} />
                Delete Product
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function StoreEditor() {
  const store = useCustomizationStore((s) => s.store);
  const updateStore = useCustomizationStore((s) => s.updateStore);

  const updateProduct = (index: number, data: Partial<Product>) => {
    const products = [...store.products];
    products[index] = { ...products[index], ...data };
    updateStore({ products });
  };

  const deleteProduct = (index: number) => {
    updateStore({ products: store.products.filter((_, i) => i !== index) });
  };

  const addProduct = () => {
    const newProduct: Product = {
      id: Date.now().toString(36),
      category: 'clothing',
      name: 'New Product',
      artist: null,
      price: 0,
      sizes: null,
      colors: null,
      images: [],
      stock: 10,
      badge: null,
      description: '',
    };
    updateStore({ products: [...store.products, newProduct] });
  };

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Hero Section
        </h3>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Hero Label</label>
          <input
            className={inputClass}
            value={store.heroLabel}
            onChange={(e) => updateStore({ heroLabel: e.target.value })}
          />
        </div>
      </div>

      {/* Products */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Products ({store.products.length})
        </h3>
        <div className="space-y-2">
          {store.products.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              onUpdate={(data) => updateProduct(i, data)}
              onDelete={() => deleteProduct(i)}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={addProduct}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#1a1a1a] border border-[#333] rounded-lg text-sm text-gray-400 hover:text-white hover:border-[#555] transition-colors w-full justify-center"
        >
          <Plus size={14} />
          Add Product
        </button>
      </div>
    </div>
  );
}
