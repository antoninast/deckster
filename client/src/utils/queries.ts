import { gql } from "@apollo/client";

export const QUERY_PROFILES = gql`
  query allProfiles {
    profiles {
      _id
      username
    }
  }
`;

export const QUERY_SINGLE_PROFILE = gql`
  query singleProfile($profileId: ID!) {
    profile(profileId: $profileId) {
      _id
      username
    }
  }
`;

export const QUERY_SINGLE_PROFILE_BY_USERNAME = gql`
  query singleProfile($username: String!) {
    profile(username: $username) {
      _id
      username
      securityQuestion
    }
  }
`;

export const QUERY_ME = gql`
  query me {
    me {
      _id
      username
    }
  }
`;

export const QUERY_USER_DECKS = gql`
  query cardDecksByUser($userId: ID!) {
    cardDecksByUser(userId: $userId) {
      _id
      name
      categoryName
      image_url
    }
  }
`;

export const QUERY_MY_DECKS = gql`
  query myCardDecks {
    myCardDecks {
      _id
      name
      categoryName
      image_url
      numberOfCards
      userStudyAttemptStats {
        attemptAccuracy
        proficiency
      }
      isPublic
    }
  }
`;

export const QUERY_CARD_DECKS = gql`
  query GetCardDecks($isPublic: Boolean!) {
    cardDecks(isPublic: $isPublic) {
      _id
      name
      categoryName
      image_url
      isPublic
      user {
        _id
        username
      }
      userStudyAttemptStats {
        attemptAccuracy
        proficiency
      }
    }
  }
`;

export const QUERY_FLASHCARDS_BY_DECK = gql`
  query FlashcardsByDeck($deckId: ID!) {
    flashcardsByDeck(deckId: $deckId) {
      _id
      question
      answer
      image_url
    }
  }
`;

export const GET_SESSION_STATS = gql`
  query GetSessionStats($studySessionId: String!) {
    sessionStats(studySessionId: $studySessionId) {
      totalAttempts
      correctAttempts
      sessionAccuracy
    }
  }
`;

export const GET_RECENT_SESSION_STATS = gql`
  query GetRecentSessionsStats($deckId: ID!, $limit: Int) {
    recentSessionsStats(deckId: $deckId, limit: $limit) {
      studySessionId
      timestamp
      totalAttempts
      correctAttempts
      sessionAccuracy
    }
  }
`;
