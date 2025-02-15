# tiptap-image-resize-with-caption

An extension for Tiptap that allows you to resize and align images as well as add captions to them.

[Tiptap](https://tiptap.dev/) is a suite of open source content editing and real-time collaboration tools for developers building apps like Notion or Google Docs.

## Installation

You can install it using npm:

```bash
npm install tiptap-image-resize-with-caption
```

Keep in mind that this package requires Tiptap 2.x.

## Usage

```javascript
import StarterKit from "@tiptap/starter-kit";
import ImageResizeWithCaption from "tiptap-image-resize-with-caption";
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
