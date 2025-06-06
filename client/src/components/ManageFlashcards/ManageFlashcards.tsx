import { useMutation, useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  QUERY_FLASHCARDS_BY_DECK,
  //   QUERY_CARD_DECKS,
} from "../../utils/queries";
import { REMOVE_FLASHCARD, UPDATE_FLASHCARD } from "../../utils/mutations";
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

  // TODO: const decks = useQuery(QUERY_CARD_DECKS, {
  //     fetchPolicy: "cache-and-network"
  // });

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

  if (queryLoading || removeLoading || updateLoading) {
    return <div>Loading cards ...</div>;
  }

  if (!flashcards) {
    return <div>No flashcards in this deck</div>;
  }

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
      <h2>Flashcards with - DECK ID - {deckId}</h2>
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="17"
                height="17"
                fill="gray"
                className="bi bi-x-square delete-icon"
                viewBox="0 0 16 16"
              >
                <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z" />
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
              </svg>
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
            <div className="action-buttons">
              <div
                onClick={() =>
                  handleUpdateFlashcard(
                    flashcard._id,
                    flashcard.question,
                    flashcard.answer
                  )
                }
              >
                {flashcard._id === currentlyEditedCardId ? (
                  <button type="button" className="btn btn-outline-info btn-sm">
                    💾 Save
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                  >
                    ✏️ Edit
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
