class PromptEnhancer {
  constructor() {
    this.isEnabled = true;
    this.style = 'Professional';
    this.enhanceButton = null;
    this.currentInput = null;
    this.observer = null;
    this.init();
  }

  async init() {
    // Load settings from storage
    const settings = await this.loadSettings();
    this.isEnabled = settings.isEnabled !== false;
    this.style = settings.style || 'Professional';
    
    if (this.isEnabled) {
      this.startObserving();
    }
  }

  async loadSettings() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['isEnabled', 'style'], (result) => {
        resolve(result);
      });
    });
  }

  startObserving() {
    // Observe DOM changes to detect new chat inputs
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          this.detectChatInputs();
        }
      });
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Initial detection
    this.detectChatInputs();
  }

  detectChatInputs() {
    // Common selectors for chat inputs across different AI platforms
    const selectors = [
      'textarea[placeholder*="chat"]',
      'textarea[placeholder*="message"]',
      'textarea[placeholder*="prompt"]',
      'input[placeholder*="chat"]',
      'input[placeholder*="message"]',
      'input[placeholder*="prompt"]',
      '[contenteditable="true"]',
      '.chat-input',
      '.message-input',
      '.prompt-input',
      '[data-testid*="input"]',
      '[data-testid*="chat"]'
    ];

    selectors.forEach(selector => {
      const inputs = document.querySelectorAll(selector);
      inputs.forEach(input => {
        if (!input.hasAttribute('data-prompt-enhancer')) {
          this.setupInput(input);
        }
      });
    });
  }

  setupInput(input) {
    input.setAttribute('data-prompt-enhancer', 'true');
    
    // Create enhance button
    const enhanceButton = this.createEnhanceButton();
    
    // Position the button relative to the input
    this.positionButton(enhanceButton, input);
    
    // Add event listeners
    input.addEventListener('input', () => this.handleInput(input, enhanceButton));
    input.addEventListener('focus', () => this.showButton(enhanceButton));
    input.addEventListener('blur', () => this.hideButton(enhanceButton));
    
    // Store reference
    this.currentInput = input;
    this.enhanceButton = enhanceButton;
  }

  createEnhanceButton() {
    const button = document.createElement('div');
    button.className = 'prompt-enhancer-button';
    button.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
      <span>Enhance</span>
    `;
    
    button.addEventListener('click', () => this.enhancePrompt());
    button.style.display = 'none';
    
    document.body.appendChild(button);
    return button;
  }

  positionButton(button, input) {
    const rect = input.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    button.style.position = 'absolute';
    button.style.top = `${rect.top + scrollTop - 40}px`;
    button.style.left = `${rect.left + scrollLeft + rect.width - 120}px`;
    button.style.zIndex = '10000';
  }

  handleInput(input, button) {
    const text = input.value || input.textContent || '';
    if (text.trim().length > 10) {
      this.showButton(button);
    } else {
      this.hideButton(button);
    }
  }

  showButton(button) {
    button.style.display = 'flex';
  }

  hideButton(button) {
    button.style.display = 'none';
  }

  async enhancePrompt() {
    if (!this.currentInput) return;
    
    const originalText = this.currentInput.value || this.currentInput.textContent || '';
    if (!originalText.trim()) return;
    
    try {
      // Show loading state
      this.enhanceButton.innerHTML = '<span>Enhancing...</span>';
      this.enhanceButton.style.pointerEvents = 'none';
      
      // Enhance the prompt
      const enhancedPrompt = await this.enhanceText(originalText);
      
      // Replace the original text
      if (this.currentInput.value !== undefined) {
        this.currentInput.value = enhancedPrompt;
      } else {
        this.currentInput.textContent = enhancedPrompt;
      }
      
      // Trigger input event to update any listeners
      this.currentInput.dispatchEvent(new Event('input', { bubbles: true }));
      
      // Focus the input for immediate use
      this.currentInput.focus();
      
      // Show success feedback
      this.showSuccessFeedback();
      
    } catch (error) {
      console.error('Prompt enhancement failed:', error);
      this.showErrorFeedback();
    } finally {
      // Restore button
      this.enhanceButton.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2L2 7l10 5 10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
        <span>Enhance</span>
      `;
      this.enhanceButton.style.pointerEvents = 'auto';
    }
  }

  async enhanceText(text) {
    // This is a local enhancement function - in a real extension, you might want to use an API
    const enhancements = {
      'Professional': this.enhanceProfessional,
      'Creative': this.enhanceCreative,
      'Technical': this.enhanceTechnical,
      'Casual': this.enhanceCasual
    };
    
    const enhancer = enhancements[this.style] || enhancements['Professional'];
    return enhancer(text);
  }

  enhanceProfessional(text) {
    return `Please provide a comprehensive and well-structured response to the following request:

${text}

Please ensure your response is:
- Clear and concise
- Well-organized with logical structure
- Professional in tone
- Comprehensive yet focused
- Actionable and practical

Thank you for your assistance.`;
  }

  enhanceCreative(text) {
    return `I'd love to explore this creative challenge with you! Here's what I'm thinking:

${text}

Let's make this exciting by:
- Thinking outside the box
- Exploring multiple creative angles
- Adding some imaginative flair
- Making it engaging and inspiring
- Surprising me with unexpected ideas

Ready to create something amazing together! ✨`;
  }

  enhanceTechnical(text) {
    return `Technical Analysis Request:

${text}

Please provide a detailed technical response that includes:
- Step-by-step methodology
- Relevant technical specifications
- Code examples or pseudocode where applicable
- Performance considerations
- Best practices and industry standards
- Potential challenges and solutions
- References to relevant documentation or research

Please structure your response with clear headings and use technical terminology appropriately.`;
  }

  enhanceCasual(text) {
    return `Hey there! 👋 

So I was thinking about this:

${text}

Could you help me out with this? I'd love to hear your thoughts in a friendly, conversational way. No need to be too formal - just share what you know and maybe throw in some helpful tips or examples if you have them.

Thanks a bunch! 😊`;
  }

  showSuccessFeedback() {
    const feedback = document.createElement('div');
    feedback.className = 'prompt-enhancer-feedback success';
    feedback.textContent = 'Prompt enhanced! ✨';
    feedback.style.position = 'fixed';
    feedback.style.top = '20px';
    feedback.style.right = '20px';
    feedback.style.zIndex = '10001';
    
    document.body.appendChild(feedback);
    
    setTimeout(() => {
      feedback.remove();
    }, 3000);
  }

  showErrorFeedback() {
    const feedback = document.createElement('div');
    feedback.className = 'prompt-enhancer-feedback error';
    feedback.textContent = 'Enhancement failed. Please try again.';
    feedback.style.position = 'fixed';
    feedback.style.top = '20px';
    feedback.style.right = '20px';
    feedback.style.zIndex = '10001';
    
    document.body.appendChild(feedback);
    
    setTimeout(() => {
      feedback.remove();
    }, 3000);
  }

  updateSettings(newSettings) {
    Object.assign(this, newSettings);
    
    if (this.isEnabled && !this.observer) {
      this.startObserving();
    } else if (!this.isEnabled && this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateSettings') {
    promptEnhancer.updateSettings(request.settings);
    sendResponse({ success: true });
  }
});

// Initialize the enhancer
const promptEnhancer = new PromptEnhancer();