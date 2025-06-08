import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { useState } from "react";
import { QUERY_AVAILABLE_AVATARS } from "../../utils/queries";
import { useMutation } from "@apollo/client";
import { UPDATE_AVATAR } from "../../utils/mutations";

import { QUERY_SINGLE_PROFILE, QUERY_ME } from "../../utils/queries";
import "./Avatar.css";
import auth from "../../utils/auth";
// import auth from "../../utils/auth";


const Avatars = () => {
  const { profileId } = useParams();
  const navigate = useNavigate();
  const [_avatarSelection, setAvatarSelection] = useState("");
  const [updateAvatar] = useMutation(UPDATE_AVATAR);

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
  // const isOwnProfile = !profileId || auth.getProfile().data._id === profileId;

  if (loadingProfile) {
    return (
      <div className="avatar-loading">
        <div className="loading-spinner">Loading Profile...</div>
      </div>
    );
  }
  if (loadingAvatars) {
    return (
      <div className="avatar-loading">
        <div className="loading-spinner">Loading Avatars...</div>
      </div>
    );
  }

  if (!profile?.username) {
    return (
      <div className="avatar-error">
        <h3>Profile Not Found</h3>
        <p>You need to be logged in to see the Avatars...dems the rules.</p>
        <button className="btn-primary" onClick={() => navigate("/login")}>
          Sign In
        </button>
      </div>
    );
  }

  const handleAvatarSelection = (avatar: string) => {
    console.log("Updating avatar for profile:", profile.username, " to ", avatar);

    try {
      setAvatarSelection(avatar);
      // Call the mutation to update the avatar in the database
      updateAvatar({
        variables: { username: profile.username, avatar: avatar },
      });
      console.log("Avatar updated successfully");
      navigate("/me");
    } catch (error) {
      console.error("Error updating avatar:", error);
    }
  };

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
    <div className="avatar-page">
      <div className="avatar-info">
        <h1 className="avatar-username">{profile.username}</h1>
        <p className="avatar-email">{profile.email}</p>
      </div>
      
      <div>
        <h2 className="avatar-avatar-title">Available Avatars</h2>
        <p className="avatar-avatar-description">
          Select an avatar to represent you in the app.
        </p>
        {(avatarList.availableAvatars).map((avatar: string) => {
          return (
            <img className="avatar-image"
                src={avatar}
                alt={avatar}
                onClick={() => {handleAvatarSelection(avatar);}}
              />
          );  
        })}
      </div>
    </div>
  );
};

export default Avatars;
