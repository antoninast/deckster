export interface Flashcard {
  _id: string;
  question: string;
  answer: string;
  image_url: string | null;
  deckId: string;
}
