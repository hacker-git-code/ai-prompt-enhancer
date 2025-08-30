// Background service worker for Prompt Enhancer

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Set default settings on first install
    chrome.storage.sync.set({
      isEnabled: true,
      style: 'Professional'
    });
    
    // Open welcome page or show installation message
    console.log('Prompt Enhancer installed successfully!');
  }
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // This will open the popup automatically due to manifest configuration
  // But we can add additional logic here if needed
});

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSettings') {
    // Return current settings
    chrome.storage.sync.get(['isEnabled', 'style'], (result) => {
      sendResponse(result);
    });
    return true; // Keep message channel open for async response
  }
  
  if (request.action === 'updateSettings') {
    // Update settings and notify content scripts
    chrome.storage.sync.set(request.settings, () => {
      // Broadcast settings change to all tabs
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, {
            action: 'updateSettings',
            settings: request.settings
          }).catch(() => {
            // Ignore errors for tabs that don't have content scripts
          });
        });
      });
      sendResponse({ success: true });
    });
    return true;
  }
});

// Handle tab updates to ensure content script is injected
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Check if the tab has a content script
    chrome.tabs.sendMessage(tabId, { action: 'ping' }).catch(() => {
      // Content script not found, inject it
      if (tab.url.startsWith('http')) {
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          files: ['content.js']
        }).catch(() => {
          // Ignore errors for restricted pages
        });
      }
    });
  }
});

// Handle extension updates
chrome.runtime.onUpdateAvailable.addListener(() => {
  chrome.runtime.reload();
});