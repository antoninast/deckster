import { Schema, model, Document, Types } from "mongoose";

export interface IStudyAttempt extends Document {
  userId: Types.ObjectId;
  flashcardId: Types.ObjectId;
  deckId: Types.ObjectId;
  isCorrect: Boolean;
  timestamp: Date;
  // adding this in case we want to track eprformance over time
  // client side can generate a Universal unique identifier for each study session
  studySessionId: Types.ObjectId;
  createdAt: Date;
  // updatedAt probably wont be needed
  updatedAt: Date;
}

const studyAttemptSchema = new Schema<IStudyAttempt>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
    },
    flashcardId: {
      type: Schema.Types.ObjectId,
      ref: "Flashcard",
      required: true,
    },
    deckId: {
      type: Schema.Types.ObjectId,
      ref: "CardDeck",
      required: true,
    },
    isCorrect: {
      type: Boolean,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    studySessionId: {
      type: Schema.Types.ObjectId,
      ref: "StudySession",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const StudyAttempt = model<IStudyAttempt>("StudyAttempt", studyAttemptSchema);
export default StudyAttempt;
