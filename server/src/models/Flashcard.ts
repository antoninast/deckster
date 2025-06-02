import { Schema, model, Document, Types } from "mongoose";

export interface IFlashcard extends Document {
  _id: Types.ObjectId;
  question: string;
  answer: string;
  image_url: string | null;
  deckId: Types.ObjectId;
}

/**
 * Flashcard model represents a single study flashcard
 * Each flashcard belongs to a specific deck and contains a question/answer pair
 */
const flashcardSchema = new Schema<IFlashcard>(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    answer: {
      type: String,
      required: true,
      trim: true,
    },
    image_url: {
      type: String,
      default: null,
    },
    deckId: {
      type: Schema.Types.ObjectId,
      ref: "CardDeck",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Flashcard = model<IFlashcard>("Flashcard", flashcardSchema);
export default Flashcard;
