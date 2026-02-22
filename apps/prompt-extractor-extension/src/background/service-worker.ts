/// <reference types="chrome"/>

chrome.runtime.onInstalled.addListener(() => {
  console.log('PixelForge AI extension installed');

  chrome.contextMenus.create({
    id: 'pixelforge-get-prompt',
    title: 'Get AI Prompt with PixelForge AI',
    contexts: ['image'],
    documentUrlPatterns: ['<all_urls>'],
  });

  chrome.contextMenus.create({
    id: 'pixelforge-snip-page',
    title: 'Snip Area for AI Prompt',
    contexts: ['page'],
    documentUrlPatterns: ['<all_urls>'],
  });
});

chrome.contextMenus.onClicked.addListener(async (info: any, tab: any) => {
  if (!tab?.id) return;

  try {
    if (info.menuItemId === 'pixelforge-get-prompt') {
      await chrome.tabs.sendMessage(tab.id, {
        action: 'getImagePrompt',
        imageUrl: info.srcUrl,
      });
    } else if (info.menuItemId === 'pixelforge-snip-page') {
      await chrome.tabs.sendMessage(tab.id, { action: 'initSnip' });
    }
  } catch (error) {
    // If the content script isn't loaded (e.g. extension just installed, tab not refreshed)
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content/content-script.js']
      });

      // Retry sending the message
      if (info.menuItemId === 'pixelforge-get-prompt') {
        chrome.tabs.sendMessage(tab.id, { action: 'getImagePrompt', imageUrl: info.srcUrl });
      } else {
        chrome.tabs.sendMessage(tab.id, { action: 'initSnip' });
      }
    } catch (e) {
      console.error("Cannot inject script into this page:", e);
    }
  }
});

// Listen for messages from popup and content scripts
chrome.runtime.onMessage.addListener((request: any, sender: any, sendResponse: any) => {
  if (request.action === 'captureVisibleTab') {
    chrome.tabs.captureVisibleTab({ format: 'png' }, (dataUrl: string) => {
      sendResponse({ dataUrl });
    });
    return true; // Keep channel open
  }

  if (request.action === 'getPrompt') {
    // Send request to backend
    fetch('http://localhost:3000/api/tools/prompt-extract', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-extension-key': 'pixelforge-ext-dev-key-2024',
      },
      body: JSON.stringify({
        image_base64: request.imageBase64,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          sendResponse({
            success: true,
            prompt: data.data.prompt,
            prompts_remaining: data.data.prompts_remaining,
            upgrade_url: data.data.upgrade_url,
          });
        } else {
          sendResponse({ success: false, error: data.error });
        }
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });

    return true; // Keep message channel open for async response
  }

  return false;
});
