import { gql } from "@apollo/client";

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

export const REMOVE_FLASHCARD = gql`
  mutation removeFlashcard($flashcardId: ID!) {
    removeFlashcard(flashcardId: $flashcardId) {
      _id
    }
  }
`;

export const REMOVE_CARDDECK = gql`
  mutation removeCardDeck($deckId: String!) {
    removeCardDeck(deckId: $deckId) {
      _id
    }
  }
`;

