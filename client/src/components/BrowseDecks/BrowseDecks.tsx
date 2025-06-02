import { useMutation, useQuery } from "@apollo/client";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaCog, FaBookOpen, FaFileImport, FaPlus } from "react-icons/fa";
import { QUERY_MY_DECKS, QUERY_CARD_DECKS } from "../../utils/queries";
import { REMOVE_CARDDECK } from "../../utils/mutations";
import { CardDeck } from "../../interfaces/CardDeck";
import "./BrowseDecks.css";

const BrowseDecks = () => {
  const navigate = useNavigate();
  const user = useSelector((state: any) => state.user.value);

  const [openModal, setOpenModal] = useState(false);
  const [deckIdToRemove, setDeckIdToRemove] = useState("");

  // Query decks based on authentication status
  const { loading, data, refetch } = useQuery(
    !user ? QUERY_CARD_DECKS : QUERY_MY_DECKS,
    {
      ...(user ? {} : { variables: { isPublic: true } }),
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-first",
    }
  );

  const decks = !user ? data?.cardDecks || [] : data?.myCardDecks || [];

  const [removeCardDeckMutation] = useMutation(REMOVE_CARDDECK, {
    onCompleted: () => {
      refetch();
    },
  });

  const removeDeck = async () => {
    try {
      await removeCardDeckMutation({
        variables: { deckId: deckIdToRemove },
      });
      setOpenModal(false);
    } catch (error) {
      console.error("Failed to remove deck:", error);
    }
  };

  const cancelRemoveDeck = () => {
    setDeckIdToRemove("");
    setOpenModal(false);
  };

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

  const getProficiencyClass = (proficiency: string | undefined) => {
    if (!proficiency || proficiency === "No Data") return "";
    return proficiency.toLowerCase();
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div>Loading available decks...</div>
      </div>
    );
  }

  if (!decks.length) {
    return (
      <div className="browse-page">
        <div className="empty-state">
          <div className="empty-state-content">
            <div className="empty-state-icon">
              <FaBookOpen />
            </div>
            <h3>No Decks Available</h3>
            <p>
              {user ? (
                <>
                  You haven't created any decks yet.
                  <br />
                  Start building your knowledge! 🌱
                </>
              ) : (
                "Sign in to create your own decks or browse public decks."
              )}
            </p>
            {user && (
              <button
                className="empty-state-btn"
                onClick={() => navigate("/import")}
              >
                <FaPlus className="btn-icon" />
                Create Your First Deck
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="browse-page">
      {openModal && (
        <div className="modal show">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-body">
                <h3 style={{ marginBottom: "1rem" }}>Delete Deck?</h3>
                <p>
                  This will permanently delete this deck and all associated
                  flashcards. This action cannot be undone.
                </p>
              </div>
              <div className="modal-footer">
                <button
                  onClick={cancelRemoveDeck}
                  type="button"
                  className="modal-btn btn-cancel"
                >
                  Cancel
                </button>
                <button
                  onClick={removeDeck}
                  type="button"
                  className="modal-btn btn-danger"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <h2>Browse Decks</h2>

      <div className="decks-container">
        {decks.map((deck: CardDeck) => (
          <div key={deck._id} className="deck card">
            <div className="card-header">
              <h3 className="card-title">{deck.name}</h3>
              {user && (
                <div
                  className="deck-delete-button-wrapper"
                  onClick={() => handleRemoveCardDeck(deck._id)}
                  aria-label="Delete deck"
                >
                  <svg xmlns="http://www.w3.org/2000/svg"
                    width="17" height="17" fill="gray" className="bi bi-x-square delete-icon" viewBox="0 0 16 16">
                    <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/>
                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
                  </svg>
                </div>
              )}
            </div>

            <div className="deck-details">
              <p className="deck-stat">
                <span className="deck-stat-label">Category:</span>
                <span className="deck-stat-value">{deck.categoryName}</span>
              </p>

              <p className="deck-stat">
                <span className="deck-stat-label">Accuracy:</span>
                <span className="deck-stat-value">
                  {deck.userStudyAttemptStats?.attemptAccuracy?.toFixed(1) ||
                    "0.0"}
                  %
                </span>
              </p>

              <p className="deck-stat">
                <span className="deck-stat-label">Total cards:</span>
                <span className="deck-stat-value">{deck.isPublic}</span>
              </p>

              <p className="deck-stat">
                <span className="deck-stat-label">Proficiency:</span>
                <span
                  className={`proficiency-badge ${getProficiencyClass(
                    deck.userStudyAttemptStats?.proficiency
                  )}`}
                >
                  {deck.userStudyAttemptStats?.proficiency || "No Data"}
                </span>
              </p>

              <p className="deck-stat">
                <span className="deck-stat-label">Visibility:</span>
                <span className="deck-stat-value">{deck.isPublic ? 'Public' : 'Only you'}</span>
              </p>
            </div>

            <div className="action-buttons">
              {user ?
                <button
                  onClick={() => handleManageDeck(deck._id)}
                  type="button"
                  className="deck-action-btn btn-manage"
                >
                  <FaCog className="btn-icon" />
                  Manage
                </button> : null
              }
              <button
                onClick={() => handleStudyDeck(deck._id)}
                type="button"
                className="deck-action-btn btn-study"
              >
                <FaBookOpen className="btn-icon" />
                Study
              </button>
              {user ?
                <button
                  onClick={() => navigate(`/deck/${deck._id}/import`)}
                  type="button"
                  className="deck-action-btn btn-import"
                >
                  <FaFileImport className="btn-icon" />
                  Import
                </button> : null
              }
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrowseDecks;
