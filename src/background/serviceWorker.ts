// Background service worker for Tilda Animation Helper
// Handles extension icon click and message routing

chrome.action.onClicked.addListener((tab) => {
  if (tab.id == null) return;
  chrome.tabs.sendMessage(tab.id, { type: 'TAH_TOGGLE_PANEL' }).catch(() => {
    // Content script might not be injected yet on this tab
    chrome.scripting
      .executeScript({
        target: { tabId: tab.id! },
        files: ['src/content/contentScript.js'],
      })
      .then(() => {
        setTimeout(() => {
          chrome.tabs.sendMessage(tab.id!, { type: 'TAH_TOGGLE_PANEL' });
        }, 300);
      })
      .catch(() => {
        // Not allowed on this tab (chrome:// pages etc.)
      });
  });
});

// Relay storage requests from content scripts (not needed but available as extension point)
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'TAH_PING') {
    sendResponse({ ok: true });
    return true;
  }
  return false;
});

export {};
