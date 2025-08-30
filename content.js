// Content script for Prompt Enhancer Pro
class ContentScript {
    constructor() {
        this.init();
    }

    init() {
        this.listenForMessages();
        this.detectChatInterfaces();
        this.addEnhancementButton();
    }

    listenForMessages() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === 'insertPrompt') {
                this.insertPromptIntoChat(request.prompt);
                sendResponse({ success: true });
            }
        });
    }

    detectChatInterfaces() {
        // Common chat input selectors for popular AI platforms
        const chatSelectors = [
            // ChatGPT
            'textarea[data-id="root"]',
            'textarea[placeholder*="Message"]',
            'textarea[placeholder*="chat"]',
            'textarea[placeholder*="Send a message"]',
            
            // Claude
            'textarea[placeholder*="Message Claude"]',
            'textarea[placeholder*="Ask Claude"]',
            
            // Bard/Gemini
            'textarea[placeholder*="Message"]',
            'textarea[placeholder*="Ask"]',
            
            // Bing Chat
            'textarea[placeholder*="Ask me anything"]',
            'textarea[placeholder*="Message"]',
            
            // Generic chat inputs
            'textarea[placeholder*="Type"]',
            'textarea[placeholder*="Enter"]',
            'textarea[placeholder*="Write"]',
            
            // Input fields that might be chat inputs
            'input[type="text"][placeholder*="Message"]',
            'input[type="text"][placeholder*="Ask"]',
            'input[type="text"][placeholder*="Type"]',
            
            // Contenteditable divs
            'div[contenteditable="true"][placeholder*="Message"]',
            'div[contenteditable="true"][placeholder*="Ask"]',
            'div[contenteditable="true"][placeholder*="Type"]'
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

        // Also listen for dynamically added chat inputs
        this.observeDOMChanges();
    }

    isChatInput(element) {
        // Check if element looks like a chat input
        const placeholder = element.placeholder || element.getAttribute('aria-label') || '';
        const isTextarea = element.tagName === 'TEXTAREA';
        const isInput = element.tagName === 'INPUT' && element.type === 'text';
        const isContentEditable = element.contentEditable === 'true';
        
        const chatKeywords = ['message', 'ask', 'type', 'write', 'chat', 'send'];
        const hasChatKeywords = chatKeywords.some(keyword => 
            placeholder.toLowerCase().includes(keyword)
        );

        return (isTextarea || isInput || isContentEditable) && hasChatKeywords;
    }

    addEnhancementIndicator(element) {
        // Add a small visual indicator that this input can be enhanced
        const indicator = document.createElement('div');
        indicator.className = 'prompt-enhancer-indicator';
        indicator.innerHTML = '✨';
        indicator.title = 'Prompt Enhancer Pro - Click to enhance your prompt';
        indicator.style.cssText = `
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            cursor: pointer;
            font-size: 16px;
            opacity: 0.7;
            transition: opacity 0.2s ease;
            z-index: 1000;
            pointer-events: none;
        `;

        // Position the indicator relative to the input
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
                        // Check if the new node is a chat input
                        if (this.isChatInput(node)) {
                            this.chatInputs.push(node);
                            this.addEnhancementIndicator(node);
                        }
                        
                        // Check if the new node contains chat inputs
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

    addEnhancementButton() {
        // Add a floating enhancement button for quick access
        const button = document.createElement('div');
        button.className = 'prompt-enhancer-float-btn';
        button.innerHTML = '🚀';
        button.title = 'Prompt Enhancer Pro - Click to enhance your prompt';
        button.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            cursor: pointer;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            transition: all 0.3s ease;
            user-select: none;
        `;

        button.addEventListener('mouseenter', () => {
            button.style.transform = 'scale(1.1)';
            button.style.boxShadow = '0 6px 25px rgba(0, 0, 0, 0.3)';
        });

        button.addEventListener('mouseleave', () => {
            button.style.transform = 'scale(1)';
            button.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.2)';
        });

        button.addEventListener('click', () => {
            this.openEnhancementPopup();
        });

        document.body.appendChild(button);
    }

    openEnhancementPopup() {
        // Create a popup for quick enhancement
        const popup = document.createElement('div');
        popup.className = 'prompt-enhancer-popup';
        popup.innerHTML = `
            <div class="popup-header">
                <h3>🚀 Quick Prompt Enhancement</h3>
                <button class="close-btn">×</button>
            </div>
            <div class="popup-content">
                <textarea placeholder="Write your simple prompt here..." class="quick-input"></textarea>
                <div class="style-buttons">
                    <button data-style="professional" class="style-btn active">Professional</button>
                    <button data-style="creative" class="style-btn">Creative</button>
                    <button data-style="detailed" class="style-btn">Detailed</button>
                    <button data-style="concise" class="style-btn">Concise</button>
                </div>
                <button class="enhance-btn">✨ Enhance & Insert</button>
            </div>
        `;

        popup.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 400px;
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
            z-index: 10001;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .prompt-enhancer-popup .popup-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 20px;
                border-radius: 16px 16px 0 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .prompt-enhancer-popup .popup-header h3 {
                margin: 0;
                font-size: 18px;
            }
            
            .prompt-enhancer-popup .close-btn {
                background: none;
                border: none;
                color: white;
                font-size: 24px;
                cursor: pointer;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: background 0.2s ease;
            }
            
            .prompt-enhancer-popup .close-btn:hover {
                background: rgba(255, 255, 255, 0.2);
            }
            
            .prompt-enhancer-popup .popup-content {
                padding: 20px;
            }
            
            .prompt-enhancer-popup .quick-input {
                width: 100%;
                padding: 12px;
                border: 2px solid #e1e5e9;
                border-radius: 8px;
                font-family: inherit;
                font-size: 14px;
                resize: vertical;
                margin-bottom: 16px;
                min-height: 80px;
            }
            
            .prompt-enhancer-popup .style-buttons {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 8px;
                margin-bottom: 16px;
            }
            
            .prompt-enhancer-popup .style-btn {
                padding: 8px 12px;
                border: 2px solid #e1e5e9;
                border-radius: 6px;
                background: white;
                color: #666;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .prompt-enhancer-popup .style-btn.active {
                background: #667eea;
                border-color: #667eea;
                color: white;
            }
            
            .prompt-enhancer-popup .enhance-btn {
                width: 100%;
                padding: 12px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: transform 0.2s ease;
            }
            
            .prompt-enhancer-popup .enhance-btn:hover {
                transform: translateY(-1px);
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(popup);

        // Add event listeners
        const closeBtn = popup.querySelector('.close-btn');
        const styleBtns = popup.querySelectorAll('.style-btn');
        const enhanceBtn = popup.querySelector('.enhance-btn');
        const input = popup.querySelector('.quick-input');

        closeBtn.addEventListener('click', () => popup.remove());

        styleBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                styleBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        enhanceBtn.addEventListener('click', () => {
            const prompt = input.value.trim();
            if (prompt) {
                const style = popup.querySelector('.style-btn.active').dataset.style;
                const enhanced = this.enhancePrompt(prompt, style);
                this.insertPromptIntoChat(enhanced);
                popup.remove();
            }
        });

        // Close on outside click
        popup.addEventListener('click', (e) => {
            if (e.target === popup) popup.remove();
        });

        // Focus input
        input.focus();
    }

    enhancePrompt(prompt, style) {
        const templates = {
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

        const template = templates[style];
        return template.prefix + prompt + template.suffix;
    }

    insertPromptIntoChat(enhancedPrompt) {
        // Find the most recently focused or active chat input
        let targetInput = null;
        
        // Check if there's a focused element that's a chat input
        if (document.activeElement && this.chatInputs.includes(document.activeElement)) {
            targetInput = document.activeElement;
        } else if (this.chatInputs.length > 0) {
            // Use the last chat input found
            targetInput = this.chatInputs[this.chatInputs.length - 1];
        }

        if (targetInput) {
            if (targetInput.tagName === 'TEXTAREA' || targetInput.tagName === 'INPUT') {
                targetInput.value = enhancedPrompt;
                targetInput.focus();
                
                // Trigger input event to notify the chat interface
                targetInput.dispatchEvent(new Event('input', { bubbles: true }));
                targetInput.dispatchEvent(new Event('change', { bubbles: true }));
            } else if (targetInput.contentEditable === 'true') {
                targetInput.textContent = enhancedPrompt;
                targetInput.focus();
                
                // Trigger input event
                targetInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }
    }
}

// Initialize the content script
new ContentScript();