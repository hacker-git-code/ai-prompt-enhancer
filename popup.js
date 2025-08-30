// Simplified popup for Prompt Enhancer Pro
class SimplePopup {
    constructor() {
        this.currentStyle = 'professional';
        this.init();
    }

    init() {
        this.loadSavedStyle();
        this.bindEvents();
    }

    bindEvents() {
        // Style selection
        document.querySelectorAll('.style-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectStyle(e));
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
        
        // Send message to content script to update style
        this.updateContentScriptStyle();
    }

    loadSavedStyle() {
        chrome.storage.sync.get(['selectedStyle'], (result) => {
            if (result.selectedStyle) {
                this.currentStyle = result.selectedStyle;
                document.querySelector(`[data-style="${this.currentStyle}"]`).classList.add('active');
            }
        });
    }

    updateContentScriptStyle() {
        // Get the active tab and send the style change message
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'changeStyle',
                    style: this.currentStyle
                }).catch(() => {
                    // Tab might not have content script loaded yet
                    console.log('Content script not ready yet');
                });
            }
        });
    }
}

// Initialize the popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SimplePopup();
});