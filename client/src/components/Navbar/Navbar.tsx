import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, MouseEvent } from "react";
import auth from "../../utils/auth";

//Bootstrap Elements
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';


// TODO: Import from the main CSS file prior to importing for the current component
// import "../index.css"; 
import "./Navbar.css";
import logo from "../../../../resources/logo.png";

const appNavbar = () => {
  const navigate = useNavigate();
  const [loginCheck, setLoginCheck] = useState(false);
  
  const logout = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    auth.logout();
  };

  const checkLoginStatus = () => {
    if (auth.loggedIn()) {
      setLoginCheck(true);
      navigate("/me");
    } else {
      setLoginCheck(false);
      navigate("/login");
    }
  };

  useEffect(() => {
    checkLoginStatus(); 
  }, [loginCheck])

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
    {/* <Navbar.Toggle/> */}
    <Navbar.Collapse id="basic-navbar-nav">
      <Nav className="navbar-links">
        <div className="navbar-links-container">
          {loginCheck ? (
            <>
              <div>
                <Link to="/browse-decks">Browse Decks</Link>
              </div>
              <div>
                <Link to="/import">Import CSV</Link>
              </div>
              <div>
                <Link to="/me">View My Profile</Link>
              </div>
              <div onClick={(ev) => logout(ev)}>
                Logout
              </div>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              {/* <Link to="/signup">Signup</Link> I moved this to the Login page -JH*/}
            </>
          )}
        </div>
      </Nav>
    </Navbar.Collapse>
    </Container>
    </Navbar>
  );
};

export default appNavbar;
