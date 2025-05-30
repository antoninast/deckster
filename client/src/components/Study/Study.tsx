import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, gql } from "@apollo/client";
import { QUERY_FLASHCARDS_BY_DECK } from "../../utils/queries";
import { REVIEW_FLASHCARD } from "../../utils/mutations";
import { createStudySession } from "../../utils/sessionUtils";
import { GET_SESSION_STATS } from "../../utils/queries";
import Flashcard from "../Flashcard/Flashcard";
import "./Study.css";

export default function Study() {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [sessionId, setSessionId] = useState("");
  const [isSessionComplete, setIsSessionComplete] = useState(false);

  const { loading, data } = useQuery(QUERY_FLASHCARDS_BY_DECK, {
    variables: { deckId },
  });

  // Add query for session stats
  const { data: statsData, refetch: refetchStats } = useQuery(
    GET_SESSION_STATS,
    {
      variables: { studySessionId: sessionId },
      skip: !sessionId,
    }
  );

  const [reviewFlashcard] = useMutation(REVIEW_FLASHCARD);

  useEffect(() => {
    // Create a new study session when component mounts
    const newSessionId = createStudySession();
    setSessionId(newSessionId);
  }, []);

  const startNewSession = () => {
    const newSessionId = createStudySession();
    setSessionId(newSessionId);
    setCurrentCardIndex(0);
    setIsSessionComplete(false);
  };

  const handleResponse = async (correct: boolean) => {
    if (!flashcards[currentCardIndex]) return;

    try {
      await reviewFlashcard({
        variables: {
          flashcardId: flashcards[currentCardIndex]._id,
          correct,
          studySessionId: sessionId,
        },
      });

      await refetchStats();

      // Check if this was the last card
      if (currentCardIndex === flashcards.length - 1) {
        setIsSessionComplete(true);
      } else {
        setCurrentCardIndex((prevIndex) => prevIndex + 1);
      }
    } catch (err) {
      console.error("Error recording flashcard review:", err);
    }
  };

  if (loading) return <div>Loading...</div>;

  const flashcards = data?.flashcardsByDeck || [];
  const stats = statsData?.sessionStats;

  if (flashcards.length === 0) {
    return <div>No flashcards found in this deck.</div>;
  }

  if (isSessionComplete) {
    return (
      <div className="session-complete">
        <h2>Session Complete! 🎉</h2>
        <div className="final-stats">
          <p>Final Results:</p>
          <p>Cards Studied: {stats?.totalAttempts}</p>
          <p>Correct: {stats?.correctAttempts}</p>
          <p>Accuracy: {stats?.attemptAccuracy.toFixed(1)}%</p>
        </div>
        <div className="session-controls">
          <button onClick={startNewSession}>Study Again</button>
          <button onClick={() => navigate("/browse-decks")}>
            Back to Decks
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="study-page">
      <h2>Study Session</h2>

      <p>
        Card {currentCardIndex + 1} of {flashcards.length}
      </p>

      <Flashcard
        key={currentCardIndex} // Force re-render with new card
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
