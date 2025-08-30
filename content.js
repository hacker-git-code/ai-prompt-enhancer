// Simplified Content Script for Prompt Enhancer Pro
// Automatically detects chat inputs and enhances prompts directly

class AutoPromptEnhancer {
    constructor() {
        this.isActive = false;
        this.enhancementTemplates = {
            professional: {
                prefix: "Please provide a comprehensive and professional response to the following request: ",
                suffix: " Please ensure the response is well-structured, informative, and suitable for a professional audience. Include relevant examples, best practices, and actionable insights."
            },
            creative: {
                prefix: "I'd love to see your creative take on this: ",
                suffix: " Feel free to think outside the box and provide innovative, engaging, and imaginative solutions. Add creative examples, metaphors, or unique perspectives to make it memorable."
            },
            detailed: {
                prefix: "I need a thorough and detailed analysis of the following: ",
                suffix: " Please provide an in-depth response with comprehensive coverage, step-by-step explanations, and thorough analysis. Include multiple perspectives, detailed examples, and comprehensive coverage of all aspects."
            },
            concise: {
                prefix: "Please provide a clear and concise response to: ",
                suffix: " Keep it brief but informative, focusing on the most important points. Be direct and to the point while maintaining clarity and usefulness."
            }
        };
        
        this.currentStyle = 'professional';
        this.init();
    }

    init() {
        this.loadSettings();
        this.addFloatingButton();
        this.detectChatInputs();
        this.observeDOMChanges();
    }

    loadSettings() {
        chrome.storage.sync.get(['selectedStyle'], (result) => {
            if (result.selectedStyle) {
                this.currentStyle = result.selectedStyle;
            }
        });
    }

