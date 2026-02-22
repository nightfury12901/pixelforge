'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';
import { Upload, Loader2 } from 'lucide-react';

export function TemplateUploader({ onClose }: { onClose?: () => void } = {}) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    prompt_template: '',
    category: 'lifestyle',
    tier: 'starter',
    is_trending: false,
    is_new: true,
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast.error('Please select an image');
      return;
    }

    if (!formData.name || !formData.prompt_template) {
      toast.error('Please fill in required fields');
      return;
    }

    setUploading(true);

    try {
      const form = new FormData();
      form.append('file', file);
      form.append('name', formData.name);
      form.append('description', formData.description);
      form.append('prompt_template', formData.prompt_template);
      form.append('category', formData.category);
      form.append('tier', formData.tier);
      form.append('is_trending', String(formData.is_trending));
      form.append('is_new', String(formData.is_new));

      const response = await fetch('/api/templates/upload', {
        method: 'POST',
        body: form,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      toast.success('Template uploaded successfully!');
      router.refresh();

      // Reset form
      setFormData({
        name: '',
        description: '',
        prompt_template: '',
        category: 'lifestyle',
        tier: 'starter',
        is_trending: false,
        is_new: true,
      });
      setFile(null);
      setPreview(null);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload template');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload New Template</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Template Preview Image *</label>
            <div className="flex gap-4">
              {preview && (
                <div className="w-40 h-52 rounded-xl overflow-hidden bg-gray-100">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
              <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl p-6 cursor-pointer hover:border-primary transition-colors">
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">
                  Click to upload (440x600px recommended)
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>
          </div>

          {/* Template Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Template Name *</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Bollywood Cinematic"
              disabled={uploading}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe this template style..."
              className="w-full h-24 px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              disabled={uploading}
            />
          </div>

          {/* Prompt Template */}
          <div className="space-y-2">
            <label className="text-sm font-medium">AI Prompt Template *</label>
            <textarea
              value={formData.prompt_template}
              onChange={(e) => setFormData({ ...formData, prompt_template: e.target.value })}
              placeholder="Professional portrait in Bollywood cinematic style, dramatic lighting, vibrant colors..."
              className="w-full h-32 px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              disabled={uploading}
            />
          </div>

          {/* Category & Tier */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full h-12 px-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={uploading}
              >
                <option value="professional">Professional</option>
                <option value="indian">Indian Aesthetic</option>
                <option value="lifestyle">Lifestyle</option>
                <option value="artistic">Artistic</option>
                <option value="trending">Trending</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Access Tier *</label>
              <select
                value={formData.tier}
                onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                className="w-full h-12 px-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={uploading}
              >
                <option value="free">Free</option>
                <option value="starter">Starter</option>
                <option value="pro">Pro</option>
              </select>
            </div>
          </div>

          {/* Badges */}
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_trending}
                onChange={(e) => setFormData({ ...formData, is_trending: e.target.checked })}
                className="rounded"
                disabled={uploading}
              />
              <span className="text-sm">Mark as Trending</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_new}
                onChange={(e) => setFormData({ ...formData, is_new: e.target.checked })}
                className="rounded"
                disabled={uploading}
              />
              <span className="text-sm">Mark as New</span>
            </label>
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={uploading} className="w-full" size="lg">
            {uploading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-5 w-5 mr-2" />
                Upload Template
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
