export interface Flashcard {
    id?: number;
    question: string;
    answer: string;
    difficulty: number | null;
    attempts: number | null;
    correct: number | null;
    incorrect: number | null;
    lastReview: Date | null;
    image_url: string | null;
    Deck: {
        id: number | null;
        deckName: string | null;
    };
    Category: {
        id: number | null;
        category: string | null;
    };
}