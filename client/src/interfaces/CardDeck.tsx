export interface CardDeck {
  _id: number;
  name: string;
  lastReview: Date;
  image_url: string;
  categoryName: string;
  userId: number;
  flashcardIds: number[];
  isPublic: boolean;
  userStudyAttemptStats?: {
    attemptAccuracy?: number;
    proficiency?: string;
  };
}
