import React from "react";
import "./HelpModal.css";

interface HelpModalProps {
  step: number;
  totalSteps: number;
  message: string;
  targetRef: React.RefObject<HTMLElement>;
  onNext: () => void;
  isVisible: boolean;
}

export const HelpModal: React.FC<HelpModalProps> = ({
  step,
  totalSteps,
  message,
  targetRef,
  onNext,
  isVisible,
}) => {
  if (!isVisible) return null;

  const getModalPosition = () => {
    if (!targetRef.current) return { style: {}, isAbove: false };

    const rect = targetRef.current.getBoundingClientRect();
    const modalWidth = 300;
    const spacing = 20;
    const modalHeight = 200;

    let top = rect.bottom + spacing;
    let left = rect.left + rect.width / 2 - modalWidth / 2;
    let isAbove = false;

    if (left + modalWidth > window.innerWidth) {
      left = window.innerWidth - modalWidth - spacing;
    }
    if (left < spacing) {
      left = spacing;
    }

    // check if modal needs to go above element if too close to bottom of
    if (top + modalHeight > window.innerHeight) {
      top = rect.top - spacing - modalHeight;
      isAbove = true;
    }

    return {
      style: {
        position: "fixed" as "fixed",
        top: `${top}px`,
        left: `${left}px`,
        width: `${modalWidth}px`,
        "--arrow-position": isAbove ? "bottom" : "top",
      } as React.CSSProperties,
      isAbove,
    };
  };

  const { style, isAbove } = getModalPosition();

  return (
    <div className="help-modal" style={style}>
      <div className="help-modal-step">
        {step} of {totalSteps}
      </div>
      <div className="help-modal-content">
        <p>{message}</p>
        <button onClick={onNext}>
          {step === totalSteps ? "Done" : "Next"}
        </button>
      </div>
      <div className={`help-modal-arrow ${isAbove ? "bottom" : ""}`} />
    </div>
  );
};
