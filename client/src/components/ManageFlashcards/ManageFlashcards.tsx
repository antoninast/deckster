import { useMutation, useQuery } from "@apollo/client";
import { useParams } from "react-router-dom"
import { QUERY_FLASHCARDS_BY_DECK } from "../../utils/queries";
import type { Flashcard } from "../../interfaces/Flashcard";
import "./ManageFlashcards.css";
import { REMOVE_FLASHCARD } from "../../utils/mutations";

export default function Flashcards() {
    const { deckId } = useParams();

    const { loading: queryLoading, data: flashcards, refetch } = useQuery(QUERY_FLASHCARDS_BY_DECK,
        { variables: { deckId } }
    );

    const [removeFlashcard, { loading: mutationLoading }] = useMutation(REMOVE_FLASHCARD, {
        onCompleted: () => {
            refetch();
        }
    });

    const handleUpdateFlashcard = (flashcardId: string) => {

    }

    const handleRemoveFlashcard = async (flashcardId: string) => {
        try {
            await removeFlashcard({
              variables: { flashcardId } 
            });
        } catch (error) {
            throw new Error(`Failed to remove the deck, ${error}`);
        }
    }

    if (queryLoading || mutationLoading) {
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
                <div key={flashcard._id}className="flashcard">
                    <div>Question: {flashcard.question}</div>
                    <div>Answer: {flashcard.answer}</div>
                    <button onClick={() => handleUpdateFlashcard(flashcard._id)}>Edit</button>
                    <button onClick={() => handleRemoveFlashcard(flashcard._id)}>Delete</button>
                </div>
            )}
        </div>
    )
}
