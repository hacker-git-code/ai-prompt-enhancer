// Background service worker for Prompt Enhancer Pro

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        // First time installation
        console.log('Prompt Enhancer Pro installed successfully!');
        
        // Set default settings
        chrome.storage.sync.set({
            'selectedStyle': 'professional',
            'showFloatingButton': true,
            'autoDetectChats': true,
            'enhancementLevel': 'standard'
        });
        
        // Open welcome page
        chrome.tabs.create({
            url: 'https://github.com/your-repo/prompt-enhancer-pro#readme'
        });
    } else if (details.reason === 'update') {
        // Extension updated
        console.log('Prompt Enhancer Pro updated to version', chrome.runtime.getManifest().version);
    }
});

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
    console.log('Prompt Enhancer Pro started');
});

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case 'getSettings':
            chrome.storage.sync.get(null, (settings) => {
                sendResponse({ success: true, settings });
            });
            return true; // Keep message channel open for async response
            
        case 'updateSettings':
            chrome.storage.sync.set(request.settings, () => {
                sendResponse({ success: true });
            });
            return true;
            
        case 'getActiveTab':
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                sendResponse({ success: true, tab: tabs[0] });
            });
            return true;
            
        case 'executeScript':
            chrome.scripting.executeScript({
                target: { tabId: request.tabId },
                func: request.function,
                args: request.args || []
            }, (result) => {
                sendResponse({ success: true, result });
            });
            return true;
            
        default:
            sendResponse({ success: false, error: 'Unknown action' });
            return false;
    }
});

// Handle context menu creation
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'enhancePrompt',
        title: '🚀 Enhance Prompt with Prompt Enhancer Pro',
        contexts: ['selection']
    });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'enhancePrompt' && info.selectionText) {
        // Send the selected text to the content script for enhancement
        chrome.tabs.sendMessage(tab.id, {
            action: 'enhanceSelectedText',
            text: info.selectionText
        });
    }
});

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
    if (command === 'enhance-prompt') {
        // Get active tab and send enhancement request
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'openEnhancementPopup'
                });
            }
        });
    }
});

// Handle storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync') {
        // Notify content scripts of setting changes
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach(tab => {
                chrome.tabs.sendMessage(tab.id, {
                    action: 'settingsChanged',
                    changes
                }).catch(() => {
                    // Tab might not have content script loaded
                });
            });
        });
    }
});

// Handle tab updates to inject content script if needed
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        // Check if this is a chat platform where we should inject our script
        const chatPlatforms = [
            'chat.openai.com',      // ChatGPT
            'claude.ai',            // Claude
            'bard.google.com',      // Bard
            'bing.com/chat',        // Bing Chat
            'poe.com',              // Poe
            'perplexity.ai',        // Perplexity
            'you.com',              // You.com
            'phind.com'             // Phind
        ];
        
        const isChatPlatform = chatPlatforms.some(platform => 
            tab.url.includes(platform)
        );
        
        if (isChatPlatform) {
            // Ensure content script is injected
            chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ['content.js']
            }).catch(() => {
                // Script might already be injected
            });
        }
    }
});

// Handle extension icon clicks
chrome.action.onClicked.addListener((tab) => {
    // Open the popup when extension icon is clicked
    // This is handled by the manifest.json action configuration
});

// Utility function to check if a URL is a chat platform
function isChatPlatform(url) {
    const chatPatterns = [
        /chat\.openai\.com/,
        /claude\.ai/,
        /bard\.google\.com/,
        /bing\.com\/chat/,
        /poe\.com/,
        /perplexity\.ai/,
        /you\.com/,
        /phind\.com/
    ];
    
    return chatPatterns.some(pattern => pattern.test(url));
}

// Handle web requests to detect chat platforms
chrome.webRequest.onBeforeRequest.addListener(
    (details) => {
        // This can be used for additional chat platform detection
        // or to modify requests if needed in the future
    },
    { urls: ["<all_urls>"] },
    ["requestBody"]
);

// Export functions for use in other parts of the extension
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        isChatPlatform
    };
}