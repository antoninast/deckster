export interface CardDeck {
    _id: number;
    name: string;
    lastReview: Date;
    image_url: string;
    categoryName: string;
    isPublic: boolean
}