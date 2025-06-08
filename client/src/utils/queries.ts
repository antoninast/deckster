import { gql } from "@apollo/client";

export const QUERY_PROFILES = gql`
  query allProfiles {
    profiles {
      _id
      username
      email
      fullName
      securityQuestion
      profilePicture
    }
  }
`;

export const QUERY_SINGLE_PROFILE = gql`
  query singleProfile($profileId: ID!) {
    profile(profileId: $profileId) {
      _id
      username
      email
      fullName
      securityQuestion
      profilePicture
    }
  }
`;

export const QUERY_SINGLE_PROFILE_BY_USERNAME = gql`
  query singleProfile($username: String!) {
    profile(username: $username) {
      _id
      username
      email
      fullName
      securityQuestion
      profilePicture
    }
  }
`;

export const COMPARE_SECURITY_ANSWERS = gql`
  query compareSecurityAnswers($username: String!, $securityAnswer: String!) {
    compareSecurityAnswers(username: $username, securityAnswer: $securityAnswer)
  }
`;

// export const COMPARE_SECURITY_ANSWERS = gql`
//   query compareSecurityAnswer($username: String!, $securityAnswer: String!) {
//     security(username: $username, securityAnswer: $securityAnswer) {
//       _id
//       username
//       securityQuestion
//       securityAnswer
//     }
//   }
// `;

export const QUERY_ME = gql`
  query me {
    me {
      _id
      username
      email
      fullName
      securityQuestion
      profilePicture
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
      user {
        _id
        username
      }
      userStudyAttemptStats {
        attemptAccuracy
        proficiency
      }
      isPublic
    }
  }
`;

export const QUERY_CARD_DECKS = gql`
  query cardDecks($isPublic: Boolean!) {
    cardDecks(isPublic: $isPublic) {
      _id
      name
      categoryName
      image_url
      numberOfCards
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

export const QUERY_AVAILABLE_AVATARS = gql`
  query availableAvatars {
    availableAvatars
  }
`;

export const QUERY_FLASHCARDS_BY_DECK = gql`
  query flashcardsByDeck($deckId: ID!) {
    flashcardsByDeck(deckId: $deckId) {
      _id
      question
      answer
      image_url
      userStudyAttemptStats {
        totalAttempts
        correctAttempts
        attemptAccuracy
        proficiency
      }
    }
  }
`;

export const QUERY_STUDY_SESSION = gql`
  query studySession($studySessionId: ID!) {
    studySession(studySessionId: $studySessionId) {
      _id
      startTime
      totalAttempts
      correctAttempts
      sessionAccuracy
      clientDuration
      status
    }
  }
`;

export const QUERY_MY_STUDY_SESSIONS = gql`
  query myStudySessions {
    myStudySessions {
      _id
      userId
      deckId
      startTime
      endTime
      clientDuration
      calculatedDuration
      totalAttempts
      correctAttempts
      status
      sessionAccuracy
      createdAt
      updatedAt
    }
  }
`;

export const QUERY_RECENT_STUDY_SESSIONS = gql`
  query recentStudySessions($deckId: ID, $limit: Int) {
    recentStudySessions(deckId: $deckId, limit: $limit) {
      _id
      startTime
      endTime
      totalAttempts
      correctAttempts
      sessionAccuracy
      deckTitle
      clientDuration
      status
      createdAt
      updatedAt
    }
  }
`;

export const QUERY_USER_ACHIEVEMENT_STATS = gql`
  query userAchievementStats {
    userAchievementStats {
      totalSessions
      totalCardsStudied
      bestAccuracy
      currentStreak
      fastestSession
    }
  }
`;
