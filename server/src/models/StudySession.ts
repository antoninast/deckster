import { Schema, model, Document, Types } from "mongoose";

export interface IStudySession extends Document {
  userId: Types.ObjectId;
  deckId: Types.ObjectId;
  startTime: Date;
  endTime: Date | null;
  clientDuration: number; // duration from client in seconds
  calculatedDuration: number; // server-side validation
  totalAttempts: number;
  correctAttempts: number;
  status: "active" | "completed" | "abandoned";
  createdAt: Date;
  updatedAt: Date;
}

const studySessionSchema = new Schema<IStudySession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
      index: true,
    },
    deckId: {
      type: Schema.Types.ObjectId,
      ref: "CardDeck",
      required: true,
      index: true,
    },
    startTime: {
      type: Date,
      default: Date.now,
      required: true,
    },
    endTime: {
      type: Date,
      default: null,
    },
    clientDuration: {
      type: Number,
      required: true,
      default: 0,
    },
    calculatedDuration: {
      type: Number,
      default: 0,
    },
    totalAttempts: {
      type: Number,
      default: 0,
    },
    correctAttempts: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "completed", "abandoned"],
      default: "active",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Virtual for accuracy percentage with additional type safety
studySessionSchema.virtual("sessionAccuracy").get(function (): number {
  if (!this.totalAttempts || this.totalAttempts === 0) return 0;
  const accuracy = (this.correctAttempts / this.totalAttempts) * 100;
  // Round to whole number and ensure valid range
  return Math.min(Math.max(Math.round(accuracy) / 100, 0), 100);
});

// Pre-save middleware to validate duration
studySessionSchema.pre("save", function (next) {
  if (this.endTime && this.startTime) {
    const serverDuration = Math.floor(
      (this.endTime.getTime() - this.startTime.getTime()) / 1000
    );
    // Allow for small discrepancy between client and server duration
    const discrepancy = Math.abs(serverDuration - this.clientDuration);
    if (discrepancy > 300) {
      // 5 minute tolerance
      console.warn(
        `Large duration discrepancy detected for session ${this._id}`
      );
    }
    this.calculatedDuration = serverDuration;
  }
  next();
});

const StudySession = model<IStudySession>("StudySession", studySessionSchema);
export default StudySession;
