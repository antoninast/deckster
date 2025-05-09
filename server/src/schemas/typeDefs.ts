const typeDefs = `
  type Profile {
    _id: ID
    name: String
    email: String
    password: String
    skills: [String]!
  }

  type Auth {
    token: ID!
    profile: Profile
  }
  
  input ProfileInput {
    name: String!
    email: String!
    password: String!
  }

  type CardDeck {
    _id: ID
    deckName: String
    lastReview: string
    image_url: String
    category: Category
    user: Profile;
}

type Flashcard {
    _id: ID
    question: String
    answer: String
    difficulty: Int
    attempts: Int
    correct: Int
    incorrect: Int  
    lastReview: String
    image_url: String
    deck: CardDeck
}

type Query {
    profiles: [Profile]!
    profile(profileId: ID!): Profile
    me: Profile
    
    cardDecks: [CardDeck]!
    cardDecksByUser(userId: ID!): [CardDeck]!
    myCardDecks: [CardDeck]!
    cardDeck(deckId: ID!): CardDeck
    
    flashcards: [Flashcard]!
    flashcardsByDeck(deckId: ID!): [Flashcard]!
    flashcard(flashcardId: ID!): Flashcard
}

  type Mutation {
    addProfile(input: ProfileInput!): Auth
    login(email: String!, password: String!): Auth

    addSkill(profileId: ID!, skill: String!): Profile
    removeProfile: Profile
    removeSkill(skill: String!): Profile
  }
`;

export default typeDefs;
