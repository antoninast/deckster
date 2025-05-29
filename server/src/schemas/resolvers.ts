import { Profile, CardDeck, Flashcard, StudyAttempt } from "../models/index.js";
import { IProfile } from "../models/Profile.js";
import { IFlashcard } from "../models/Flashcard.js";
import { ICardDeck } from "../models/CardDeck.js";
import { signToken, AuthenticationError } from "../utils/auth.js";
import mongoose from "mongoose";
// import { parse } from 'csv-parse/sync'
// import { insertMany } from './db'

interface ProfileArgs {
  profileId: string;
}

interface AddProfileArgs {
  input: {
    login: string;
    email: string;
    password: string;
    securityQuestion: string;
    securityAnswer: string;
  };
}

interface Context {
  user?: IProfile;
}

const resolvers = {
  Query: {
    profiles: async (): Promise<IProfile[]> => {
      return await Profile.find();
    },
    profile: async (
      _parent: any,
      { profileId }: ProfileArgs
    ): Promise<IProfile | null> => {
      return await Profile.findOne({ _id: profileId });
    },
    me: async (
      _parent: any,
      _args: any,
      context: Context
    ): Promise<IProfile | null> => {
      if (context.user) {
        return await Profile.findOne({ _id: context.user._id });
      }
      throw AuthenticationError;
    },
    // cardDecks: [CardDeck]!
    cardDecks: async (
      _parent: any,
      { isPublic }: { isPublic?: boolean }
    ): Promise<ICardDeck[]> => {
      console.log("isPublic:", isPublic);
      // If isPublic is true, only return public decks
      const query = isPublic === true ? { isPublic: true } : {};
      console.log("Query filter:", query);
      return await CardDeck.find(query);
    },
    // cardDecksByUser(userId: ID!): [CardDeck]!
    cardDecksByUser: async (
      _parent: any,
      { userId }: { userId: string }
    ): Promise<ICardDeck[]> => {
      return await CardDeck.find({ userId });
    },
    // myCardDecks: [CardDeck]!
    myCardDecks: async (
      _parent: any,
      _args: any,
      context: Context
    ): Promise<ICardDeck[]> => {
      if (context.user) {
        return await CardDeck.find({ userId: context.user._id });
      }
      throw AuthenticationError;
    },
    // cardDeck(deckId: ID!): CardDeck
    cardDeck: async (
      _parent: any,
      { deckId }: { deckId: string }
    ): Promise<ICardDeck | null> => {
      return await CardDeck.findOne({ _id: deckId });
    },
    // flashcards: [Flashcard]!
    flashcards: async (): Promise<IFlashcard[]> => {
      return await Flashcard.find();
    },
    // flashcardsByDeck(deckId: ID!): [Flashcard]!
    flashcardsByDeck: async (
      _parent: any,
      { deckId }: { deckId: string }
    ): Promise<IFlashcard[]> => {
      return await Flashcard.find({ deckId });
    },
    // flashcard(flashcardId: ID!): Flashcard
    flashcard: async (
      _parent: any,
      { flashcardId }: { flashcardId: string }
    ): Promise<IFlashcard | null> => {
      return await Flashcard.findOne({ _id: flashcardId });
    },
  },
  Mutation: {
    //TODO: Hash the profile password before saving
    addProfile: async (
      _parent: any,
      { input }: AddProfileArgs
    ): Promise<{ token: string; profile: IProfile }> => {
      const profile = await Profile.create({ ...input });
      const token = signToken(profile.login, profile.email, profile._id);
      return { token, profile };
    },
    login: async (
      _parent: any,
      { email, password }: { email: string; password: string }
    ): Promise<{ token: string; profile: IProfile }> => {
      const profile = await Profile.findOne({ email });
      if (!profile) {
        throw AuthenticationError;
      }
      const correctPw = await profile.isCorrectPassword(password);
      if (!correctPw) {
        throw AuthenticationError;
      }
      const token = signToken(profile.login, profile.email, profile._id);
      return { token, profile };
    },
    // addCardDeck(input: CardDeckInput!): CardDeck
    addCardDeck: async (
      _parent: any,
      { input }: { input: ICardDeck }
    ): Promise<ICardDeck> => {
      const cardDeck = await CardDeck.create(input);
      return cardDeck;
    },
    // updateCardDeck(deckId: ID!, input: CardDeckInput!): CardDeck
    updateCardDeck: async (
      _parent: any,
      { deckId, input }: { deckId: string; input: ICardDeck }
    ): Promise<ICardDeck | null> => {
      return await CardDeck.findByIdAndUpdate(deckId, input, {
        new: true,
        runValidators: true,
      });
    },
    // removeCardDeck(deckId: ID!): CardDeck
    removeCardDeck: async (
      _parent: any,
      { deckId }: { deckId: string }
    ): Promise<ICardDeck | null> => {
      return await CardDeck.findByIdAndDelete(deckId);
    },
    // addFlashcard(input: FlashcardInput!): Flashcard
    addFlashcard: async (
      _parent: any,
      { input }: { input: IFlashcard }
    ): Promise<IFlashcard> => {
      const flashcard = await Flashcard.create(input);
      return flashcard;
    },
    // updateFlashcard(flashcardId: ID!, input: FlashcardInput!): Flashcard
    updateFlashcard: async (
      _parent: any,
      { flashcardId, input }: { flashcardId: string; input: IFlashcard }
    ): Promise<IFlashcard | null> => {
      return await Flashcard.findByIdAndUpdate(flashcardId, input, {
        new: true,
        runValidators: true,
      });
    },
    // removeFlashcard(flashcardId: ID!): Flashcard
    removeFlashcard: async (
      _parent: any,
      { flashcardId }: { flashcardId: string }
    ): Promise<IFlashcard | null> => {
      return await Flashcard.findByIdAndDelete(flashcardId);
    },
    // reviewFlashcard(flashcardId: ID!, correct: Boolean!): Flashcard
    reviewFlashcard: async (
      _parent: any,
      { flashcardId, correct }: { flashcardId: string; correct: boolean },
      context: Context
    ): Promise<IFlashcard | null> => {
      if (!context.user) {
        throw AuthenticationError;
      }

      const userId = new mongoose.Types.ObjectId(context.user._id);
      const deckId = (await Flashcard.findById(flashcardId))?.deckId;

      if (!deckId) {
        throw new Error("Deck not found for the provided flashcard.");
      }

      // Create a new study attempt
      await StudyAttempt.create({
        userId,
        flashcardId: new mongoose.Types.ObjectId(flashcardId),
        deckId: new mongoose.Types.ObjectId(deckId),
        isCorrect: correct,
        timestamp: new Date(),
      });

      // Return the updated flashcard
      return await Flashcard.findById(flashcardId);
    },

    //JH: Add import_csv resolver
    // import_csv: async (_: any, { csvData}: { csvData: string}) => {
    //   try {
    //     const records = parse(csvData, {
    //       columns: true,
    //       skip_empty_lines: true,
    //     });
    //     await insertMany(records);

    //     return true;
    //   } catch (error) {
    //     console.error('Eeks! Error importing CSV:', error);
    //     return false;
    //   }
    // },
  },

  CardDeck: {
    userStudyAttemptStats: async (
      parent: ICardDeck,
      _args: any,
      context: Context
    ) => {
      if (!context.user) {
        return {
          totalAttempts: 0,
          correctAttempts: 0,
          attemptAccuracy: 0,
          proficiency: "No Data",
        };
      }

      const userId = new mongoose.Types.ObjectId(context.user._id);
      const deckId = new mongoose.Types.ObjectId(parent._id as string);

      const results = await StudyAttempt.aggregate([
        { $match: { userId: userId, deckId: deckId } },
        {
          $group: {
            _id: null,
            totalAttempts: { $sum: 1 },
            correctAttempts: { $sum: { $cond: ["$isCorrect", 1, 0] } },
          },
        },
        {
          // add attemptAccuracy as a new field based on the grouped data
          $addFields: {
            attemptAccuracy: {
              $cond: [
                { $eq: ["$totalAttempts", 0] },
                0,
                {
                  $multiply: [
                    { $divide: ["$correctAttempts", "$totalAttempts"] },
                    100,
                  ],
                },
              ],
            },
          },
        },
        {
          // project the final fields using attemptAccuracy
          $project: {
            _id: 0, // dont include _id in the output
            totalAttempts: 1,
            correctAttempts: 1,
            attemptAccuracy: 1,
            proficiency: {
              $switch: {
                branches: [
                  {
                    case: { $gte: ["$attemptAccuracy", 95] },
                    then: "Mastered",
                  },
                  {
                    case: { $gte: ["$attemptAccuracy", 85] },
                    then: "Advanced",
                  },
                  {
                    case: { $gte: ["$attemptAccuracy", 75] },
                    then: "Proficient",
                  },
                  {
                    case: { $gte: ["$attemptAccuracy", 65] },
                    then: "Developing",
                  },
                  { case: { $gte: ["$attemptAccuracy", 0] }, then: "Beginner" },
                ],
                default: "No Data",
              },
            },
          },
        },
      ]);

      return (
        results[0] || {
          totalAttempts: 0,
          correctAttempts: 0,
          attemptAccuracy: 0,
          proficiency: "No Data",
        }
      );
    },
  },

  Flashcard: {
    userStudyAttemptStats: async (
      parent: IFlashcard, // Ensure this parent type is correct
      _args: any,
      context: Context
    ) => {
      if (!context.user) {
        return {
          totalAttempts: 0,
          correctAttempts: 0,
          attemptAccuracy: 0,
          proficiency: "No Data",
        };
      }

      const userId = new mongoose.Types.ObjectId(context.user._id);
      const flashcardId = new mongoose.Types.ObjectId(parent._id.toString()); // Robust conversion

      const results = await StudyAttempt.aggregate([
        { $match: { userId: userId, flashcardId: flashcardId } }, // <-- Match on flashcardId
        {
          $group: {
            _id: null,
            totalAttempts: { $sum: 1 },
            correctAttempts: { $sum: { $cond: ["$isCorrect", 1, 0] } },
          },
        },
        {
          $addFields: {
            attemptAccuracy: {
              $cond: [
                { $eq: ["$totalAttempts", 0] },
                0,
                {
                  $multiply: [
                    { $divide: ["$correctAttempts", "$totalAttempts"] },
                    100,
                  ],
                },
              ],
            },
          },
        },
        {
          $project: {
            _id: 0,
            totalAttempts: 1,
            correctAttempts: 1,
            attemptAccuracy: 1,
            proficiency: {
              $switch: {
                branches: [
                  {
                    case: { $gte: ["$attemptAccuracy", 95] },
                    then: "Mastered",
                  },
                  {
                    case: { $gte: ["$attemptAccuracy", 85] },
                    then: "Advanced",
                  },
                  {
                    case: { $gte: ["$attemptAccuracy", 75] },
                    then: "Proficient",
                  },
                  {
                    case: { $gte: ["$attemptAccuracy", 65] },
                    then: "Developing",
                  },
                  { case: { $gte: ["$attemptAccuracy", 0] }, then: "Beginner" },
                ],
                default: "No Data",
              },
            },
          },
        },
      ]);

      return (
        results[0] || {
          totalAttempts: 0,
          correctAttempts: 0,
          attemptAccuracy: 0,
          proficiency: "No Data",
        }
      );
    },
  },
};

export default resolvers;
