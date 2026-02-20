'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

const CATEGORIES = [
    { value: 'professional', label: '💼 Professional', keywords: ['business', 'corporate', 'suit', 'office', 'linkedin', 'headshot', 'resume', 'formal'] },
    { value: 'indian', label: '🇮🇳 Indian', keywords: ['indian', 'desi', 'saree', 'kurta', 'ethnic', 'traditional', 'bollywood', 'festival', 'wedding'] },
    { value: 'lifestyle', label: '🌟 Lifestyle', keywords: ['casual', 'outdoor', 'travel', 'fashion', 'street', 'urban', 'nature', 'beach'] },
    { value: 'artistic', label: '🎨 Artistic', keywords: ['art', 'painting', 'anime', 'fantasy', 'surreal', 'abstract', 'creative', 'illustration'] },
    { value: 'trending', label: '🔥 Trending', keywords: ['viral', 'trending', 'popular', 'tiktok', 'instagram', 'reels'] },
];

const TIERS = [
    { value: 'free', label: '🆓 Free' },
    { value: 'starter', label: '⭐ Starter' },
    { value: 'pro', label: '💎 Pro' },
];

const ASPECT_RATIOS = [
    { value: '1:1', label: '1:1 Square' },
    { value: '3:4', label: '3:4 Portrait' },
    { value: '4:3', label: '4:3 Landscape' },
    { value: '9:16', label: '9:16 Story/Reel' },
    { value: '16:9', label: '16:9 Widescreen' },
    { value: '2:3', label: '2:3 Tall Portrait' },
    { value: '4:5', label: '4:5 Instagram' },
];

function autoClassify(prompt: string): string {
    const lower = prompt.toLowerCase();
    let bestMatch = 'lifestyle';
    let bestScore = 0;
    for (const cat of CATEGORIES) {
        let score = 0;
        for (const kw of cat.keywords) {
            if (lower.includes(kw)) score++;
        }
        if (score > bestScore) { bestScore = score; bestMatch = cat.value; }
    }
    return bestMatch;
}

interface TemplateItem {
    id: string;
    name: string;
    category: string;
    tier: string;
    aspect_ratio: string | null;
    is_published: boolean;
    preview_image_url: string;
    created_at: string;
}

const PAGE_SIZE = 8;

