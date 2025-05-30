import { Profile, SecurityQuestion } from "../models/index.js";

const cleanDB = async (): Promise<void> => {
  try {
    // Drop the entire collection (removes indexes too)
    await Profile.collection.drop().catch(() => {
      console.log("Profile collection does not exist, creating new one.");
    });

    await SecurityQuestion.deleteMany({});
    console.log("Collections cleaned.");
    
  } catch (err) {
    console.error("Error cleaning collections:", err);
    process.exit(1);
  }
};

export default cleanDB;
