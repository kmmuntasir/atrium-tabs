# Atrium Tabs

**Atrium Tabs** is a minimalist Chrome extension that brings back real-time tab group switching — allowing you to isolate, manage, and switch between tab workspaces effortlessly, without the clutter of session history or bloated UI.

---

## ✨ Inspiration

I was a long-time user of the now-abandoned **Sync Tab Groups** extension. It offered the perfect way to organize my tabs into isolated groups and switch between them in real time. But as Chrome evolved and the extension became outdated, no modern alternative matched its simplicity and power — most options today are bloated with session backups, cloud sync, or UI-heavy dashboards.

So I built **Atrium Tabs** to bring back that experience — but cleaner, faster, and built for the present.

---

## 🔧 What Atrium Tabs Does

- 🔄 **Real-Time Group Tracking**: When you're in a tab group, any new tabs you open or close are automatically tracked.
- 🔁 **Instant Group Switching**: Switch between saved tab groups. Tabs from the current group close, and the new group opens — instantly.
- 📌 **Pinned Tabs Control**: Choose whether pinned tabs should belong to groups or persist across all.
- 💾 **Persistent Groups**: All tab groups are stored locally and restored on browser restart.
- 🧘 **Minimal UI**: A lightweight popup and clean UX — no dashboards, no sync prompts.

---

## 📸 Demo (Coming Soon)

A short GIF or video will go here showing:
- Creating a group
- Switching between two groups
- Behavior with pinned tabs

---

## 🚀 Installation

### From Chrome Web Store (Coming Soon)

TBD — link will be updated once published.

### For Developers

1. Clone this repository:
   ```bash
   git clone https://github.com/kmmuntasir/atrium-tabs.git
2. Open chrome://extensions/ in Chrome.
3. Enable Developer mode (top right).
4. Click Load unpacked and select the atrium-tabs directory.
5. The extension icon should now appear in your toolbar.

## 🧠 How It Works

- **Group**: A named list of tabs (URLs), optionally including pinned tabs.
- **Active Group**: The group currently managing your open tabs.
- While a group is active:
  - Any tab you open, close, or navigate is tracked in real time.
- When switching groups:
  - The current group's tab state is saved automatically.
  - All current tabs are closed (except pinned ones, based on your preference).
  - Tabs from the selected group are opened.
  - That group becomes the new "active" group.

You can optionally:
- Exclude pinned tabs from groups (they’ll persist across switches).
- Include pinned tabs in groups (they’ll be saved/restored with each group).

---

## 🛠️ Features in Progress

- ⌨️ Keyboard shortcuts for switching between groups
- ⏪ Undo last group switch
- 🔥 Firefox support (planned)
- 🗂️ Basic folder or tag support (low priority)

---

## 🧳 Tech Stack

- Chrome Extension API (Manifest V3)
- JavaScript (Vanilla)
- `chrome.tabs`, `chrome.storage`, and `chrome.runtime` APIs

---

## 🧼 Philosophy

No sync. No cloud. No clutter.

**Atrium Tabs** is built for users who:
- Want real-time, isolated tab workspaces.
- Don’t need session backups, dashboards, or cloud syncing.
- Miss the simplicity and elegance of the original **Sync Tab Groups**.

---

## 🙏 Credits

Inspired by:
- [Sync Tab Groups](https://github.com/Morikko/sync-tab-groups) by Morikko
- Every tab-hoarder who just wants some sanity back.

---

## 📄 License

MIT License. Do whatever you want, but attribution is appreciated.

---

## 💬 Feedback or Contributions

Pull requests and issues are welcome!

Feel free to [open an issue](https://github.com/kmmuntasir/atrium-tabs/issues) with suggestions or bug reports.

Let's bring back smart, focused tab management — without the bloat.
