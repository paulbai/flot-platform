'use client';

interface ColorPickerProps {
  value: string;
  onChange: (hex: string) => void;
  label: string;
}

export default function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider">
        {label}
      </label>
      <div className="flex items-center gap-3 bg-[#111] border border-[#333] rounded-lg px-3 py-2">
        <div className="relative w-8 h-8 rounded-md overflow-hidden border border-[#444] shrink-0">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
          />
          <div
            className="w-full h-full"
            style={{ backgroundColor: value }}
          />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => {
            const v = e.target.value;
            if (/^#[0-9a-fA-F]{0,6}$/.test(v)) onChange(v);
          }}
          className="bg-transparent text-sm text-white font-mono w-20 outline-none"
          maxLength={7}
        />
      </div>
    </div>
  );
}
