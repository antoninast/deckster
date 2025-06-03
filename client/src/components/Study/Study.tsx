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
  GET_SESSION_STATS,
  GET_RECENT_SESSION_STATS,
} from "../../utils/queries";
import Flashcard from "../Flashcard/Flashcard";
import { HelpModal } from "../HelpModal/HelpModal";
import RecentSessionsChart from "../RecentSessionsChart/RecentSessionsChart";
import "./Study.css";

export default function Study() {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [sessionId, setSessionId] = useState("");
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [helpStep, setHelpStep] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [startStudySession] = useMutation(START_STUDY_SESSION);
  const [endStudySession] = useMutation(END_STUDY_SESSION);
  const [reviewFlashcard] = useMutation(REVIEW_FLASHCARD);

  const cardRef = useRef<HTMLDivElement>(null);
  const correctBtnRef = useRef<HTMLButtonElement>(null);
  const incorrectBtnRef = useRef<HTMLButtonElement>(null);
  const endSessionRef = useRef<HTMLButtonElement>(null);

  const { loading, data } = useQuery(QUERY_FLASHCARDS_BY_DECK, {
    variables: { deckId },
  });

  const { data: statsData, refetch: refetchStats } = useQuery(
    GET_SESSION_STATS,
    {
      variables: { studySessionId: sessionId },
      skip: !sessionId, // only query once sessionId is set to a valid value
    }
  );

  const { refetch: recentSessionsStatsRefetch } = useQuery(
    GET_RECENT_SESSION_STATS,
    {
      variables: {
        deckId: deckId || "",
        limit: 5,
      },
      skip: !deckId,
    }
  );

  useEffect(() => {
    const initializeSession = async () => {
      try {
        const { data } = await startStudySession({
          variables: { deckId },
        });
        setSessionId(data.startStudySession._id);
      } catch (err) {
        console.error("Error starting study session:", err);
      }
    };

    initializeSession();

    // Cleanup function for unmount/navigation
    return () => {
      if (sessionId && !isSessionComplete) {
        endStudySession({
          variables: {
            sessionId,
            status: "abandoned",
          },
        }).catch((err) => console.error("Error ending session:", err));
      }
    };
  }, []);

  const startNewSession = async () => {
    try {
      const { data } = await startStudySession({
        variables: { deckId },
      });
      setSessionId(data.startStudySession._id);
      setCurrentCardIndex(0);
      setIsSessionComplete(false);
    } catch (err) {
      console.error("Error starting new session:", err);
    }
  };

  const handleSessionComplete = async (abandonedEarly = false) => {
    try {
      await endStudySession({
        variables: {
          sessionId,
          status: abandonedEarly ? "abandoned" : "completed",
        },
      });
      setIsSessionComplete(true);
      await recentSessionsStatsRefetch();
    } catch (err) {
      console.error("Error ending session:", err);
    }
  };

  const handleResponse = async (correct: boolean) => {
    if (!flashcards[currentCardIndex]) return;

    // consider updating resolver to handle an array of flashcardIds?
    // then save responses locally in an array
    // and batch fetch the reslts when the session is over
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
      await refetchStats();

      // check if this was the last card
      if (currentCardIndex === flashcards.length - 1) {
        setIsSessionComplete(true);
        await recentSessionsStatsRefetch(); // Refresh chart data when session completes
      } else {
        setCurrentCardIndex((previousIndex) => previousIndex + 1);
        // reset flip state when moving to next card
        setIsFlipped(false);
      }
    } catch (err) {
      console.error("Error recording flashcard review:", err);
    }
  };

  const handleEndSessionClick = () => {
    handleSessionComplete(true);
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isSessionComplete) return;

      switch (e.code) {
        case "ArrowUp":
        case "ArrowDown":
          setIsFlipped((previousIndex) => !previousIndex);
          break;
        case "ArrowLeft":
          handleResponse(false);
          break;
        case "ArrowRight":
          handleResponse(true);
          break;
        case "Space":
          setIsSessionComplete(true);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isSessionComplete, handleResponse]);

  if (loading) return <div>Loading...</div>;

  const flashcards = data?.flashcardsByDeck || [];
  const stats = statsData?.sessionStats;

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
          <p>Accuracy: {stats?.sessionAccuracy.toFixed(1)}%</p>
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
