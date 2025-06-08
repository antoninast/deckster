const typeDefs = `
  # User authentication and profile types
  type Profile {
    _id: ID
    username: String
    email: String
    password: String
    fullName: String
    profilePicture: String
    securityQuestion: String
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
    studySessionId: ID
  }

  type StudyAttemptStats {
    totalAttempts: Int!
    correctAttempts: Int!
    attemptAccuracy: Float!
    proficiency: String!
  }

  enum SessionStatus {
    active
    completed
    abandoned
  }

  type StudySession {
    _id: ID!
    userId: ID!
    deckId: ID!
    startTime: String!
    endTime: String
    clientDuration: Int!
    calculatedDuration: Int
    totalAttempts: Int!
    correctAttempts: Int!
    status: SessionStatus!
    sessionAccuracy: Float!
    deckTitle: String
    createdAt: String
    updatedAt: String
  }

  # Core content types
  type CardDeck {
    _id: ID
    name: String
    lastReview: String
    image_url: String
    categoryName: String
    userId: ID!
    user: Profile
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

  type UserAchievementStats {
  totalSessions: Int!
  totalCardsStudied: Int!
  bestAccuracy: Float!
  currentStreak: Int!
  fastestSession: Int
}

  # Input types
  input CardDeckInput {
    name: String!
    image_url: String
    categoryName: String
    userId: ID!
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
    profile(profileId: ID, username: String): Profile
    me: Profile
    compareSecurityAnswers(username: String!, securityAnswer: String!): Boolean

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
    studySession(studySessionId: ID!): StudySession
    myStudySessions: [StudySession]!
    recentStudySessions(deckId: ID, limit: Int): [StudySession]

    # Avatar queries
    availableAvatars: [String!]!

    # Achievement query
    userAchievementStats: UserAchievementStats
  }

  # Mutations
  type Mutation {
    # Authentication mutations
    addProfile(input: ProfileInput!): Auth
    login(username: String!, password: String!): Auth
    resetPassword(
      username: String!
      newPassword: String!
      securityAnswer: String!
    ): Boolean

    # Deck management mutations
    addCardDeck(input: CardDeckInput!): CardDeck
    updateCardDeck(deckId: ID!, input: CardDeckInput!): CardDeck
    removeCardDeck(deckId: ID!): CardDeck

    # Flashcard management mutations
    addFlashcard(input: FlashcardInput!): Flashcard
    updateFlashcard(flashcardId: ID!, input: FlashcardInput!): Flashcard
    removeFlashcard(flashcardId: ID!): Flashcard
    reviewFlashcard(flashcardId: ID!, correct: Boolean!, studySessionId: ID!): Flashcard

    # Bulk operations
    addMultipleFlashcards(deckId: ID!, flashcards: [FlashcardInput!]!): [Flashcard]

    # Study session mutations
    startStudySession(deckId: ID!): StudySession!
    endStudySession(
      sessionId: ID!
      clientDuration: Int!
      status: SessionStatus!
    ): StudySession!
  }
`;

export default typeDefs;
