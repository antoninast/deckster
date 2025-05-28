import { gql } from '@apollo/client';

export const QUERY_PROFILES = gql`
  query allProfiles {
    profiles {
      _id
      name
    }
  }
`;

export const QUERY_SINGLE_PROFILE = gql`
  query singleProfile($profileId: ID!) {
    profile(profileId: $profileId) {
      _id
      name
    }
  }
`;

export const QUERY_ME = gql`
  query me {
    me {
      _id
      name
    }
  }
`;

export const QUERY_USER_DECKS = gql`
  query cardDecksByUser($userId: ID!) {
    cardDecksByUser(userId: $userId) {
      _id
      deckName
      categoryId
      image_url
    }
  }
`;

export const QUERY_MY_DECKS = gql`
  query myCardDecks {
    myCardDecks {
      _id
      deckName
      categoryId
      image_url
    }
  }
`;
