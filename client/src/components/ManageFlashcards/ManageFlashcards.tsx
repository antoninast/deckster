import { useMutation, useQuery } from "@apollo/client";
import { useState } from "react";
import { useParams } from "react-router-dom"
import { QUERY_FLASHCARDS_BY_DECK } from "../../utils/queries";
import type { Flashcard } from "../../interfaces/Flashcard";
import "./ManageFlashcards.css";
import { REMOVE_FLASHCARD, UPDATE_FLASHCARD } from "../../utils/mutations";

export default function Flashcards() {
    const { deckId } = useParams();
    const [editMode, setEditMode] = useState(false);
    const [updatedFlashcard, setUpdatedFlashcard] = useState({ question: '', answer: '' });
    const [currentlyEditedCardId, setCurrentlyEditedCardId] = useState('');

    const { loading: queryLoading, data: flashcards, refetch } = useQuery(QUERY_FLASHCARDS_BY_DECK,
        { variables: { deckId } }
    );

    const [removeFlashcard, { loading: removeLoading }] = useMutation(REMOVE_FLASHCARD, {
        onCompleted: () => {
            refetch();
        }
    });

    const [updateFlashcard, { loading: updateLoading }] = useMutation(UPDATE_FLASHCARD, {
        onCompleted: () => {
            refetch();
        }
    });

    const handleRemoveFlashcard = async (flashcardId: string) => {
        try {
            await removeFlashcard({
              variables: { flashcardId } 
            });
        } catch (error) {
            throw new Error(`Failed to remove the flashcard, ${error}`);
        }
    }

    const handleUpdateFlashcard = async (flashcardId: string, question: string, answer: string) => {
        if (currentlyEditedCardId && flashcardId !== currentlyEditedCardId) {
            alert('You are currently editing another card. Do you want to save the changes?');
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
                        input: updatedFlashcard
                    } 
                });
                setCurrentlyEditedCardId('');
                setUpdatedFlashcard({ question: '', answer: '' });
                setEditMode(false);
            } catch (error) {
                throw new Error(`Failed to remove the deck, ${error}`);
            }

        }
    }

    const handleQuestionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setUpdatedFlashcard({ ...updatedFlashcard, question: e.target.value });
    };

    const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setUpdatedFlashcard({ ...updatedFlashcard, answer: e.target.value });
    };

    if (queryLoading || removeLoading || updateLoading) {
        return (
            <div>Loading cards ...</div>
        )
    }

    if (!flashcards) {
        return (<div>No flashcards in this deck</div>)
    }

    return (
        <div>
            <h2>Flashcards Here - DECK ID - {deckId}</h2>
            <div className="flashcards-container">
                {flashcards.flashcardsByDeck.map((flashcard: Flashcard) => 
                    <div key={flashcard._id}>                    
                        <div className="card" style={{width: "18rem;"}}>
                            {flashcard._id === currentlyEditedCardId ? 
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
                            </div> :
                            <div className="view-mode">
                                <p className="card-title">{flashcard.question}</p>
                                <hr></hr>
                                <p className="text-body-secondary">{flashcard.answer}</p>
                            </div>
                            }
                            <div className="action-buttons">
                                <div onClick={() => handleUpdateFlashcard(flashcard._id, flashcard.question, flashcard.answer)}>
                                    {flashcard._id === currentlyEditedCardId ?
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="20"
                                            height="20"
                                            fill="#22aa22"
                                            className="bi bi-check-square"
                                            viewBox="0 0 16 16">
                                            <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/>
                                            <path d="M10.97 4.97a.75.75 0 0 1 1.071 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425z"/>
                                        </svg> :
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg" 
                                            width="20"
                                            height="20"
                                            fill="#6495ed"
                                            className="bi bi-pencil-square"
                                            viewBox="0 0 16 16">
                                            <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                                            <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
                                        </svg>
                                    }
                                </div>
                                {flashcard._id === currentlyEditedCardId ?
                                    '' :
                                    <div onClick={() => handleRemoveFlashcard(flashcard._id)}>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="20"
                                            height="20"
                                            fill="#d20c31"
                                            className="bi bi-trash3"
                                            viewBox="0 0 16 16">
                                            <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5"/>
                                        </svg>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
