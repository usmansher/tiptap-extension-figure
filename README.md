# TipTap Figures Extension

![demo](https://raw.githubusercontent.com/usmansher/tiptap-extension-figure/refs/heads/main/demo.gif?raw=true)

## 🚀 Enhanced Fork Features

This is a fork of the original TipTap Image Extension with bug fixes and new features:

### Key Improvements:

1. **🗑️ Delete Image Button**: Added a red delete button for one-click image removal
   - Positioned in the top-right corner of images
   - Safe deletion using TipTap's transaction system

2. **🐛 Bug Fix**: Fixed issue where controls stopped working after caption removal
   - Previously, removing a caption would break all image controls (resize, alignment, etc.)
   - Now controls remain fully functional for both captioned and non-captioned images

See the [CHANGELOG.md](./CHANGELOG.md) for detailed information about all improvements.

---

An extension for Tiptap that allows you to add and edit captions for images as well as align and resize them.

[Tiptap](https://tiptap.dev/) is a suite of open source content editing and real-time collaboration tools for developers building apps like Notion or Google Docs.

## Installation

You can install it using npm:

```bash
npm install tiptap-extension-figure
```

Keep in mind that this package requires Tiptap 2.x.

## Usage

```javascript
import StarterKit from "@tiptap/starter-kit";
import ImageResizeWithCaption from "tiptap-extension-figure";
import { EditorContent, useEditor } from "@tiptap/react";

const editor = useEditor({
  extensions: [StarterKit, ImageResizeWithCaption],
  content: `
    <h3>Image with caption</h3>
    <figure>
        <img src="https://placehold.co/800x400/orange/white" alt="Random photo of something" title="Who's dat?">
        <figcaption>
        <p>Very <strong>bold</strong> of <i>you</i>!</p>
        </figcaption>
    </figure>

    <h3>Image without caption</h3>
    <img src="https://placehold.co/800x400/green/white">
  `,
});
```
