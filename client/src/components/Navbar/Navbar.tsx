import { Link } from "react-router-dom";
import { type MouseEvent } from "react";
import "./Navbar.css";
import Auth from "../../utils/auth";

const Navbar = () => {
  const logout = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    Auth.logout();
  };

  return (
    <div className="navbar">
      {Auth.loggedIn() ? (
        <>
          <div>
            <Link to="/browse-decks">Browse Decks</Link>
          </div>
          <div>
            <Link to="/import">Import CSV</Link>
          </div>
          <Link to="/me">View My Profile</Link>
          <div onClick={(ev) => logout(ev)}>Logout</div>
        </>
      ) : (
        <>
          <Link to="/login">Login</Link>
          <Link to="/signup">Signup</Link>
        </>
      )}
    </div>
  );
};

export default Navbar;
