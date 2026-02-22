/// <reference types="chrome"/>

let selectedImage: HTMLImageElement | null = null;

// Track last right-clicked image
document.addEventListener('contextmenu', (e) => {
  if (e.target instanceof HTMLImageElement) {
    selectedImage = e.target;
  } else {
    selectedImage = null;
  }
});

function showToast(message: string, isError = false) {
  const existing = document.getElementById('pixelforge-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'pixelforge-toast';
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: ${isError ? '#ef4444' : '#18181b'};
    color: white;
    padding: 12px 20px;
    border-radius: 12px;
    font-family: system-ui, sans-serif;
    font-size: 14px;
    z-index: 9999999;
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    border: 1px solid ${isError ? '#dc2626' : '#27272a'};
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 8px;
  `;
  toast.innerHTML = `<span style="font-size: 16px;">${isError ? '⚠️' : '✨'}</span> ${message}`;
  document.body.appendChild(toast);

  if (!isError && !message.includes('Analyzing')) {
    setTimeout(() => {
      if (document.body.contains(toast)) toast.remove();
    }, 4000);
  }
}

function showResultModal(prompt: string) {
  const existing = document.getElementById('pixelforge-toast');
  if (existing) existing.remove();

  const existingModal = document.getElementById('pixelforge-modal');
  if (existingModal) existingModal.remove();

  const modal = document.createElement('div');
  modal.id = 'pixelforge-modal';
  modal.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    width: 380px;
    background: #0a0a0a;
    border-radius: 12px;
    z-index: 9999999;
    box-shadow: 0 24px 48px rgba(0,0,0,0.5);
    border: 1px solid #333;
    overflow: hidden;
    font-family: system-ui, -apple-system, sans-serif;
  `;

  const cleanedPrompt = prompt
    .replace(/\*\*(Prompt|Style):\*\*/g, '')
    .replace(/^Here is a detailed AI art prompt.*:\s*/i, '')
    .trim();

  modal.innerHTML = `
    <div style="background: #111; padding: 16px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #222;">
      <div style="color: white; font-weight: 600; font-size: 14px; display: flex; align-items: center; gap: 6px;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
        PixelForge AI
      </div>
      <button id="pf-close-btn" style="background: none; border: none; color: #888; cursor: pointer; padding: 4px; display: flex; align-items: center; justify-content: center; border-radius: 4px; transition: all 0.2s;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    </div>
    <div style="padding: 16px; background: #0a0a0a;">
      <div style="background: #111; border: 1px solid #222; border-radius: 8px; padding: 12px; font-size: 12px; color: #ccc; line-height: 1.6; max-height: 180px; overflow-y: auto; white-space: pre-wrap; font-family: monospace;">${cleanedPrompt}</div>
    </div>
    <div style="padding: 12px 16px; background: #0a0a0a; border-top: 1px solid #222; display: flex; gap: 8px;">
      <button id="pf-copy-btn" style="flex: 1; background: #111; border: 1px solid #333; padding: 8px 12px; border-radius: 6px; font-weight: 500; font-size: 12px; color: #eee; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s;">
        Copy Prompt
      </button>
      <a href="http://localhost:3000/dashboard/image-gen?prompt=${encodeURIComponent(cleanedPrompt)}" target="_blank" style="flex: 1; background: #fff; color: #000; border: none; padding: 8px 12px; border-radius: 6px; font-weight: 600; font-size: 12px; cursor: pointer; text-decoration: none; text-align: center; display: flex; align-items: center; justify-content: center; transition: all 0.2s;">
        Generate Image →
      </a>
    </div>
  `;

  document.body.appendChild(modal);

  const copyBtn = document.getElementById('pf-copy-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(cleanedPrompt);
      copyBtn.innerHTML = '✓ Copied!';
      copyBtn.style.background = '#052e16';
      copyBtn.style.color = '#4ade80';
      copyBtn.style.borderColor = '#166534';
      setTimeout(() => {
        copyBtn.innerHTML = 'Copy Prompt';
        copyBtn.style.background = '#111';
        copyBtn.style.color = '#eee';
        copyBtn.style.borderColor = '#333';
      }, 2000);
    });
  }

  const closeBtn = document.getElementById('pf-close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.remove();
    });
  }
}

