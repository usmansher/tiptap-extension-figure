import {
  mergeAttributes,
  findChildrenInRange,
  Tracker,
  nodeInputRule,
} from "@tiptap/core";
import ImageExtension, { ImageOptions } from "@tiptap/extension-image";
import { isMobileScreen } from "../utils/is-mobile-screen.util";
import { removeImageControlsAndResetStyles } from "../utils/remove-image-controls.util";
import { addImageAlignmentControls } from "../utils/add-image-alignment-controls.util";
import { addImageResizeControls } from "../utils/add-image-resize-controls.util";

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

  addCommands() {
    return {
      ...this.parent?.(),
      setImageFigure:
        (options: {
          src: string;
          alt?: string;
          title?: string;
          caption?: string;
        }) =>
        ({ chain }) => {
          return chain()
            .insertContent({
              type: this.name,
              attrs: {
                src: options.src,
                alt: options.alt,
                title: options.title,
              },
              content: options.caption
                ? [{ type: "text", text: options.caption }]
                : [],
            })
            .run();
        },

      convertToFigure:
        () =>
        ({ tr, commands }) => {
          const { doc, selection } = tr;
          const { from, to } = selection;
          const images = findChildrenInRange(
            doc,
            { from, to },
            (node) => node.type.name === "image"
          );

          if (!images.length) return false;

          const tracker = new Tracker(tr);

          return commands.forEach(images, ({ node, pos }) => {
            const mapResult = tracker.map(pos);
            if (mapResult.deleted) return false;

            const range = {
              from: mapResult.position,
              to: mapResult.position + node.nodeSize,
            };

            return commands.insertContentAt(range, {
              type: this.name,
              attrs: {
                src: node.attrs.src,
                alt: node.attrs.alt,
                title: node.attrs.title,
                style: node.attrs.style,
              },
            });
          });
        },

      convertToImage:
        () =>
        ({ tr, commands }) => {
          const { doc, selection } = tr;
          const { from, to } = selection;
          const figures = findChildrenInRange(
            doc,
            { from, to },
            (node) => node.type.name === this.name
          );

          if (!figures.length) return false;

          const tracker = new Tracker(tr);

          return commands.forEach(figures, ({ node, pos }) => {
            const mapResult = tracker.map(pos);
            if (mapResult.deleted) return false;

            const range = {
              from: mapResult.position,
              to: mapResult.position + node.nodeSize,
            };

            return commands.insertContentAt(range, {
              type: "image",
              attrs: {
                src: node.attrs.src,
                alt: node.attrs.alt,
                title: node.attrs.title,
                style: node.attrs.style,
              },
            });
          });
        },
    };
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
      const imageElement = document.createElement("img");
      const captionElement = document.createElement("figcaption");

      // Set up wrapper
      wrapperElement.setAttribute(
        "style",
        `display: flex; flex-direction: column; position: relative;`
      );

      // Set up container
      wrapperElement.setAttribute(
        "style",
        `${style} position: relative; cursor: pointer; width: fit-content;`
      );
      wrapperElement.appendChild(imageElement);

      // Set up image attributes
      Object.entries(node.attrs).forEach(([key, value]) => {
        if (value === undefined || value === null) {
          return;
        }
        imageElement.setAttribute(key, value);
      });

      // Add caption if needed
      if (node.content.size > 0) {
        captionElement.setAttribute(
          "style",
          "text-align: center; margin-top: 8px; min-height: 1em;"
        );
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
          wrapperElement
        );

        // Show new controls
        wrapperElement.style.border = "1px dashed #6C6C6C";

        addImageAlignmentControls(wrapperElement, imageElement, () => {
          dispatchNodeView();
          editor.commands.focus();
        });

        addImageResizeControls(
          wrapperElement,
          imageElement,
          isResizing,
          startX,
          startWidth,
          () => {
            dispatchNodeView();
            editor.commands.focus();
          }
        );

        this.storage.elementsVisible = true;
      });

      // Handle clicks outside
      document.addEventListener("click", (event) => {
        if (!wrapperElement.contains(event.target as Node)) {
          removeImageControlsAndResetStyles(
            event.target as HTMLElement,
            wrapperElement
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
