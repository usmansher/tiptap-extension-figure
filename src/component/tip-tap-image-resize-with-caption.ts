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

const TiptapImageResizeWithCaption = ImageExtension.extend<CustomImageOptions>({
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

  addStorage() {
    return {
      elementsVisible: false,
    };
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      style: {
        // This style is applied to the wrapper element
        default: "width: 100%; height: auto; cursor: pointer;",
        parseHTML: (element) => {
          const width = element.getAttribute("width");
          return width
            ? `width: ${width}px; height: auto; cursor: pointer;`
            : `${element.style.cssText}`;
        },
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
          view.dispatch(view.state.tr.setNodeMarkup(getPos(), null, newAttrs));
          this.storage.elementsVisible = false;
        }
      };

      const {
        view,
        options: { editable },
      } = editor;
      const { style } = node.attrs;

      const wrapperElement = document.createElement("div");
      const containerElement = document.createElement("div");
      const imageElement = document.createElement("img");

      wrapperElement.setAttribute("style", `display: flex;`);
      wrapperElement.appendChild(containerElement);

      containerElement.setAttribute("style", style);
      containerElement.style.cursor = "pointer";
      containerElement.appendChild(imageElement);

      Object.entries(node.attrs).forEach(([key, value]) => {
        if (value === undefined || value === null) {
          return;
        }
        imageElement.setAttribute(key, value);
      });

      if (!editable) return { dom: containerElement };

      let isResizing = false;
      let startX: number;
      let startWidth: number;

      const containerClickListener = containerElement.addEventListener(
        "click",
        (event) => {
          // We stop propagation to prevent the document click listener from firing
          event.stopPropagation();

          const isMobile = isMobileScreen();
          if (isMobile) {
            const focusedElement = document.querySelector(
              ".ProseMirror-focused"
            ) as HTMLElement | null;
            focusedElement?.blur();
          }

          // If elements are already visible, skip the rest of the function
          if (this.storage.elementsVisible) {
            return;
          }

          // If elements are not visible, set the flag to true and add the elements
          this.storage.elementsVisible = true;

          // Add border to the container element to indicate that it's selected
          containerElement.style.border = "1px dashed #6C6C6C";
          containerElement.style.position = "relative";

          addImageAlignmentControls(containerElement, imageElement, () => {
            dispatchNodeView();
            this.editor.commands.focus();
          });

          addImageResizeControls(
            containerElement,
            imageElement,
            isResizing,
            startX,
            startWidth,
            () => {
              dispatchNodeView();
              this.editor.commands.focus();
            }
          );
        }
      );

      // Attach click listener to the whole document to remove all custom UI elements
      // when the user clicks outside the image
      const documentClickListener = document.addEventListener(
        "click",
        (event) => {
          // Remove all custom UI elements
          removeImageControlsAndResetStyles(
            event.target as HTMLElement,
            containerElement
          );
          this.storage.elementsVisible = false;
        }
      );

      return {
        dom: wrapperElement,
      };
    };
  },
});

export { TiptapImageResizeWithCaption };

export default TiptapImageResizeWithCaption;
