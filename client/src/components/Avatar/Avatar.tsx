import { useParams, Link, useNavigate } from "react-router-dom";
import { DateTime } from "luxon";
import { useQuery } from "@apollo/client";
import { useState } from "react";

import {
  QUERY_SINGLE_PROFILE,
  QUERY_ME,
  QUERY_MY_DECKS,
  QUERY_MY_STUDY_SESSIONS,
  QUERY_RECENT_STUDY_SESSIONS,

} from "../../utils/queries";
import "./Avatar.css";
import auth from "../../utils/auth";
import { CardDeck } from "../../interfaces/CardDeck";

const Avatars = () => {
  const { profileId } = useParams();
  const navigate = useNavigate();
  const [avatarSelection, setAvatarSelection] = useState("");

  const { loading, data } = useQuery(
    profileId ? QUERY_SINGLE_PROFILE : QUERY_ME,
    { variables: { profileId: profileId } }
  );

  const profile = data?.me || data?.profile || {};
  const isOwnProfile = !profileId || auth.getProfile().data._id === profileId;

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner">Loading Avatars...</div>
      </div>
    );
  }

  if (!profile?.username) {
    return (
      <div className="profile-error">
        <h3>Profile Not Found</h3>
        <p>You need to be logged in to see the Avatars...dems the rules.</p>
        <button className="btn-primary" onClick={() => navigate("/login")}>
          Sign In
        </button>
      </div>
    );
  }


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

export default Avatars;
