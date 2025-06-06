import { useState } from "react";
import {
  FaCheckCircle,
} from "react-icons/fa";
import "./ManualImport.css";

interface ManualImportProps {
  onManualImportSubmit: (data: { question: string; answer: string }) => void;
}

const ManualImport: React.FC<ManualImportProps> = ({ onManualImportSubmit }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  const handleQuestionInput = (ev: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuestion(ev.target.value);
  };

  const handleAnswerInput = (ev: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAnswer(ev.target.value);
  };

  const handleSubmit = () => {
    if (!question.length || !answer.length) {
      alert('empty');
      return
    }

    onManualImportSubmit({ question, answer });
  };

  return (
    <div className="import-container manual">
      <div className="import-card">
        <div className="import-card-header">
          <h2>Create Flashcard</h2>
          <p className="import-subtitle">
            Add flashcards one by one to create your custom deck manually
          </p>
        </div>
        <div className="import-card-body">
           <div className="manual-import">
              <div className="form-floating mb-3">
                <h3>Question</h3>
                <textarea className="form-control question" onChange={handleQuestionInput} />
              </div>
              <div className="form-floating">
                <h3>Answer</h3>
                <textarea className="form-control answer" onChange={handleAnswerInput}/>
              </div>
            </div>
            <button className="import-button" onClick={handleSubmit}>
                <FaCheckCircle className="import-icon" />
                Import Flashcard
            </button>
        </div>
      </div>
    </div>
  );
};

export default ManualImport;
