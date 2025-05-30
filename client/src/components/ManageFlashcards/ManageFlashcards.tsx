import { useQuery } from "@apollo/client";
import { useParams } from "react-router-dom"
import { QUERY_FLASHCARDS_BY_DECK } from "../../utils/queries";
import type { Flashcard } from "../../interfaces/Flashcard";
import "./ManageFlashcards.css";

export default function Flashcards() {
    const { deckId } = useParams();

    const { loading, data } = useQuery(QUERY_FLASHCARDS_BY_DECK,
        { variables: { deckId } }
    );

    if (loading) {
        return (
            <div>Loading cards ...</div>
        )
    }

    if (!data) {
        return (<div>No flashcards in this deck</div>)
    }

    return (
        <div>
            <h2>Flashcards Here - DECK ID - {deckId}</h2>
            {data.flashcardsByDeck.map((flashcard: Flashcard) => 
                <div key={flashcard._id}className="flashcard">
                    <div>Question: {flashcard.question}</div>
                    <div>Answer: {flashcard.answer}</div>
                </div>
            )}
        </div>
    )
}
