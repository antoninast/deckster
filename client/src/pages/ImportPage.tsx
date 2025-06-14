import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@apollo/client";
import CSVImport from "../components/CSVImport/CSVImport";
import { ADD_MULTIPLE_FLASHCARDS, ADD_CARD_DECK } from "../utils/mutations";
import {
  QUERY_MY_DECKS,
  QUERY_CARD_DECKS,
  QUERY_FLASHCARDS_BY_DECK,
} from "../utils/queries";
import { FaCheckCircle } from "react-icons/fa";
import auth from "../utils/auth";
import "./ImportPage.css";
import ManualImport from "../components/ManualImport/ManualImport";
import { CardDeck } from "../interfaces/CardDeck";

const ImportPage: React.FC = () => {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();

  const { data: userDecks } = useQuery(QUERY_MY_DECKS);
  const [addMultipleFlashcards] = useMutation(ADD_MULTIPLE_FLASHCARDS);
  const [addCardDeck] = useMutation(ADD_CARD_DECK);

  const [isProcessing, setIsProcessing] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [importedCount, setImportedCount] = useState(0);
  const [createdDeckId, setCreatedDeckId] = useState<string | null>(null);
  const [isDeckNameDuplicate, setIsDeckNameDuplicate] = useState(false);

  // Show deck creation form when no deckId is provided
  const [showDeckForm, setShowDeckForm] = useState(!deckId);
  const [deckFormData, setDeckFormData] = useState({
    name: "",
    categoryName: "",
    isPublic: false,
  });

  const handleDeckNameInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDeckFormData({ ...deckFormData, name: e.target.value });
    setIsDeckNameDuplicate(false);
  }

  const handleDeckFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!deckFormData.name || !deckFormData.categoryName) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const user = auth.getProfile();

      if (!user?.data?._id) {
        alert("You must be logged in to create a deck");
        navigate("/login");
        return;
      }

      const duplicatedDeck = userDecks?.myCardDecks.find((deck: CardDeck) => deck.name === deckFormData.name)
      if (duplicatedDeck) {
        setIsDeckNameDuplicate(true);
        return;
      }

      const { data } = await addCardDeck({
        variables: {
          input: {
            ...deckFormData,
            userId: user.data._id,
            // flashcardIds: [],
          },
        },
        refetchQueries: [
          { query: QUERY_MY_DECKS },
          { query: QUERY_CARD_DECKS, variables: { isPublic: true } },
          { query: QUERY_CARD_DECKS, variables: { isPublic: false } },
        ],
        awaitRefetchQueries: true,
      });

      if (data?.addCardDeck?._id) {
        setCreatedDeckId(data.addCardDeck._id);
        setShowDeckForm(false);
      }
    } catch (error) {
      console.error("Error creating deck:", error);
      alert("Failed to create deck. Please try again.");
    }
  };

  const handleImportComplete = async (data: any[]) => {
    const targetDeckId = deckId || createdDeckId;

    if (!targetDeckId) {
      alert("No deck selected or created");
      return;
    }

    setIsProcessing(true);
    try {
      // Process CSV data, handling various column name formats
      const flashcards = data.map((row) => ({
        question: String(row.Question || row.question || "").trim(),
        answer: String(row.Answer || row.answer || "").trim(),
      }));

      const validFlashcards = flashcards.filter(
        (fc) => fc.question && fc.answer
      );

      if (validFlashcards.length === 0) {
        throw new Error(
          "No valid flashcards found in CSV. Make sure your CSV has Question and Answer columns."
        );
      }

      await addMultipleFlashcards({
        variables: {
          deckId: targetDeckId,
          flashcards: validFlashcards,
        },
        refetchQueries: [
          { query: QUERY_MY_DECKS },
          { query: QUERY_CARD_DECKS, variables: { isPublic: true } },
          { query: QUERY_CARD_DECKS, variables: { isPublic: false } },
          {
            query: QUERY_FLASHCARDS_BY_DECK,
            variables: { deckId: targetDeckId },
          },
        ],
        awaitRefetchQueries: true,
      });

      setImportedCount(validFlashcards.length);
      setImportSuccess(true);
      setIsProcessing(false);

      // Redirect to deck view after showing success message
      setTimeout(() => {
        navigate(`/browse-decks/${targetDeckId}`);
      }, 2500);
    } catch (error: any) {
      let errorMessage = "Failed to import flashcards.";
      if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        errorMessage = error.graphQLErrors[0].message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      alert(`Import failed: ${errorMessage}`);
      setIsProcessing(false);
    }
  };

  const handleManualImportSubmit = async (data: {question: string, answer: string}) => {
    const targetDeckId = deckId || createdDeckId;

    if (!targetDeckId) {
      alert("No deck selected or created");
      return;
    }

    await addMultipleFlashcards({
      variables: {
        deckId: targetDeckId,
        flashcards: [data],
      },
      refetchQueries: [
        { query: QUERY_MY_DECKS },
      ],
      awaitRefetchQueries: true,
    });

    setImportedCount(1);
    setImportSuccess(true);

    // Redirect to deck view after showing success message
    setTimeout(() => {
      navigate(`/browse-decks/${targetDeckId}`);
    }, 2500);
  }

  useEffect(() => {
    // Verify user is authenticated on component mount
    const profile = auth.getProfile();
    if (!profile?.data?._id) {
      navigate("/login");
    }
  }, [navigate]);

  if (importSuccess) {
    return (
      <div className="import-page">
        <div className="import-success-container">
          <div className="success-animation">
            <FaCheckCircle className="success-icon" />
          </div>
          <h2>Import Successful!</h2>
          <p className="success-message">
            Successfully imported {importedCount} flashcard
            {importedCount !== 1 ? "s" : ""} to your deck.
          </p>
          <p className="redirect-message">
            Redirecting you back to your deck...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="import-page">
      {/* <div className="import-header">
        <button
          className="back-button"
          onClick={() => navigate(-1)}
          disabled={isProcessing}
        >
          <FaArrowLeft className="back-icon" />
          <span>Back</span>
        </button>
      </div> */}

      {showDeckForm ? (
        <div className="deck-form-container">
          <h2>Create New Deck</h2>
          <p>First, let's create a deck for your flashcards</p>
          <form onSubmit={handleDeckFormSubmit} className="deck-form">
            <div className="form-group">
              <label htmlFor="deckName">Deck Name</label>
              <input
                id="deckName"
                type="text"
                placeholder="e.g., Spanish Vocabulary"
                value={deckFormData.name}
                className={isDeckNameDuplicate ? 'duplicated-name' : ''}
                onChange={(e) => handleDeckNameInputChange(e)}
                required
              />
              {isDeckNameDuplicate ? <p className="error-message">You already have a deck with this name.</p> : null}
            </div>
            <div className="form-group">
              <label htmlFor="categoryName">Category</label>
              <input
                id="categoryName"
                type="text"
                placeholder="e.g., Language Learning"
                value={deckFormData.categoryName}
                onChange={(e) =>
                  setDeckFormData({
                    ...deckFormData,
                    categoryName: e.target.value,
                  })
                }
                required
              />
            </div>
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={deckFormData.isPublic}
                  onChange={(e) =>
                    setDeckFormData({
                      ...deckFormData,
                      isPublic: e.target.checked,
                    })
                  }
                />
                Make this deck public
              </label>
            </div>
            <button type="submit" className="submit-button">
              Create Deck & Continue
            </button>
          </form>
        </div>
      ) :
      (
        <div className="import-options">
          <CSVImport
            onImportComplete={handleImportComplete}
            isProcessing={isProcessing}
          />
          <ManualImport onManualImportSubmit={handleManualImportSubmit}/>
        </div>
      )}
    </div>
  );
};

export default ImportPage;
