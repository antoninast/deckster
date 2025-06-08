import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { useState } from "react";
import { QUERY_AVAILABLE_AVATARS } from "../../utils/queries";

import { QUERY_SINGLE_PROFILE, QUERY_ME } from "../../utils/queries";
import "./Avatar.css";
import auth from "../../utils/auth";

const Avatars = () => {
  const { profileId } = useParams();
  const navigate = useNavigate();
  const [avatarSelection, setAvatarSelection] = useState("");

  const { loading: loadingAvatars, data: avatarList } = useQuery(
    QUERY_AVAILABLE_AVATARS
  );
  console.log("Avatar List:", avatarList);

  // Load profile data
  const { loading: loadingProfile, data: profileQuery } = useQuery(
    profileId ? QUERY_SINGLE_PROFILE : QUERY_ME,
    { variables: { profileId: profileId } }
    // { variables: { username: username } }
  );

  const profile = profileQuery?.me || profileQuery?.profile || {};
  const isOwnProfile = !profileId || auth.getProfile().data._id === profileId;

  if (loadingProfile) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner">Loading Profile...</div>
      </div>
    );
  }
  if (loadingAvatars) {
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
            {isOwnProfile && <button className="edit-avatar-btn"></button>}
          </div>

          <div className="profile-info">
            <h1 className="profile-username">{profile.username}</h1>
            <p className="profile-email">{profile.email}</p>
          </div>

          <div>
            <h2 className="profile-avatar-title">Available Avatars</h2>
            <p className="profile-avatar-description">
              Select an avatar to represent you in the app.
            </p>
            {avatarList.availableAvatars.map((avatar: string) => {
              return <img src={avatar} alt={avatar} />;
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Avatars;
