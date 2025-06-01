import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import CSVImport from '../components/CSVImport/CSVImport';
import { ADD_MULTIPLE_FLASHCARDS } from '../utils/mutations';
import './ImportPage.css';

const ImportPage: React.FC = () => {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const [addMultipleFlashcards] = useMutation(ADD_MULTIPLE_FLASHCARDS);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImportComplete = async (data: any[]) => {
    if (!deckId) {
      alert('No deck selected');
      return;
    }

    setIsProcessing(true);
    try {
      const flashcards = data.map(row => ({
        question: row.Question,
        answer: row.Answer
      }));

      await addMultipleFlashcards({
        variables: {
          deckId,
          flashcards
        }
      });

      alert(`Successfully imported ${flashcards.length} flashcards!`);
      navigate(`/deck/${deckId}`);
    } catch (error) {
      console.error('Import error:', error);
      alert('Failed to import flashcards. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="import-page">
      <div className="import-header">
        <button
          className="btn-secondary"
          onClick={() => navigate(-1)}
          disabled={isProcessing}
        >
          ← Back to Deck
        </button>
      </div>

      {isProcessing ? (
        <div className="processing-message">
          <p>Importing flashcards...</p>
        </div>
      ) : (
        <CSVImport onImportComplete={handleImportComplete} />
      )}
    </div>
  );
};

export default ImportPage;