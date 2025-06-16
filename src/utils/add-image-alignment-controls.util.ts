type ImageAlignmentControlType = "left" | "center" | "right";

interface ImageAlignmentControls {
  type: ImageAlignmentControlType;
  icon: string;
  classToApply: string;
}

import leftIcon from "../assets/icons/format-align-left.svg";
import centerIcon from "../assets/icons/format-align-center.svg";
import rightIcon from "../assets/icons/format-align-right.svg";

const imageAlignmentControls: ImageAlignmentControls[] = [
  {
    type: "left",
    icon: leftIcon,
    classToApply: "md:float-left"
  },
  {
    type: "center",
    icon: centerIcon,
    classToApply: "float-none"
  },
  {
    type: "right",
    icon: rightIcon,
    classToApply: "md:float-right"
  },
];

export const addImageAlignmentControls = (
  wrapperElement: HTMLElement,
  imageElement: HTMLImageElement,
  styles: Record<string, string>,
  onAlign: () => void
) => {
  const imageAlignmentContainer = document.createElement("div");

  imageAlignmentContainer.setAttribute("contenteditable", "false");
  imageAlignmentContainer.setAttribute(
    "class",
    styles["image-alignment-container"]
  );

  imageAlignmentControls.forEach((imageControl) => {
    const imageAlignmentControl = document.createElement("img");
    imageAlignmentControl.src = imageControl.icon;
    imageAlignmentControl.setAttribute(
      "class",
      styles["image-alignment-control"]
    );
    imageAlignmentControl.addEventListener("click", (event) => {
      event.stopPropagation();
      imageElement.classList.add(imageControl.classToApply);
      onAlign();
    });

    imageAlignmentContainer.appendChild(imageAlignmentControl);
  });

  wrapperElement.appendChild(imageAlignmentContainer);
};
