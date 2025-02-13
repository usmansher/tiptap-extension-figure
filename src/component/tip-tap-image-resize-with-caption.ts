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

export interface CustomImageOptions extends ImageOptions {
  resizable: boolean;
  alignable: boolean;
  captionEnabled: boolean;
}

export const inputRegex = /!\[(.+|:?)]\((\S+)(?:(?:\s+)["'](\S+)["'])?\)/;

const TiptapImageFigureExtension = ImageExtension.extend<CustomImageOptions>({
  addOptions() {
    return {
      ...this.parent?.(),
      inline: false,
      allowBase64: false,
      HTMLAttributes: {},
      resizable: true,
      alignable: true,
      captionEnabled: true,
    };
  },

  group: "block",

  draggable: true,

  isolating: true,

  content: "inline*",

  addStorage() {
    return {
      elementsVisible: false,
    };
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      src: {
        default: null,
        parseHTML: (element) => {
          const img = element.querySelector("img");
          return img?.getAttribute("src");
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

  parseHTML() {
    return [
      {
        tag: "figure",
        contentElement: "figcaption",
      },
      {
        tag: "img[src]",
      },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    const hasCaption = node.content.size > 0;

    if (hasCaption) {
      return [
        "figure",
        this.options.HTMLAttributes,
        [
          "img",
          mergeAttributes(HTMLAttributes, {
            draggable: false,
            contenteditable: false,
          }),
        ],
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
      const wrapperElement = document.createElement(
        node.content.size > 0 ? "figure" : "div"
      );
      wrapperElement.setAttribute("class", styles["wrapper-element"]);
      wrapperElement.setAttribute("style", style);

      const imageElement = document.createElement("img");
      wrapperElement.appendChild(imageElement);

      const captionElement = document.createElement("figcaption");

      // Set up image attributes
      Object.entries(node.attrs).forEach(([key, value]) => {
        if (value === undefined || value === null) {
          return;
        }
        imageElement.setAttribute(key, value);
      });

      // Add caption if needed
      if (node.content.size > 0) {
        captionElement.setAttribute("class", styles["caption-element"]);
        captionElement.setAttribute("contenteditable", "true");
        wrapperElement.appendChild(captionElement);
      }

      if (!editable) return { dom: wrapperElement, contentDOM: captionElement };

      // Initialize control variables
      let isResizing = false;
      let startX = 0;
      let startWidth = 0;

      // Handle click on container
      wrapperElement.addEventListener("click", (event) => {
        event.stopPropagation();
        event.preventDefault();

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
            dispatchNodeView();
            editor.commands.focus();
          }
        );

        addCaptionControls(
          wrapperElement,
          styles,
          () => {
            // On caption remove
            changeFigureToImage(wrapperElement);

            this.storage.elementsVisible = false;
          },
          () => {
            // On caption add
            changeImageToFigure(wrapperElement, captionElement);

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
        }
      });

      return {
        dom: wrapperElement,
        contentDOM: node.content.size > 0 ? captionElement : undefined,
        ignoreMutation: (mutation) => {
          // We must ignore mutations that happened outside the captionElement
          return !captionElement.contains(mutation.target);
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
          const [, alt, src, title] = match;
          return { src, alt, title };
        },
      }),
    ];
  },
});

export { TiptapImageFigureExtension };

export default TiptapImageFigureExtension;
