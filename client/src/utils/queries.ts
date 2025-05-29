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
      isPublic
      userStudyAttemptStats {
        attemptAccuracy
        proficiency
      }
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
