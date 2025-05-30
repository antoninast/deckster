import { useState } from "react";
import "./Flashcard.css";

interface FlashcardProps {
  question: string;
  answer: string;
  onResponse: (correct: boolean) => void;
}

export default function Flashcard({
  question,
  answer,
  onResponse,
}: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      onResponse(false);
    } else if (e.key === "ArrowRight") {
      onResponse(true);
    } else if (e.key === " ") {
      setIsFlipped(!isFlipped);
    }
  };

  return (
    <div
      className={`flashcard ${isFlipped ? "flipped" : ""}`}
      onClick={() => setIsFlipped(!isFlipped)}
      tabIndex={0}
      onKeyDown={handleKeyPress}
    >
      <div className="flashcard-inner">
        <div className="flashcard-front">
          <p>{question}</p>
        </div>
        <div className="flashcard-back">
          <p>{answer}</p>
        </div>
      </div>
      <div className="controls">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onResponse(false);
          }}
        >
          ❌ Incorrect
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onResponse(true);
          }}
        >
          ✅ Correct
        </button>
      </div>
    </div>
  );
}
