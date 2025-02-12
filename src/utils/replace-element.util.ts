export const changeFigureToImage = (wrapperElement: HTMLElement) => {
  const imageWrapperElement = document.createElement("div");
  const oldAttributes = wrapperElement.attributes;
  const newAttributes = imageWrapperElement.attributes;

  // Copy attributes
  for (let i = 0, len = oldAttributes.length; i < len; i++) {
    newAttributes.setNamedItem(oldAttributes.item(i).cloneNode() as Attr);
  }

  // Find the image within the old wrapper and set it as the only child of the new wrapper
  const imageElement = wrapperElement.querySelector("img");
  if (imageElement) {
    imageWrapperElement.appendChild(imageElement);
  }

  // Replace wrapperElement with imageWrapperElement
  wrapperElement.replaceWith(imageWrapperElement);
};

export const changeImageToFigure = (
  wrapperElement: HTMLElement,
  captionElement: HTMLElement
) => {
  const figureWrapperElement = document.createElement("figure");
  const oldAttributes = wrapperElement.attributes;
  const newAttributes = figureWrapperElement.attributes;

  console.log(wrapperElement);

  // Copy attributes
  for (let i = 0, len = oldAttributes.length; i < len; i++) {
    newAttributes.setNamedItem(oldAttributes.item(i).cloneNode() as Attr);
  }

  // Find the image within the old wrapper and set it as the only child of the new wrapper
  const imageElement = wrapperElement.querySelector("img");
  if (imageElement) {
    figureWrapperElement.appendChild(imageElement);
  }
  captionElement.innerHTML = "Caption";
  figureWrapperElement.appendChild(captionElement);

  console.log(figureWrapperElement);
  // Replace wrapperElement with figureWrapperElement
  wrapperElement.replaceWith(figureWrapperElement);
};
