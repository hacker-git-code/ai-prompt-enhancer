# Prompt Enhancer

A lightweight browser extension that automatically refines user prompts in AI chat interfaces for better, more structured results.

## ✨ Features

- **Automatic Detection**: Automatically detects chat input fields across popular AI platforms
- **Smart Enhancement**: Transforms basic prompts into detailed, structured requests
- **Multiple Styles**: Choose from Professional, Creative, Technical, or Casual enhancement styles
- **Non-Intrusive**: Minimal, distraction-free UI that appears only when needed
- **Instant Results**: Enhanced prompts replace original text immediately for seamless workflow
- **Cross-Platform**: Works on any website with chat interfaces

## 🚀 How It Works

1. **Type your prompt** in any AI chat interface (ChatGPT, Claude, Bard, etc.)
2. **Enhance button appears** when you type more than 10 characters
3. **Click "Enhance"** to automatically refine your prompt
4. **Enhanced prompt replaces** the original text instantly
5. **Hit Enter** to send the improved version

## 🎨 Enhancement Styles

### Professional 💼
- Formal, business-like tone
- Structured and comprehensive
- Actionable and practical focus

### Creative 🎨
- Imaginative and inspiring
- Multiple creative angles
- Engaging and artistic flair

### Technical ⚙️
- Detailed methodology
- Code examples and specifications
- Best practices and standards

### Casual 😊
- Friendly and conversational
- Relaxed and approachable
- Helpful tips and examples

## 📦 Installation

### Chrome/Edge/Brave
1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder
5. The extension icon should appear in your toolbar

### Firefox
1. Download or clone this repository
2. Open Firefox and go to `about:debugging`
3. Click "This Firefox" tab
4. Click "Load Temporary Add-on" and select `manifest.json`
5. The extension will be loaded temporarily

## ⚙️ Configuration

Click the extension icon in your toolbar to access settings:

- **Enable/Disable**: Toggle the extension on or off
- **Style Selection**: Choose your preferred enhancement style
- **Reset to Defaults**: Restore original settings

## 🔧 Technical Details

- **Manifest Version**: 3 (Chrome Extension Manifest V3)
- **Permissions**: 
  - `activeTab`: Access to current tab
  - `storage`: Save user preferences
- **Content Scripts**: Automatically injected on all websites
- **Background Service Worker**: Handles extension lifecycle and messaging

## 🌐 Supported Platforms

The extension automatically detects chat inputs on:
- ChatGPT (chat.openai.com)
- Claude (claude.ai)
- Google Bard (bard.google.com)
- Microsoft Copilot (copilot.microsoft.com)
- And many more AI chat interfaces

## 🛠️ Development

### Project Structure
```
prompt-enhancer/
├── manifest.json          # Extension configuration
├── content.js            # Main content script
├── popup.html            # Settings popup
├── popup.css             # Popup styling
├── popup.js              # Popup functionality
├── background.js         # Service worker
├── styles.css            # Content script styling
├── icons/                # Extension icons
└── README.md             # This file
```

### Building Icons
The extension includes an SVG icon that can be converted to PNG:
- 16x16: Toolbar icon
- 48x48: Extension management page
- 128x128: Chrome Web Store

### Testing
1. Load the extension in developer mode
2. Navigate to any AI chat interface
3. Type a prompt and look for the enhance button
4. Test different enhancement styles

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

If you encounter any issues or have questions:
1. Check the browser console for error messages
2. Ensure the extension is enabled
3. Try refreshing the page
4. Submit an issue on GitHub

## 🔄 Updates

The extension automatically checks for updates and will reload when new versions are available.

---

**Made with ❤️ for better AI interactions**