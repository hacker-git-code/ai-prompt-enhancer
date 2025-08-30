// Content script for Prompt Enhancer Pro
class ContentScript {
    constructor() {
        this.initialize();
    }

    initialize() {
        this.setupMessageListener();
        this.setupContextMenu();
        this.setupKeyboardShortcuts();
        this.injectEnhancementToolbar();
    }

    setupMessageListener() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === 'insertEnhancedPrompt') {
                this.insertEnhancedPrompt(request.prompt);
                sendResponse({ success: true });
            }
        });
    }

    setupContextMenu() {
        // Create custom context menu for text selection
        document.addEventListener('mouseup', (e) => {
            const selectedText = window.getSelection().toString().trim();
            if (selectedText && selectedText.length > 0) {
                this.showContextMenu(e, selectedText);
            } else {
                this.hideContextMenu();
            }
        });

        // Hide context menu when clicking elsewhere
        document.addEventListener('click', () => {
            this.hideContextMenu();
        });
    }

    showContextMenu(event, selectedText) {
        this.hideContextMenu();

        const contextMenu = document.createElement('div');
        contextMenu.id = 'prompt-enhancer-context-menu';
        contextMenu.innerHTML = `
            <div class="context-menu-item" data-action="enhance">
                🚀 Enhance as Prompt
            </div>
            <div class="context-menu-item" data-action="quick-enhance">
                ⚡ Quick Enhance
            </div>
        `;

        // Position the context menu
        contextMenu.style.position = 'fixed';
        contextMenu.style.left = event.pageX + 'px';
        contextMenu.style.top = event.pageY + 'px';
        contextMenu.style.zIndex = '10000';

        // Add event listeners
        contextMenu.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            if (action === 'enhance') {
                this.openEnhancerWithText(selectedText);
            } else if (action === 'quick-enhance') {
                this.quickEnhance(selectedText);
            }
        });

        document.body.appendChild(contextMenu);
    }

    hideContextMenu() {
        const existingMenu = document.getElementById('prompt-enhancer-context-menu');
        if (existingMenu) {
            existingMenu.remove();
        }
    }

    openEnhancerWithText(text) {
        // Store the text in storage and open the popup
        chrome.storage.local.set({ 'pendingEnhancement': text }, () => {
            chrome.runtime.sendMessage({ action: 'openEnhancer' });
        });
    }

    quickEnhance(text) {
        // Quick enhancement without opening the full popup
        const enhanced = this.applyQuickEnhancement(text);
        this.insertEnhancedPrompt(enhanced);
        
        // Show success notification
        this.showNotification('Prompt enhanced and inserted!', 'success');
    }

    applyQuickEnhancement(text) {
        // Simple enhancement rules for quick enhancement
        let enhanced = text;
        
        // Add context if it's a question
        if (text.includes('?') || text.toLowerCase().includes('how') || text.toLowerCase().includes('what')) {
            enhanced = `Please provide a comprehensive answer to: ${text}\n\nPlease include relevant examples and explain your reasoning.`;
        }
        // Add context if it's a request
        else if (text.toLowerCase().includes('help') || text.toLowerCase().includes('write') || text.toLowerCase().includes('create')) {
            enhanced = `I need assistance with: ${text}\n\nPlease provide step-by-step guidance and consider best practices.`;
        }
        // Add context if it's a task
        else {
            enhanced = `Please help me with the following task: ${text}\n\nPlease provide detailed instructions and consider potential challenges.`;
        }

        return enhanced;
    }

    insertEnhancedPrompt(prompt) {
        // Find the most appropriate input field to insert the prompt
        const inputFields = this.findInputFields();
        
        if (inputFields.length > 0) {
            // Insert into the first suitable input field
            const targetField = inputFields[0];
            this.insertTextAtCursor(targetField, prompt);
            
            // Trigger input event to notify the page
            targetField.dispatchEvent(new Event('input', { bubbles: true }));
            targetField.dispatchEvent(new Event('change', { bubbles: true }));
        } else {
            // If no input field found, create a floating input
            this.createFloatingInput(prompt);
        }
    }

    findInputFields() {
        // Find common AI chat input fields
        const selectors = [
            'textarea[placeholder*="message"]',
            'textarea[placeholder*="prompt"]',
            'textarea[placeholder*="ask"]',
            'input[placeholder*="message"]',
            'input[placeholder*="prompt"]',
            'input[placeholder*="ask"]',
            '.chat-input',
            '.prompt-input',
            '.message-input',
            '[contenteditable="true"]'
        ];

        const fields = [];
        selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                if (el.offsetParent !== null && el.style.display !== 'none') {
                    fields.push(el);
                }
            });
        });

        return fields;
    }

    insertTextAtCursor(element, text) {
        if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
            const start = element.selectionStart;
            const end = element.selectionEnd;
            const value = element.value;
            
            element.value = value.substring(0, start) + text + value.substring(end);
            element.selectionStart = element.selectionEnd = start + text.length;
        } else if (element.contentEditable === 'true') {
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                range.deleteContents();
                range.insertNode(document.createTextNode(text));
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }
        
        element.focus();
    }

    createFloatingInput(prompt) {
        const floatingInput = document.createElement('div');
        floatingInput.id = 'prompt-enhancer-floating-input';
        floatingInput.innerHTML = `
            <div class="floating-input-header">
                <span>Enhanced Prompt Ready</span>
                <button class="close-btn">×</button>
            </div>
            <textarea class="floating-input-textarea" readonly>${prompt}</textarea>
            <div class="floating-input-actions">
                <button class="copy-btn">📋 Copy</button>
                <button class="close-float-btn">Close</button>
            </div>
        `;

        // Style the floating input
        Object.assign(floatingInput.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            width: '400px',
            background: 'white',
            border: '2px solid #667eea',
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
            zIndex: '10000',
            fontFamily: 'inherit'
        });

        // Add event listeners
        floatingInput.querySelector('.close-btn').addEventListener('click', () => {
            floatingInput.remove();
        });

        floatingInput.querySelector('.copy-btn').addEventListener('click', () => {
            navigator.clipboard.writeText(prompt);
            this.showNotification('Prompt copied to clipboard!', 'success');
        });

        floatingInput.querySelector('.close-float-btn').addEventListener('click', () => {
            floatingInput.remove();
        });

        document.body.appendChild(floatingInput);
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+Shift+E to open enhancer
            if (e.ctrlKey && e.shiftKey && e.key === 'E') {
                e.preventDefault();
                chrome.runtime.sendMessage({ action: 'openEnhancer' });
            }
        });
    }

    injectEnhancementToolbar() {
        // Inject a floating toolbar for quick access
        const toolbar = document.createElement('div');
        toolbar.id = 'prompt-enhancer-toolbar';
        toolbar.innerHTML = `
            <button class="toolbar-btn" title="Open Prompt Enhancer (Ctrl+Shift+E)">
                🚀
            </button>
        `;

        // Style the toolbar
        Object.assign(toolbar.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: '9999'
        });

        // Style the button
        const button = toolbar.querySelector('.toolbar-btn');
        Object.assign(button.style, {
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
            transition: 'all 0.3s ease'
        });

        button.addEventListener('click', () => {
            chrome.runtime.sendMessage({ action: 'openEnhancer' });
        });

        button.addEventListener('mouseenter', () => {
            button.style.transform = 'scale(1.1)';
            button.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
        });

        button.addEventListener('mouseleave', () => {
            button.style.transform = 'scale(1)';
            button.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
        });

        document.body.appendChild(toolbar);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `prompt-enhancer-notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '12px 24px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            zIndex: '10001',
            opacity: '0',
            transition: 'opacity 0.3s ease'
        });

        // Set background color based on type
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            info: '#17a2b8'
        };
        notification.style.background = colors[type] || colors.info;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize content script
new ContentScript();