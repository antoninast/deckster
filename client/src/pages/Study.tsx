import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import { QUERY_FLASHCARDS_BY_DECK } from "../utils/queries";
import { REVIEW_FLASHCARD } from "../utils/mutations";
import { createStudySession } from "../utils/sessionUtils";
import Flashcard from "../components/Flashcard/Flashcard";

export default function Study() {
  const { deckId } = useParams();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [sessionId, setSessionId] = useState("");

  const { loading, data } = useQuery(QUERY_FLASHCARDS_BY_DECK, {
    variables: { deckId },
  });

  const [reviewFlashcard] = useMutation(REVIEW_FLASHCARD);

  useEffect(() => {
    // Create a new study session when component mounts
    const newSessionId = createStudySession();
    console.log("$$$$$$$ Creating new study session with ID:", newSessionId);
    setSessionId(newSessionId);
  }, []);

  if (loading) return <div>Loading...</div>;

  const flashcards = data?.flashcardsByDeck || [];
  console.log("flashcards:", flashcards);
  console.log("Current card index:", currentCardIndex);

  const handleResponse = async (correct: boolean) => {
    console.log("Handling response for card:", flashcards[currentCardIndex]);
    if (!flashcards[currentCardIndex]) return;
    console.log("Recording review for card:", flashcards[currentCardIndex]._id);
    console.log("flashcardId:", flashcards[currentCardIndex]._id);
    console.log("Correct response:", correct);
    console.log("Session ID:", sessionId);
    try {
      await reviewFlashcard({
        variables: {
          flashcardId: flashcards[currentCardIndex]._id,
          correct,
          studySessionId: sessionId,
        },
      });

      // Move to next card
      setCurrentCardIndex((prev) =>
        prev + 1 >= flashcards.length ? 0 : prev + 1
      );
    } catch (err) {
      console.error("Error recording flashcard review:", err);
    }
  };

  if (flashcards.length === 0) {
    return <div>No flashcards found in this deck.</div>;
  }

  return (
    <div className="study-page">
      <h2>Study Session</h2>
      <p>
        Card {currentCardIndex + 1} of {flashcards.length}
      </p>
      <Flashcard
        question={flashcards[currentCardIndex].question}
        answer={flashcards[currentCardIndex].answer}
        onResponse={handleResponse}
      />
      <div className="study-instructions">
        <p>Click card to flip • Use ← → arrows to mark incorrect/correct</p>
      </div>
    </div>
  );
}
