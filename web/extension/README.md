# NeoFeed Probe (Browser Extension)

**Feed the Singularity.**  
Capture content from the web directly into your NeoFeed galaxy.

## 🌐 Compatibility

| Browser | Status | Instructions |
| :--- | :--- | :--- |
| **Chrome** | ✅ Ready | Load unpacked `web/extension` folder |
| **Edge** | ✅ Ready | Compatible (Chromium based). See below. |
| **Brave** | ✅ Ready | Compatible (Chromium based). |
| **Arc** | ✅ Ready | Compatible (Chromium based). |
| **Safari** | 🚧 Needs Build | Requires conversion via Xcode. |
| **Firefox** | ⏳ Pending | Requires manifest adjustments. |

## 📦 Installation Guide

### Google Chrome / Brave / Arc
1. Open `chrome://extensions/`
2. Enable **Developer mode** (top right).
3. Click **Load unpacked**.
4. Select the `web/extension` folder in this project.

### Microsoft Edge
1. Open `edge://extensions/`
2. Enable **Developer mode** (left sidebar or toggle).
3. Click **Load unpacked**.
4. Select the `web/extension` folder.

### Safari (macOS)
Safari extensions require an Xcode project wrapper.
1. Run: `xcrun safari-web-extension-converter web/extension` in your terminal.
2. Open the generated Xcode project.
3. Build and Run.


