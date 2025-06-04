import db from '../config/connection.js';
import { CardDeck, Flashcard, Profile, SecurityQuestion } from '../models/index.js';
import cardDeckSeeds from './cardDeckData.json' with { type: "json" };
import flashcardDataSeeds from './flashcardData.json' with { type: "json" };
import profileData from './profileData.json' with { type: "json" };
import securityQuestionsData from './securityQuestions.json' with { type: "json" };
import cleanDB from './cleanDB.js';
import { Types } from 'mongoose';
import { hashPassword } from '../utils/auth.js';

const seedDatabase = async (): Promise<void> => {
  console.log('Seeding database...');
  try {
    await db();
    await cleanDB();

    // Hash passwords and create users
    const hashedProfiles = await Promise.all(
      profileData.map(async (user) => ({
        ...user,
        password: await hashPassword(user.password)
      }))
    );

    // Insert users with hashed passwords
    const insertedProfiles = await Profile.insertMany(hashedProfiles);
    console.log('User profiles seeded.');

    // Link userIds in decks
    const updatedDecks = cardDeckSeeds.map((deck, idx) => ({
      ...deck,
      userId: insertedProfiles[idx % insertedProfiles.length]._id,
    }));
    const insertedDecks = await CardDeck.insertMany(updatedDecks);
    console.log('Decks seeded.');

    const flashcards = flashcardDataSeeds.map((card, idx) => {
      const deckIndex = Math.floor(idx / 5);
      const deckId= (insertedDecks[deckIndex] as any)?._id;
      
      return {
        ...card,
        lastReview: new Date(),
        _id: new Types.ObjectId(),
        deckId
      }
    });
    await Flashcard.insertMany(flashcards);
    console.log('Flashcards seeded.');

    await SecurityQuestion.insertMany(securityQuestionsData);
    console.log('Security questions seeded.');

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
