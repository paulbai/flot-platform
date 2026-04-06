'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { useCustomizationStore } from '@/store/customizationStore';
import ImageUploader from '../ImageUploader';
import type { MenuItem, MenuCategory } from '@/lib/types';

const inputClass =
  'bg-[#111] border border-[#333] rounded px-3 py-2 text-sm text-white focus:border-[#666] outline-none w-full';

const DIETARY_OPTIONS = [
  { value: 'V', label: 'V (Vegetarian)' },
  { value: 'GF', label: 'GF (Gluten Free)' },
];

function MenuItemCard({
  item,
  onUpdate,
  onDelete,
}: {
  item: MenuItem;
  onUpdate: (data: Partial<MenuItem>) => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-[#111] border border-[#2a2a2a] rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-[#1a1a1a] transition-colors"
      >
        <div className="flex items-center gap-2 text-sm text-white">
          {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          <span>{item.name || 'Untitled Item'}</span>
          {item.popular && (
            <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">Popular</span>
          )}
        </div>
        <span className="text-xs text-gray-500">${item.price}</span>
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-2 border-t border-[#2a2a2a] pt-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Name</label>
              <input
                className={inputClass}
                value={item.name}
                onChange={(e) => onUpdate({ name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Price</label>
              <input
                type="number"
                step="0.01"
                className={inputClass}
                value={item.price}
                onChange={(e) => onUpdate({ price: Number(e.target.value) })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Description</label>
            <textarea
              className={`${inputClass} resize-none`}
              rows={2}
              value={item.description}
              onChange={(e) => onUpdate({ description: e.target.value })}
            />
          </div>

          <div className="flex items-center gap-4">
            {DIETARY_OPTIONS.map((opt) => (
              <label key={opt.value} className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={item.dietary.includes(opt.value)}
                  onChange={(e) => {
                    const dietary = e.target.checked
                      ? [...item.dietary, opt.value]
                      : item.dietary.filter((d) => d !== opt.value);
                    onUpdate({ dietary });
                  }}
                  className="w-3.5 h-3.5 rounded border-[#333] bg-[#111] accent-white"
                />
                <span className="text-xs text-gray-400">{opt.label}</span>
              </label>
            ))}
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={item.popular}
                onChange={(e) => onUpdate({ popular: e.target.checked })}
                className="w-3.5 h-3.5 rounded border-[#333] bg-[#111] accent-white"
              />
              <span className="text-xs text-gray-400">Popular</span>
            </label>
            <button
              type="button"
              onClick={onDelete}
              className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              <Trash2 size={11} />
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RestaurantEditor() {
  const restaurant = useCustomizationStore((s) => s.restaurant);
  const updateRestaurant = useCustomizationStore((s) => s.updateRestaurant);

  const updateCategory = (catIndex: number, data: Partial<MenuCategory>) => {
    const categories = [...restaurant.categories];
    categories[catIndex] = { ...categories[catIndex], ...data };
    updateRestaurant({ categories });
  };

  const updateItem = (catIndex: number, itemIndex: number, data: Partial<MenuItem>) => {
    const categories = [...restaurant.categories];
    const items = [...categories[catIndex].items];
    items[itemIndex] = { ...items[itemIndex], ...data };
    categories[catIndex] = { ...categories[catIndex], items };
    updateRestaurant({ categories });
  };

  const deleteItem = (catIndex: number, itemIndex: number) => {
    const categories = [...restaurant.categories];
    categories[catIndex] = {
      ...categories[catIndex],
      items: categories[catIndex].items.filter((_, i) => i !== itemIndex),
    };
    updateRestaurant({ categories });
  };

  const addItem = (catIndex: number) => {
    const categories = [...restaurant.categories];
    const newItem: MenuItem = {
      id: Date.now().toString(36),
      name: 'New Item',
      price: 0,
      description: '',
      dietary: [],
      popular: false,
    };
    categories[catIndex] = {
      ...categories[catIndex],
      items: [...categories[catIndex].items, newItem],
    };
    updateRestaurant({ categories });
  };

  const addCategory = () => {
    const newCategory: MenuCategory = {
      id: Date.now().toString(36),
      name: 'New Category',
      items: [],
    };
    updateRestaurant({ categories: [...restaurant.categories, newCategory] });
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Hero Section
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Headline</label>
            <input
              className={inputClass}
              value={restaurant.heroHeadline}
              onChange={(e) => updateRestaurant({ heroHeadline: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Subline</label>
            <input
              className={inputClass}
              value={restaurant.heroSubline}
              onChange={(e) => updateRestaurant({ heroSubline: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Description</label>
          <textarea
            className={`${inputClass} resize-none`}
            rows={2}
            value={restaurant.heroDescription}
            onChange={(e) => updateRestaurant({ heroDescription: e.target.value })}
          />
        </div>
        <ImageUploader
          label="Hero Image"
          value={restaurant.heroImage}
          onChange={(dataUrl) => updateRestaurant({ heroImage: dataUrl })}
        />
      </div>

      {/* Menu Categories */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Menu ({restaurant.categories.length} categories)
        </h3>

        {restaurant.categories.map((cat, catIndex) => (
          <div key={cat.id} className="bg-[#1a1a1a] border border-[#333] rounded-lg p-4 space-y-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Category Name</label>
              <input
                className={inputClass}
                value={cat.name}
                onChange={(e) => updateCategory(catIndex, { name: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              {cat.items.map((item, itemIndex) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  onUpdate={(data) => updateItem(catIndex, itemIndex, data)}
                  onDelete={() => deleteItem(catIndex, itemIndex)}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => addItem(catIndex)}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
            >
              <Plus size={12} />
              Add Item
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addCategory}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#1a1a1a] border border-[#333] rounded-lg text-sm text-gray-400 hover:text-white hover:border-[#555] transition-colors w-full justify-center"
        >
          <Plus size={14} />
          Add Category
        </button>
      </div>
    </div>
  );
}
