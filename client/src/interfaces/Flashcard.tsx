export interface Flashcard {
  id: number;
  question: string;
  answer: string;
  image_url: string | null;
  deckId: number; 
}
