export interface CardDeck {
  _id: string;
  name: string;
  lastReview: Date;
  image_url: string;
  categoryName: string;
  user: {
    username: string;
    _id: string;
  }
  // flashcardIds: number[];
  numberOfCards?: number;
  userStudyAttemptStats?: {
    attemptAccuracy?: number;
    proficiency?: string;
  };
  isPublic: boolean;
  leaderBoard: {
      username: string,
      totalAttempts: number,
      correctAttempts: number,
      attemptAccuracy: number,
    }[];
}
