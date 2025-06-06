// client/src/components/Navbar/Navbar.tsx
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, MouseEvent } from "react";
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
import logo from "../../../../assets/deckster-logo-concept.png";

const AppNavbar = () => {
  // Fixed: Component name should be capitalized
  const navigate = useNavigate();
  const [loginCheck, setLoginCheck] = useState(false);

  const logout = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    auth.logout();
    setLoginCheck(false);
    navigate("/");
  };

  const checkLoginStatus = () => {
    if (auth.loggedIn()) {
      setLoginCheck(true);
    } else {
      setLoginCheck(false);
    }
  };

  useEffect(() => {
    checkLoginStatus();
  });

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
                    <Link to="/browse-decks" className="nav-link-with-icon">
                      <FaLayerGroup className="nav-icon" />
                      <span>Browse Decks</span>
                    </Link>
                  </div>
                  <div>
                    <Link to="/import" className="nav-link-with-icon">
                      <FaFileImport className="nav-icon" />
                      <span>Create Deck</span>
                    </Link>
                  </div>
                  <div>
                    <Link to="/me" className="nav-link-with-icon">
                      <FaUserCircle className="nav-icon" />
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
                  <Link to="/browse-decks" className="nav-link-with-icon">
                    <FaLayerGroup className="nav-icon" />
                    <span>Browse Public Decks</span>
                  </Link>
                  <Link to="/login" className="nav-link-with-icon">
                    <FaSignInAlt className="nav-icon" />
                    <span>Login</span>
                  </Link>
                  <Link to="/signup" className="nav-link-with-icon">
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
