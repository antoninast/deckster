import { Schema, model, Document, Types } from "mongoose";

export interface ICardDeck extends Document {
  name: string;
  lastReview: Date | null;
  image_url: string | null;
  categoryName: string;
  userId: Types.ObjectId;
  isPublic: boolean;
  numberOfCards?: number; // Add this to interface
}

const cardDeckSchema = new Schema<ICardDeck>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    image_url: {
      type: String,
      default: null,
    },
    categoryName: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true }, // Enable virtuals when converting to JSON
    toObject: { virtuals: true },
  }
);

cardDeckSchema.virtual("numberOfCards", {
  ref: "Flashcard",
  localField: "_id",
  foreignField: "deckId",
  count: true, // return only the count
});

const CardDeck = model<ICardDeck>("CardDeck", cardDeckSchema);
export default CardDeck;
