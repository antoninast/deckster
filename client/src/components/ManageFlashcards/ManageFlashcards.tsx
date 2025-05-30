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

    const handleQuestionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUpdatedFlashcard({ ...updatedFlashcard, question: e.target.value });
    };

    const handleAnswerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
            {flashcards.flashcardsByDeck.map((flashcard: Flashcard) => 
                <div key={flashcard._id} className="flashcard">
                    {flashcard._id === currentlyEditedCardId ? 
                        <div className="edit-mode">
                            <input value={updatedFlashcard.question} onChange={handleQuestionChange} />
                            <input value={updatedFlashcard.answer} onChange={handleAnswerChange} />
                        </div> :
                        <div className="view-mode">
                            <div>Question: {flashcard.question}</div>
                            <div>Answer: {flashcard.answer}</div>
                        </div>
                    }
                    <button
                        onClick={() => handleUpdateFlashcard(flashcard._id, flashcard.question, flashcard.answer)}
                    >{flashcard._id === currentlyEditedCardId ? 'Save' : 'Edit'}</button>
                    {flashcard._id === currentlyEditedCardId ? '' : <button onClick={() => handleRemoveFlashcard(flashcard._id)}>Delete</button>}
                </div>
            )}
        </div>
    )
}
