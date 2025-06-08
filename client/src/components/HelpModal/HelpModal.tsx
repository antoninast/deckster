import React from "react";
import { FaQuestionCircle } from "react-icons/fa";
import "./HelpModal.css";

interface HelpModalProps {
  step: number;
  targetRefs: {
    cardRef: React.RefObject<HTMLElement>;
    correctBtnRef: React.RefObject<HTMLElement>;
    incorrectBtnRef: React.RefObject<HTMLElement>;
    endSessionRef: React.RefObject<HTMLElement>;
  };
  onNext: () => void;
  isVisible: boolean;
  onToggleHelp: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({
  step,
  targetRefs,
  onNext,
  isVisible,
  onToggleHelp,
}) => {
  // Help modal steps - now internal to the component
  const helpSteps = [
    {
      title: "Flip Flashcard",
      details: "• Click the flashcard\n• Press ↑ or ↓ arrow keys",
      targetRef: targetRefs.cardRef,
    },
    {
      title: "Mark Correct",
      details: "• Click Correct checkbox ✓\n• Press → arrow key",
      targetRef: targetRefs.correctBtnRef,
    },
    {
      title: "Mark Incorrect",
      details: "• Click Incorrect checkbox ✗\n• Press ← arrow key",
      targetRef: targetRefs.incorrectBtnRef,
    },
    {
      title: "End Session",
      details: "• Click End Session button\n• Press spacebar",
      targetRef: targetRefs.endSessionRef,
    },
  ];

  if (!isVisible) return null;

  const getModalPosition = () => {
    const currentStep = helpSteps[step - 1];
    if (!currentStep?.targetRef.current)
      return { style: {}, isAbove: false, arrowOffset: 0 };

    const rect = currentStep.targetRef.current.getBoundingClientRect();
    const modalWidth = 300;
    const spacing = 20;
    const modalHeight = 200;

    let top = rect.bottom + spacing;
    let left = rect.left + rect.width / 2 - modalWidth / 2;
    let isAbove = false;

    // Calculate target element center
    const targetCenter = rect.left + rect.width / 2;

    if (left + modalWidth > window.innerWidth) {
      left = window.innerWidth - modalWidth - spacing;
    }
    if (left < spacing) {
      left = spacing;
    }

    // Calculate arrow offset based on difference between modal center and target center
    const modalCenter = left + modalWidth / 2;
    const arrowOffset = targetCenter - modalCenter;

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
        "--arrow-offset": `${arrowOffset}px`,
      } as React.CSSProperties,
      isAbove,
      arrowOffset,
    };
  };

  const { style, isAbove } = getModalPosition();

  return (
    <>
      <button
        className="help-button"
        onClick={onToggleHelp}
        title="Study session controls"
      >
        <FaQuestionCircle />
      </button>
      {isVisible && (
        <div className="help-modal" style={style}>
          <div className="help-modal-step">
            {step} of {helpSteps.length}
          </div>
          <div className="help-modal-content">
            <div className="help-modal-title">
              {helpSteps[step - 1]?.title || ""}
            </div>
            <p style={{ whiteSpace: "pre-line" }}>
              {helpSteps[step - 1]?.details || ""}
            </p>
            <button onClick={onNext}>
              {step === helpSteps.length ? "Done" : "Next"}
            </button>
          </div>
          <div className={`help-modal-arrow ${isAbove ? "bottom" : ""}`} />
        </div>
      )}
    </>
  );
};
