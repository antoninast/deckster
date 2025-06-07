import "./Flashcard.css";

interface FlashcardProps {
  question: string;
  answer: string;
  isFlipped: boolean;
  onFlip: () => void;
  currentCard: number;
  totalCards: number;
}

export default function Flashcard({
  question,
  answer,
  isFlipped,
  onFlip,
  currentCard,
  totalCards,
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
            <div className="card-content indie-flower-regular">
              <p>{question}</p>
              <div className="card-counter">
                {currentCard} of {totalCards}
              </div>
            </div>
          </div>
          <div className="flashcard-back">
            <div className="card-content indie-flower-regular">
              <p>{answer}</p>
              <div className="card-counter">
                {currentCard} of {totalCards}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
