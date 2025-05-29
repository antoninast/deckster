import db from '../config/connection.js';
import { CardDeck, Flashcard, Profile, SecurityQuestion } from '../models/index.js';
import profileSeeds from './profileData.json' with { type: "json" };
import cardDeckSeeds from './cardDeckData.json' with { type: "json" };
import flashcardDataSeeds from './flashcardData.json' with { type: "json" };
import profileData from './profileData.json' with { type: "json" };
import securityQuestionsData from './securityQuestions.json' with { type: "json" };
import cleanDB from './cleanDB.js';
import { Types } from 'mongoose';
import { hashPassword } from '../utils/auth.js';

const seedDatabase = async (): Promise<void> => {
  console.log('Seeding database...');
  // This was just here for testing purposes -JH
  // await Profile.collection.dropIndexes();
  // await Profile.collection.drop()
  // return;
  try {
    await db();
    await cleanDB();

    await Profile.insertMany(profileSeeds);
    await CardDeck.insertMany(cardDeckSeeds);

    const flashcardsWithDates = flashcardDataSeeds.map(card => ({
      ...card,
      lastReview: new Date(),
      _id: new Types.ObjectId()
    }));

    await Flashcard.insertMany(flashcardsWithDates);

    // Clear existing users
    await Profile.deleteMany({});

    // Hash passwords and create users
    const hashedProfiles = await Promise.all(
      profileData.map(async (user) => ({
        ...user,
        password: await hashPassword(user.password)
      }))
    );

    // Insert users with hashed passwords
    await Profile.insertMany(hashedProfiles);

    await SecurityQuestion.deleteMany({});
    await SecurityQuestion.insertMany(securityQuestionsData);

    console.log('Seeding completed successfully!');
    process.exit(0);

  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error seeding database:', error.message);
    } else {
      console.error('Unknown error seeding database');
    }
    process.exit(1);
  }
};

seedDatabase();
