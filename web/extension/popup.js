const API_ENDPOINT = 'http://localhost:3000/api/process-feed';

document.addEventListener('DOMContentLoaded', async () => {
  // --- UI Elements ---
  const views = {
    setup: document.getElementById('setup-view'),
    capture: document.getElementById('capture-view'),
    success: document.getElementById('success-view')
  };
  
  const inputs = {
    apiKey: document.getElementById('api-key-input'),
    note: document.getElementById('user-note')
  };

  const displays = {
    title: document.getElementById('page-title'),
    url: document.getElementById('page-url'),
    stats: document.getElementById('content-stats'),
    status: document.getElementById('status-bar'),
    statusText: document.getElementById('status-text'),
    preview: document.getElementById('content-preview')
  };

  const buttons = {
    saveKey: document.getElementById('save-key-btn'),
    send: document.getElementById('send-btn'),
    reset: document.getElementById('reset-btn'),
    back: document.getElementById('back-btn') // Back from success
  };

  // --- State ---
  let currentTab = null;

  // --- Init ---
  const { neofeed_api_key } = await chrome.storage.local.get('neofeed_api_key');
  if (neofeed_api_key) {
    showView('capture');
  } else {
    showView('setup');
  }

  // --- View Management ---
  function showView(name) {
    Object.values(views).forEach(el => el.classList.remove('active'));
    views[name].classList.add('active');
    
    if (name === 'capture') {
      initCaptureView();
    }
  }

  async function initCaptureView() {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    currentTab = tab;

    if (tab && tab.url && (tab.url.startsWith('http') || tab.url.startsWith('https'))) {
      displays.title.textContent = tab.title || 'Untitled';
      displays.url.textContent = new URL(tab.url).hostname; // Only show hostname for cleanliness
      
      // Auto-extract content to show stats immediately
      extractContent(tab.id, true); // dryRun = true
    } else {
      displays.title.textContent = 'Restricted Page';
      displays.url.textContent = 'Cannot capture browser pages';
      buttons.send.disabled = true;
      buttons.send.textContent = "UNAVAILABLE";
    }
  }

  function updateStatus(msg, progress = 0, type = 'normal') {
    displays.statusText.textContent = msg;
    displays.status.style.width = `${progress}%`;
    
    // Reset classes
    displays.status.className = 'status-bar-fill';
    if (type === 'error') displays.status.classList.add('error');
    if (type === 'success') displays.status.classList.add('success');
  }

  // --- Core Logic: Smart Extraction ---
  // This function is serialized and injected into the page
  function smartExtractInPage() {
    try {
      // 1. Clone body to be safe
      const clone = document.body.cloneNode(true);

      // 2. Remove Noise
      const noiseSelectors = [
        'script', 'style', 'noscript', 'iframe', 'svg', 
        'nav', 'footer', 'header', 'aside', 
        '.ad', '.advertisement', '.social-share', '.cookie-banner', 
        '[role="alert"]', '[role="banner"]', '[role="dialog"]'
      ];
      noiseSelectors.forEach(sel => {
        clone.querySelectorAll(sel).forEach(el => el.remove());
      });

      // 3. Find Core Content
      // Heuristic: Look for <article>, then <main>, then specific IDs, then fallback to body
      let contentNode = clone.querySelector('article') || 
                        clone.querySelector('main') || 
                        clone.querySelector('[role="main"]') || 
                        clone.querySelector('#content') || 
                        clone.querySelector('#main') ||
                        clone;

      // 4. Extract Text & Clean
      let text = contentNode.innerText || "";
      
      // Remove excessive whitespace
      text = text
        .replace(/[\t\r]+/g, ' ') // Tabs/Returns to space
        .replace(/\n\s+\n/g, '\n\n') // Multiple newlines to double newline
        .replace(/ {2,}/g, ' ') // Multiple spaces to single
        .trim();

      return {
        text: text.slice(0, 30000), // Cap at 30k chars
        length: text.length,
        debug_node: contentNode.tagName
      };
    } catch (e) {
      return { error: e.toString() };
    }
  }

  // --- Actions ---

  async function extractContent(tabId, dryRun = false) {
    try {
      if (!dryRun) updateStatus('EXTRACTING...', 30);
      
      const results = await chrome.scripting.executeScript({
        target: { tabId },
        func: smartExtractInPage
      });

      if (results && results[0] && results[0].result) {
        const data = results[0].result;
        
        if (data.error) throw new Error(data.error);

        if (dryRun) {
          displays.stats.textContent = `${data.length} chars / ${data.debug_node}`;
          displays.preview.textContent = data.text.slice(0, 100) + "...";
          return null;
        }
        
        return data.text;
      }
      throw new Error("No content returned");
    } catch (e) {
      if (!dryRun) updateStatus('EXTRACTION FAILED', 100, 'error');
      console.error(e);
      return null;
    }
  }

  buttons.saveKey.addEventListener('click', async () => {
    const key = inputs.apiKey.value.trim();
    if (!key.startsWith('sk_neofeed_')) {
      inputs.apiKey.style.borderColor = '#ef4444';
      return;
    }
    await chrome.storage.local.set({ neofeed_api_key: key });
    showView('capture');
  });

  buttons.reset.addEventListener('click', async () => {
    await chrome.storage.local.remove('neofeed_api_key');
    showView('setup');
  });

  buttons.back.addEventListener('click', () => {
    showView('capture');
  });

  buttons.send.addEventListener('click', async () => {
    const { neofeed_api_key } = await chrome.storage.local.get('neofeed_api_key');
    if (!neofeed_api_key) return showView('setup');

    buttons.send.disabled = true;
    updateStatus('INITIALIZING...', 10);

    // 1. Extract
    const content = await extractContent(currentTab.id);
    if (!content) {
      buttons.send.disabled = false;
      return;
    }

    // 2. Prepare Payload
    const note = inputs.note.value.trim();
    const payload = {
      url: currentTab.url,
      title: currentTab.title,
      content: `${note ? `[User Note: ${note}]\n\n` : ''}${content}`
    };

    updateStatus('TRANSMITTING...', 60);

    // 3. Send
    try {
      const res = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${neofeed_api_key}` 
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Server rejected request");

      updateStatus('COMPLETE', 100, 'success');
      setTimeout(() => {
        showView('success');
        buttons.send.disabled = false;
        inputs.note.value = ''; // Clear note
        updateStatus('', 0); // Reset status
      }, 800);

    } catch (e) {
      updateStatus('UPLOAD FAILED', 100, 'error');
      buttons.send.disabled = false;
      console.error(e);
    }
  });
});
