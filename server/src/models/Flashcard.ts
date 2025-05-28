import { Schema, model, Document, Types } from "mongoose";

export interface IFlashcard extends Document {
  _id: Types.ObjectId;
  question: string; // front of the flashcard
  answer: string; // back of the flashcard
  image_url: string;
  deckId: Types.ObjectId; // flashcard can only belong ton one deck
}

const flashcardSchema = new Schema<IFlashcard>(
  {
    _id: {
      type: Schema.Types.ObjectId,
      ref: "",
      required: true,
    },
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
