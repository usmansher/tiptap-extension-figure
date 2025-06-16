import closedCaptionAddIcon from "../assets/icons/closed-caption-add.svg";
import deleteIcon from "../assets/icons/delete.svg";

export const addCaptionControls = (
  wrapperElement: HTMLElement,
  styles: Record<string, string>,
  onCaptionRemove: () => void,
  onCaptionAdd: () => void
) => {
  // 1) Remove any old controls
  const old = wrapperElement.querySelector(
    `.${styles["caption-controls-element"]}`
  );
  if (old) old.remove();

  // 2) Create the container
  const captionControlsContainer = document.createElement("div");
  captionControlsContainer.setAttribute("contenteditable", "false");
  captionControlsContainer.classList.add(
    styles["caption-controls-element"]
  );

  // 3) Find (or assume) the <figcaption>
  let captionEl = wrapperElement.querySelector("figcaption");
  if (!captionEl) {
    // if for some reason it doesn't exist, create & append it
    captionEl = document.createElement("figcaption");
    captionEl.setAttribute("contenteditable", "true");
    captionEl.textContent = "";
    wrapperElement.appendChild(captionEl);
  }

  const hasCaption = captionEl.textContent?.trim().length > 0;

  // 4) Build the appropriate button
  const button = document.createElement("img");
  button.setAttribute("class", hasCaption
    ? styles["remove-caption-button"]
    : styles["add-caption-button"]
  );
  button.setAttribute("src", hasCaption ? deleteIcon : closedCaptionAddIcon);
  button.setAttribute("title", hasCaption ? "Remove caption" : "Add caption");
  button.addEventListener("click", (e) => {
    e.stopPropagation();
    if (hasCaption) {
      onCaptionRemove();
    } else {
      onCaptionAdd();
    }
  });

  // 5) Put it all together
  captionControlsContainer.appendChild(button);
  wrapperElement.appendChild(captionControlsContainer);
};
