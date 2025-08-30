// Background Service Worker for Prompt Enhancer Pro

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        // First time installation
        console.log('Prompt Enhancer Pro installed successfully!');
        
        // Set default settings
        chrome.storage.sync.set({
            addExamples: true,
            addFormatting: true,
            addConstraints: false,
            enhancementStyle: 'professional'
        });
        
        // Open welcome page or show notification
        chrome.tabs.create({
            url: chrome.runtime.getURL('welcome.html')
        });
    } else if (details.reason === 'update') {
        // Extension updated
        console.log('Prompt Enhancer Pro updated!');
    }
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case 'openEnhancer':
            handleOpenEnhancer();
            break;
        case 'getSettings':
            handleGetSettings(sendResponse);
            return true; // Keep message channel open for async response
        case 'updateSettings':
            handleUpdateSettings(request.settings, sendResponse);
            return true;
        case 'enhancePrompt':
            handleEnhancePrompt(request.prompt, request.options, sendResponse);
            return true;
        default:
            console.log('Unknown action:', request.action);
    }
});

// Handle opening the enhancer
async function handleOpenEnhancer() {
    try {
        // Get the current active tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (tab) {
            // Check if there's pending text to enhance
            const result = await chrome.storage.local.get(['pendingEnhancement']);
            
            if (result.pendingEnhancement) {
                // Clear the pending enhancement
                await chrome.storage.local.remove(['pendingEnhancement']);
                
                // Send message to popup to pre-fill the input
                chrome.runtime.sendMessage({
                    action: 'prefillPrompt',
                    text: result.pendingEnhancement
                });
            }
        }
    } catch (error) {
        console.error('Error handling open enhancer:', error);
    }
}

// Handle getting settings
async function handleGetSettings(sendResponse) {
    try {
        const result = await chrome.storage.sync.get([
            'addExamples',
            'addFormatting', 
            'addConstraints',
            'enhancementStyle'
        ]);
        
        sendResponse({
            success: true,
            settings: result
        });
    } catch (error) {
        console.error('Error getting settings:', error);
        sendResponse({
            success: false,
            error: error.message
        });
    }
}

// Handle updating settings
async function handleUpdateSettings(settings, sendResponse) {
    try {
        await chrome.storage.sync.set(settings);
        sendResponse({
            success: true
        });
    } catch (error) {
        console.error('Error updating settings:', error);
        sendResponse({
            success: false,
            error: error.message
        });
    }
}

// Handle prompt enhancement (for future AI integration)
async function handleEnhancePrompt(prompt, options, sendResponse) {
    try {
        // This is where you could integrate with external AI services
        // For now, we'll use the built-in enhancement logic
        
        let enhanced = applyStyleEnhancement(prompt, options.style || 'professional');
        enhanced = addContextEnhancement(enhanced, options);
        
        sendResponse({
            success: true,
            enhancedPrompt: enhanced
        });
    } catch (error) {
        console.error('Error enhancing prompt:', error);
        sendResponse({
            success: false,
            error: error.message
        });
    }
}

// Built-in enhancement functions (same as in popup.js)
function applyStyleEnhancement(prompt, style) {
    const enhancements = {
        professional: {
            prefix: "Please provide a comprehensive and professional response to the following request: ",
            suffix: " Please ensure your response is well-structured, accurate, and suitable for a professional audience."
        },
        creative: {
            prefix: "I'd like you to approach this creatively and think outside the box: ",
            suffix: " Feel free to be innovative, imaginative, and provide unique perspectives or solutions."
        },
        detailed: {
            prefix: "Please provide an extremely detailed and thorough response to: ",
            suffix: " Include step-by-step explanations, examples, and cover all relevant aspects comprehensively."
        },
        concise: {
            prefix: "Please provide a clear and concise response to: ",
            suffix: " Keep your answer focused, direct, and to the point while maintaining accuracy."
        }
    };

    const enhancement = enhancements[style] || enhancements.professional;
    return enhancement.prefix + prompt + enhancement.suffix;
}

function addContextEnhancement(prompt, options) {
    let enhanced = prompt;

    if (options.examples) {
        enhanced += "\n\nPlease include relevant examples to illustrate your points.";
    }

    if (options.formatting) {
        enhanced += "\n\nPlease format your response clearly with appropriate headings, bullet points, or numbered lists where helpful.";
    }

    if (options.constraints) {
        enhanced += "\n\nPlease consider any practical constraints or limitations that might apply to this request.";
    }

    return enhanced;
}

// Context menu creation
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'enhancePrompt',
        title: '🚀 Enhance as Prompt',
        contexts: ['selection']
    });
    
    chrome.contextMenus.create({
        id: 'quickEnhance',
        title: '⚡ Quick Enhance',
        contexts: ['selection']
    });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'enhancePrompt') {
        // Store the selected text and open enhancer
        chrome.storage.local.set({ 'pendingEnhancement': info.selectionText }, () => {
            chrome.runtime.sendMessage({ action: 'openEnhancer' });
        });
    } else if (info.menuItemId === 'quickEnhance') {
        // Send message to content script for quick enhancement
        chrome.tabs.sendMessage(tab.id, {
            action: 'quickEnhance',
            text: info.selectionText
        });
    }
});

// Handle tab updates to inject content scripts
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && tab.url.startsWith('http')) {
        // Inject content script if not already injected
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content.js']
        }).catch(() => {
            // Content script might already be injected, ignore error
        });
    }
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
    // Open the popup when extension icon is clicked
    chrome.action.openPopup();
});

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
    if (command === 'open-enhancer') {
        handleOpenEnhancer();
    }
});

// Error handling and logging
chrome.runtime.onSuspend.addListener(() => {
    console.log('Prompt Enhancer Pro background script suspended');
});

// Keep service worker alive
chrome.runtime.onStartup.addListener(() => {
    console.log('Prompt Enhancer Pro background script started');
});