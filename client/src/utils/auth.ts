import { type JwtPayload, jwtDecode } from "jwt-decode";

// Extended JWT interface to include user data structure
interface ExtendedJwt extends JwtPayload {
  data: {
    username: string;
    email: string;
    _id: string;
  };
}

class AuthService {
  // Decode and return the user profile from the JWT token
  getProfile() {
    return jwtDecode<ExtendedJwt>(this.getToken());
  }

  // Check if user is currently logged in with a valid token
  loggedIn() {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  // Verify if the JWT token has expired
  isTokenExpired(token: string) {
    try {
      const decoded = jwtDecode<JwtPayload>(token);

      if (decoded?.exp && decoded?.exp < Date.now() / 1000) {
        return true;
      }
    } catch (err) {
      return false;
    }
  }

  // Retrieve the JWT token from localStorage
  getToken(): string {
    const loggedUser = localStorage.getItem("id_token") || "";
    return loggedUser;
  }

  // Store the JWT token on successful login
  login(idToken: string) {
    localStorage.setItem("id_token", idToken);
  }

  // Clear all authentication data and redirect to home
  logout() {
    localStorage.removeItem("id_token");
    localStorage.removeItem("userId");
    window.location.assign("/");
  }
}

export default new AuthService();
