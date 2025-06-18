import deleteIcon from "../assets/icons/delete.svg";

export const addImageDeleteControls = (
  wrapperElement: HTMLElement,
  styles: Record<string, string>,
  onDelete: () => void
) => {
  // Create delete controls container
  const deleteControlsElement = document.createElement("div");
  deleteControlsElement.setAttribute("class", styles["delete-controls-element"]);

  // Create delete button
  const deleteButton = document.createElement("img");
  deleteButton.setAttribute("class", styles["delete-image-button"]);
  deleteButton.setAttribute("src", deleteIcon);
  deleteButton.setAttribute("title", "Delete Image");

  // Add click handler
  deleteButton.addEventListener("click", (event) => {
    event.stopPropagation();
    event.preventDefault();
    onDelete();
  });

  deleteControlsElement.appendChild(deleteButton);
  wrapperElement.appendChild(deleteControlsElement);
}; 