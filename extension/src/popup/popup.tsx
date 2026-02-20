/// <reference types="chrome"/>
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import './popup.css';

const BASE_URL = 'http://localhost:3000';

// Minimal particle component
function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const particles: { x: number; y: number; r: number; vx: number; vy: number; alpha: number }[] = [];
    for (let i = 0; i < 38; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.3,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        alpha: Math.random() * 0.5 + 0.15,
      });
    }

    let animId: number;
    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;
        ctx.fill();
      }
      // draw faint lines between close particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 55) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(255,255,255,${0.07 * (1 - dist / 55)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: 0,
      }}
    />
  );
}

function Popup() {
  const [prompt, setPrompt] = useState('');
  const [promptsRemaining, setPromptsRemaining] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleMessage = (message: any) => {
      if (message.action === 'promptResult') {
        setLoading(false);
        if (message.success) {
          setPrompt(message.prompt || '');
          setPromptsRemaining(message.prompts_remaining ?? null);
          setError('');
        } else {
          setError(message.error || 'Something went wrong.');
        }
      }
    };
    chrome.runtime.onMessage.addListener(handleMessage);
    return () => chrome.runtime.onMessage.removeListener(handleMessage);
  }, []);

  const startSnip = async () => {
    setError('');
    chrome.tabs?.query({ active: true, currentWindow: true }, async (tabs: any) => {
      const tab = tabs[0];
      if (!tab?.id) { setError('No active tab found.'); return; }
      if (tab.url?.startsWith('chrome://') || tab.url?.startsWith('edge://')) {
        setError('Open a normal webpage first.'); return;
      }
      try {
        await chrome.tabs.sendMessage(tab.id, { action: 'initSnip' });
        window.close();
      } catch {
        try {
          await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content/content-script.js'] });
          chrome.tabs.sendMessage(tab.id, { action: 'initSnip' });
          window.close();
        } catch { setError('Cannot inspect this page. Try a different site.'); }
      }
    });
  };

  const handleCopy = () => {
    if (!prompt) return;
    navigator.clipboard.writeText(prompt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const generateUrl = `${BASE_URL}/dashboard/image-gen?prompt=${encodeURIComponent(prompt)}`;

  return (
    <div style={{
      width: 380, background: '#0a0a0a', color: '#fff',
      fontFamily: "'Inter', system-ui, sans-serif",
      position: 'relative', overflow: 'hidden', minHeight: 220,
    }}>
      <Particles />

      <div style={{ position: 'relative', zIndex: 1, padding: '20px 20px 16px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, letterSpacing: '-0.01em', color: '#fff' }}>PixelForge AI</div>
            <div style={{ fontSize: 10, color: '#555', marginTop: 1 }}>
              {promptsRemaining !== null ? `${promptsRemaining} prompts left today` : 'Image Prompt Extractor'}
            </div>
          </div>
        </div>

        {/* Hint / idle state */}
        {!prompt && !loading && !error && (
          <div style={{
            border: '1px solid #1a1a1a', borderRadius: 10, padding: '10px 12px',
            marginBottom: 14, background: 'rgba(255,255,255,0.02)',
          }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8 }}>
              <span style={{ fontSize: 12 }}>✂️</span>
              <span style={{ fontSize: 11, color: '#666', lineHeight: 1.5 }}>
                <strong style={{ color: '#aaa' }}>Click below</strong> to draw a selection over any image on screen.
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 12 }}>🖱️</span>
              <span style={{ fontSize: 11, color: '#666', lineHeight: 1.5 }}>
                Or <strong style={{ color: '#aaa' }}>right-click</strong> any image → "Get AI Prompt".
              </span>
            </div>
          </div>
        )}

        {/* Snip button */}
        {!prompt && (
          <button
            onClick={startSnip}
            style={{
              width: '100%', height: 40, background: '#fff', color: '#000',
              border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 12,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 6, letterSpacing: '-0.01em', marginBottom: 10,
              transition: 'background 0.15s, transform 0.1s',
            }}
            onMouseOver={e => (e.currentTarget.style.background = '#e5e5e5')}
            onMouseOut={e => (e.currentTarget.style.background = '#fff')}
          >
            ✂️ Snip Screen Area
          </button>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0', color: '#666', fontSize: 12 }}>
            <div style={{
              width: 14, height: 14, border: '2px solid #333', borderTopColor: '#fff',
              borderRadius: '50%', animation: 'spin 0.8s linear infinite',
            }} />
            Analyzing with AI...
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(255,60,60,0.07)', border: '1px solid rgba(255,60,60,0.2)',
            borderRadius: 8, padding: '10px 12px', marginBottom: 10,
            color: '#ff6b6b', fontSize: 11, lineHeight: 1.5,
          }}>
            {error}
          </div>
        )}

        {/* Generate on Platform Link */}
        {!prompt && (
          <a
            href={`${BASE_URL}/dashboard/portraits`}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'block', textAlign: 'center', fontSize: 10,
              color: '#333', textDecoration: 'none', paddingTop: 8,
              borderTop: '1px solid #111',
            }}
          >
            Open PixelForge AI ↗
          </a>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const container = document.getElementById('root');
if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(<Popup />);
}
