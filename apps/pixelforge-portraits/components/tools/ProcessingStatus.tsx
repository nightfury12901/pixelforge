'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Loader2, Download, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface ProcessingStatusProps {
  generationId: string;
  templatePreview: string;
  onComplete: () => void;
}

export function ProcessingStatus({ generationId, templatePreview, onComplete }: ProcessingStatusProps) {
  const [status, setStatus] = useState<'processing' | 'completed' | 'failed'>('processing');
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const pollStatus = async () => {
      const interval = setInterval(async () => {
        try {
          const response = await fetch(`/api/tools/status?id=${generationId}`);
          const data = await response.json();

          if (data.success) {
            if (data.data.status === 'completed') {
              setStatus('completed');
              setOutputUrl(data.data.output_image_url);
              clearInterval(interval);
            } else if (data.data.status === 'failed') {
              setStatus('failed');
              setError(data.data.error_message || 'Generation failed');
              clearInterval(interval);
            }
          }
        } catch (err) {
          console.error('Status poll error:', err);
        }
      }, 2000);

      // Stop polling after 5 minutes
      setTimeout(() => {
        clearInterval(interval);
        if (status === 'processing') {
          setStatus('failed');
          setError('Generation timeout. Please try again.');
        }
      }, 300000);
    };

    pollStatus();

    return () => {
      // Cleanup interval on unmount
    };
  }, [generationId, status]);

  const handleDownload = () => {
    if (outputUrl) {
      const link = document.createElement('a');
      link.href = outputUrl;
      link.download = `aurashot-${Date.now()}.webp`;
      link.click();
    }
  };

  const handleShare = () => {
    if (outputUrl) {
      navigator.clipboard.writeText(outputUrl);
      toast.success('Image URL copied to clipboard!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-6 py-2 bg-primary/10 rounded-full">
          <Loader2
            className={cn(
              'h-5 w-5 animate-spin',
              status !== 'processing' && 'hidden'
            )}
          />
          <span className="font-semibold text-primary">
            {status === 'processing' && 'Generating your portrait...'}
            {status === 'completed' && 'Portrait ready! ✨'}
            {status === 'failed' && 'Generation failed 😔'}
          </span>
        </div>
      </div>

      {/* Content */}
      {status === 'processing' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12"
        >
          <div className="relative w-64 h-80 mx-auto rounded-2xl overflow-hidden bg-gradient-to-br from-primary/5 to-secondary/5 shadow-2xl">
            <Image
              src={templatePreview}
              alt="Processing"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
              <div className="space-y-2">
                <div className="h-2 bg-white/30 rounded-full animate-pulse">
                  <div className="h-2 bg-white rounded-full animate-pulse w-16" />
                </div>
                <p className="text-white/90 text-sm font-medium">Applying magic...</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {status === 'completed' && outputUrl && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">Your portrait is ready! ✨</h3>
            <p className="text-muted-foreground">Perfect for Instagram, LinkedIn, or anywhere</p>
          </div>

          {/* Result Image */}
          <div className="relative w-80 h-[500px] mx-auto rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src={outputUrl}
              alt="Generated portrait"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-center">
            <Button size="lg" onClick={handleDownload}>
              <Download className="h-5 w-5 mr-2" />
              Download
            </Button>
            <Button size="lg" variant="secondary" onClick={handleShare}>
              <Share2 className="h-5 w-5 mr-2" />
              Share
            </Button>
            <Button size="lg" onClick={onComplete}>
              View History
            </Button>
          </div>
        </motion.div>
      )}

      {status === 'failed' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 space-y-4"
        >
          <div className="text-6xl">😔</div>
          <h3 className="text-2xl font-semibold">Generation failed</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {error}
          </p>
          <div className="flex gap-3 justify-center pt-6">
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
            <Button variant="secondary" onClick={onComplete}>
              Close
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
