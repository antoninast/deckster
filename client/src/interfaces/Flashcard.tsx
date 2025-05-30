export interface Flashcard {
  _id: number;
  question: string;
  answer: string;
  image_url: string | null;
  deckId: string;
}
