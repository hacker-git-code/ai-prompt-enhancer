class PromptEnhancer {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.loadSettings();
    }

    initializeElements() {
        this.promptInput = document.getElementById('prompt-input');
        this.enhanceBtn = document.getElementById('enhance-btn');
        this.resultSection = document.getElementById('result-section');
        this.enhancedPrompt = document.getElementById('enhanced-prompt');
        this.copyBtn = document.getElementById('copy-btn');
        this.useBtn = document.getElementById('use-btn');
        this.styleButtons = document.querySelectorAll('.style-btn');
        this.templateButtons = document.querySelectorAll('.template-btn');
        this.addExamples = document.getElementById('add-examples');
        this.addFormatting = document.getElementById('add-formatting');
        this.addConstraints = document.getElementById('add-constraints');
    }

    bindEvents() {
        this.enhanceBtn.addEventListener('click', () => this.enhancePrompt());
        this.copyBtn.addEventListener('click', () => this.copyToClipboard());
        this.useBtn.addEventListener('click', () => this.useEnhancedPrompt());
        
        this.styleButtons.forEach(btn => {
            btn.addEventListener('click', () => this.selectStyle(btn));
        });

        this.templateButtons.forEach(btn => {
            btn.addEventListener('click', () => this.loadTemplate(btn.dataset.template));
        });

        // Save settings when changed
        [this.addExamples, this.addFormatting, this.addConstraints].forEach(checkbox => {
            checkbox.addEventListener('change', () => this.saveSettings());
        });

        // Auto-resize textarea
        this.promptInput.addEventListener('input', () => this.autoResize());
    }

    selectStyle(selectedBtn) {
        this.styleButtons.forEach(btn => btn.classList.remove('active'));
        selectedBtn.classList.add('active');
    }

    getSelectedStyle() {
        const activeBtn = document.querySelector('.style-btn.active');
        return activeBtn ? activeBtn.dataset.style : 'professional';
    }

    loadTemplate(templateType) {
        const templates = {
            blog: "Write a blog post about [topic]",
            email: "Draft a professional email to [recipient] about [subject]",
            code: "Help me write code for [functionality] in [language]",
            analysis: "Analyze [data/topic] and provide insights"
        };

        this.promptInput.value = templates[templateType] || '';
        this.autoResize();
    }

    autoResize() {
        this.promptInput.style.height = 'auto';
        this.promptInput.style.height = this.promptInput.scrollHeight + 'px';
    }

    async enhancePrompt() {
        const prompt = this.promptInput.value.trim();
        
        if (!prompt) {
            this.showNotification('Please enter a prompt to enhance', 'error');
            return;
        }

        this.setLoading(true);
        
        try {
            const enhancedPrompt = await this.generateEnhancedPrompt(prompt);
            this.displayResult(enhancedPrompt);
        } catch (error) {
            console.error('Enhancement failed:', error);
            this.showNotification('Failed to enhance prompt. Please try again.', 'error');
        } finally {
            this.setLoading(false);
        }
    }

    async generateEnhancedPrompt(originalPrompt) {
        const style = this.getSelectedStyle();
        const options = {
            examples: this.addExamples.checked,
            formatting: this.addFormatting.checked,
            constraints: this.addConstraints.checked
        };

        // Enhanced prompt generation logic
        let enhanced = this.applyStyleEnhancement(originalPrompt, style);
        enhanced = this.addContextEnhancement(enhanced, options);
        
        return enhanced;
    }

    applyStyleEnhancement(prompt, style) {
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

    addContextEnhancement(prompt, options) {
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

    displayResult(enhancedPrompt) {
        this.enhancedPrompt.value = enhancedPrompt;
        this.resultSection.classList.remove('hidden');
        this.resultSection.scrollIntoView({ behavior: 'smooth' });
    }

    async copyToClipboard() {
        try {
            await navigator.clipboard.writeText(this.enhancedPrompt.value);
            this.showNotification('Enhanced prompt copied to clipboard!', 'success');
        } catch (error) {
            // Fallback for older browsers
            this.enhancedPrompt.select();
            document.execCommand('copy');
            this.showNotification('Enhanced prompt copied to clipboard!', 'success');
        }
    }

    async useEnhancedPrompt() {
        try {
            // Send message to content script to insert the enhanced prompt
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            await chrome.tabs.sendMessage(tab.id, {
                action: 'insertEnhancedPrompt',
                prompt: this.enhancedPrompt.value
            });
            this.showNotification('Enhanced prompt inserted!', 'success');
        } catch (error) {
            console.error('Failed to insert prompt:', error);
            this.showNotification('Failed to insert prompt. Please try again.', 'error');
        }
    }

    setLoading(loading) {
        const btnText = this.enhanceBtn.querySelector('.btn-text');
        const spinner = this.enhanceBtn.querySelector('.loading-spinner');
        
        if (loading) {
            btnText.style.opacity = '0';
            spinner.classList.remove('hidden');
            this.enhanceBtn.disabled = true;
        } else {
            btnText.style.opacity = '1';
            spinner.classList.add('hidden');
            this.enhanceBtn.disabled = false;
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add styles
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            zIndex: '10000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            maxWidth: '300px',
            wordWrap: 'break-word'
        });

        // Set background color based on type
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            info: '#17a2b8'
        };
        notification.style.background = colors[type] || colors.info;

        // Add to page
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    loadSettings() {
        chrome.storage.sync.get(['addExamples', 'addFormatting', 'addConstraints'], (result) => {
            this.addExamples.checked = result.addExamples !== undefined ? result.addExamples : true;
            this.addFormatting.checked = result.addFormatting !== undefined ? result.addFormatting : true;
            this.addConstraints.checked = result.addConstraints !== undefined ? result.addConstraints : false;
        });
    }

    saveSettings() {
        chrome.storage.sync.set({
            addExamples: this.addExamples.checked,
            addFormatting: this.addFormatting.checked,
            addConstraints: this.addConstraints.checked
        });
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PromptEnhancer();
});