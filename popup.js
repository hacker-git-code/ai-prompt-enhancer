class PopupManager {
  constructor() {
    this.settings = {
      isEnabled: true,
      style: 'Professional'
    };
    this.init();
  }

  async init() {
    await this.loadSettings();
    this.setupEventListeners();
    this.updateUI();
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get(['isEnabled', 'style']);
      this.settings = {
        isEnabled: result.isEnabled !== false,
        style: result.style || 'Professional'
      };
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  async saveSettings() {
    try {
      await chrome.storage.sync.set(this.settings);
      
      // Notify content script of settings change
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab) {
        await chrome.tabs.sendMessage(tab.id, {
          action: 'updateSettings',
          settings: this.settings
        });
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  setupEventListeners() {
    // Enable/disable toggle
    const enableToggle = document.getElementById('enableToggle');
    enableToggle.addEventListener('change', (e) => {
      this.settings.isEnabled = e.target.checked;
      this.saveSettings();
      this.updateStatusIndicator();
    });

    // Style selection
    const styleInputs = document.querySelectorAll('input[name="style"]');
    styleInputs.forEach(input => {
      input.addEventListener('change', (e) => {
        this.settings.style = e.target.value;
        this.saveSettings();
      });
    });

    // Reset button
    const resetButton = document.getElementById('resetSettings');
    resetButton.addEventListener('click', () => {
      this.resetToDefaults();
    });

    // Update status when popup opens
    this.updateStatusIndicator();
  }

  updateUI() {
    // Set toggle state
    const enableToggle = document.getElementById('enableToggle');
    enableToggle.checked = this.settings.isEnabled;

    // Set style selection
    const styleInput = document.querySelector(`input[name="style"][value="${this.settings.style}"]`);
    if (styleInput) {
      styleInput.checked = true;
    }
  }

  updateStatusIndicator() {
    const statusDot = document.querySelector('.status-dot');
    const statusText = document.querySelector('.status-text');
    
    if (this.settings.isEnabled) {
      statusDot.classList.add('active');
      statusText.textContent = 'Active';
    } else {
      statusDot.classList.remove('active');
      statusText.textContent = 'Disabled';
    }
  }

  async resetToDefaults() {
    this.settings = {
      isEnabled: true,
      style: 'Professional'
    };
    
    await this.saveSettings();
    this.updateUI();
    this.updateStatusIndicator();
    
    // Show reset confirmation
    this.showResetConfirmation();
  }

  showResetConfirmation() {
    // Create a temporary confirmation message
    const confirmation = document.createElement('div');
    confirmation.className = 'reset-confirmation';
    confirmation.textContent = 'Settings reset to defaults!';
    confirmation.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #22c55e;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      z-index: 10000;
      animation: slideDown 0.3s ease-out;
    `;
    
    // Add animation keyframes
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateX(-50%) translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
      }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(confirmation);
    
    // Remove after 3 seconds
    setTimeout(() => {
      confirmation.remove();
      style.remove();
    }, 3000);
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PopupManager();
});

// Handle popup window focus to refresh status
window.addEventListener('focus', () => {
  // Refresh status when popup gains focus
  const statusDot = document.querySelector('.status-dot');
  const statusText = document.querySelector('.status-text');
  
  if (statusDot && statusText) {
    // Check if extension is enabled by looking at the toggle
    const enableToggle = document.getElementById('enableToggle');
    if (enableToggle) {
      if (enableToggle.checked) {
        statusDot.classList.add('active');
        statusText.textContent = 'Active';
      } else {
        statusDot.classList.remove('active');
        statusText.textContent = 'Disabled';
      }
    }
  }
});