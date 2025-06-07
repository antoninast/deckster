import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import { QUERY_FLASHCARDS_BY_DECK } from "../../utils/queries";
import {
  REVIEW_FLASHCARD,
  START_STUDY_SESSION,
  END_STUDY_SESSION,
} from "../../utils/mutations";
import {
  QUERY_STUDY_SESSION,
  QUERY_RECENT_STUDY_SESSIONS,
} from "../../utils/queries";
import Flashcard from "../Flashcard/Flashcard";
import { HelpModal } from "../HelpModal/HelpModal";
import RecentSessionsChart from "../RecentSessionsChart/RecentSessionsChart";
import "./Study.css";
import { FaSignOutAlt, FaGamepad } from "react-icons/fa";

export default function Study() {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [sessionId, setSessionId] = useState<string>("");
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [isSessionAbandoned, setIsSessionAbandoned] = useState(false);
  const [helpStep, setHelpStep] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [jeopardyMode, setJeopardyMode] = useState(false);

  // Add new state for animations
  const [selectedAnswer, setSelectedAnswer] = useState<
    "correct" | "incorrect" | null
  >(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Add new state for forcing modal position updates
  const [_modalUpdateTrigger, setModalUpdateTrigger] = useState(0);

  // Mutations
  const [startStudySession] = useMutation(START_STUDY_SESSION);
  const [endStudySession] = useMutation(END_STUDY_SESSION);
  const [reviewFlashcard] = useMutation(REVIEW_FLASHCARD);

  // Refs for help modal
  const cardRef = useRef<HTMLDivElement>(null);
  const correctBtnRef = useRef<HTMLButtonElement>(null);
  const incorrectBtnRef = useRef<HTMLButtonElement>(null);
  const endSessionRef = useRef<HTMLButtonElement>(null);

  // Queries
  const { loading, data } = useQuery(QUERY_FLASHCARDS_BY_DECK, {
    variables: { deckId },
  });

  const { data: statsData, refetch: refetchStudySession } = useQuery(
    QUERY_STUDY_SESSION,
    {
      variables: { studySessionId: sessionId },
      skip: !sessionId.length,
    }
  );

  const { refetch: refetchRecentStudySessions } = useQuery(
    QUERY_RECENT_STUDY_SESSIONS,
    {
      variables: { deckId: deckId || "", limit: 5 },
      skip: !deckId,
    }
  );

  // Initialize session
  useEffect(() => {
    let isSubscribed = true;

    const initializeSession = async () => {
      try {
        if (!sessionId) {
          const { data } = await startStudySession({ variables: { deckId } });
          if (isSubscribed) setSessionId(data.startStudySession._id);
        }
      } catch (err) {
        console.error("Error starting study session:", err);
      }
    };

    initializeSession();
    return () => {
      isSubscribed = false;
    };
  }, [deckId, sessionId, startStudySession]);

  // Cleanup effect for abandoned sessions
  useEffect(() => {
    return () => {
      if (
        sessionId &&
        statsData?.studySession?.status === "active" &&
        !isSessionComplete &&
        isSessionAbandoned
      ) {
        endStudySession({
          variables: {
            sessionId,
            clientDuration: statsData?.studySession?.clientDuration || 0,
            status: "abandoned",
          },
        }).catch((err) => console.error("Error ending session:", err));
      }
    };
  }, [
    sessionId,
    isSessionComplete,
    endStudySession,
    statsData,
    isSessionAbandoned,
  ]);

  // Keyboard event handlers
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isSessionComplete) return;

      switch (e.code) {
        case "ArrowUp":
        case "ArrowDown":
          e.preventDefault(); // Prevent default scroll behavior
          setIsFlipped((prev) => !prev);
          break;
        case "ArrowLeft":
          e.preventDefault(); // Optional: prevent horizontal scroll too
          handleResponse(false);
          break;
        case "ArrowRight":
          e.preventDefault(); // Optional: prevent horizontal scroll too
          handleResponse(true);
          break;
        case "Space":
          e.preventDefault(); // Prevent default page scroll
          handleSessionComplete(true);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isSessionComplete, currentCardIndex, sessionId]);

  // Add scroll handling for help modal positioning
  useEffect(() => {
    const handleScroll = () => {
      // Force re-render of help modal to recalculate position
      if (helpStep > 0) {
        setModalUpdateTrigger(Date.now());
      }
    };

    if (helpStep > 0) {
      window.addEventListener("scroll", handleScroll, { passive: true });
      window.addEventListener("resize", handleScroll, { passive: true });
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [helpStep]);

  // Handle session completion
  const handleSessionComplete = async (abandonedEarly = false) => {
    try {
      setIsSessionAbandoned(abandonedEarly);

      const startTimeMs = Number(statsData?.studySession?.startTime);

      const clientDuration = startTimeMs
        ? Math.floor((Date.now() - startTimeMs) / 1000)
        : 0;

      await endStudySession({
        variables: {
          sessionId,
          clientDuration,
          status: abandonedEarly ? "abandoned" : "completed",
        },
      });
      setIsSessionComplete(true);
      await refetchRecentStudySessions();
    } catch (err) {
      console.error("Error ending session:", err);
    }
  };

  // Update the handleResponse function
  const handleResponse = async (correct: boolean) => {
    if (!data?.flashcardsByDeck?.[currentCardIndex] || isAnimating) return;

    setIsAnimating(true);
    setSelectedAnswer(correct ? "correct" : "incorrect");

    // Wait for animation to complete
    setTimeout(async () => {
      try {
        await reviewFlashcard({
          variables: {
            flashcardId: data.flashcardsByDeck[currentCardIndex]._id,
            correct,
            studySessionId: sessionId,
          },
        });

        if (currentCardIndex === data.flashcardsByDeck.length - 1) {
          await handleSessionComplete(false);
          setIsSessionComplete(true);
          await refetchStudySession();
          await refetchRecentStudySessions();
        } else {
          setCurrentCardIndex((prev) => prev + 1);
          if (jeopardyMode) {
            setIsFlipped(true);
          } else {
            setIsFlipped(false);
          }
          // Reset animation states
          setSelectedAnswer(null);
          setIsAnimating(false);
        }
      } catch (err) {
        console.error("Error recording flashcard review:", err);
        setSelectedAnswer(null);
        setIsAnimating(false);
      }
    }, 500);
  };

  const handleHelpNext = () => {
    if (helpStep < 4) {
      setHelpStep((prev) => prev + 1);
    } else {
      setHelpStep(0);
    }
  };

  const jeopardyModeToggle = () => {
    setJeopardyMode(!jeopardyMode);
    setIsFlipped((prev) => !prev);
  };

  const startNewSession = () => {
    setCurrentCardIndex(0);
    setIsSessionComplete(false);
    setIsSessionAbandoned(false);
    setIsFlipped(false);
    setSessionId("");
    setJeopardyMode(false);
    setSelectedAnswer(null);
    setIsAnimating(false);
  };

  const handleEndSessionClick = () => {
    handleSessionComplete(true);
  };

  const handleToggleHelp = () => {
    if (helpStep > 0) {
      setHelpStep(0); // Close help
    } else {
      setHelpStep(1); // Open help
    }
  };

  // Loading and empty states - MOVED AFTER ALL HOOKS
  if (loading) return <div>Loading...</div>;
  if (!data?.flashcardsByDeck?.length)
    return <div>No flashcards found in this deck.</div>;

  const flashcards = data.flashcardsByDeck;

  // Add safety check for currentCardIndex
  if (currentCardIndex >= flashcards.length) {
    return <div>Loading next card...</div>;
  }

  // Add safety check for current flashcard
  const currentFlashcard = flashcards[currentCardIndex];
  if (!currentFlashcard) {
    return <div>Loading flashcard...</div>;
  }

  // Session complete view
  if (isSessionComplete) {
    return (
      <div className="session-complete">
        <h2>Session Complete! 🎉</h2>
        <div className="final-stats">
          <p>Final Results:</p>
          <p>Cards Studied: {statsData?.studySession.totalAttempts}</p>
          <p>Correct: {statsData?.studySession.correctAttempts}</p>
          <p>Accuracy: {statsData?.studySession.sessionAccuracy.toFixed(1)}%</p>
        </div>
        <div className="session-controls">
          <button onClick={startNewSession}>Study Again</button>
          <button onClick={() => navigate("/browse-decks")}>
            Back to Decks
          </button>
        </div>
        <RecentSessionsChart deckId={deckId || ""} />
      </div>
    );
  }

  // Main study view
  return (
    <div className="study-page">
      <div className="study-header">
        <h2>Study Session</h2>
      </div>

      <div ref={cardRef}>
        <Flashcard
          key={currentCardIndex}
          question={currentFlashcard.question}
          answer={currentFlashcard.answer}
          isFlipped={isFlipped}
          onFlip={() => setIsFlipped((prev) => !prev)}
          currentCard={currentCardIndex + 1}
          totalCards={flashcards.length}
        />
      </div>

      <div className="study-controls">
        <div className="controls">
          <button
            ref={incorrectBtnRef}
            className="checkbox-button"
            onClick={(e) => {
              e.stopPropagation();
              handleResponse(false);
            }}
            disabled={isAnimating}
          >
            <div
              className={`checkbox-container ${
                selectedAnswer === "incorrect" ? "selected-incorrect" : ""
              }`}
            >
              <span
                className={`checkbox-icon incorrect ${
                  selectedAnswer === "incorrect" ? "animate-in" : ""
                }`}
              >
                ✗
              </span>
            </div>
            <span className="checkbox-label">Incorrect</span>
          </button>

          <button
            ref={correctBtnRef}
            className="checkbox-button"
            onClick={(e) => {
              e.stopPropagation();
              handleResponse(true);
            }}
            disabled={isAnimating}
          >
            <div
              className={`checkbox-container ${
                selectedAnswer === "correct" ? "selected-correct" : ""
              }`}
            >
              <span
                className={`checkbox-icon correct ${
                  selectedAnswer === "correct" ? "animate-in" : ""
                }`}
              >
                ✓
              </span>
            </div>
            <span className="checkbox-label">Correct</span>
          </button>
        </div>

        <button
          ref={endSessionRef}
          className="end-session-btn"
          onClick={handleEndSessionClick}
        >
          <FaSignOutAlt className="btn-icon" />
          End Session
        </button>
      </div>

      {/* Add Jeopardy Mode Toggle Button */}
      <button
        className={`jeopardy-toggle-button ${jeopardyMode ? "active" : ""}`}
        onClick={jeopardyModeToggle}
        title="Jeopardy Mode - Show answers first"
      >
        <FaGamepad />
      </button>

      <button className="help-button" onClick={handleToggleHelp}>
        ?
      </button>

      <HelpModal
        step={helpStep}
        targetRefs={{
          cardRef,
          correctBtnRef,
          incorrectBtnRef,
          endSessionRef,
        }}
        onNext={handleHelpNext}
        isVisible={helpStep > 0}
        onToggleHelp={handleToggleHelp}
      />
    </div>
  );
}
