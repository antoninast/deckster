const typeDefs = `
  # User authentication and profile types
  type Profile {
    _id: ID
    username: String
    email: String
    password: String
    studyAttempts: [StudyAttempt]
  }

  type Auth {
    token: ID!
    profile: Profile
  }

  input ProfileInput {
    username: String!
    email: String!
    password: String!
    securityQuestion: String!
    securityAnswer: String!
  }

  # Study tracking types
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

  # Core content types
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

  # Input types
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

  # Queries
  type Query {
    # User queries
    profiles: [Profile]!
    profile(profileId: ID!): Profile
    me: Profile

    # Deck queries
    cardDecks(isPublic: Boolean): [CardDeck]!
    cardDecksByUser(userId: ID!): [CardDeck]!
    myCardDecks: [CardDeck]!
    cardDeck(deckId: ID!): CardDeck

    # Flashcard queries
    flashcards: [Flashcard]!
    flashcardsByDeck(deckId: ID!): [Flashcard]!
    flashcard(flashcardId: ID!): Flashcard

    # Study statistics queries
    sessionStats(studySessionId: String!): SessionStats
    recentSessionsStats(deckId: ID!, limit: Int): [RecentSessionsStats]!
  }

  # Mutations
  type Mutation {
    # Authentication mutations
    addProfile(input: ProfileInput!): Auth
    login(email: String!, password: String!): Auth

    # Deck management mutations
    addCardDeck(input: CardDeckInput!): CardDeck
    updateCardDeck(deckId: ID!, input: CardDeckInput!): CardDeck
    removeCardDeck(deckId: ID!): CardDeck

    # Flashcard management mutations
    addFlashcard(input: FlashcardInput!): Flashcard
    updateFlashcard(flashcardId: ID!, input: FlashcardInput!): Flashcard
    removeFlashcard(flashcardId: ID!): Flashcard
    reviewFlashcard(flashcardId: ID!, correct: Boolean!, studySessionId: String!): Flashcard

    # Bulk operations
    addMultipleFlashcards(deckId: ID!, flashcards: [FlashcardInput!]!): [Flashcard]
  }
`;

export default typeDefs;
