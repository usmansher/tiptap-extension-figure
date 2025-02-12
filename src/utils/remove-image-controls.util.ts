export const removeImageControlsAndResetStyles = (
  clickedElement: HTMLElement,
  wrapperElement: HTMLElement
) => {
  const containerContainsClickedElement =
    wrapperElement.contains(clickedElement);

  if (containerContainsClickedElement) {
    return;
  }

  // Remove all custom UI elements and styling
  wrapperElement.style.border = "none";

  // Remove all DOM elements except the image
  const children = Array.from(wrapperElement.children);
  children.forEach((child) => {
    if (child.tagName !== "IMG" && child.tagName !== "FIGCAPTION") {
      wrapperElement.removeChild(child);
    }
  });
};
