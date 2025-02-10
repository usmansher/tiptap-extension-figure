export const removeImageControlsAndResetStyles = (
  clickedElement: HTMLElement,
  containerElement: HTMLDivElement
) => {
  const containerContainsClickedElement =
    containerElement.contains(clickedElement);

  if (containerContainsClickedElement) {
    return;
  }

  // Remove all custom UI elements and styling
  containerElement.style.border = "none";

  // Remove all DOM elements except the image
  const children = Array.from(containerElement.children);
  children.forEach((child) => {
    if (child.tagName !== "IMG") {
      containerElement.removeChild(child);
    }
  });
};
