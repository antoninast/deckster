export interface Flashcard {
    id: number;
    question: string;
    answer: string;
    difficulty: number | null;
    attempts: number | null;
    correct: number | null;
    lastReview: Date | null;
    image_url: string | null;
    deck: {
        id: number | null;
        name: string | null;
    };
    category: {
        id: number | null;
        name: string | null;
    };
}