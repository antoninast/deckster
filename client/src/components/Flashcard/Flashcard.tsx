import "./Flashcard.css";

interface FlashcardProps {
  question: string;
  answer: string;
  isFlipped: boolean;
  onFlip: () => void;
}

export default function Flashcard({
  question,
  answer,
  isFlipped,
  onFlip,
}: FlashcardProps) {
  return (
    <div className="flashcard-container">
      <div
        className={`flashcard ${isFlipped ? "flipped" : ""}`}
        onClick={onFlip}
        tabIndex={0}
      >
        <div className="flashcard-inner">
          <div className="flashcard-front">
            <div className="card-content">
              <h3>Question</h3>
              <p>{question}</p>
            </div>
          </div>
          <div className="flashcard-back">
            <div className="card-content">
              <h3>Answer</h3>
              <p>{answer}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
