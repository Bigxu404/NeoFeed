const API_ENDPOINT = 'http://localhost:3000/api/process-feed';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "save-to-neofeed",
    title: "Save selection to NeoFeed",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "save-to-neofeed") {
    const { neofeed_api_key } = await chrome.storage.local.get('neofeed_api_key');
    if (!neofeed_api_key) return console.error("No API Key");

    const content = `\"${info.selectionText}\"\n\nSource: [${tab.title}](${tab.url})`;
    
    try {
      await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${neofeed_api_key}` },
        body: JSON.stringify({ content })
      });
    } catch (e) {
      console.error(e);
    }
  }
});
