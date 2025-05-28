import { Profile, SecurityQuestion } from '../models/index.js';

const cleanDB = async (): Promise<void> => {
  try {
    await Profile.deleteMany({});
    await SecurityQuestion.deleteMany({});
    console.log('Profile collection cleaned.');

  } catch (err) {
    console.error('Error cleaning collections:', err);
    process.exit(1);
  }
};

export default cleanDB;
