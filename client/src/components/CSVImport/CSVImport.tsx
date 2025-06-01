import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import './CSVImport.css';

interface CSVRow {
  Question: string;
  Answer: string;
  Category?: string;
  Difficulty?: string;
}

interface CSVImportProps {
  onImportComplete: (data: CSVRow[]) => void;
}

const CSVImport: React.FC<CSVImportProps> = ({ onImportComplete }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    setError(null);
    setSuccess(false);

    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    setIsUploading(true);

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        try {
          const validData = results.data.filter((row: any) =>
            row.Question && row.Answer
          ) as CSVRow[];

          if (validData.length === 0) {
            setError('No valid flashcards found. Ensure your CSV has Question and Answer columns.');
            setIsUploading(false);
            return;
          }

          console.log(`Parsed ${validData.length} flashcards`);
          onImportComplete(validData);
          setSuccess(true);
          setIsUploading(false);
        } catch (err) {
          setError('Failed to parse CSV file');
          setIsUploading(false);
        }
      },
      error: (error) => {
        setError(`Parse error: ${error.message}`);
        setIsUploading(false);
      }
    });
  };

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="csv-import-container">
      <h2>Import Flashcards from CSV</h2>
      <div className="csv-import-instructions">
        <p>Upload a CSV file with columns: Question, Answer</p>
        <small>Optional columns: Category, Difficulty</small>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        onChange={handleChange}
        style={{ display: "none" }}
      />

      <div
        className={`csv-import-dropzone ${dragActive ? 'active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
      >
        {isUploading ? (
          <p>Processing CSV file...</p>
        ) : (
          <p>Drag and drop your CSV file here, or click to browse</p>
        )}
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