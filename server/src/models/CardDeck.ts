import { Schema, model, Document, Types } from "mongoose";

export interface ICardDeck extends Document {
  deckName: string;
  image_url: string | null;
  categoryId: Types.ObjectId; // doesn't this require a Category model?
  userId: Types.ObjectId;
  flashcardIds: Types.ObjectId[];
  // adding as optional so user can see difficulty of deck
  numberOfCards: number;
  createdAt: Date;
  updatedAt: Date;
}

const cardDeckSchema = new Schema<ICardDeck>(
  {
    deckName: {
      type: String,
      required: true,
      trim: true,
    },
    image_url: {
      type: String,
      default: null,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
    },
    flashcardIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Flashcard",
        required: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

cardDeckSchema.virtual("numberOfCards").get(function () {
  return this.flashcardIds.length;
});

const CardDeck = model<ICardDeck>("CardDeck", cardDeckSchema);
export default CardDeck;
