export interface CardDeck {
    id?: number;
    deckName: string;
    lastReview: Date | null;
    image_url: string | null;
    Category: {
        id: number | null;
        category: string | null;
    };
}