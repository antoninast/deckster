import React, { useState } from 'react';
import './CSVImport.css';

interface CSVImportProps {
  onImportComplete: () => void;
}

const CSVImport: React.FC<CSVImportProps> = ({ onImportComplete }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  return (
    <div className="csv-import-container">
      <h2>Import Flashcards from CSV</h2>
      <div className="csv-import-instructions">
        <p>Upload a CSV file with columns: Question, Answer</p>
        <small>Optional columns: Category, Difficulty</small>
      </div>

      <div className="csv-import-dropzone">
        <p>Drag and drop your CSV file here, or click to browse</p>
      </div>

      {error && (
        <div className="alert alert-error">{error}</div>
      )}

      {success && (
        <div className="alert alert-success">
          Flashcards imported successfully!
        </div>
      )}
    </div>
  );
};

export default CSVImport;