import {
  Profile,
  CardDeck,
  Flashcard,
  StudyAttempt,
  StudySession,
} from "../models/index.js";
import { IProfile } from "../models/Profile.js";
import type { IFlashcard } from "../models/Flashcard.js";
import { ICardDeck } from "../models/CardDeck.js";
import { signToken, AuthenticationError } from "../utils/auth.js";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";

// Making it so that the ProfileArgs can be either profileId or username, but not both at the same time -JH
type ProfileArgs =
  | { profileId: string; username: undefined }
  | { username: string; profileId: undefined };

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
      profileRef: ProfileArgs
    ): Promise<IProfile | null> => {
      if (profileRef.profileId) {
        return await Profile.findOne({ _id: profileRef.profileId });
      } else if (profileRef.username) {
        // return await Profile.findOne({ username: profileRef.username });
        return await Profile.findOne({
          $expr: {
            $eq: [{ $toLower: "$username" }, profileRef.username.toLowerCase()],
          },
        });
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
      throw new AuthenticationError(
        "You must be logged in to perform this action"
      );
    },

    compareSecurityAnswers: async (
      _parent: any,
      { username, securityAnswer }: { username: string; securityAnswer: string }
    ): Promise<boolean> => {
      const profile = await Profile.findOne({ username });
      if (!profile) {
        throw new AuthenticationError("Username not found.");
      } else {
        return await bcrypt.compare(securityAnswer, profile.securityAnswer);
      }
    },

    cardDecks: async (
      _parent: any,
      { isPublic }: { isPublic?: boolean }
    ): Promise<ICardDeck[]> => {
      const query = isPublic === true ? { isPublic: true } : {};
      const decks = await CardDeck.find(query)
        .populate("userId", "_id username")
        .populate("numberOfCards");

      const deckIds = decks.map(deck => deck._id);
      const topUsersByDeck = await StudyAttempt.aggregate([
        {
          $match: {
            deckId: { $in: deckIds },
          },
        },
        {
          $group: {
            _id: { deckId: "$deckId", userId: "$userId" },
            totalAttempts: { $sum: 1 },
            correctAttempts: {
              $sum: { $cond: ["$isCorrect", 1, 0] },
            },
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
        // Join user data
        {
          $lookup: {
            from: "profiles", // or "users", depending on your model
            localField: "_id.userId",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: "$user", // Unwrap single user object
        },
        {
          $group: {
            _id: "$_id.deckId",
            users: {
              $push: {
                username: "$user.username",
                userId: "$_id.userId", // keep it if you want both
                totalAttempts: "$totalAttempts",
                correctAttempts: "$correctAttempts",
                attemptAccuracy: "$attemptAccuracy",
              },
            },
          },
        },
        {
          $project: {
            topUsers: {
              $slice: [
                {
                  $sortArray: {
                    input: "$users",
                    sortBy: { attemptAccuracy: -1 },
                  },
                },
                5,
              ],
            },
          },
        },
      ]);


      // 3. Build a map of topUsers by deckId
      const topUsersMap = new Map<string, any>();
      topUsersByDeck.forEach((entry) => {
        topUsersMap.set(entry._id.toString(), entry.topUsers);
      });

      // 4. Attach topUsers to each deck
      return decks.map((deck: any) => {
        const topUsers = topUsersMap.get(deck._id.toString()) || [];
        console.log('top users map ======> ', deck._id, topUsers);
        return {
          ...deck.toObject(),
          leaderBoard: topUsers,
        };
      });
    },

    cardDecksByUser: async (
      _parent: any,
      { userId }: { userId: string }
    ): Promise<ICardDeck[]> => {
      const objectId = new ObjectId(userId);
      return await CardDeck.find({ userId: objectId });
    },

    availableAvatars: async (): Promise<string[]> => {
      // Test data for available avatars
      // return [
      //   "/avatars/Abraham Baker.png",
      //   "/avatars/Adriana O'Sullivan.png",
      // ];

      // Fetch from a static directory or a database
      // Use Node's fs module to read files from the static avatars directory
      const avatarsDir = path.resolve(process.cwd(), "server/public/avatars");

      try {
        const files = fs.readdirSync(avatarsDir);
        // Filter for image files (png, jpg, jpeg, gif, svg)
        const avatarFiles = files.filter((file) =>
          /\.(png|jpe?g|gif|svg)$/i.test(file)
        );
        // Return as relative paths for frontend usage
        return avatarFiles.map((file) => `/avatars/${file}`);
      } catch (err) {
        console.error("Error reading avatars directory:", err);
        return [];
      }
    },

    myCardDecks: async (
      _parent: any,
      _args: any,
      context: Context
    ): Promise<ICardDeck[]> => {
      if (context.user) {
        return await CardDeck.find({ userId: context.user._id })
          .populate("userId", "_id username")
          .populate("numberOfCards");
      }
      throw new AuthenticationError(
        "You must be logged in to perform this action"
      );
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

    studySession: async (
      _parent: any,
      { studySessionId }: { studySessionId: string },
      context: Context
    ) => {
      if (!context.user) {
        throw new AuthenticationError(
          "You must be logged in to perform this action"
        );
      }

      const session = await StudySession.findById(studySessionId);
      if (!session) {
        throw new Error("Session not found");
      }

      if (session.userId.toString() !== context.user._id.toString()) {
        throw new Error("Unauthorized: Not your session");
      }

      return session; // Return the entire session object
    },

    myStudySessions: async (_parent: any, _args: any, context: Context) => {
      if (!context.user) {
        throw AuthenticationError;
      }

      const sessions = await StudySession.find({
        userId: context.user._id,
        status: { $in: ["completed", "abandoned"] },
      })
        .sort({ endTime: -1 })
        .select(
          "_id userId deckId startTime endTime totalAttempts correctAttempts status clientDuration sessionAccuracy"
        );

      return sessions;
    },

    userAchievementStats: async (
      _parent: any,
      _args: any,
      context: Context
    ) => {
      if (!context.user) {
        throw new AuthenticationError("You must be logged in");
      }

      const userId = context.user._id;

      // Get total sessions
      const totalSessions = await StudySession.countDocuments({
        userId,
        status: { $in: ["completed", "abandoned"] },
      });

      // Get total cards studied
      const totalCardsResult = await StudyAttempt.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: null, total: { $sum: 1 } } },
      ]);
      const totalCardsStudied = totalCardsResult[0]?.total || 0;

      // Get best accuracy from any deck
      const deckStats = await StudyAttempt.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        {
          $group: {
            _id: "$deckId",
            totalAttempts: { $sum: 1 },
            correctAttempts: { $sum: { $cond: ["$isCorrect", 1, 0] } },
          },
        },
        {
          $addFields: {
            accuracy: {
              $multiply: [
                { $divide: ["$correctAttempts", "$totalAttempts"] },
                100,
              ],
            },
          },
        },
        { $sort: { accuracy: -1 } },
        { $limit: 1 },
      ]);
      const bestAccuracy = deckStats[0]?.accuracy || 0;

      // Get fastest session
      const fastestSession = await StudySession.findOne({
        userId,
        status: "completed",
        clientDuration: { $gt: 0 },
      }).sort({ clientDuration: 1 });

      // Simple streak calculation (sessions on consecutive days)
      const recentSessions = await StudySession.find({
        userId,
        status: "completed",
      })
        .sort({ endTime: -1 })
        .limit(30);

      let currentStreak = 0;
      let lastDate: Date | null = null;

      for (const session of recentSessions) {
        const sessionDate = new Date(session.endTime!);
        sessionDate.setHours(0, 0, 0, 0);

        if (!lastDate) {
          currentStreak = 1;
          lastDate = sessionDate;
        } else {
          const dayDiff =
            (lastDate.getTime() - sessionDate.getTime()) /
            (1000 * 60 * 60 * 24);
          if (dayDiff === 1) {
            currentStreak++;
            lastDate = sessionDate;
          } else if (dayDiff > 1) {
            break;
          }
        }
      }

      return {
        totalSessions,
        totalCardsStudied,
        bestAccuracy,
        currentStreak,
        fastestSession: fastestSession?.clientDuration || null,
      };
    },

    recentStudySessions: async (
      _parent: any,
      { deckId, limit = 5 }: { deckId?: string | ""; limit?: number },
      context: Context
    ) => {
      if (!context.user) {
        throw new AuthenticationError(
          "You must be logged in to perform this action"
        );
      }

      const sessions = await StudySession.find({
        userId: context.user._id,
        status: { $in: ["completed", "abandoned"] },
        ...(deckId && { deckId: new mongoose.Types.ObjectId(deckId) }),
      })
        .populate("deckTitle")
        .sort({ endTime: -1 })
        .limit(limit)
        .select(
          "_id userId deckId startTime endTime totalAttempts correctAttempts status clientDuration sessionAccuracy deckTitle"
        );

      return sessions;
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
      // const profile = await Profile.findOne({ username: username.toLowerCase() });
      // const profile = await Profile.findOne({ username: {$regex: new RegExp(username.toLowerCase(), "i") }});

      const profile = await Profile.findOne({
        $expr: {
          $eq: [{ $toLower: "$username" }, username.toLowerCase()],
        },
      });

      if (!profile) {
        throw new AuthenticationError("Username is not found.");
      }
      const correctPw = await profile.isCorrectPassword(password);
      if (!correctPw) {
        throw new AuthenticationError("Password is wrong.");
      }
      const token = signToken(profile.username, profile.email, profile._id);
      return { token, profile };
    },

    resetPassword: async (
      _parent: any,
      {
        username,
        newPassword,
        securityAnswer,
      }: {
        username: string;
        newPassword: string;
        securityAnswer: string;
      }
    ): Promise<boolean> => {
      const profile = await Profile.findOne({ username });
      if (!profile) {
        throw new AuthenticationError("Username not found.");
      }
      const isAnswerCorrect = await bcrypt.compare(
        securityAnswer,
        profile.securityAnswer
      );
      if (!isAnswerCorrect) {
        throw new AuthenticationError("Security answer is incorrect.");
      }
      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      // Update the profile with the new password
      await Profile.findByIdAndUpdate(profile._id, {
        password: hashedPassword,
      });
      return true;
    },

    updateAvatar: async (
      _parent: any,
      { username, avatar }: { username: string; avatar: string }
    ): Promise<boolean> => {
      console.log("Updating avatar for:", username, "to", avatar);
      if (!username || !avatar) {
        throw new Error("Username and avatar are required");
      }
      const profile = await Profile.findOne({ username });
      // console.log("Found profile:", profile);
      if (!profile) {
        throw new Error("Profile not found");
      }
      await Profile.findByIdAndUpdate(profile._id, {
        profilePicture: avatar,
      });
      return true;
    },

    addCardDeck: async (
      _parent: any,
      { input }: { input: ICardDeck },
      context: Context
    ): Promise<ICardDeck> => {
      if (!context.user) {
        throw new AuthenticationError(
          "You must be logged in to perform this action"
        );
      }
      const cardDeckDoc = await CardDeck.create(input);
      const cardDeck = await cardDeckDoc.populate("numberOfCards");
      return cardDeck;
    },

    updateCardDeck: async (
      _parent: any,
      { deckId, input }: { deckId: string; input: ICardDeck },
      context: Context
    ): Promise<ICardDeck | null> => {
      if (!context.user) {
        throw new AuthenticationError(
          "You must be logged in to perform this action"
        );
      }

      const objectId = new ObjectId(deckId);
      const userId = new ObjectId(input.userId);
      input.userId = userId;
      return await CardDeck.findByIdAndUpdate(objectId, input, {
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
        throw new AuthenticationError(
          "You must be logged in to perform this action"
        );
      }
      const objectId = new ObjectId(deckId);
      const deck = await CardDeck.findById(objectId);
      if (!deck) {
        throw new Error(`Deck with id ${deckId} does not exist.`);
      }
      if (context.user._id.toString() !== deck.userId.toString()) {
        throw new Error("Only the owner of the deck can delete it.");
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
        throw new AuthenticationError(
          "You must be logged in to perform this action"
        );
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
        throw new AuthenticationError(
          "You must be logged in to perform this action"
        );
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
        throw new AuthenticationError(
          "You must be logged in to perform this action"
        );
      }

      const flashcard = await Flashcard.findById(flashcardId);
      const deck = await CardDeck.findById(flashcard?.deckId);
      if (context.user._id.toString() !== deck?.userId.toString()) {
        throw new Error(
          "Only the owner of the deck can delete the flashcards associated with the it."
        );
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
    ) => {
      if (!context.user) {
        throw new AuthenticationError(
          "You must be logged in to perform this action"
        );
      }

      const session = await StudySession.findById(studySessionId);
      if (!session || session.status !== "active") {
        throw new Error("Invalid or inactive study session");
      }

      const flashcard = await Flashcard.findById(flashcardId);
      if (!flashcard) {
        throw new Error("Flashcard not found");
      }

      // Create study attempt record
      await StudyAttempt.create({
        userId: context.user._id,
        flashcardId: new mongoose.Types.ObjectId(flashcardId),
        deckId: session.deckId,
        isCorrect: correct,
        studySessionId: new mongoose.Types.ObjectId(studySessionId),
      });

      return flashcard;
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

    startStudySession: async (
      _parent: any,
      { deckId }: { deckId: string },
      context: Context
    ) => {
      if (!context.user) {
        throw AuthenticationError;
      }

      const session = await StudySession.create({
        userId: context.user._id,
        deckId: new mongoose.Types.ObjectId(deckId),
        startTime: new Date(),
        status: "active",
      });

      return session;
    },

    endStudySession: async (
      _parent: any,
      {
        sessionId,
        clientDuration,
        status,
      }: {
        sessionId: string;
        clientDuration: number;
        status: "completed" | "abandoned";
      },
      context: Context
    ) => {
      if (!context.user) {
        throw AuthenticationError;
      }

      const session = await StudySession.findById(sessionId);
      if (!session) {
        throw new Error("Session not found");
      }

      if (session.userId.toString() !== context.user._id.toString()) {
        throw new Error("Unauthorized: Not your session");
      }

      session.endTime = new Date();
      session.clientDuration = clientDuration;
      session.status = status;

      // Calculate final stats
      const attempts = await StudyAttempt.aggregate([
        {
          $match: {
            studySessionId: new mongoose.Types.ObjectId(session._id as string),
            userId: new mongoose.Types.ObjectId(context.user._id),
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
      if (attempts.length > 0) {
        session.totalAttempts = attempts[0].totalAttempts;
        session.correctAttempts = attempts[0].correctAttempts;
      }

      await session.save();
      return session;
    },
  },

  CardDeck: {
    user: (parent: { userId: any }) => parent.userId,
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
