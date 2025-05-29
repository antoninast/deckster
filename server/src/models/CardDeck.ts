import { Schema, model, Document, Types } from "mongoose";

export interface ICardDeck extends Document {
  name: string;
  lastReview: Date | null;
  image_url: string | null;
  categoryName: string;
  userId: Types.ObjectId;
  flashcardIds: Types.ObjectId[];
  isPublic: boolean;
}

const cardDeckSchema = new Schema<ICardDeck>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    lastReview: {
      type: Date,
      default: null,
    },
    image_url: {
      type: String,
      default: null,
    },
    categoryName: {
      type: String,
      required: true
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
    isPublic: {
      type: Boolean,
      default: false
    }
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
