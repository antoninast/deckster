export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  image_url: string | null;
  deckId: number; 
}
