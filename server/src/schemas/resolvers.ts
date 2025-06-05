import { Profile, CardDeck, Flashcard, StudyAttempt } from "../models/index.js";
import { IProfile } from "../models/Profile.js";
import type { IFlashcard } from "../models/Flashcard.js";
import { ICardDeck } from "../models/CardDeck.js";
import { signToken, AuthenticationError } from "../utils/auth.js";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";

// Making it so that the ProfileArgs can be either profileId or username, but not both at the same time -JH
type ProfileArgs = 
  | { profileId: string, username: undefined }
  | { username: string, profileId: undefined };

interface AddProfileArgs {
  input: {
    username: string;
    email: string;
    password: string;
    securityQuestion: string;
    securityAnswer: string;
  };
}

interface FlashcardInput {
  question: string;
  answer: string;
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
      profileRef : ProfileArgs
    ): Promise<IProfile | null> => {
      if (profileRef.profileId) {
        return await Profile.findOne({ _id: profileRef.profileId });
      } else if (profileRef.username) {
        return await Profile.findOne({ username: profileRef.username });
      } else {
        throw new Error("You must provide either a profileId or username");
      }
    },

    me: async (
      _parent: any,
      _args: any,
      context: Context
    ): Promise<IProfile | null> => {
      if (context.user) {
        return await Profile.findOne({ _id: context.user._id });
      }
      throw new AuthenticationError('You must be logged in to perform this action');
    },

    compareSecurityAnswers: async (
      _parent: any,
      { username, securityAnswer }: { username: string; securityAnswer: string }
    ): Promise<boolean> => {

      const profile = await Profile.findOne({ username });
      if (!profile) {
        throw new AuthenticationError('Username not found.');
      } else {
        return await bcrypt.compare(securityAnswer, profile.securityAnswer);
      }
    },

    cardDecks: async (
      _parent: any,
      { isPublic }: { isPublic?: boolean }
    ): Promise<ICardDeck[]> => {
      const query = isPublic === true ? { isPublic: true } : {};
      return await CardDeck.find(query).populate("userId", "_id username");
    },

    cardDecksByUser: async (
      _parent: any,
      { userId }: { userId: string }
    ): Promise<ICardDeck[]> => {
      const objectId = new ObjectId(userId);
      return await CardDeck.find({ userId: objectId });
    },

    myCardDecks: async (
      _parent: any,
      _args: any,
      context: Context
    ): Promise<ICardDeck[]> => {
      if (context.user) {
        return await CardDeck.find({ userId: context.user._id }).populate("userId", "_id username");;
      }
      throw new AuthenticationError('You must be logged in to perform this action');
    },

    cardDeck: async (
      _parent: any,
      { deckId }: { deckId: string }
    ): Promise<ICardDeck | null> => {
      return await CardDeck.findOne({ _id: deckId });
    },

    flashcards: async (): Promise<IFlashcard[]> => {
      return await Flashcard.find();
    },

    flashcardsByDeck: async (
      _parent: any,
      { deckId }: { deckId: string }
    ): Promise<IFlashcard[]> => {
      const objectId = new ObjectId(deckId);
      return await Flashcard.find({ deckId: objectId });
    },

    flashcard: async (
      _parent: any,
      { flashcardId }: { flashcardId: string }
    ): Promise<IFlashcard | null> => {
      return await Flashcard.findOne({ _id: flashcardId });
    },

    sessionStats: async (
      _parent: any,
      { studySessionId }: { studySessionId: string },
      context: Context
    ) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to perform this action');
      }

      const userId = new mongoose.Types.ObjectId(context.user._id);

      const results = await StudyAttempt.aggregate([
        {
          $match: {
            userId,
            studySessionId,
          },
        },
        {
          $group: {
            _id: null,
            totalAttempts: { $sum: 1 },
            correctAttempts: { $sum: { $cond: ["$isCorrect", 1, 0] } },
          },
        },
        {
          $addFields: {
            sessionAccuracy: {
              $multiply: [
                { $divide: ["$correctAttempts", "$totalAttempts"] },
                100,
              ],
            },
          },
        },
        {
          $project: {
            _id: 0,
            totalAttempts: 1,
            correctAttempts: 1,
            sessionAccuracy: 1,
          },
        },
      ]);

      return (
        results[0] || {
          totalAttempts: 0,
          correctAttempts: 0,
          sessionAccuracy: 0,
        }
      );
    },

    recentSessionsStats: async (
      _parent: any,
      { deckId, limit = 10 }: { deckId: string; limit?: number },
      context: Context
    ) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to perform this action');
      }

      const userId = new mongoose.Types.ObjectId(context.user._id);
      const deckObjectId = new mongoose.Types.ObjectId(deckId);

      // Get unique session IDs, sorted by most recent
      const sessions = await StudyAttempt.aggregate([
        {
          $match: {
            userId,
            deckId: deckObjectId,
            studySessionId: { $ne: null },
          },
        },
        {
          $sort: { createdAt: -1 },
        },
        {
          $group: {
            _id: "$studySessionId",
            timestamp: { $first: "$createdAt" },
          },
        },
        {
          $limit: limit,
        },
      ]);

      // Calculate stats for each session
      const sessionStats = await Promise.all(
        sessions.map(async (session) => {
          const stats = await StudyAttempt.aggregate([
            {
              $match: {
                userId,
                deckId: deckObjectId,
                studySessionId: session._id,
              },
            },
            {
              $group: {
                _id: null,
                totalAttempts: { $sum: 1 },
                correctAttempts: { $sum: { $cond: ["$isCorrect", 1, 0] } },
              },
            },
          ]);

          return {
            studySessionId: session._id,
            timestamp: session.timestamp,
            totalAttempts: stats[0]?.totalAttempts || 0,
            correctAttempts: stats[0]?.correctAttempts || 0,
            sessionAccuracy: stats[0]
              ? (stats[0].correctAttempts / stats[0].totalAttempts) * 100
              : 0,
          };
        })
      );

      return sessionStats;
    },
  },

  Mutation: {
    addProfile: async (
      _parent: any,
      { input }: AddProfileArgs
    ): Promise<{ token: string; profile: IProfile }> => {
      const profile = await Profile.create({ ...input });
      const token = signToken(profile.username, profile.email, profile._id);
      return { token, profile };
    },

    // Uncomment this section if you want to use email/password login
    // login: async (
    //   _parent: any,
    //   { email, password }: { email: string; password: string }
    // ): Promise<{ token: string; profile: IProfile }> => {
    //   const profile = await Profile.findOne({ email });
    //   if (!profile) {
    //     throw AuthenticationError;
    //   }
    //   const correctPw = await profile.isCorrectPassword(password);
    //   if (!correctPw) {
    //     throw AuthenticationError;
    //   }
    //   const token = signToken(profile.username, profile.email, profile._id);
    //   return { token, profile };
    // },

    // Login using username and password instead of email
    login: async (
      _parent: any,
      { username, password }: { username: string; password: string }
    ): Promise<{ token: string; profile: IProfile }> => {
      const profile = await Profile.findOne({ username });
      if (!profile) {
        throw new AuthenticationError('Username is not found.');
      }
      const correctPw = await profile.isCorrectPassword(password);
      if (!correctPw) {
        throw new AuthenticationError('Password is wrong.');
      }
      const token = signToken(profile.username, profile.email, profile._id);
      return { token, profile };
    },

    addCardDeck: async (
      _parent: any,
      { input }: { input: ICardDeck },
      context: Context
    ): Promise<ICardDeck> => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to perform this action');
      }
      const cardDeck = await CardDeck.create(input);
      return cardDeck;
    },

    updateCardDeck: async (
      _parent: any,
      { deckId, input }: { deckId: string; input: ICardDeck },
      context: Context
    ): Promise<ICardDeck | null> => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to perform this action');
      }
      return await CardDeck.findByIdAndUpdate(deckId, input, {
        new: true,
        runValidators: true,
      });
    },

    removeCardDeck: async (
      _parent: any,
      { deckId }: { deckId: string },
      context: Context
    ): Promise<ICardDeck | null | any> => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to perform this action');
      }
      const objectId = new ObjectId(deckId);
      const deck = await CardDeck.findById(objectId);
      if (!deck) {
        throw new Error(`Deck with id ${deckId} does not exist.`);
      }
      if (context.user._id.toString() !== deck.userId.toString()) {
        throw new Error('Only the owner of the deck can delete it.');
      }
      await Flashcard.deleteMany({ deckId });
      return await CardDeck.findByIdAndDelete(objectId);
    },

    addFlashcard: async (
      _parent: any,
      { input }: { input: IFlashcard },
      context: Context
    ): Promise<IFlashcard> => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to perform this action');
      }
      const flashcard = await Flashcard.create(input);
      return flashcard;
    },

    updateFlashcard: async (
      _parent: any,
      { flashcardId, input }: { flashcardId: string; input: IFlashcard },
      context: Context
    ): Promise<IFlashcard | null> => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to perform this action');
      }
      return await Flashcard.findByIdAndUpdate(flashcardId, input, {
        new: true,
        runValidators: true,
      });
    },

    removeFlashcard: async (
      _parent: any,
      { flashcardId }: { flashcardId: string },
      context: Context
    ): Promise<IFlashcard | null> => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to perform this action');
      }

      const flashcard = await Flashcard.findById(flashcardId);
      const deck = await CardDeck.findById(flashcard?.deckId);
      if (context.user._id.toString() !== deck?.userId.toString()) {
        throw new Error('Only the owner of the deck can delete the flashcards associated with the it.');
      }
      return await Flashcard.findByIdAndDelete(flashcardId);
    },

    reviewFlashcard: async (
      _parent: any,
      {
        flashcardId,
        correct,
        studySessionId,
      }: {
        flashcardId: string;
        correct: boolean;
        studySessionId: string;
      },
      context: Context
    ): Promise<IFlashcard | null> => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to perform this action');
      }

      const userId = new mongoose.Types.ObjectId(context.user._id);
      const deckId = (await Flashcard.findById(flashcardId))?.deckId;

      if (!deckId) {
        throw new Error("Deck not found for the provided flashcard.");
      }

      // Create study attempt record
      await StudyAttempt.create({
        userId,
        flashcardId: new mongoose.Types.ObjectId(flashcardId),
        deckId: new mongoose.Types.ObjectId(deckId),
        isCorrect: correct,
        studySessionId,
      });

      return await Flashcard.findById(flashcardId);
    },

    addMultipleFlashcards: async (
      _parent: any,
      { deckId, flashcards }: { deckId: string; flashcards: FlashcardInput[] },
      context: Context
    ): Promise<IFlashcard[]> => {
      if (!context.user) {
        throw new AuthenticationError("You must be logged in");
      }

      try {
        // Validate input
        if (!deckId) {
          throw new Error("DeckId is required");
        }

        if (
          !flashcards ||
          !Array.isArray(flashcards) ||
          flashcards.length === 0
        ) {
          throw new Error("Flashcards array is required and must not be empty");
        }

        // Validate each flashcard has required fields
        flashcards.forEach((fc: FlashcardInput, index: number) => {
          if (!fc.question || !fc.answer) {
            throw new Error(
              `Flashcard at index ${index} is missing question or answer`
            );
          }
        });

        // Verify deck exists and user owns it
        const deck = await CardDeck.findById(deckId);
        if (!deck) {
          throw new Error(`Deck not found with ID: ${deckId}`);
        }

        if (deck.userId.toString() !== context.user._id.toString()) {
          throw new Error("Unauthorized: You do not own this deck");
        }

        // Create flashcard documents
        const flashcardDocs = flashcards.map((fc: FlashcardInput) => ({
          question: fc.question.trim(),
          answer: fc.answer.trim(),
          deckId: new mongoose.Types.ObjectId(deckId),
          image_url: null,
        }));

        // Bulk insert flashcards
        const createdFlashcards = await Flashcard.insertMany(flashcardDocs);

        // Update deck with new flashcard IDs
        // const flashcardIds = createdFlashcards.map((fc) => fc._id);
        // await CardDeck.findByIdAndUpdate(deckId, {
        //   $push: { flashcardIds: { $each: flashcardIds } },
        // });

        return createdFlashcards;
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
  },

  // Field resolvers for computed fields
  CardDeck: {
    user: (parent: { userId: any; }) => parent.userId,
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

  Flashcard: {
    userStudyAttemptStats: async (
      parent: IFlashcard,
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
      const flashcardId = new mongoose.Types.ObjectId(parent._id.toString());

      const results = await StudyAttempt.aggregate([
        { $match: { userId: userId, flashcardId: flashcardId } },
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
