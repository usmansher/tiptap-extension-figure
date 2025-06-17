import { mergeAttributes, nodeInputRule } from "@tiptap/core";
import ImageExtension, { ImageOptions } from "@tiptap/extension-image";
import { isMobileScreen } from "../utils/is-mobile-screen.util";
import { removeImageControlsAndResetStyles } from "../utils/remove-image-controls.util";
import { addImageAlignmentControls } from "../utils/add-image-alignment-controls.util";
import { addImageResizeControls } from "../utils/add-image-resize-controls.util";
import { addCaptionControls } from "../utils/add-caption-controls.util";
import {
  changeImageToFigure,
  changeFigureToImage,
} from "../utils/replace-element.util";

import styles from "../assets/styles/styles.css";

export const inputRegex = /!\[(.+|:?)]\((\S+)(?:(?:\s+)["'](\S+)["'])?\)/;

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    imageFigure: {
      setImageFigure: (options: {
        src: string;
        alt?: string;
        title?: string;
        width?: string | Number;
        height?: string | Number;
      }) => ReturnType;
    };
  }
}

const TiptapImageFigureExtension = ImageExtension.extend<ImageOptions>({
  addOptions() {
    return {
      ...this.parent?.(),
      inline: false,
      allowBase64: false,
      HTMLAttributes: {},
    };
  },

  group: "block",

  draggable: true,

  isolating: true,

  content: "inline*",

  name: "imageFigure",

  addStorage() {
    return {
      elementsVisible: false,
      currentActiveWrapper: null as HTMLElement | null,
    };
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      src: {
        default: null,
        parseHTML: (element) => {
          if (element.tagName === "FIGURE") {
            const img = element.querySelector("img");
            return img?.getAttribute("src");
          }
          return element.getAttribute("src");
        },
      },
      alt: {
        default: null,
        parseHTML: (element) => {
          const img = element.querySelector("img");
          return img?.getAttribute("alt");
        },
      },
      title: {
        default: null,
        parseHTML: (element) => {
          const img = element.querySelector("img");
          return img?.getAttribute("title");
        },
      },
      width: {
        default: null,
        parseHTML: (element) =>
          element.querySelector("img")?.getAttribute("width"),
        renderHTML: (attributes) => {
          return { width: attributes.width };
        },
      },
      height: {
        default: null,
        parseHTML: (element) =>
          element.querySelector("img")?.getAttribute("height"),
        renderHTML: (attributes) => {
          return { height: attributes.height };
        },
      },
      style: {
        // This style is applied to the wrapper element
        default: "width: 100%; height: auto; cursor: pointer;",
        parseHTML: (element) => {
          const width = element.getAttribute("width");
          // const img = element.querySelector("img");
          // const width = img?.getAttribute("width");
          return width
            ? `width: ${width}px; height: auto; cursor: pointer;`
            : `${element.style.cssText}`;
        },
      },
    };
  },

  addCommands() {
    return {
      ...this.parent?.(),

      setImage:
        (options) =>
          ({ commands }) => {
            return commands.insertContent({
              type: this.name,
              attrs: options,
            });
          },

      setImageFigure:
        (options) =>
          ({ commands }) => {
            return commands.insertContent({
              type: this.name,
              attrs: options,
              content: [],
            });
          },
    };
  },

  parseHTML() {
    return [
      {
        tag: "figure:has(figcaption)",
        contentElement: "figcaption",
      },
      {
        tag: "figure:not(:has(figcaption))",
      },
      {
        tag: this.options.allowBase64
          ? "img[src]"
          : 'img[src]:not([src^="data:"])',
      },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    const hasCaption = node.content.size > 0;

    if (hasCaption) {
      // We should ignore src, alt and title from html attributes if the wrapper element is a figure
      const { src, alt, title, ...figureHtmlAttributes } = HTMLAttributes;

      return [
        "figure",
        mergeAttributes(figureHtmlAttributes, {
          draggable: false,
          contenteditable: false,
        }),
        ["img", mergeAttributes(HTMLAttributes)],
        ["figcaption", 0],
      ];
    }

    return ["img", mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      const dispatchNodeView = () => {
        if (typeof getPos === "function") {
          const newAttrs = {
            ...node.attrs,
            style: imageElement.style.cssText,
          };

          editor.view.dispatch(
            editor.view.state.tr.setNodeMarkup(getPos(), null, newAttrs)
          );
          this.storage.elementsVisible = false;
        }
      };

      const {
        options: { editable },
      } = editor;
      const { style } = node.attrs;

      // Create wrapper based on content
      const hasCaption = node.content.size > 0;
      const wrapperElement = document.createElement(
        hasCaption ? "figure" : "div"
      );
      wrapperElement.setAttribute("class", styles["wrapper-element"]);
      wrapperElement.setAttribute("style", style);

      const imageElement = document.createElement("img");
      wrapperElement.appendChild(imageElement);

      let captionElement: HTMLElement | undefined = undefined;
      if (hasCaption) {
        captionElement = document.createElement("figcaption");
      }

      // Set up image attributes
      Object.entries(node.attrs).forEach(([key, value]) => {
        if (value === undefined || value === null) {
          return;
        }
        imageElement.setAttribute(key, value);
      });

      // Add caption if needed
      if (hasCaption && captionElement) {
        captionElement.setAttribute("class", styles["caption-element"]);
        captionElement.setAttribute("contenteditable", "true");
        wrapperElement.appendChild(captionElement);

        captionElement.addEventListener("click", (event) => {
          // Do not propagate click event to the wrapper element
          event.stopPropagation();
        });
      }

      if (!editable) {
        return {
          dom: wrapperElement,
          contentDOM: hasCaption && captionElement ? captionElement : undefined,
        };
      }

      // Initialize control variables
      let isResizing = false;
      let startX = 0;
      let startWidth = 0;

      // Handle click on container (works for both <figure> and <div>)
      wrapperElement.addEventListener("click", (event) => {
        event.stopPropagation();
        event.preventDefault();

        editor.commands.setNodeSelection(getPos());

        // If controls are already visible, check if another image or figure is being clicked on
        if (this.storage.elementsVisible) {
          const clickedElement = event.target as HTMLElement;
          const currentActiveWrapper = this.storage.currentActiveWrapper;

          // Check if the clicked element is a child of the current active wrapper
          // If it isn't, we must remove the controls from the previous wrapper and continue
          // If it is, we do nothing
          if (
            currentActiveWrapper &&
            currentActiveWrapper.contains(clickedElement)
          ) {
            return;
          }

          if (currentActiveWrapper) {
            removeImageControlsAndResetStyles(
              clickedElement,
              currentActiveWrapper,
              styles
            );
          }
        }

        this.storage.currentActiveWrapper = wrapperElement;

        const isMobile = isMobileScreen();
        if (isMobile) {
          const focusedElement = document.querySelector(
            ".ProseMirror-focused"
          ) as HTMLElement | null;
          focusedElement?.blur();
        }

        // Remove existing controls first
        removeImageControlsAndResetStyles(
          event.target as HTMLElement,
          wrapperElement,
          styles
        );

        // Show new controls
        wrapperElement.classList.toggle(styles["active"]);

        addImageAlignmentControls(wrapperElement, imageElement, styles, () => {
          dispatchNodeView();
          editor.commands.focus();
        });

        addImageResizeControls(
          wrapperElement,
          imageElement,
          isResizing,
          startX,
          startWidth,
          styles,
          () => {
            // Get new width and height in pixels from the image element
            const newWidth = imageElement.offsetWidth;
            const newHeight = imageElement.offsetHeight;
            if (typeof getPos === "function") {
              const newAttrs = {
                ...node.attrs,
                width: newWidth,
                height: newHeight,
                style: imageElement.style.cssText,
              };
              editor.view.dispatch(
                editor.view.state.tr.setNodeMarkup(getPos(), null, newAttrs)
              );
              this.storage.elementsVisible = false;
            }
            editor.commands.focus();
          }
        );

        addCaptionControls(
          wrapperElement,
          styles,
          () => {
            // On caption remove
            if (typeof getPos === "function") {
              const pos = getPos();
              // Clear only the caption content (not the entire node content)
              const contentStart = pos + 1; // Start of node content
              const contentEnd = pos + node.content.size + 1; // End of node content
              if (node.content.size > 0) {
                editor.view.dispatch(
                  editor.view.state.tr.delete(contentStart, contentEnd)
                );
              }
              
              // Update controls after caption removal
              setTimeout(() => {
                removeImageControlsAndResetStyles(
                  wrapperElement,
                  wrapperElement,
                  styles
                );
                // Re-add controls with updated state (no caption)
                wrapperElement.click();
              }, 10);
            }
            this.storage.elementsVisible = false;
          },
          () => {
            // On caption add
            if (typeof getPos === "function") {
              const pos = getPos();
              // Add caption content
              editor.view.dispatch(
                editor.view.state.tr.insert(pos + 1, editor.schema.text("Caption"))
              );
              
              // Update controls after caption addition
              setTimeout(() => {
                removeImageControlsAndResetStyles(
                  wrapperElement,
                  wrapperElement,
                  styles
                );
                // Re-add controls with updated state (has caption)
                wrapperElement.click();
              }, 10);
            }
            this.storage.elementsVisible = false;
          }
        );

        this.storage.elementsVisible = true;
      });

      // Handle clicks outside
      document.addEventListener("click", (event) => {
        if (!wrapperElement.contains(event.target as Node)) {
          removeImageControlsAndResetStyles(
            event.target as HTMLElement,
            wrapperElement,
            styles
          );
          this.storage.elementsVisible = false;
          this.storage.currentActiveWrapper = null;
        }
      });

      return {
        dom: wrapperElement,
        contentDOM: hasCaption && captionElement ? captionElement : undefined,
        ignoreMutation: (mutation) => {
          // We must ignore mutations that happened outside the captionElement
          if (captionElement) {
            return !captionElement.contains(mutation.target);
          }
          return true; // Ignore all mutations if no caption
        },
      };
    };
  },

  addInputRules() {
    return [
      nodeInputRule({
        find: inputRegex,
        type: this.type,
        getAttributes: (match) => {
          const [, alt, src, title, width, height] = match;
          return { src, alt, title, width, height };
        },
      }),
    ];
  },
});

export { TiptapImageFigureExtension };

export default TiptapImageFigureExtension;
