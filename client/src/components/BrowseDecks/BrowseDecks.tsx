import { useMutation, useQuery } from "@apollo/client";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { QUERY_MY_DECKS, QUERY_CARD_DECKS } from "../../utils/queries";
import { CardDeck } from "../../interfaces/CardDeck";
import { REMOVE_CARDDECK } from "../../utils/mutations";
import "./BrowseDecks.css";

const BrowseDecks = () => {
  const navigate = useNavigate();
  const user = useSelector((state: any) => {
    return state.user.value;
  });

  const [openModal, setOpenModal] = useState(false);
  const [deckIdToRemove, setDeckIdToRemove] = useState('');

  const { loading, data, refetch } = useQuery(
    !user ? QUERY_CARD_DECKS : QUERY_MY_DECKS,
    !user ? { variables: { isPublic: true } } : {}
  );

  const decks = !user ? data?.cardDecks || [] : data?.myCardDecks || [];

  const [removeCardDeckMutation] = useMutation(REMOVE_CARDDECK, {
    onCompleted: () => {
      refetch();
    }
  });

  const removeDeck = async () => {
    try {
      await removeCardDeckMutation({
        variables: { deckId: deckIdToRemove },
      });
      setOpenModal(false);
    } catch (error) {
      throw new Error(`Failed to remove the deck, ${error}`);
    }
  }

  const cancelRemoveDeck = () => {
    setDeckIdToRemove('');
    setOpenModal(false);
  }

  const handleRemoveCardDeck = async (deckId: string) => {
    setDeckIdToRemove(deckId);
    setOpenModal(true);
  };

  const handleManageDeck = (deckId: string) => {
    navigate(`/browse-decks/${deckId}`);
  };

  const handleStudyDeck = (deckId: string) => {
    navigate(`/study-deck/${deckId}`);
  };

  if (loading) {
    return <div>Loading available decks...</div>;
  }

  if (!decks.length) {
    return <div>You don't have decks.</div>;
  }

  return (
    <div className="browse-page">
      <div className={openModal ? "modal show" : "modal hide"}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-body">
              Do you want to permanently delete this card deck and the associated flashcards?
            </div>
            <div className="modal-footer">
              <button onClick={cancelRemoveDeck} type="button" className="btn btn-secondary btn-sm">Cancel</button>
              <button onClick={removeDeck} type="button" className="btn btn-danger btn-sm">Delete</button>
            </div>
          </div>
        </div>
      </div>
      <h2>Browse decks</h2>
      <div className="decks-container">
        {decks.map((deck: CardDeck) =>
          <div key={deck._id} className="deck card">
            <div className="deck-details">
              <div className="delete-button-wrapper" onClick={() => handleRemoveCardDeck(deck._id)}>
                <svg xmlns="http://www.w3.org/2000/svg"
                  width="17" height="17" fill="gray" className="bi bi-x-square delete-icon" viewBox="0 0 16 16">
                  <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/>
                  <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
                </svg>
              </div>
              <p><b>Name:</b> {deck.name}</p>
              <p><b>Category:</b> {deck.categoryName}</p>
              <p>
                <b>Accuracy:</b> {deck.userStudyAttemptStats?.attemptAccuracy?.toFixed(1)}%
              </p>
              <p>
                <b>Proficiency:</b> {deck.userStudyAttemptStats?.proficiency || "No Data"}
              </p>
            </div>
            {/* <img src={deck.image_url} alt={deck.name}></img> */}
            <div className="action-buttons">
              <button
                onClick={() => handleManageDeck(deck._id)}
                type="button" className="btn btn-outline-warning btn-sm"
              >⚙️ Manage</button>
              <button
                onClick={() => handleStudyDeck(deck._id)}
                type="button" className="btn btn-outline-success btn-sm"
              >📗 Study</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseDecks;
