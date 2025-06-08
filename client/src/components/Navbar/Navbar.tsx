// client/src/components/Navbar/Navbar.tsx
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, MouseEvent } from "react";
// import { QUERY_SINGLE_PROFILE_BY_USERNAME } from "../../utils/queries";
// import { useLazyQuery } from "@apollo/client";
import auth from "../../utils/auth";

// Add icon imports
import {
  FaLayerGroup, // Browse Decks
  FaFileImport, // Import CSV
  FaUserCircle, // Profile
  FaSignOutAlt, // Logout
  FaSignInAlt, // Login
  FaUserPlus, // Sign Up
} from "react-icons/fa";

//Bootstrap Elements
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";

import "./Navbar.css";
import logo from "../../assets/deckster-logo.png";

const AppNavbar = () => {
  // Fixed: Component name should be capitalized
  const navigate = useNavigate();
  // const [fetchProfile] = useLazyQuery(QUERY_SINGLE_PROFILE_BY_USERNAME)
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const [loginCheck, setLoginCheck] = useState(false);
  // const [avatar, setAvatar] = useState<string | null>(null);

  const logout = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    auth.logout();
    setLoginCheck(false);
    navigate("/");
  };

  const checkLoginStatus = async () => {
    if (auth.loggedIn()) {
      setLoginCheck(true);

      // // Fetch user profile to get avatar
      // const userData = await fetchProfile({
      //   variables: { username: auth.getProfile().data.username },
      // });
      // console.log("User data fetched:", userData);
      // await setAvatar(userData.data?.profile?.profilePicture || null);
      // console.log("Avatar set to:", avatar);

    } else {
      setLoginCheck(false);
    }
  };

  useEffect(() => {
    checkLoginStatus();
    // eslint-disable-next-line
  }, []);

  // const avatarHandler = async () => {
  //   console.log("Avatar handler called with avatar:", avatar);
  //   if (avatar) {
  //     return "<img src={avatar}/>"
  //   }
  //   return "<FaUserCircle />"
  // };

  return (
    <Navbar className="navbar">
      <Navbar.Brand>
        <img
          className="brand-logo"
          id="navbar-logo"
          src={logo}
          onClick={() => navigate("/")}
          alt="company logo"
        />
      </Navbar.Brand>

      <Container>
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="navbar-links">
            <div className="navbar-links-container">
              {loginCheck ? (
                <>
                  <div>
                    <Link
                      to="/browse-decks"
                      className={`nav-link-with-icon ${isActive("/browse-decks") ? "active" : ""}`}>
                      <FaLayerGroup className="nav-icon" />
                      <span>Browse Decks</span>
                    </Link>
                  </div>
                  <div>
                    <Link
                      to="/import"
                      className={`nav-link-with-icon ${isActive("/import") ? "active" : ""}`}>
                      <FaFileImport className="nav-icon" />
                      <span>Create Deck</span>
                    </Link>
                  </div>
                  <div>
                    <Link
                      to="/me"
                      className={`nav-link-with-icon ${isActive("/me") ? "active" : ""}`}>
                      <div className="nav-icon">
                        <FaUserCircle />
                      </div>
                      <span>View My Profile</span>
                    </Link>
                  </div>
                  <div
                    onClick={(ev) => logout(ev)}
                    className="nav-link-with-icon logout-link"
                  >
                    <FaSignOutAlt className="nav-icon" />
                    <span>Logout</span>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/browse-decks"
                    className={`nav-link-with-icon ${isActive("/browse-decks") ? "active" : ""}`}>
                    <FaLayerGroup className="nav-icon" />
                    <span>Browse Public Decks</span>
                  </Link>
                  <Link
                    to="/login"
                    className={`nav-link-with-icon ${isActive("/login") ? "active" : ""}`}>
                    <FaSignInAlt className="nav-icon" />
                    <span>Login</span>
                  </Link>
                  <Link
                    to="/signup"
                    className={`nav-link-with-icon ${isActive("/signup") ? "active" : ""}`}>
                    <FaUserPlus className="nav-icon" />
                    <span>Sign Up</span>
                  </Link>
                </>
              )}
            </div>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
