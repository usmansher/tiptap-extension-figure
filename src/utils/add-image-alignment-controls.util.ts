type ImageAlignmentControlType = "left" | "center" | "right";

interface ImageAlignmentControls {
  type: ImageAlignmentControlType;
  icon: string;
  styleToApply: string;
}

import leftIcon from "../assets/icons/format-align-left.svg";
import centerIcon from "../assets/icons/format-align-center.svg";
import rightIcon from "../assets/icons/format-align-right.svg";

const imageAlignmentControls: ImageAlignmentControls[] = [
  {
    type: "left",
    icon: leftIcon,
    styleToApply: "margin: 0 auto 0 0;",
  },
  {
    type: "center",
    icon: centerIcon,
    styleToApply: "margin: 0 auto;",
  },
  {
    type: "right",
    icon: rightIcon,
    styleToApply: "margin: 0 0 0 auto;",
  },
];

export const addImageAlignmentControls = (
  wrapperElement: HTMLElement,
  imageElement: HTMLImageElement,
  onAlign: () => void
) => {
  const imageAlignmentContainer = document.createElement("div");

  imageAlignmentControls.forEach((imageControl) => {
    const imageAlignmentControl = document.createElement("img");
    imageAlignmentControl.src = imageControl.icon;
    imageAlignmentControl.setAttribute(
      "style",
      `cursor: pointer; font-size: 20px;`
    );
    imageAlignmentControl.addEventListener("mouseover", onIconMouseOver);
    imageAlignmentControl.addEventListener("mouseout", onIconMouseOut);
    imageAlignmentControl.addEventListener("click", (event) => {
      event.stopPropagation();
      imageElement.style.cssText = `${imageElement.style.cssText} ${imageControl.styleToApply}`;
      onAlign();
    });

    imageAlignmentContainer.appendChild(imageAlignmentControl);
  });

  imageAlignmentContainer.setAttribute(
    "style",
    "position: absolute; top: 0%; left: 50%; width: 100px; height: 25px; z-index: 999; background-color: rgba(255, 255, 255, 0.7); border-radius: 4px; border: 2px solid #6C6C6C; cursor: pointer; transform: translate(-50%, -50%); display: flex; justify-content: space-between; align-items: center; padding: 0 10px;"
  );

  wrapperElement.appendChild(imageAlignmentContainer);
};

const onIconMouseOver = (event: MouseEvent) => {
  const element = event.target as HTMLElement;
  element.style.opacity = "0.5";
};

const onIconMouseOut = (event: MouseEvent) => {
  const element = event.target as HTMLElement;
  element.style.opacity = "1";
};
