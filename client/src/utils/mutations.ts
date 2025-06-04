import { gql } from "@apollo/client";

// Creates a new user profile with authentication token
export const ADD_PROFILE = gql`
  mutation addProfile($input: ProfileInput!) {
    addProfile(input: $input) {
      token
      profile {
        _id
        username
        email
        password
      }
    }
  }
`;

// Authenticates user and returns token with basic profile info
export const LOGIN_USER = gql`
  mutation login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      profile {
        _id
        username
      }
    }
  }
`;

// Creates a new card deck with specified properties
export const ADD_CARD_DECK = gql`
  mutation addCardDeck($input: CardDeckInput!) {
    addCardDeck(input: $input) {
      _id
      name
      categoryName
      isPublic
    }
  }
`;

// Adds multiple flashcards to a deck (used for CSV import)
export const ADD_MULTIPLE_FLASHCARDS = gql`
  mutation AddMultipleFlashcards(
    $deckId: ID!
    $flashcards: [FlashcardInput!]!
  ) {
    addMultipleFlashcards(deckId: $deckId, flashcards: $flashcards) {
      _id
      question
      answer
    }
  }
`;

export const START_STUDY_SESSION = gql`
  mutation StartStudySession($deckId: ID!) {
    startStudySession(deckId: $deckId) {
      _id
      startTime
      status
      totalAttempts
      correctAttempts
    }
  }
`;

export const END_STUDY_SESSION = gql`
  mutation EndStudySession(
    $sessionId: ID!
    $clientDuration: Int!
    $status: String!
  ) {
    endStudySession(
      sessionId: $sessionId
      clientDuration: $clientDuration
      status: $status
    ) {
      _id
      endTime
      status
      sessionAccuracy
      totalAttempts
      correctAttempts
      clientDuration
    }
  }
`;

// Records a study attempt for a flashcard with correctness tracking
export const REVIEW_FLASHCARD = gql`
  mutation reviewFlashcard(
    $flashcardId: ID!
    $correct: Boolean!
    $studySessionId: String!
  ) {
    reviewFlashcard(
      flashcardId: $flashcardId
      correct: $correct
      studySessionId: $studySessionId
    ) {
      _id
      question
      answer
      image_url
      deckId
    }
  }
`;

// Updates an existing flashcard's question and answer
export const UPDATE_FLASHCARD = gql`
  mutation updateFlashcard($flashcardId: ID!, $input: FlashcardInput!) {
    updateFlashcard(flashcardId: $flashcardId, input: $input) {
      _id
      question
      answer
    }
  }
`;

// Deletes a flashcard from the database
export const REMOVE_FLASHCARD = gql`
  mutation removeFlashcard($flashcardId: ID!) {
    removeFlashcard(flashcardId: $flashcardId) {
      _id
    }
  }
`;

// Deletes an entire card deck and its associated flashcards
export const REMOVE_CARDDECK = gql`
  mutation removeCardDeck($deckId: ID!) {
    removeCardDeck(deckId: $deckId) {
      _id
    }
  }
`;
