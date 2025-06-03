import { Schema, model, Document, Types } from "mongoose";
import { IStudyAttempt } from "./StudyAttempt";
import bcrypt from "bcrypt";

// Define an interface for the Profile document
export interface IProfile extends Document {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  fullName?: string;
  profilePicture?: string;
  lastLogin?: Date;
  securityQuestion: string;
  securityAnswer: string;
  isCorrectPassword(password: string): Promise<boolean>;
  studyAttempts: IStudyAttempt[];
  createdAt: Date;
  updatedAt: Date;
}

// Define the schema for the Profile document
const profileSchema = new Schema<IProfile>(
  {
    username: {
      // Changed from 'login'
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/.+@.+\..+/, "Must match an email address!"],
    },
    password: {
      type: String,
      required: true,
      minlength: 5,
    },
    securityQuestion: {
      type: String,
      required: true,
    },
    securityAnswer: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

// set up pre-save middleware to create password
profileSchema.pre<IProfile>("save", async function (next) {
  if (this.isNew || this.isModified("password")) {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }
  // Hash the security answer if it is modified or new
  if (this.isNew || this.isModified("securityAnswer")) {
    const saltRounds = 10;
    this.securityAnswer = await bcrypt.hash(this.securityAnswer, saltRounds);
  }
  next();
});

// compare the incoming password assert the hashed password
profileSchema.methods.isCorrectPassword = async function (
  password: string
): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

const Profile = model<IProfile>("Profile", profileSchema);

export default Profile;