function processImageBase64(base64: string) {
  showToast('Analyzing image with PixelForge AI...');
  chrome.runtime.sendMessage(
    { action: 'getPrompt', imageBase64: base64 },
    (response: any) => {
      if (!response) {
        showToast('Extension communication failed. Try again.', true);
        return;
      }
      if (response.success) {
        showResultModal(response.prompt);
      } else {
        showToast(response.error || 'Failed to generate prompt', true);
      }
    }
  );
}

function startSnipMode() {
  if (document.getElementById('pf-snip-overlay')) return;

  const overlay = document.createElement('div');
  overlay.id = 'pf-snip-overlay';
  overlay.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    background: rgba(0,0,0,0.3); z-index: 99999999; cursor: crosshair;
    user-select: none;
  `;

  const selection = document.createElement('div');
  selection.style.cssText = `
    position: absolute; border: 2px dashed #a855f7; background: rgba(168, 85, 247, 0.1);
    display: none; box-shadow: 0 0 0 9999px rgba(0,0,0,0.5);
  `;
  overlay.appendChild(selection);
  document.body.appendChild(overlay);

  let startX = 0, startY = 0, isDragging = false;

  const handleMouseDown = (e: MouseEvent) => {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    selection.style.left = startX + 'px';
    selection.style.top = startY + 'px';
    selection.style.width = '0px';
    selection.style.height = '0px';
    selection.style.display = 'block';
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    const currentX = e.clientX;
    const currentY = e.clientY;
    const x = Math.min(startX, currentX);
    const y = Math.min(startY, currentY);
    const w = Math.abs(currentX - startX);
    const h = Math.abs(currentY - startY);
    selection.style.left = x + 'px';
    selection.style.top = y + 'px';
    selection.style.width = w + 'px';
    selection.style.height = h + 'px';
  };

  const handleMouseUp = (e: MouseEvent) => {
    if (!isDragging) return;
    isDragging = false;
    overlay.remove();

    const currentX = e.clientX;
    const currentY = e.clientY;
    const x = Math.min(startX, currentX);
    const y = Math.min(startY, currentY);
    const w = Math.abs(currentX - startX);
    const h = Math.abs(currentY - startY);

    if (w < 10 || h < 10) return; // Ignore tiny clicks

    showToast('Capturing area...');

    // Request full viewport screenshot from background
    chrome.runtime.sendMessage({ action: 'captureVisibleTab' }, (response: any) => {
      if (response && response.dataUrl) {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const dpr = window.devicePixelRatio || 1;

          canvas.width = w * dpr;
          canvas.height = h * dpr;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, x * dpr, y * dpr, w * dpr, h * dpr, 0, 0, w * dpr, h * dpr);
            const croppedBase64 = canvas.toDataURL('image/jpeg', 0.9).split(',')[1];
            processImageBase64(croppedBase64);
          }
        };
        img.src = response.dataUrl;
      } else {
        showToast('Capture failed. Make sure you are on a standard webpage.', true);
      }
    });
  };

  // Bind events securely
  overlay.addEventListener('mousedown', handleMouseDown);
  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('mouseup', handleMouseUp);
}

chrome.runtime.onMessage.addListener((request: any, sender: any, sendResponse: any) => {
  if (request.action === 'initSnip') {
    startSnipMode();
    sendResponse({ success: true });
    return false;
  }

  if (request.action === 'getImagePrompt') {
    const imageUrl = request.imageUrl || (selectedImage ? selectedImage.src : null);

    if (!imageUrl) {
      showToast('No image selected. Right-click an image first.', true);
      sendResponse({ success: false });
      return false;
    }

    showToast('Fetching image data... (Will fail if CORS blocked. Please use Snip Area instead)');

    fetch(imageUrl)
      .then(r => r.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          processImageBase64(base64);
        };
        reader.readAsDataURL(blob);
      })
      .catch(err => {
        showToast('Cannot read this image due to cross-origin security. Try using the Snipping Tool instead!', true);
      });

    sendResponse({ success: true });
    return false;
  }

  return false;
});
