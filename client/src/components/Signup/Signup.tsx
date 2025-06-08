import { useState, type FormEvent, type ChangeEvent, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";
import { useMutation } from "@apollo/client";
import { ADD_PROFILE } from "../../utils/mutations";
import Auth from "../../utils/auth";
import "./Signup.css";

interface SecurityQuestion {
  id: number;
  question: string;
}

const Signup = () => {
  // Form state management
  const [formState, setFormState] = useState({
    username: "",
    email: "",
    password: "",
    passwordConfirm: "",
    securityQuestion: "",
    securityAnswer: "",
  });

  // Security questions from API
  const [securityQuestions, setSecurityQuestions] = useState<
    SecurityQuestion[]
  >([]);

  // Form validation errors
  const [passwordError, setPasswordError] = useState("");

  // GraphQL mutation hook
  const [addProfile, { error, data }] = useMutation(ADD_PROFILE);

  // Fetch security questions on component mount
  useEffect(() => {
    const fetchSecurityQuestions = async () => {
      try {
        const response = await fetch("/api/security-questions");
        if (!response.ok) {
          throw new Error("Failed to fetch security questions");
        }
        const questions = await response.json();
        setSecurityQuestions(questions);

        // Set default selection to first question
        if (questions.length > 0) {
          setFormState((prevState) => ({
            ...prevState,
            securityQuestion: questions[0].question,
          }));
        }
      } catch (error) {
        console.error("Error fetching security questions:", error);
      }
    };

    fetchSecurityQuestions();
  }, []);

  // Handle form input changes
  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setFormState({
      ...formState,
      [name]: value,
    });

    // Clear password error when user types in password fields
    if (name === "password" || name === "passwordConfirm") {
      setPasswordError("");
    }
  };

  // Handle form submission
  const handleFormSubmit = async (event: FormEvent) => {
    event.preventDefault();

    // Validate password match
    if (formState.password !== formState.passwordConfirm) {
      setPasswordError("Passwords do not match");
      return;
    }

    // Extract form data for mutation
    const { email, password, securityAnswer, securityQuestion, username } =
      formState;
    const formStateCopy = {
      email,
      password,
      securityAnswer,
      securityQuestion,
      username,
    };

    try {
      const { data } = await addProfile({
        variables: { input: formStateCopy },
      });
      // Auto-login user after successful registration
      Auth.login(data.addProfile.token);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <main className="signup-page">
      <div className="signup-container">
        <div className="signup-card">
          <div className="signup-header">
            {!data ? <h1 className="signup-title">Create Account</h1> : null}
            {!data ? <p className="signup-subtitle">
              Already have an account? <Link to="/login">Sign in</Link>
            </p> : null}
          </div>

          {data ? (
            <p className="success-message">
              <div className="success-animation">
                <FaCheckCircle className="success-icon" />
              </div>
              <h3>Your account was created!</h3>
              <Link to="/login">Go to login page</Link>
            </p>
          ) : (
            <>
              <form className="signup-form" onSubmit={handleFormSubmit}>
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <input
                    id="username"
                    className="form-input"
                    placeholder="Choose a username"
                    name="username"
                    type="text"
                    value={formState.username}
                    onChange={handleChange}
                    required
                  />
                </div>

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
                    placeholder="Create a password (min. 5 characters)"
                    name="password"
                    type="password"
                    value={formState.password}
                    onChange={handleChange}
                    required
                    minLength={5}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="passwordConfirm">Confirm Password</label>
                  <input
                    id="passwordConfirm"
                    className="form-input"
                    placeholder="Re-enter your password"
                    name="passwordConfirm"
                    type="password"
                    value={formState.passwordConfirm}
                    onChange={handleChange}
                    required
                  />
                </div>

                {passwordError && (
                  <div className="field-error">{passwordError}</div>
                )}

                <div className="form-group">
                  <label htmlFor="securityQuestion">Security Question</label>
                  <select
                    id="securityQuestion"
                    className="form-select"
                    name="securityQuestion"
                    value={formState.securityQuestion}
                    onChange={handleChange}
                    aria-label="Select a security question"
                    required
                  >
                    {securityQuestions.map((question) => (
                      <option key={question.id} value={question.question}>
                        {question.question}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="securityAnswer">Security Answer</label>
                  <input
                    id="securityAnswer"
                    className="form-input"
                    placeholder="Your answer (case sensitive)"
                    name="securityAnswer"
                    type="text"
                    value={formState.securityAnswer}
                    onChange={handleChange}
                    required
                  />
                </div>

                <button className="submit-button" type="submit">
                  Create Account
                </button>
              </form>

              {error && <div className="error-message">{error.message}</div>}

              <div className="privacy-notice">
                By creating an account, you agree to our Terms of Service and
                Privacy Policy.
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
};

export default Signup;
