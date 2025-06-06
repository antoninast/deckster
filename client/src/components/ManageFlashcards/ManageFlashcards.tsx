import { useMutation, useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  QUERY_FLASHCARDS_BY_DECK,
  QUERY_CARD_DECKS,
} from "../../utils/queries";
import { REMOVE_FLASHCARD, UPDATE_FLASHCARD } from "../../utils/mutations";
import { GrEdit, GrTrash } from "react-icons/gr";
import { RiSave3Line } from "react-icons/ri";
import type { Flashcard } from "../../interfaces/Flashcard";
import "./ManageFlashcards.css";

export default function Flashcards() {
  const { deckId } = useParams();
  const [editMode, setEditMode] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [flashcardIdToRemove, setFlashcardIdToRemove] = useState("");
  const [updatedFlashcard, setUpdatedFlashcard] = useState({
    question: "",
    answer: "",
  });
  const [currentlyEditedCardId, setCurrentlyEditedCardId] = useState("");
  const [flashcardList, setFlashcardList] = useState([]);

  const {
    loading: queryLoading,
    data: flashcards,
    refetch,
  } = useQuery(QUERY_FLASHCARDS_BY_DECK, { variables: { deckId } });

  const [removeFlashcardMutation, { loading: removeLoading }] = useMutation(
    REMOVE_FLASHCARD,
    {
      onCompleted: () => {
        refetch();
      },
    }
  );

  const [updateFlashcard, { loading: updateLoading }] = useMutation(
    UPDATE_FLASHCARD,
    {
      onCompleted: () => {
        refetch();
      },
    }
  );

  // Add loading state for the decks query
  const { data: decks, loading: decksLoading } = useQuery(QUERY_CARD_DECKS, {
    variables: { isPublic: false },
  });

  const deck = decks?.cardDecks.find((deck: any) => deck._id === deckId);

  const removeFlashcard = async () => {
    try {
      await removeFlashcardMutation({
        variables: { flashcardId: flashcardIdToRemove },
      });
      setOpenModal(false);
    } catch (error: any) {
      alert(error.message);
      setOpenModal(false);
      console.error(error.message);
    }
  };

  const cancelRemoveFlashcard = () => {
    setFlashcardIdToRemove("");
    setOpenModal(false);
  };

  const handleRemoveFlashcard = async (flashcardId: string) => {
    setFlashcardIdToRemove(flashcardId);
    setOpenModal(true);
  };

  const handleUpdateFlashcard = async (
    flashcardId: string,
    question: string,
    answer: string
  ) => {
    if (currentlyEditedCardId && flashcardId !== currentlyEditedCardId) {
      alert(
        "You are currently editing another card. Do you want to save the changes?"
      );
      return;
    }

    if (!editMode) {
      setCurrentlyEditedCardId(flashcardId);
      setUpdatedFlashcard({ question, answer });
      setEditMode(true);
    } else {
      try {
        await updateFlashcard({
          variables: {
            flashcardId,
            input: updatedFlashcard,
          },
        });
        setCurrentlyEditedCardId("");
        setUpdatedFlashcard({ question: "", answer: "" });
        setEditMode(false);
      } catch (error) {
        throw new Error(`Failed to remove the deck, ${error}`);
      }
    }
  };

  const handleQuestionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUpdatedFlashcard({ ...updatedFlashcard, question: e.target.value });
  };

  const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUpdatedFlashcard({ ...updatedFlashcard, answer: e.target.value });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (e.target.value) {
      const updatedFlashcardList = flashcards.flashcardsByDeck.filter(
        (card: any) => {
          return (
            card.question.toLowerCase().includes(value) ||
            card.answer.toLowerCase().includes(value)
          );
        }
      );
      setFlashcardList([...updatedFlashcardList] as any);
    } else {
      setFlashcardList(flashcards.flashcardsByDeck);
    }
  };

  useEffect(() => {
    if (flashcards?.flashcardsByDeck) {
      setFlashcardList(flashcards.flashcardsByDeck);
    }
  }, [flashcards]);

  // Update the loading condition to include decksLoading
  if (queryLoading || removeLoading || updateLoading || decksLoading) {
    return <div>Loading cards ...</div>;
  }

  // Add a check for deck existence
  if (!flashcards) {
    return <div>No flashcards in this deck</div>;
  }

  if (!deck) {
    return <div>Deck not found</div>;
  }

  // Update the h2 element to safely access deck.name
  return (
    <div>
      <div className={openModal ? "modal show" : "modal hide"}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-body">
              <h3 style={{ marginBottom: "1rem" }}>Delete Flashcard?</h3>
              <p>This will permanently delete this flashcard.</p>
            </div>
            <div className="modal-footer">
              <button
                onClick={cancelRemoveFlashcard}
                type="button"
                className="btn btn-secondary btn-sm"
              >
                Cancel
              </button>
              <button
                onClick={removeFlashcard}
                type="button"
                className="btn btn-danger btn-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
      <h2>{deck?.name || "Unknown Deck"}</h2>
      <div className="search-bar">
        <input
          onChange={handleSearch}
          type="text"
          className="form-control"
          placeholder="Search by keyword"
        />
      </div>
      <div className="flashcards-container">
        {flashcardList.map((flashcard: Flashcard) => (
          <div key={flashcard._id} className="card">
            <div
              className="flashcard-delete-button-wrapper"
              onClick={() => handleRemoveFlashcard(flashcard._id)}
            >
              <GrTrash />
            </div>
            {flashcard._id === currentlyEditedCardId ? (
              <div className="edit-mode">
                <textarea
                  className="question form-control"
                  value={updatedFlashcard.question}
                  onChange={handleQuestionChange}
                />
                <textarea
                  className="answer form-control"
                  value={updatedFlashcard.answer}
                  onChange={handleAnswerChange}
                />
              </div>
            ) : (
              <div className="view-mode">
                <p className="card-question">{flashcard.question}</p>
                <hr></hr>
                <p className="card-answer">{flashcard.answer}</p>
              </div>
            )}
            <div
              className="flashcard-action-buttons"
              onClick={() =>
                  handleUpdateFlashcard(
                    flashcard._id,
                    flashcard.question,
                    flashcard.answer
                  )
                }>
                {flashcard._id === currentlyEditedCardId ? (
                  <RiSave3Line className="save-btn"/>
                ) : (
                  <GrEdit />
                )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
