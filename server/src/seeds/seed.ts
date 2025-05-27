import db from '../config/connection';
import { CardDeck, Flashcard, Profile } from '../models/index.js';
import profileSeeds from './profileData.json' with { type: "json" };
import cardDeckSeeds from './cardDeckData.json' with { type: "json" };
import flashcardDataSeeds from './flashcardData.json' with { type: "json" };
import cleanDB from './cleanDB.js';
import { Types } from 'mongoose';

const seedDatabase = async (): Promise<void> => {
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
