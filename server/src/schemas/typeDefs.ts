const typeDefs = `
  type Profile {
    _id: ID
    username: String  # Changed from 'name'
    email: String
    password: String
    studyAttempts: [StudyAttempt]
  }

  type Auth {
    token: ID!
    profile: Profile
  }

  input ProfileInput {
    username: String!  # Changed from 'name'
    email: String!
    password: String!
    securityQuestion: String!
    securityAnswer: String!
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

  type SessionStats {
  totalAttempts: Int!
  correctAttempts: Int!
  sessionAccuracy: Float!
  }

  type RecentSessionsStats {
  studySessionId: String!
  timestamp: String!
  totalAttempts: Int!
  correctAttempts: Int!
  sessionAccuracy: Float!
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
  }

  type Query {
    profiles: [Profile]!
    profile(profileId: ID!): Profile
    me: Profile
    
    cardDecks(isPublic: Boolean): [CardDeck]!
    cardDecksByUser(userId: ID!): [CardDeck]!
    myCardDecks: [CardDeck]!
    cardDeck(deckId: ID!): CardDeck

    flashcards: [Flashcard]!
    flashcardsByDeck(deckId: ID!): [Flashcard]!
    flashcard(flashcardId: ID!): Flashcard

    sessionStats(studySessionId: String!): SessionStats
    recentSessionsStats(deckId: ID!, limit: Int): [RecentSessionsStats]!
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
    reviewFlashcard(flashcardId: ID!, correct: Boolean!, studySessionId: String!): Flashcard

    addMultipleFlashcards(flashcards: [FlashcardInput!]!): [Flashcard]
  }
`;

export default typeDefs;
