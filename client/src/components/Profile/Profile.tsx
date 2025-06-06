import { useParams, Link, useNavigate } from "react-router-dom";
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
  // FaCog,
  // FaSignOutAlt,
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
  console.log("recentStudySessions", recentStudySessions);

  const profile = data?.me || data?.profile || {};
  const isOwnProfile = !profileId || auth.getProfile().data._id === profileId;

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
  console.log("mystudySessions", myStudySessions);
  // Profile statistics
  const stats = {
    totalDecks: myDecks.length,
    totalCards: myDecks.reduce(
      (total: number, deck: CardDeck) => total + (deck.numberOfCards || 0),
      0
    ),
    // studySessions: 45,
    averageAccuracy:
      Math.round(
        myDecks.reduce(
          (total: number, deck: CardDeck) =>
            total + (deck.userStudyAttemptStats?.attemptAccuracy || 0),
          0
        ) / (myDecks.length || 1)
      ) || 0,
    currentStreak: 7,
    totalStudyTime: (() => {
      const totalSeconds = myStudySessions.reduce(
        (total: number, session: any) => total + (session.clientDuration || 0),
        0
      );
      console.log("totalSeconds", totalSeconds);
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
  const achievements = [
    { icon: "🔥", title: "On Fire", description: "7 day streak" },
    { icon: "🎯", title: "Sharp Shooter", description: "90%+ accuracy" },
    { icon: "📚", title: "Bookworm", description: "200+ cards studied" },
    { icon: "⚡", title: "Speed Learner", description: "5 decks mastered" },
  ];

  return (
    <div className="profile-page">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-header-content">
          <div className="profile-avatar-section">
            <div className="profile-avatar">
              <FaUserCircle />
            </div>
            {isOwnProfile && (
              <button className="edit-avatar-btn">
                <Link to="/me">
                  <FaEdit /> Edit
                </Link>
              </button>
            )}
          </div>

          <div className="profile-info">
            <h1 className="profile-username">{profile.username}</h1>
            <p className="profile-email">{profile.email}</p>
            <p className="profile-joined">
              Member since {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* {isOwnProfile && (
            <div className="profile-actions">
              <button
                className="profile-action-btn"
                onClick={() => navigate("/settings")}
              >
                <FaCog /> Settings
              </button>
              <button
                className="profile-action-btn logout-btn"
                onClick={() => auth.logout()}
              >
                <FaSignOutAlt /> Logout
              </button>
            </div>
          )} */}
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
        <div className="achievements-grid">
          {achievements.map((achievement, index) => (
            <div key={index} className="achievement-card">
              <span className="achievement-icon">{achievement.icon}</span>
              <h4>{achievement.title}</h4>
              <p>{achievement.description}</p>
            </div>
          ))}
        </div>
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
            className={`tab-btn ${activeTab === "progress" ? "active" : ""}`}
            onClick={() => setActiveTab("progress")}
          >
            Progress
          </button>
        </div>

        <div className="tabs-content">
          {activeTab === "overview" && (
            <div className="tab-panel">
              <div className="study-streak-banner">
                <h3>🔥 Current Streak: {stats.currentStreak} days</h3>
                <p>Keep it up! You're on fire!</p>
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

          {activeTab === "progress" && (
            <div className="tab-panel">
              <h3>Learning Progress</h3>
              <div className="progress-chart">
                <p>Progress visualization coming soon...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
