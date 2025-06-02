import { useMutation, useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { QUERY_MY_DECKS, QUERY_CARD_DECKS } from "../../utils/queries";
import { CardDeck } from "../../interfaces/CardDeck";
import { REMOVE_CARDDECK } from "../../utils/mutations";
import { FaCog, FaBookOpen, FaFileImport, FaPlus } from "react-icons/fa";
import auth from "../../utils/auth";
import "./BrowseDecks.css";
import { ADD_CARD_DECK } from "../../utils/mutations";

const BrowseDecks = () => {
  const navigate = useNavigate();
  const user = useSelector((state: any) => {
    return state.user.value;
  });

  const [openModal, setOpenModal] = useState(false);
  const [deckIdToRemove, setDeckIdToRemove] = useState("");

  const { loading, data, refetch } = useQuery(
    !user ? QUERY_CARD_DECKS : QUERY_MY_DECKS,
    {
      ...(user ? {} : { variables: { isPublic: true } }),
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-first"
    }
  );

  useEffect(() => {
  refetch();
}, []);

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
      console.error(`Failed to remove the deck:`, error);
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

  const [addCardDeck] = useMutation(ADD_CARD_DECK, {
    onCompleted: () => {
      refetch();
    },
  });

  // Add this function:
  const createTestDeck = async () => {
    try {
      const user = auth.getProfile();
      if (!user?.data?._id) {
        alert("You must be logged in");
        return;
      }

      await addCardDeck({
        variables: {
          input: {
            name: "Test Deck",
            categoryName: "Testing",
            userId: user.data._id,
            isPublic: false,
            flashcardIds: [],
          },
        },
      });

      alert("Deck created successfully!");
    } catch (error) {
      console.error("Error creating deck:", error);
      alert("Failed to create deck");
    }
  };

  // Add a button in the empty state or at the top of the page:
  {
    user && (
      <button onClick={createTestDeck} style={{ marginBottom: "1rem" }}>
        Create Test Deck
      </button>
    );
  }

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
                // TODO: Future feature - navigate to manual deck creation screen
                // onClick={() => navigate("/create-deck")}
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
                  className="delete-button-wrapper"
                  onClick={() => handleRemoveCardDeck(deck._id)}
                  aria-label="Delete deck"
                >
                  <span className="delete-icon">×</span>
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
                <span className="deck-stat-label">Proficiency:</span>
                <span
                  className={`proficiency-badge ${getProficiencyClass(
                    deck.userStudyAttemptStats?.proficiency
                  )}`}
                >
                  {deck.userStudyAttemptStats?.proficiency || "No Data"}
                </span>
              </p>
            </div>

            <div className="action-buttons">
              <button
                onClick={() => handleManageDeck(deck._id)}
                type="button"
                className="deck-action-btn btn-manage"
              >
                <FaCog className="btn-icon" />
                Manage
              </button>
              <button
                onClick={() => handleStudyDeck(deck._id)}
                type="button"
                className="deck-action-btn btn-study"
              >
                <FaBookOpen className="btn-icon" />
                Study
              </button>
              <button
                onClick={() => navigate(`/deck/${deck._id}/import`)}
                type="button"
                className="deck-action-btn btn-import"
              >
                <FaFileImport className="btn-icon" />
                Import
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrowseDecks;
