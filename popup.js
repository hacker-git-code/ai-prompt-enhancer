class PromptEnhancer {
    constructor() {
        this.currentStyle = 'professional';
        this.enhancementTemplates = {
            professional: {
                prefix: "Please provide a comprehensive and professional response to the following request: ",
                suffix: " Please ensure the response is well-structured, informative, and suitable for a professional audience.",
                structure: "Include relevant examples, best practices, and actionable insights."
            },
            creative: {
                prefix: "I'd love to see your creative take on this: ",
                suffix: " Feel free to think outside the box and provide innovative, engaging, and imaginative solutions.",
                structure: "Add creative examples, metaphors, or unique perspectives to make it memorable."
            },
            detailed: {
                prefix: "I need a thorough and detailed analysis of the following: ",
                suffix: " Please provide an in-depth response with comprehensive coverage, step-by-step explanations, and thorough analysis.",
                structure: "Include multiple perspectives, detailed examples, and comprehensive coverage of all aspects."
            },
            concise: {
                prefix: "Please provide a clear and concise response to: ",
                suffix: " Keep it brief but informative, focusing on the most important points.",
                structure: "Be direct and to the point while maintaining clarity and usefulness."
            }
        };
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadSavedStyle();
    }

    bindEvents() {
        // Style selection
        document.querySelectorAll('.style-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectStyle(e));
        });

        // Enhance button
        document.getElementById('enhance-btn').addEventListener('click', () => this.enhancePrompt());

        // Copy button
        document.getElementById('copy-btn').addEventListener('click', () => this.copyToClipboard());

        // Use in chat button
        document.getElementById('use-btn').addEventListener('click', () => this.useInChat());

        // Input field enter key
        document.getElementById('original-prompt').addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                this.enhancePrompt();
            }
        });
    }

    selectStyle(event) {
        // Remove active class from all buttons
        document.querySelectorAll('.style-btn').forEach(btn => btn.classList.remove('active'));
        
        // Add active class to clicked button
        event.target.classList.add('active');
        
        // Update current style
        this.currentStyle = event.target.dataset.style;
        
        // Save to storage
        chrome.storage.sync.set({ 'selectedStyle': this.currentStyle });
    }

    loadSavedStyle() {
        chrome.storage.sync.get(['selectedStyle'], (result) => {
            if (result.selectedStyle) {
                this.currentStyle = result.selectedStyle;
                document.querySelector(`[data-style="${this.currentStyle}"]`).classList.add('active');
            }
        });
    }

    enhancePrompt() {
        const originalPrompt = document.getElementById('original-prompt').value.trim();
        
        if (!originalPrompt) {
            this.showNotification('Please enter a prompt to enhance!', 'error');
            return;
        }

        this.showLoading(true);
        
        // Simulate processing time for better UX
        setTimeout(() => {
            const enhancedPrompt = this.generateEnhancedPrompt(originalPrompt);
            this.displayResult(enhancedPrompt);
            this.showLoading(false);
        }, 800);
    }

    generateEnhancedPrompt(originalPrompt) {
        const template = this.enhancementTemplates[this.currentStyle];
        
        // Basic enhancement logic
        let enhanced = template.prefix + originalPrompt + template.suffix;
        
        // Add context and structure based on the prompt content
        enhanced += this.addContextualEnhancements(originalPrompt);
        
        // Add the structure instruction
        enhanced += " " + template.structure;
        
        // Add specific enhancements based on prompt type
        enhanced += this.addSpecificEnhancements(originalPrompt);
        
        return enhanced;
    }

    addContextualEnhancements(prompt) {
        let enhancements = "";
        
        // Detect writing-related prompts
        if (this.containsKeywords(prompt, ['write', 'blog', 'article', 'content', 'story'])) {
            enhancements += " Consider the target audience, tone, and purpose. Include a clear structure with introduction, main points, and conclusion.";
        }
        
        // Detect coding-related prompts
        if (this.containsKeywords(prompt, ['code', 'program', 'script', 'function', 'algorithm'])) {
            enhancements += " Provide clear code examples, explain the logic, and consider edge cases and error handling.";
        }
        
        // Detect analysis-related prompts
        if (this.containsKeywords(prompt, ['analyze', 'research', 'study', 'examine', 'investigate'])) {
            enhancements += " Present multiple perspectives, cite relevant sources if applicable, and provide evidence-based conclusions.";
        }
        
        // Detect creative prompts
        if (this.containsKeywords(prompt, ['creative', 'design', 'art', 'imagine', 'brainstorm'])) {
            enhancements += " Encourage innovative thinking and provide multiple creative approaches or solutions.";
        }
        
        return enhancements;
    }

    addSpecificEnhancements(prompt) {
        let enhancements = "";
        
        // Add format specifications
        if (this.containsKeywords(prompt, ['email', 'letter', 'message'])) {
            enhancements += " Format as a professional communication with appropriate greeting and closing.";
        }
        
        if (this.containsKeywords(prompt, ['list', 'steps', 'instructions'])) {
            enhancements += " Present information in a clear, numbered or bulleted format for easy following.";
        }
        
        if (this.containsKeywords(prompt, ['compare', 'difference', 'versus'])) {
            enhancements += " Use a structured comparison format highlighting key differences and similarities.";
        }
        
        return enhancements;
    }

    containsKeywords(text, keywords) {
        return keywords.some(keyword => 
            text.toLowerCase().includes(keyword.toLowerCase())
        );
    }

    displayResult(enhancedPrompt) {
        document.getElementById('enhanced-prompt').value = enhancedPrompt;
        document.querySelector('.result-section').style.display = 'block';
        
        // Scroll to result
        document.querySelector('.result-section').scrollIntoView({ 
            behavior: 'smooth' 
        });
    }

    showLoading(show) {
        const btnText = document.querySelector('.btn-text');
        const spinner = document.querySelector('.loading-spinner');
        
        if (show) {
            btnText.style.display = 'none';
            spinner.style.display = 'inline-block';
            document.getElementById('enhance-btn').disabled = true;
        } else {
            btnText.style.display = 'inline-block';
            spinner.style.display = 'none';
            document.getElementById('enhance-btn').disabled = false;
        }
    }

    async copyToClipboard() {
        const enhancedPrompt = document.getElementById('enhanced-prompt').value;
        
        try {
            await navigator.clipboard.writeText(enhancedPrompt);
            this.showNotification('Enhanced prompt copied to clipboard!', 'success');
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = enhancedPrompt;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showNotification('Enhanced prompt copied to clipboard!', 'success');
        }
    }

    useInChat() {
        const enhancedPrompt = document.getElementById('enhanced-prompt').value;
        
        // Send message to content script to insert into active chat
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: 'insertPrompt',
                prompt: enhancedPrompt
            });
        });
        
        this.showNotification('Prompt sent to active chat!', 'success');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            animation: slideIn 0.3s ease;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
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
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PromptEnhancer();
});