export default function AdminTemplatesPage() {
    const [allTemplates, setAllTemplates] = useState<TemplateItem[]>([]);
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [filterCat, setFilterCat] = useState('all');
    const fileRef = useRef<HTMLInputElement>(null);

    // Form
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [promptTemplate, setPromptTemplate] = useState('');
    const [category, setCategory] = useState('lifestyle');
    const [tier, setTier] = useState('starter');
    const [aspectRatio, setAspectRatio] = useState('3:4');
    const [isTrending, setIsTrending] = useState(false);
    const [isNew, setIsNew] = useState(true);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => { fetchTemplates(); }, []);

    useEffect(() => {
        if (promptTemplate.trim().length > 10) setCategory(autoClassify(promptTemplate));
    }, [promptTemplate]);

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/templates/list?category=all&sort=newest&published=all');
            const data = await res.json();
            if (data.success) setAllTemplates(data.data || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const filtered = filterCat === 'all'
        ? allTemplates
        : allTemplates.filter(t => t.category === filterCat);

    const visible = filtered.slice(0, visibleCount);
    const hasMore = visibleCount < filtered.length;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        setFile(f);
        setPreviewUrl(URL.createObjectURL(f));
        if (!name) {
            const baseName = f.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
            setName(baseName.charAt(0).toUpperCase() + baseName.slice(1));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) { toast.error('Select an image'); return; }
        if (!name.trim()) { toast.error('Name required'); return; }
        if (!promptTemplate.trim()) { toast.error('Prompt required'); return; }

        setSubmitting(true);
        try {
            const fd = new FormData();
            fd.append('file', file);
            fd.append('name', name.trim());
            fd.append('description', description.trim());
            fd.append('prompt_template', promptTemplate.trim());
            fd.append('category', category);
            fd.append('tier', tier);
            fd.append('aspect_ratio', aspectRatio);
            fd.append('is_trending', String(isTrending));
            fd.append('is_new', String(isNew));

            const res = await fetch('/api/templates/upload', { method: 'POST', body: fd });
            const data = await res.json();

            if (data.success) {
                toast.success('Template added!');
                setName(''); setDescription(''); setPromptTemplate('');
                setCategory('lifestyle'); setTier('starter'); setAspectRatio('3:4');
                setIsTrending(false); setIsNew(true);
                setFile(null); setPreviewUrl(null);
                if (fileRef.current) fileRef.current.value = '';
                fetchTemplates();
            } else {
                toast.error(data.error || 'Failed');
            }
        } catch (err: any) { toast.error(err.message); }
        finally { setSubmitting(false); }
    };

    const deleteTemplate = async (id: string) => {
        if (!confirm('Delete this template?')) return;
        try {
            const res = await fetch(`/api/templates/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) { toast.success('Deleted'); fetchTemplates(); }
            else toast.error(data.error || 'Failed');
        } catch (err: any) { toast.error(err.message); }
    };

    return (
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '2rem 1rem', fontFamily: 'system-ui, sans-serif' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>🛠️ Admin — Manage Templates</h1>
            <p style={{ color: '#888', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                Add portrait templates. Category auto-detects from prompt keywords.
            </p>

            {/* ─── Add Form ─── */}
            <form onSubmit={handleSubmit} style={{
                background: '#111', border: '1px solid #333', borderRadius: 12, padding: '1.5rem', marginBottom: '2rem'
            }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '1rem' }}>➕ Add New Template</h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    {/* Left — image */}
                    <div>
                        <label style={lbl}>Preview Image *</label>
                        <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange}
                            style={{ display: 'block', marginBottom: 8, color: '#ccc', fontSize: '0.85rem' }} />
                        {previewUrl && (
                            <img src={previewUrl} alt="Preview" style={{
                                width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 8, border: '1px solid #333'
                            }} />
                        )}
                    </div>

                    {/* Right — fields */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        <div>
                            <label style={lbl}>Name *</label>
                            <input value={name} onChange={e => setName(e.target.value)}
                                placeholder="e.g. Corporate Headshot" style={inp} />
                        </div>
                        <div>
                            <label style={lbl}>Description</label>
                            <input value={description} onChange={e => setDescription(e.target.value)}
                                placeholder="Short description" style={inp} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                            <div>
                                <label style={lbl}>Category</label>
                                <select value={category} onChange={e => setCategory(e.target.value)} style={inp}>
                                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={lbl}>Tier</label>
                                <select value={tier} onChange={e => setTier(e.target.value)} style={inp}>
                                    {TIERS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={lbl}>Aspect Ratio</label>
                                <select value={aspectRatio} onChange={e => setAspectRatio(e.target.value)} style={inp}>
                                    {ASPECT_RATIOS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                                </select>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#ccc', cursor: 'pointer', fontSize: '0.85rem' }}>
                                <input type="checkbox" checked={isTrending} onChange={e => setIsTrending(e.target.checked)} /> 🔥 Trending
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#ccc', cursor: 'pointer', fontSize: '0.85rem' }}>
                                <input type="checkbox" checked={isNew} onChange={e => setIsNew(e.target.checked)} /> 🆕 New
                            </label>
                        </div>
                    </div>
                </div>

                {/* Prompt — full width */}
                <div style={{ marginTop: '0.75rem' }}>
                    <label style={lbl}>Prompt Template *</label>
                    <textarea value={promptTemplate} onChange={e => setPromptTemplate(e.target.value)}
                        rows={3} placeholder="e.g. A professional corporate headshot of {subject}, wearing a business suit, studio lighting, 8k"
                        style={{ ...inp, resize: 'vertical' }} />
                    <p style={{ fontSize: '0.72rem', color: '#555', marginTop: 2 }}>
                        Use <code style={{ color: '#999' }}>{'{subject}'}</code> as placeholder. Auto-classified:{' '}
                        <strong style={{ color: '#ddd' }}>{CATEGORIES.find(c => c.value === category)?.label}</strong>
                    </p>
                </div>

                <button type="submit" disabled={submitting} style={{
                    marginTop: '0.75rem', padding: '0.6rem 1.5rem',
                    background: submitting ? '#444' : '#7c3aed', color: '#fff',
                    border: 'none', borderRadius: 8, fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer',
                }}>
                    {submitting ? '⏳ Uploading...' : '🚀 Add Template'}
                </button>
            </form>

            {/* ─── Existing Templates ─── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 600 }}>📋 Templates ({filtered.length})</h2>
                <select value={filterCat} onChange={e => { setFilterCat(e.target.value); setVisibleCount(PAGE_SIZE); }}
                    style={{ ...inp, width: 'auto' }}>
                    <option value="all">All Categories</option>
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
            </div>

            {loading && <p style={{ color: '#888' }}>Loading...</p>}

            {!loading && filtered.length === 0 && (
                <p style={{ color: '#888', padding: '2rem', textAlign: 'center', background: '#111', borderRadius: 12 }}>
                    No templates yet. Add your first one above! ☝️
                </p>
            )}

            <div style={{ columnCount: 3, columnGap: '0.75rem' }}>
                {visible.map(t => {
                    // Parse aspect ratio to CSS value (e.g. "9:16" → "9/16")
                    const ratio = t.aspect_ratio || '3:4';
                    const cssRatio = ratio.replace(':', '/');
                    return (
                        <div key={t.id} style={{
                            background: '#111', border: '1px solid #333', borderRadius: 10, overflow: 'hidden',
                            breakInside: 'avoid', marginBottom: '0.75rem', position: 'relative',
                            aspectRatio: cssRatio
                        }}>
                            <Image
                                src={t.preview_image_url}
                                alt={t.name}
                                fill
                                quality={50}
                                sizes="(max-width: 768px) 50vw, 33vw"
                                style={{ objectFit: 'cover' }}
                            />
                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', padding: '0.6rem', paddingTop: '1.5rem' }}>
                                <h3 style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#fff' }}>{t.name}</h3>
                                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
                                    <span style={badge}>{t.category}</span>
                                    {t.aspect_ratio && <span style={{ ...badge, background: '#1e5f3a' }}>{t.aspect_ratio}</span>}
                                </div>
                                <button onClick={(e) => { e.preventDefault(); deleteTemplate(t.id); }} style={{
                                    background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6,
                                    padding: '3px 10px', cursor: 'pointer', fontSize: '0.75rem'
                                }}>🗑️ Delete</button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Load More */}
            {hasMore && (
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <button onClick={() => setVisibleCount(v => v + PAGE_SIZE)} style={{
                        padding: '0.5rem 2rem', background: '#222', color: '#ccc', border: '1px solid #444',
                        borderRadius: 8, cursor: 'pointer', fontSize: '0.9rem'
                    }}>
                        Load More ({filtered.length - visibleCount} remaining)
                    </button>
                </div>
            )}
        </div>
    );
}

const lbl: React.CSSProperties = { display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#999', marginBottom: 3 };
const inp: React.CSSProperties = { width: '100%', padding: '0.45rem 0.6rem', background: '#1a1a1a', border: '1px solid #333', borderRadius: 7, color: '#fff', fontSize: '0.85rem', outline: 'none' };
const badge: React.CSSProperties = { fontSize: '0.65rem', padding: '1px 7px', borderRadius: 99, background: '#2d1f5e', color: '#bbb' };
