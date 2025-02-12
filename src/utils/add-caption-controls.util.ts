import closedCaptionAddIcon from "../assets/icons/closed-caption-add.svg";
import deleteIcon from "../assets/icons/delete.svg";

export const addCaptionControls = (
  wrapperElement: HTMLElement,
  onCaptionRemove: () => void,
  onCaptionAdd: () => void
) => {
  const captionControlsContainer = document.createElement("div");
  captionControlsContainer.setAttribute(
    "style",
    "position: absolute; bottom: 2.5%; left: 50%; width: 20px; height: 25px; z-index: 999; background-color: rgba(255, 255, 255, 0.7); border-radius: 4px; border: 2px solid #6C6C6C; cursor: pointer; transform: translate(-50%, -50%); display: flex; justify-content: space-between; align-items: center; padding: 0 10px;"
  );

  // If wrapper element is a figure and the button doesn't already exist, add a button to remove caption
  // Also, wrapper elements needs to become a div
  if (
    wrapperElement.tagName === "FIGURE" &&
    !document.getElementById("remove-caption-button")
  ) {
    const removeCaptionButton = document.createElement("img");
    removeCaptionButton.id = "remove-caption-button";
    removeCaptionButton.src = deleteIcon;
    removeCaptionButton.setAttribute(
      "style",
      `cursor: pointer; font-size: 20px;`
    );
    removeCaptionButton.addEventListener("click", onCaptionRemove);
    removeCaptionButton.addEventListener("mouseover", onIconMouseOver);
    removeCaptionButton.addEventListener("mouseout", onIconMouseOut);
    captionControlsContainer.appendChild(removeCaptionButton);
    wrapperElement.appendChild(captionControlsContainer);

    return;
  }

  // If wrapper element is a div and the button doesn't already exist, add a button to add caption
  if (
    wrapperElement.tagName === "DIV" &&
    !document.getElementById("add-caption-button")
  ) {
    const addCaptionButton = document.createElement("img");
    addCaptionButton.id = "add-caption-button";
    addCaptionButton.src = closedCaptionAddIcon;
    addCaptionButton.setAttribute("style", `cursor: pointer; font-size: 20px;`);
    addCaptionButton.addEventListener("click", onCaptionAdd);
    addCaptionButton.addEventListener("mouseover", onIconMouseOver);
    addCaptionButton.addEventListener("mouseout", onIconMouseOut);
    captionControlsContainer.appendChild(addCaptionButton);
    wrapperElement.appendChild(captionControlsContainer);
  }
};

const onIconMouseOver = (event: MouseEvent) => {
  const element = event.target as HTMLElement;
  element.style.opacity = "0.5";
};

const onIconMouseOut = (event: MouseEvent) => {
  const element = event.target as HTMLElement;
  element.style.opacity = "1";
};
