'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ImageUploader } from '@/components/tools/ImageUploader';
import { ProcessingStatus } from '@/components/tools/ProcessingStatus';
import type { PortraitTemplate } from '@/lib/types';
import { imageToBase64 } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { Sparkles, Crown, X } from 'lucide-react';

interface TemplateModalProps {
  template: PortraitTemplate;
  open: boolean;
  onClose: () => void;
}

export function TemplateModal({ template, open, onClose }: TemplateModalProps) {
  const router = useRouter();
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleImageUpload = (file: File) => {
    setUploadedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleGenerate = async () => {
    if (!uploadedImage) {
      toast.error('Please upload an image first');
      return;
    }

    setProcessing(true);

    try {
      // Convert image to base64
      const base64 = await imageToBase64(uploadedImage);

      // Call portrait generation API
      const response = await fetch('/api/tools/portrait', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template_id: template.id,
          image_base64: base64,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 402) {
          toast.error('Insufficient credits. Please upgrade your plan.');
          router.push('/pricing');
          return;
        }

        if (response.status === 403) {
          toast.error('This template requires a Pro subscription');
          router.push('/pricing');
          return;
        }

        throw new Error(data.error || 'Generation failed');
      }

      setGenerationId(data.data.generation_id);
      toast.success('Portrait generation started!');
    } catch (error: any) {
      console.error('Generation error:', error);
      toast.error(error.message || 'Failed to generate portrait');
      setProcessing(false);
    }
  };

  const handleGenerationComplete = () => {
    setProcessing(false);
    setGenerationId(null);
    setUploadedImage(null);
    setPreviewUrl(null);
    onClose();
    router.push('/dashboard/history');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <DialogTitle className="text-3xl">{template.name}</DialogTitle>
                {template.is_trending && <Badge variant="trending">🔥 Trending</Badge>}
                {template.is_new && <Badge variant="new">✨ New</Badge>}
                {template.tier === 'pro' && <Badge variant="pro">👑 Pro</Badge>}
              </div>
              <DialogDescription className="text-base">
                {template.description || 'Create stunning AI portraits in this style'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Processing View */}
          {processing && generationId && (
            <ProcessingStatus
              generationId={generationId}
              templatePreview={template.preview_image_url}
              onComplete={handleGenerationComplete}
            />
          )}

          {/* Upload & Preview View */}
          {!processing && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left: Template Preview */}
              <div className="space-y-3">
                <h4 className="font-semibold text-lg">Template Preview</h4>
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100">
                  <Image
                    src={template.preview_image_url}
                    alt={template.name}
                    fill
                    className="object-cover"
                  />
                </div>
                {template.usage_count > 0 && (
                  <p className="text-sm text-muted-foreground text-center">
                    ✨ Used by {template.usage_count.toLocaleString()} creators
                  </p>
                )}
              </div>

              {/* Right: Upload Zone */}
              <div className="space-y-3">
                <h4 className="font-semibold text-lg">Upload Your Selfie</h4>

                {!uploadedImage ? (
                  <ImageUploader
                    onImageUpload={handleImageUpload}
                    maxSize={10 * 1024 * 1024}
                  />
                ) : (
                  <div className="space-y-3">
                    {/* Preview */}
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100">
                      <Image
                        src={previewUrl!}
                        alt="Your photo"
                        fill
                        className="object-cover"
                      />
                      <button
                        onClick={() => {
                          setUploadedImage(null);
                          setPreviewUrl(null);
                        }}
                        className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
                      >
                        <X className="h-4 w-4 text-white" />
                      </button>
                    </div>

                    {/* Preview Message */}
                    <div className="bg-primary/5 rounded-2xl p-4 border border-primary/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <p className="font-medium text-sm">Ready to transform!</p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Your photo + {template.name} = Amazing portrait ✨
                      </p>
                    </div>
                  </div>
                )}

                {/* Instagram Examples */}
                {template.instagram_example_urls && template.instagram_example_urls.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Instagram examples:</p>
                    <div className="flex gap-2 overflow-x-auto">
                      {template.instagram_example_urls.map((url, idx) => (
                        <a
                          key={idx}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-100 hover:ring-2 hover:ring-primary transition-all"
                        >
                          <img
                            src={url}
                            alt={`Example ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {!processing && (
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                {template.tier === 'pro' ? (
                  <span className="flex items-center gap-1">
                    <Crown className="h-4 w-4 text-purple-500" />
                    Pro subscribers only
                  </span>
                ) : (
                  <span>1 credit per generation</span>
                )}
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={handleGenerate} disabled={!uploadedImage}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate (1 credit)
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
