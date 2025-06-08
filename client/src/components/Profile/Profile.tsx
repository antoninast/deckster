import { useParams, useNavigate } from "react-router-dom";
import { DateTime } from "luxon";
import { useQuery } from "@apollo/client";
import { useState } from "react";
import {
  FaUserCircle,
  FaTrophy,
  FaChartLine,
  FaClock,
  FaLayerGroup,
  FaGraduationCap,
  FaEdit,
  FaSave,
} from "react-icons/fa";
import {
  QUERY_SINGLE_PROFILE,
  QUERY_ME,
  QUERY_MY_DECKS,
  QUERY_MY_STUDY_SESSIONS,
  QUERY_RECENT_STUDY_SESSIONS,
} from "../../utils/queries";
import auth from "../../utils/auth";
import "./Profile.css";
import { CardDeck } from "../../interfaces/CardDeck";
import { QUERY_USER_ACHIEVEMENT_STATS } from "../../utils/queries";

const Profile = () => {
  const { profileId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const { loading, data } = useQuery(
    profileId ? QUERY_SINGLE_PROFILE : QUERY_ME,
    { variables: { profileId: profileId } }
  );

  const { data: myDecksData } = useQuery(QUERY_MY_DECKS);
  const myDecks = myDecksData?.myCardDecks || [];

  const { data: myStudySessionsData } = useQuery(QUERY_MY_STUDY_SESSIONS, {
    fetchPolicy: "cache-and-network",
  });
  const myStudySessions = myStudySessionsData?.myStudySessions || [];

  const { data: recentStudySessionsData } = useQuery(
    QUERY_RECENT_STUDY_SESSIONS,
    {
      variables: { limit: 5 },
      fetchPolicy: "cache-and-network",
    }
  );
  const recentStudySessions =
    recentStudySessionsData?.recentStudySessions || [];

  const profile = data?.me || data?.profile || {};
  const isOwnProfile = !profileId || auth.getProfile().data._id === profileId;

  const { data: achievementStatsData } = useQuery(
    QUERY_USER_ACHIEVEMENT_STATS,
    {
      skip: !isOwnProfile,
      fetchPolicy: "cache-and-network",
    }
  );

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner">Loading profile...</div>
      </div>
    );
  }

  if (!profile?.username) {
    return (
      <div className="profile-error">
        <h3>Profile Not Found</h3>
        <p>You need to be logged in to see your profile page.</p>
        <button className="btn-primary" onClick={() => navigate("/login")}>
          Sign In
        </button>
      </div>
    );
  }

  // Profile statistics
  const stats = {
    totalDecks: myDecks.length,
    totalCards: myDecks.reduce(
      (total: number, deck: CardDeck) => total + (deck.numberOfCards || 0),
      0
    ),
    averageAccuracy:
      Math.round(
        myDecks.reduce(
          (total: number, deck: CardDeck) =>
            total + (deck.userStudyAttemptStats?.attemptAccuracy || 0),
          0
        ) / (myDecks.length || 1)
      ) || 0,
    currentStreak:
      achievementStatsData?.userAchievementStats?.currentStreak || 0,
    totalStudyTime: (() => {
      const totalSeconds = myStudySessions.reduce(
        (total: number, session: any) => total + (session.clientDuration || 0),
        0
      );
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const days = Math.floor(hours / 24);

      if (days < 1 && hours < 1) {
        return `${minutes}m`;
      } else if (days < 1 && hours >= 1) {
        return `${hours}h ${minutes}m`;
      }
      return `${days}d ${hours}h ${minutes}m`;
    })(),
  };

  // User achievements
  const achievements = achievementStatsData?.userAchievementStats
    ? [
        achievementStatsData.userAchievementStats.totalSessions >= 1 && {
          icon: "🎯",
          title: "First Steps",
          description: "Completed first session",
        },
        achievementStatsData.userAchievementStats.bestAccuracy >= 80 && {
          icon: "🎯",
          title: "Sharp Mind",
          description: "80%+ accuracy",
        },
        achievementStatsData.userAchievementStats.currentStreak >= 3 && {
          icon: "🔥",
          title: "Dedicated Learner",
          description: `${achievementStatsData.userAchievementStats.currentStreak} day streak`,
        },
        achievementStatsData.userAchievementStats.totalCardsStudied >= 100 && {
          icon: "💯",
          title: "Century Club",
          description: "100+ cards studied",
        },
        achievementStatsData.userAchievementStats.bestAccuracy >= 90 && {
          icon: "👑",
          title: "Deck Master",
          description: "90%+ accuracy",
        },
        achievementStatsData.userAchievementStats.fastestSession &&
          achievementStatsData.userAchievementStats.fastestSession < 120 && {
            icon: "⚡",
            title: "Speed Demon",
            description: "< 2 min session",
          },
      ].filter(Boolean)
    : [];

  return (
    <div className="profile-page">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-header-content">
          <div className="profile-avatar-section">
            <div className="profile-avatar">
              {profile.profilePicture ? (
                <img
                  src={profile.profilePicture}
                  alt="Profile picture"
                />
              ) : (
                <FaUserCircle />
              )}
            </div>
            {isOwnProfile && (
              <button
                className="edit-avatar-btn"
                title="Edit Avatar"
                onClick={() => navigate("/profile/avatars")}
              >
                <FaEdit />
              </button>
            )}
          </div>

          <div className="profile-info">
            <h1 className="profile-username">{profile.username}</h1>
            <p className="profile-fullName">{profile.fullName}</p>
            <p className="profile-email">{profile.email}</p>
            <p className="profile-joined">
              Member since {new Date().toLocaleDateString()}
            </p>
            <p className="profile-profilePicture">Pic: {profile.profilePicture}</p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="profile-stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <FaLayerGroup />
          </div>
          <div className="stat-content">
            <h3>{stats.totalDecks}</h3>
            <p>Total Decks</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaGraduationCap />
          </div>
          <div className="stat-content">
            <h3>{stats.totalCards}</h3>
            <p>Total Cards</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaChartLine />
          </div>
          <div className="stat-content">
            <h3>{stats.averageAccuracy}%</h3>
            <p>Average Accuracy</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaClock />
          </div>
          <div className="stat-content">
            <h3>{stats.totalStudyTime}</h3>
            <p>Total Study Time</p>
          </div>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="achievements-section">
        <h2 className="section-title">
          <FaTrophy /> Achievements
        </h2>
        {achievements.length > 0 ? (
          <div className="achievements-grid">
            {achievements.map((achievement, index) => (
              <div key={index} className="achievement-card">
                <span className="achievement-icon">{achievement.icon}</span>
                <h4>{achievement.title}</h4>
                <p>{achievement.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-achievements">
            <div className="no-achievements-icon">🎯</div>
            <h3>No Achievements Yet</h3>
            <p>Complete study sessions to unlock achievements!</p>
            <p className="achievement-hint">
              Try completing your first study session to earn "First Steps" 🌟
            </p>
          </div>
        )}
      </div>

      {/* Tabs Section */}
      <div className="profile-tabs">
        <div className="tabs-header">
          <button
            className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button
            className={`tab-btn ${activeTab === "activity" ? "active" : ""}`}
            onClick={() => setActiveTab("activity")}
          >
            Recent Activity
          </button>
          <button
            className={`tab-btn ${activeTab === "account" ? "active" : ""}`}
            onClick={() => setActiveTab("account")}
          >
            Account Settings
          </button>
        </div>

        <div className="tabs-content">
          {activeTab === "overview" && (
            <div className="tab-panel">
              <div className="study-streak-banner">
                <h3>🔥 Current Streak: {stats.currentStreak} days</h3>
                <p>
                  {stats.currentStreak > 0
                    ? "Keep it up! You're on fire!"
                    : "Start your streak today!"}
                </p>
              </div>
              <div className="quick-actions">
                <h3>Quick Actions</h3>
                <div className="action-buttons">
                  <button
                    className="action-btn primary"
                    onClick={() => navigate("/browse-decks")}
                  >
                    <FaLayerGroup /> Browse My Decks
                  </button>
                  <button
                    className="action-btn secondary"
                    onClick={() => navigate("/import")}
                  >
                    Create New Deck
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "activity" && (
            <div className="tab-panel">
              <h3>Recent Study Sessions</h3>
              <div className="activity-list">
                {recentStudySessions.length === 0 ? (
                  <p>No recent study sessions found.</p>
                ) : (
                  recentStudySessions.map((session: any, index: number) => (
                    <div key={index} className="activity-item">
                      <span className="activity-date">
                        {DateTime.fromMillis(
                          Number(session.startTime)
                        ).toLocaleString(DateTime.DATETIME_FULL)}
                      </span>
                      <span className="activity-deck">
                        {" "}
                        {session.deckTitle}
                      </span>
                      <span className="activity-score">
                        {session.sessionAccuracy}% accuracy
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "account" && (
            <div className="tab-panel">
              <div className="account-section">
                <h3>Account Information</h3>
                <p className="account-description">
                  Update your account details below
                </p>

                <form className="account-form">
                  <div className="form-row">
                    <div className="account-field">
                      <label htmlFor="fullName">Full Name</label>
                      <input
                        type="text"
                        id="fullName"
                        placeholder="Enter your full name"
                        defaultValue={profile.fullName || ""}
                        className="account-input"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="account-field">
                      <label htmlFor="username">Username</label>
                      <input
                        type="text"
                        id="username"
                        value={profile.username}
                        className="account-input readonly"
                        readOnly
                        disabled
                      />
                      <span className="field-note">
                        Username cannot be changed
                      </span>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="account-field">
                      <label htmlFor="email">Email Address</label>
                      <input
                        type="email"
                        id="email"
                        defaultValue={profile.email}
                        className="account-input"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="account-field">
                      <label htmlFor="currentPassword">Password</label>
                      <input
                        type="password"
                        id="currentPassword"
                        placeholder="••••••••"
                        className="account-input"
                      />
                      <span className="field-note">
                        Leave blank to keep current password
                      </span>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="btn-save-changes"
                      onClick={(e) => {
                        e.preventDefault();
                        alert("Account update functionality coming soon!");
                      }}
                    >
                      <FaSave /> Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
