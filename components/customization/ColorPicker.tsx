'use client';

interface ColorPickerProps {
  value: string;
  onChange: (hex: string) => void;
  label: string;
  placeholder?: string;
}

export default function ColorPicker({ value, onChange, label, placeholder }: ColorPickerProps) {
  const hasValue = value && value.length > 0;

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider">
        {label}
      </label>
      <div className="flex items-center gap-3 bg-[#111] border border-[#333] rounded-lg px-3 py-2">
        <div className="relative w-8 h-8 rounded-md overflow-hidden border border-[#444] shrink-0">
          <input
            type="color"
            value={hasValue ? value : '#000000'}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
          />
          {hasValue ? (
            <div className="w-full h-full" style={{ backgroundColor: value }} />
          ) : (
            <div className="w-full h-full bg-[#222] flex items-center justify-center">
              <span className="text-[8px] text-gray-500">A</span>
            </div>
          )}
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => {
            const v = e.target.value;
            if (v === '' || /^#[0-9a-fA-F]{0,6}$/.test(v)) onChange(v);
          }}
          placeholder={placeholder}
          className="bg-transparent text-sm text-white font-mono w-20 outline-none placeholder:text-gray-600"
          maxLength={7}
        />
        {hasValue && placeholder && (
          <button
            onClick={() => onChange('')}
            className="text-[10px] text-gray-500 hover:text-gray-300 transition-colors shrink-0"
            title="Reset to auto"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
