'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { validateImage } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  onImageSelect?: (url: string) => void;
  onImageUpload?: (file: File) => void;
  maxSize?: number;
}

export function ImageUploader({ onImageSelect, onImageUpload, maxSize = 10 * 1024 * 1024 }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      const validation = validateImage(file);

      if (!validation.valid) {
        toast.error(validation.error!);
        return;
      }

      // Create object URL for preview
      const url = URL.createObjectURL(file);
      setPreview(url);

      if (onImageSelect) onImageSelect(url);
      if (onImageUpload) onImageUpload(file);
    },
    [onImageSelect, onImageUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxSize,
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        'group border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer',
        isDragActive
          ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
          : 'border-gray-300 hover:border-primary hover:bg-primary/5'
      )}
    >
      <input {...getInputProps()} />

      <div className="space-y-3">
        <div className="mx-auto w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
          <Upload className="h-6 w-6 text-primary" />
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">
            {isDragActive ? 'Drop your image here' : 'Drag & drop or click to upload'}
          </p>
          <p className="text-xs text-muted-foreground">
            JPG, PNG or WebP • Max 10MB
          </p>
        </div>
      </div>
    </div>
  );
}
