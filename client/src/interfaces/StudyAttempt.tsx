export interface StudyAttempt {
  _id: string;
  userId: string;
  flashcardId: string;
  deckId: string;
  isCorrect: boolean;
  timestamp: Date;
  studySessionId: string;
  createdAt: Date;
  updatedAt: Date;
}
