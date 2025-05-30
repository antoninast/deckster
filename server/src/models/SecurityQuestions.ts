import { Schema, model, Document, Types } from "mongoose";

export interface ISecurityQuestion extends Document {
  _id: Types.ObjectId;
  question: string;
}

const securityQuestionsSchema = new Schema<ISecurityQuestion>(
  {
    _id: {
      type: Schema.Types.ObjectId,
      ref: "",
      // required: true,
    },
    question: {
      type: String,
      required: true,
      trim: true,
    }
  },
  {
    timestamps: true,
  }
);

const SecurityQuestion = model<ISecurityQuestion>("SecurityQuestion", securityQuestionsSchema);
export default SecurityQuestion;
