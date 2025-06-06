import { CardDeck, Flashcard, Profile, SecurityQuestion } from "../models/index.js";

const cleanDB = async (): Promise<void> => {
  try {
    const collections = [Profile, CardDeck, Flashcard, SecurityQuestion];
    
    for (const model of collections) {
      try {
        await model.collection.drop();
      } catch (err) {
        throw err;
      }
    }

    console.log("All collections dropped.");
  } catch (err) {
    console.error("Error dropping collections:", err);
    process.exit(1);
  }
};

export default cleanDB;
