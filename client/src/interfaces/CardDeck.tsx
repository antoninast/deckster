export interface CardDeck {
    id: number;
    deckName: string;
    lastReview: Date | null;
    image_url: string | null;
    category: {
        id: number | null;
        name: string | null;
    };
}