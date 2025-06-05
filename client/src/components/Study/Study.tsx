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

export default function Study() {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [sessionId, setSessionId] = useState<string>("");
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [isSessionAbandoned, setIsSessionAbandoned] = useState(false);
  const [helpStep, setHelpStep] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

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

  // Handle session completion
  const handleSessionComplete = async (abandonedEarly = false) => {
    try {
      setIsSessionAbandoned(abandonedEarly);

      const startTimeMs = Number(statsData?.studySession?.startTime);

      const clientDuration = startTimeMs
        ? Math.floor((Date.now() - startTimeMs) / 1000)
        : 0;

      // console.log("Calculated duration (seconds):", clientDuration);

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

  // Handle flashcard response
  const handleResponse = async (correct: boolean) => {
    if (!flashcards[currentCardIndex]) return;

    // consider updating resolver to handle an array of flashcardIds?
    // then save responses locally in an array
    // and batch fetch the reslts when the session is over
    // console.log("Session Stats:", statsData.studySession);
    // console.log("typeof sessionId:", typeof sessionId);
    try {
      await reviewFlashcard({
        variables: {
          flashcardId: flashcards[currentCardIndex]._id,
          correct,
          studySessionId: sessionId,
        },
      });

      // maybe we only fetchd session stats when session ends?
      // otherwise this could be a problem for scalability

      if (currentCardIndex === flashcards.length - 1) {
        await handleSessionComplete(false);
        setIsSessionComplete(true);
        await refetchStudySession();
        console.log("statsData:", statsData);
        await refetchRecentStudySessions();
      } else {
        setCurrentCardIndex((prev) => prev + 1);
        setIsFlipped(false);
      }
    } catch (err) {
      console.error("Error recording flashcard review:", err);
    }
  };

  // Keyboard event handlers
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isSessionComplete) return;

      switch (e.code) {
        case "ArrowUp":
        case "ArrowDown":
          setIsFlipped((prev) => !prev);
          break;
        case "ArrowLeft":
          handleResponse(false);
          break;
        case "ArrowRight":
          handleResponse(true);
          break;
        case "Space":
          handleSessionComplete(true);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isSessionComplete, currentCardIndex, sessionId]);

  // Help modal steps
  const helpSteps = [
    {
      message:
        "To flip the flashcard over, either click on the flashcard or push the down/up arrows on the keyboard.",
      targetRef: cardRef,
    },
    {
      message:
        "To record the flashcard answered correctly, either click the correct button or push the right arrow on the keyboard.",
      targetRef: correctBtnRef,
    },
    {
      message:
        "To record the flashcard answered incorrectly, either click the incorrect button or push the left arrow on the keyboard.",
      targetRef: incorrectBtnRef,
    },
    {
      message:
        "To end the study session without reviewing all of the flashcards, either click the end session button or press the spacebar on the keyboard.",
      targetRef: endSessionRef,
    },
  ];

  const handleHelpNext = () => {
    if (helpStep < helpSteps.length) {
      setHelpStep((prev) => prev + 1);
    } else {
      setHelpStep(0);
    }
  };

  // Loading and empty states
  if (loading) return <div>Loading...</div>;
  if (!data?.flashcardsByDeck?.length)
    return <div>No flashcards found in this deck.</div>;

  const flashcards = data.flashcardsByDeck;

  const startNewSession = () => {
    setCurrentCardIndex(0);
    setIsSessionComplete(false);
    setIsSessionAbandoned(false);
    setIsFlipped(false);
    setSessionId("");
  };

  const handleEndSessionClick = () => {
    handleSessionComplete(true);
  };

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
      </div>
    );
  }

  // Main study view
  return (
    <div className="study-page">
      <div className="study-header">
        <h2>Study Session</h2>
      </div>

      <p>
        Card {currentCardIndex + 1} of {flashcards.length}
      </p>

      <div ref={cardRef}>
        <Flashcard
          key={currentCardIndex}
          question={flashcards[currentCardIndex].question}
          answer={flashcards[currentCardIndex].answer}
          isFlipped={isFlipped}
          onFlip={() => setIsFlipped((prev) => !prev)}
        />
      </div>

      <div className="study-controls">
        <div className="controls">
          <button
            ref={incorrectBtnRef}
            className="incorrect-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleResponse(false);
            }}
          >
            ❌ Incorrect
          </button>
          <button
            ref={correctBtnRef}
            className="correct-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleResponse(true);
            }}
          >
            ✅ Correct
          </button>
        </div>

        <button
          ref={endSessionRef}
          className="end-session-btn"
          onClick={handleEndSessionClick}
        >
          End Session
        </button>
      </div>

      <RecentSessionsChart deckId={deckId || ""} />

      <button className="help-button" onClick={() => setHelpStep(1)}>
        ?
      </button>

      <HelpModal
        step={helpStep}
        totalSteps={helpSteps.length}
        message={helpSteps[helpStep - 1]?.message || ""}
        targetRef={helpSteps[helpStep - 1]?.targetRef || cardRef}
        onNext={handleHelpNext}
        isVisible={helpStep > 0}
      />
    </div>
  );
}
