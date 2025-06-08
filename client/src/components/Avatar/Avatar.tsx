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
import { FaEdit, FaLayerGroup, FaUserCircle } from "react-icons/fa";

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
            {isOwnProfile && (
              <button className="edit-avatar-btn">

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
    </div>
  );
};

export default Avatars;
