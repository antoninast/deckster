import { Schema, model, Document, Types } from "mongoose";
import { IStudyAttempt } from "./StudyAttempt";
import bcrypt from "bcrypt";

// Define an interface for the Profile document
export interface IProfile extends Document {
  _id: Types.ObjectId;
  login: string;
  email: string;
  password: string;
  fullName?: string;
  profilePicture?: string;
  lastLogin?: Date;
  securityQuestion?: string;
  securityAnswer?: string;
  isCorrectPassword(password: string): Promise<boolean>;
  studyAttempts: IStudyAttempt[];
  createdAt: Date;
  updatedAt: Date;
}

// Define the schema for the Profile document
const profileSchema = new Schema<IProfile>(
  {
    login: {
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
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

profileSchema.virtual("studyAttempts", {
  ref: "StudyAttempt",
  localField: "_id",
  foreignField: "userId",
  justOne: false,
  // Sort by most recent attempts first
  options: { sort: { createdAt: -1 } },
});

// set up pre-save middleware to create password
profileSchema.pre<IProfile>("save", async function (next) {
  if (this.isNew || this.isModified("password")) {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
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
