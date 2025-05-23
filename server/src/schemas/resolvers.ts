import { Profile } from "../models/index.js";
// import { CardDeck } from "../models/CardDeck.js";
import { signToken, AuthenticationError } from "../utils/auth.js";
// import { parse } from 'csv-parse/sync'
// import { insertMany } from './db'

interface Profile {
  _id: string;
  name: string;
  email: string;
  password: string;
  skills: string[];
}

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
  user?: Profile;
}

const resolvers = {
  Query: {
    profiles: async (): Promise<Profile[]> => {
      return await Profile.find();
    },
    profile: async (
      _parent: any,
      { profileId }: ProfileArgs
    ): Promise<Profile | null> => {
      return await Profile.findOne({ _id: profileId });
    },
    me: async (
      _parent: any,
      _args: any,
      context: Context
    ): Promise<Profile | null> => {
      if (context.user) {
        return await Profile.findOne({ _id: context.user._id });
      }
      throw AuthenticationError;
    },
  },
  Mutation: {
    addProfile: async (
      _parent: any,
      { input }: AddProfileArgs
    ): Promise<{ token: string; profile: Profile }> => {
      const profile = await Profile.create({ ...input });
      const token = signToken(profile.name, profile.email, profile._id);
      return { token, profile };
    },
    login: async (
      _parent: any,
      { email, password }: { email: string; password: string }
    ): Promise<{ token: string; profile: Profile }> => {
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
