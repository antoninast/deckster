import React, { useState, useRef } from "react";
import Papa from "papaparse";
import {
  FaFileUpload,
  FaFileCsv,
  FaCheckCircle,
  FaExclamationTriangle,
  FaDownload,
} from "react-icons/fa";
import "./CSVImport.css";

interface CSVRow {
  Question: string;
  Answer: string;
  Category?: string;
  Difficulty?: string;
}

interface CSVImportProps {
  onImportComplete: (data: CSVRow[]) => void;
  isProcessing?: boolean;
}

const CSVImport: React.FC<CSVImportProps> = ({
  onImportComplete,
  isProcessing = false,
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validationInfo, setValidationInfo] = useState<{
    total: number;
    valid: number;
    invalid: number;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateCSVStructure = (headers: string[]) => {
    const requiredHeaders = ["Question", "Answer"];
    const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h));

    if (missingHeaders.length > 0) {
      throw new Error(`Missing required columns: ${missingHeaders.join(", ")}`);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

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

  const handleFile = (selectedFile: File) => {
    setError(null);
    setValidationInfo(null);

    if (!selectedFile.name.endsWith(".csv")) {
      setError("Please upload a CSV file");
      return;
    }

    setFile(selectedFile);

    // Parse CSV for validation
    Papa.parse(selectedFile, {
      header: true,
      complete: (results) => {
        try {
          if (results.meta.fields) {
            validateCSVStructure(results.meta.fields);
          }

          const validData = results.data.filter(
            (row: any) => row.Question && row.Answer
          ) as CSVRow[];

          const invalidCount = results.data.length - validData.length;

          setValidationInfo({
            total: results.data.length,
            valid: validData.length,
            invalid: invalidCount,
          });

          if (validData.length === 0) {
            setError(
              "No valid flashcards found. Ensure your CSV has Question and Answer columns."
            );
            return;
          }
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Failed to parse CSV file"
          );
          setFile(null);
        }
      },
      error: (error) => {
        setError(`Parse error: ${error.message}`);
        setFile(null);
      },
    });
  };

  const handleImport = () => {
    if (!file) return;

    // Parse and send valid data to parent component
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const validData = results.data.filter(
          (row: any) => row.Question && row.Answer
        ) as CSVRow[];
        onImportComplete(validData);
      },
    });
  };

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  const downloadTemplate = () => {
    const template =
      "Question,Answer,Category,Difficulty\n" +
      '"What is React?","A JavaScript library for building user interfaces","Technology","Easy"\n' +
      '"What is a component?","A reusable piece of UI","Technology","Easy"\n' +
      '"What is state?","Data that changes over time in a component","Technology","Medium"';

    const blob = new Blob([template], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "flashcard_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="import-container">
      <div className="import-card">
        <div className="import-card-header">
          <h2>Import Flashcards from CSV</h2>
          <p className="import-subtitle">
            Build your deck quickly by importing multiple flashcards at once
          </p>
        </div>

        <div className="import-card-body">
          {/* Instructions Section */}
          <div className="instructions-section">
            <h3>How it works:</h3>
            <ol className="instructions-list">
              <li>Prepare a CSV file with "Question" and "Answer" columns</li>
              <li>Optional columns: "Category" and "Difficulty"</li>
              <li>Upload your file using the area below</li>
              <li>Review the import summary and confirm</li>
            </ol>

            <button className="template-button" onClick={downloadTemplate}>
              <FaDownload className="template-icon" />
              Download CSV Template
            </button>
          </div>

          {/* File Input - Hidden */}
          <label htmlFor="csvFileInput" className="hidden-input-label">
            Upload CSV File
          </label>
          <input
            id="csvFileInput"
            ref={inputRef}
            type="file"
            accept=".csv"
            onChange={handleChange}
            className="hidden-input"
            title="Upload a CSV file"
            placeholder="Choose a file"
            disabled={isProcessing}
          />

          {/* Drop Zone */}
          <div
            className={`dropzone ${isDragActive ? "active" : ""} ${
              file ? "has-file" : ""
            } ${isProcessing ? "processing" : ""}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={onButtonClick}
          >
            <div className="dropzone-content">
              {!file ? (
                <>
                  <FaFileUpload className="upload-icon" />
                  <h3>Drag and drop your CSV file here</h3>
                  <p>or click to browse</p>
                  <span className="file-hint">Maximum file size: 5MB</span>
                </>
              ) : (
                <>
                  <FaFileCsv className="csv-icon" />
                  <h3>{file.name}</h3>
                  <p className="file-size">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                  {!isProcessing && (
                    <button
                      className="change-file-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                        setValidationInfo(null);
                        setError(null);
                      }}
                    >
                      Choose Different File
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Validation Results */}
          {validationInfo && !error && (
            <div className="validation-results">
              <div className="validation-header">
                <FaCheckCircle className="validation-icon" />
                <h3>File Validated Successfully</h3>
              </div>
              <div className="validation-stats">
                <div className="stat">
                  <span className="stat-label">Total Rows:</span>
                  <span className="stat-value">{validationInfo.total}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Valid Flashcards:</span>
                  <span className="stat-value valid">
                    {validationInfo.valid}
                  </span>
                </div>
                {validationInfo.invalid > 0 && (
                  <div className="stat">
                    <span className="stat-label">Skipped (Invalid):</span>
                    <span className="stat-value invalid">
                      {validationInfo.invalid}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="error-container">
              <FaExclamationTriangle className="error-icon" />
              <p>{error}</p>
            </div>
          )}

          {/* Import Button */}
          {file && validationInfo && !error && (
            <button
              className="import-button"
              onClick={handleImport}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <span className="spinner"></span>
                  Processing...
                </>
              ) : (
                <>
                  <FaCheckCircle className="import-icon" />
                  Import {validationInfo.valid} Flashcard
                  {validationInfo.valid !== 1 ? "s" : ""}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CSVImport;
