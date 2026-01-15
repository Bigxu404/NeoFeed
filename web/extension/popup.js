const API_ENDPOINT = 'http://localhost:3000/api/process-feed';

document.addEventListener('DOMContentLoaded', async () => {
  const setupView = document.getElementById('setup-view');
  const captureView = document.getElementById('capture-view');
  const apiKeyInput = document.getElementById('api-key-input');
  const saveKeyBtn = document.getElementById('save-key-btn');
  const sendBtn = document.getElementById('send-btn');
  const resetBtn = document.getElementById('reset-btn');
  const pageTitleEl = document.getElementById('page-title');
  const pageUrlEl = document.getElementById('page-url');
  const userNoteEl = document.getElementById('user-note');
  const statusMsg = document.getElementById('status-msg');

  const { neofeed_api_key } = await chrome.storage.local.get('neofeed_api_key');

  if (neofeed_api_key) {
    showCaptureView();
  } else {
    showSetupView();
  }

  function showSetupView() {
    setupView.classList.add('active');
    captureView.classList.remove('active');
  }

  async function showCaptureView() {
    setupView.classList.remove('active');
    captureView.classList.add('active');
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      pageTitleEl.textContent = tab.title || 'Unknown';
      pageUrlEl.textContent = tab.url || 'Unknown';
    }
  }

  function setStatus(msg, type = 'normal') {
    statusMsg.textContent = msg;
    statusMsg.className = `status ${type}`;
  }

  saveKeyBtn.addEventListener('click', async () => {
    const key = apiKeyInput.value.trim();
    if (!key.startsWith('sk_neofeed_')) {
      alert('Invalid Key format');
      return;
    }
    await chrome.storage.local.set({ neofeed_api_key: key });
    showCaptureView();
  });

  resetBtn.addEventListener('click', async () => {
    await chrome.storage.local.remove('neofeed_api_key');
    apiKeyInput.value = '';
    showSetupView();
  });

  sendBtn.addEventListener('click', async () => {
    const { neofeed_api_key } = await chrome.storage.local.get('neofeed_api_key');
    if (!neofeed_api_key) return showSetupView();

    const note = userNoteEl.value.trim();
    const title = pageTitleEl.textContent;
    const url = pageUrlEl.textContent;
    const content = `[${title}](${url})\n\n${note}`;

    setStatus('TRANSMITTING...', 'normal');
    sendBtn.disabled = true;

    try {
      const res = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${neofeed_api_key}` },
        body: JSON.stringify({ content })
      });
      if (!res.ok) throw new Error('Failed');
      setStatus('UPLOAD COMPLETE', 'success');
      setTimeout(() => window.close(), 1500);
    } catch (error) {
      setStatus('ERROR', 'error');
      sendBtn.disabled = false;
    }
  });
});
