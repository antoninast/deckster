export interface Flashcard {
  _id: string;
  question: string;
  answer: string;
  image_url: string | null;
  deckId: string;
  userStudyAttemptStats: {
    attemptAccuracy: number;
    correctAttempts: number;
    proficiency: string;
    totalAttempts: number;
  }
}
