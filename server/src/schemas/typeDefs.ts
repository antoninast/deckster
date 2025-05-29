const typeDefs = `
  type Profile {
    _id: ID
    name: String
    email: String
    password: String
    studyAttempts: [StudyAttempt]
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

  type StudyAttempt {
    _id: ID
    userId: ID
    flashcardId: ID
    deckId: ID
    isCorrect: Boolean
    timestamp: String
    studySessionId: String
  }

  type StudyAttemptStats {
    totalAttempts: Int!
    correctAttempts: Int!
    attemptAccuracy: Float!
    proficiency: String!
  }

  type CardDeck {
    _id: ID
    name: String
    lastReview: String
    image_url: String
    categoryName: String
    userId: ID
    flashcardIds: [ID]
    numberOfCards: Int
    userStudyAttemptStats: StudyAttemptStats
    isPublic: Boolean
  }

  type Flashcard {
    _id: ID
    question: String
    answer: String
    image_url: String
    deckId: ID
    userStudyAttemptStats: StudyAttemptStats
  }

  input CardDeckInput {
    name: String!
    image_url: String
    categoryName: String
    userId: ID!
    flashcardIds: [ID]
    isPublic: Boolean
  }

  input FlashcardInput {
    question: String!
    answer: String!
    image_url: String
    deckId: ID!
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

    addCardDeck(input: CardDeckInput!): CardDeck
    updateCardDeck(deckId: ID!, input: CardDeckInput!): CardDeck
    removeCardDeck(deckId: ID!): CardDeck

    addFlashcard(input: FlashcardInput!): Flashcard
    updateFlashcard(flashcardId: ID!, input: FlashcardInput!): Flashcard
    removeFlashcard(flashcardId: ID!): Flashcard
    reviewFlashcard(flashcardId: ID!, correct: Boolean!): Flashcard
  }
`;

export default typeDefs;
