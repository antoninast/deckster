import { Profile, CardDeck, Flashcard } from "../models/index.js";
import { IProfile } from "../models/Profile.js";
import { IFlashcard } from "../models/Flashcard.js";
import { ICardDeck } from "../models/CardDeck.js";
import { signToken, AuthenticationError } from "../utils/auth.js";
// import { parse } from 'csv-parse/sync'
// import { insertMany } from './db'

interface ProfileArgs {
  profileId: string;
}

interface AddProfileArgs {
  input: {
    name: string;
    email: string;
    password: string;
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
    cardDecks: async (): Promise<any[]> => {
      return await CardDeck.find();
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
    addProfile: async (
      _parent: any,
      { input }: AddProfileArgs
    ): Promise<{ token: string; profile: IProfile }> => {
      const profile = await Profile.create({ ...input });
      const token = signToken(profile.name, profile.email, profile._id);
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
      const token = signToken(profile.name, profile.email, profile._id);
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
    // updateFlashcard(flashcardId: ID!, input: FlashcardInput!): Flashcard
    // removeFlashcard(flashcardId: ID!): Flashcard
    // reviewFlashcard(flashcardId: ID!, correct: Boolean!): Flashcard

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
};

export default resolvers;
