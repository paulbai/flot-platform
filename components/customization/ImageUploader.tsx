'use client';

import { useCallback, useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';

interface ImageUploaderProps {
  value: string | null;
  onChange: (dataUrl: string) => void;
  label?: string;
  aspectRatio?: string;
}

const MAX_WIDTH = 800;

function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export default function ImageUploader({ value, onChange, label, aspectRatio = '16/9' }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setIsProcessing(true);
    try {
      const dataUrl = await resizeImage(file);
      onChange(dataUrl);
    } catch (err) {
      console.error('Image processing failed:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    if (inputRef.current) inputRef.current.value = '';
  }, [handleFile]);

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider">
          {label}
        </label>
      )}

      {value ? (
        <div className="relative group" style={{ aspectRatio }}>
          <img
            src={value}
            alt={label || 'Upload'}
            className="w-full h-full object-cover rounded-lg border border-[#333]"
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs rounded-md transition-colors"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="p-1.5 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-md transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          className={`
            flex flex-col items-center justify-center gap-2 rounded-lg cursor-pointer
            border-2 border-dashed transition-colors py-8
            ${isDragging
              ? 'border-white/40 bg-white/5'
              : 'border-[#333] hover:border-[#555] bg-[#111]'
            }
          `}
          style={{ aspectRatio }}
        >
          {isProcessing ? (
            <div className="text-gray-500 text-sm">Processing...</div>
          ) : (
            <>
              <Upload size={20} className="text-gray-500" />
              <span className="text-gray-500 text-xs">
                Drop image or click to upload
              </span>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />
    </div>
  );
}