    addFloatingButton() {
        // Create a simple floating button
        const button = document.createElement('div');
        button.className = 'prompt-enhancer-btn';
        button.innerHTML = '🚀';
        button.title = 'Click to enhance current prompt (Professional style)';
        button.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            transition: all 0.3s ease;
            user-select: none;
            color: white;
        `;

        button.addEventListener('mouseenter', () => {
            button.style.transform = 'scale(1.1)';
            button.style.box-shadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
        });

        button.addEventListener('mouseleave', () => {
            button.style.transform = 'scale(1)';
            button.style.box-shadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
        });

        button.addEventListener('click', () => {
            this.enhanceCurrentPrompt();
        });

        document.body.appendChild(button);
    }

    detectChatInputs() {
        // Common chat input selectors for popular AI platforms
        const chatSelectors = [
            // ChatGPT
            'textarea[data-id="root"]',
            'textarea[placeholder*="Message"]',
            'textarea[placeholder*="chat"]',
            'textarea[placeholder*="Send a message"]',
            'textarea[placeholder*="Type a message"]',
            
            // Claude
            'textarea[placeholder*="Message Claude"]',
            'textarea[placeholder*="Ask Claude"]',
            'textarea[placeholder*="Send a message"]',
            
            // Bard/Gemini
            'textarea[placeholder*="Message"]',
            'textarea[placeholder*="Ask"]',
            'textarea[placeholder*="Type here"]',
            
            // Bing Chat
            'textarea[placeholder*="Ask me anything"]',
            'textarea[placeholder*="Message"]',
            'textarea[placeholder*="Type your message"]',
            
            // Poe
            'textarea[placeholder*="Message"]',
            'textarea[placeholder*="Ask"]',
            
            // Perplexity
            'textarea[placeholder*="Ask anything"]',
            'textarea[placeholder*="Message"]',
            
            // Generic chat inputs
            'textarea[placeholder*="Type"]',
            'textarea[placeholder*="Enter"]',
            'textarea[placeholder*="Write"]',
            'textarea[placeholder*="Input"]',
            
            // Input fields
            'input[type="text"][placeholder*="Message"]',
            'input[type="text"][placeholder*="Ask"]',
            'input[type="text"][placeholder*="Type"]',
            'input[type="text"][placeholder*="Search"]',
            
            // Contenteditable divs
            'div[contenteditable="true"][placeholder*="Message"]',
            'div[contenteditable="true"][placeholder*="Ask"]',
            'div[contenteditable="true"][placeholder*="Type"]',
            'div[contenteditable="true"][data-placeholder*="Message"]',
            'div[contenteditable="true"][data-placeholder*="Ask"]'
        ];

        this.chatInputs = [];
        chatSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                if (this.isChatInput(element)) {
                    this.chatInputs.push(element);
                    this.addEnhancementIndicator(element);
                }
            });
        });
    }

    isChatInput(element) {
        const placeholder = element.placeholder || element.getAttribute('aria-label') || element.getAttribute('data-placeholder') || '';
        const isTextarea = element.tagName === 'TEXTAREA';
        const isInput = element.tagName === 'INPUT' && element.type === 'text';
        const isContentEditable = element.contentEditable === 'true';
        
        const chatKeywords = ['message', 'ask', 'type', 'write', 'chat', 'send', 'search', 'input'];
        const hasChatKeywords = chatKeywords.some(keyword => 
            placeholder.toLowerCase().includes(keyword)
        );

        return (isTextarea || isInput || isContentEditable) && hasChatKeywords;
    }

    addEnhancementIndicator(element) {
        // Add a small enhancement indicator
        const indicator = document.createElement('div');
        indicator.className = 'prompt-enhancer-indicator';
        indicator.innerHTML = '✨';
        indicator.title = 'Prompt Enhancer Pro - This input can be enhanced';
        indicator.style.cssText = `
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 14px;
            opacity: 0.6;
            z-index: 1000;
            pointer-events: none;
            color: #667eea;
        `;

        const parent = element.parentElement;
        if (parent) {
            parent.style.position = 'relative';
            parent.appendChild(indicator);
        }
    }

    observeDOMChanges() {
        // Watch for new chat inputs being added dynamically
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (this.isChatInput(node)) {
                            this.chatInputs.push(node);
                            this.addEnhancementIndicator(node);
                        }
                        
                        const chatInputs = node.querySelectorAll('textarea, input[type="text"], div[contenteditable="true"]');
                        chatInputs.forEach(input => {
                            if (this.isChatInput(input) && !this.chatInputs.includes(input)) {
                                this.chatInputs.push(input);
                                this.addEnhancementIndicator(input);
                            }
                        });
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    enhanceCurrentPrompt() {
        // Find the currently focused or most recent chat input
        let targetInput = null;
        
        // Check if there's a focused element that's a chat input
        if (document.activeElement && this.chatInputs.includes(document.activeElement)) {
            targetInput = document.activeElement;
        } else if (this.chatInputs.length > 0) {
            // Use the last chat input found
            targetInput = this.chatInputs[this.chatInputs.length - 1];
        }

        if (!targetInput) {
            this.showNotification('No chat input detected. Please click in a chat box first.', 'warning');
            return;
        }

        // Get current text
        let currentText = '';
        if (targetInput.tagName === 'TEXTAREA' || targetInput.tagName === 'INPUT') {
            currentText = targetInput.value;
        } else if (targetInput.contentEditable === 'true') {
            currentText = targetInput.textContent || targetInput.innerText;
        }

        if (!currentText.trim()) {
            this.showNotification('Please type something in the chat box first.', 'info');
            return;
        }

        // Enhance the prompt
        const enhancedPrompt = this.enhancePrompt(currentText);
        
        // Insert the enhanced prompt
        this.insertPromptIntoChat(enhancedPrompt, targetInput);
        
        // Show success notification
        this.showNotification('Prompt enhanced and inserted!', 'success');
        
        // Focus the input
        targetInput.focus();
    }

    enhancePrompt(prompt) {
        const template = this.enhancementTemplates[this.currentStyle];
        
        // Basic enhancement
        let enhanced = template.prefix + prompt + template.suffix;
        
        // Add context-specific enhancements
        enhanced += this.addContextualEnhancements(prompt);
        
        return enhanced;
    }

    addContextualEnhancements(prompt) {
        let enhancements = "";
        
        // Detect writing-related prompts
        if (this.containsKeywords(prompt, ['write', 'blog', 'article', 'content', 'story', 'email', 'letter'])) {
            enhancements += " Consider the target audience, tone, and purpose. Include a clear structure with introduction, main points, and conclusion.";
        }
        
        // Detect coding-related prompts
        if (this.containsKeywords(prompt, ['code', 'program', 'script', 'function', 'algorithm', 'debug', 'fix'])) {
            enhancements += " Provide clear code examples, explain the logic, and consider edge cases and error handling.";
        }
        
        // Detect analysis-related prompts
        if (this.containsKeywords(prompt, ['analyze', 'research', 'study', 'examine', 'investigate', 'compare'])) {
            enhancements += " Present multiple perspectives, cite relevant sources if applicable, and provide evidence-based conclusions.";
        }
        
        // Detect creative prompts
        if (this.containsKeywords(prompt, ['creative', 'design', 'art', 'imagine', 'brainstorm', 'logo', 'brand'])) {
            enhancements += " Encourage innovative thinking and provide multiple creative approaches or solutions.";
        }
        
        return enhancements;
    }

    containsKeywords(text, keywords) {
        return keywords.some(keyword => 
            text.toLowerCase().includes(keyword.toLowerCase())
        );
    }

    insertPromptIntoChat(enhancedPrompt, targetInput) {
        if (targetInput.tagName === 'TEXTAREA' || targetInput.tagName === 'INPUT') {
            targetInput.value = enhancedPrompt;
            
            // Trigger input event to notify the chat interface
            targetInput.dispatchEvent(new Event('input', { bubbles: true }));
            targetInput.dispatchEvent(new Event('change', { bubbles: true }));
        } else if (targetInput.contentEditable === 'true') {
            targetInput.textContent = enhancedPrompt;
            
            // Trigger input event
            targetInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }

    showNotification(message, type = 'info') {
        // Create a simple notification
        const notification = document.createElement('div');
        notification.className = 'prompt-enhancer-notification';
        notification.textContent = message;
        
        const colors = {
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            info: '#3b82f6'
        };
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10001;
            background: ${colors[type] || colors.info};
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            animation: slideIn 0.3s ease;
        `;
        
        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Method to change enhancement style
    changeStyle(newStyle) {
        if (this.enhancementTemplates[newStyle]) {
            this.currentStyle = newStyle;
            chrome.storage.sync.set({ 'selectedStyle': newStyle });
            
            // Update button title
            const button = document.querySelector('.prompt-enhancer-btn');
            if (button) {
                button.title = `Click to enhance current prompt (${newStyle.charAt(0).toUpperCase() + newStyle.slice(1)} style)`;
            }
            
            this.showNotification(`Style changed to ${newStyle}`, 'success');
        }
    }
}

// Initialize the auto enhancer
const autoEnhancer = new AutoPromptEnhancer();

// Listen for messages from popup (if needed for style changes)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'changeStyle') {
        autoEnhancer.changeStyle(request.style);
        sendResponse({ success: true });
    }
});