import { useState, type FormEvent, type ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { useDispatch } from "react-redux";
import { LOGIN_USER } from "../../utils/mutations";
import Auth from "../../utils/auth";
import "./Login.css";
import { setLogin } from "../../user/userState";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formState, setFormState] = useState({ email: "", password: "" });
  const [login, { error, data }] = useMutation(LOGIN_USER);

  // Update form state based on input changes
  const handleChange = (event: ChangeEvent) => {
    const { name, value } = event.target as HTMLInputElement;
    setFormState({
      ...formState,
      [name]: value,
    });
  };

  // Handle form submission and authentication
  const handleFormSubmit = async (event: FormEvent) => {
    event.preventDefault();

    try {
      const { data } = await login({
        variables: { ...formState },
      });

      // Store user ID for app-wide access
      localStorage.setItem("userId", data.login.profile._id);

      // Update Redux store with user data
      dispatch(
        setLogin({
          username: data.login.profile.username,
          _id: data.login.profile._id,
        })
      );

      // Store auth token and redirect
      Auth.login(data.login.token);
      navigate("/browse-decks");
    } catch (e) {
      console.error(e);
    }

    // Clear form after submission
    setFormState({
      email: "",
      password: "",
    });
  };

  return (
    <main className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1 className="login-title">Welcome Back</h1>
            <p className="login-subtitle">
              New to Deckster? <Link to="/signup">Create an account</Link>
            </p>
          </div>

          {data ? (
            <p className="success-message">
              Success! You may now head{" "}
              <Link to="/">back to the homepage.</Link>
            </p>
          ) : (
            <>
              <form className="login-form" onSubmit={handleFormSubmit}>
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    id="email"
                    className="form-input"
                    placeholder="Enter your email"
                    name="email"
                    type="email"
                    value={formState.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    id="password"
                    className="form-input"
                    placeholder="Enter your password"
                    name="password"
                    type="password"
                    value={formState.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <button className="submit-button" type="submit">
                  Sign In
                </button>
              </form>

              {error && <div className="error-message">{error.message}</div>}

              <div className="forgot-password">
                <Link to="/forgot-password">Forgot your password?</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
};

export default Login;
