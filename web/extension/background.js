// 🚀 Dynamic API Endpoint Discovery
const PRODUCTION_URL = 'https://neofeed.cn';
const LOCAL_URL = 'http://localhost:3000';
let API_ENDPOINT = `${PRODUCTION_URL}/api/process-feed`; // Default to production for background

async function discoverEndpoint() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 500);
    const res = await fetch(`${LOCAL_URL}/api/process-feed`, { method: 'OPTIONS', signal: controller.signal });
    if (res.ok || res.status === 401 || res.status === 405) {
      API_ENDPOINT = `${LOCAL_URL}/api/process-feed`;
    }
  } catch (e) {
    API_ENDPOINT = `${PRODUCTION_URL}/api/process-feed`;
  }
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "save-to-neofeed",
    title: "Save selection to NeoFeed",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "save-to-neofeed") {
    await discoverEndpoint(); // Re-check on click to be safe
    
    const { neofeed_api_key } = await chrome.storage.local.get('neofeed_api_key');
    if (!neofeed_api_key) return console.error("No API Key configured in NeoFeed Probe");

    const payload = {
      url: tab.url,
      title: tab.title,
      content: `\"${info.selectionText}\"`
    };
    
    try {
      await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${neofeed_api_key}` 
        },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.error("Transmit failed:", e);
    }
  }
});
