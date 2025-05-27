import { Schema, model, Document, Types } from "mongoose";

export interface IFlashcard extends Document {
  _id: Types.ObjectId;
  question: string;
  answer: string;
  difficulty: number;
  attempts: number;
  correct: number;
  lastReview: Date;
  image_url: string;
  // only planning to have one deck per flash card?
  deckId: Types.ObjectId;
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
    difficulty: {
      type: Number,
      default: 1,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    correct: {
      type: Number,
      default: 0,
    },
    lastReview: {
      type: Date,
      default: null,
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

// Define a virtual property 'fullName' with a getter
flashcardSchema.virtual("percentCorrect").get(function () {
  return (this.correct / this.attempts) * 100;
});

const Flashcard = model<IFlashcard>("Flashcard", flashcardSchema);
export default Flashcard;
