import { useState, type FormEvent, type ChangeEvent, useEffect } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { ADD_PROFILE } from "../../utils/mutations";
import Auth from "../../utils/auth";
import "./Signup.css";

interface SecurityQuestion {
  id: number;
  question: string;
}

const Signup = () => {
  const [formState, setFormState] = useState({
    username: "", // Changed from 'login'
    email: "",
    password: "",
    passwordConfirm: "",
    securityQuestion: "",
    securityAnswer: "",
  });
  const [securityQuestions, setSecurityQuestions] = useState<
    SecurityQuestion[]
  >([]);
  const [passwordError, setPasswordError] = useState("");
  const [addProfile, { error, data }] = useMutation(ADD_PROFILE);

  useEffect(() => {
    const fetchSecurityQuestions = async () => {
      try {
        const response = await fetch("/api/security-questions");

        if (!response.ok) {
          throw new Error("Failed to fetch security questions");
        }
        const questions = await response.json();
        console.log("Security Questions:", questions);
        setSecurityQuestions(questions);

        // Default to the first question if available
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

  // update state based on form input changes
  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;

    setFormState({
      ...formState,
      [name]: value,
    });

    // Clear password error when user types
    if (name === "password" || name === "passwordConfirm") {
      setPasswordError("");
    }


  };

  // submit form
  const handleFormSubmit = async (event: FormEvent) => {
    event.preventDefault();

    // check if passwords match
    if (formState.password !== formState.passwordConfirm) {
      setPasswordError("Passwords do not match");
      return;
    }

    const {email, password, securityAnswer, securityQuestion, username} = formState;

    const formStateCopy = { email, password, securityAnswer, securityQuestion, username };

    try {
      const { data } = await addProfile({
        variables: { input: formStateCopy},
      });

      Auth.login(data.addProfile.token);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <main className="signup-container">
      <div className="signup-wrapper">
        <h4 className="signup-title">Sign up</h4>
        <div className="signup-content">
          {data ? (
            <p className="success-message">
              Success! You may now head{" "}
              <Link to="/">back to the homepage.</Link>
            </p>
          ) : (
            <form className="signup-form" onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label htmlFor="username">Username:</label>
                <input
                  id="username"
                  className="form-input"
                  placeholder="Your username"
                  name="username"
                  type="text"
                  value={formState.username}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email address:</label>
                <input
                  id="email"
                  className="form-input"
                  placeholder="Your email"
                  name="email"
                  type="email"
                  value={formState.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password:</label>
                <input
                  id="password"
                  className="form-input"
                  placeholder="******"
                  name="password"
                  type="password"
                  value={formState.password}
                  onChange={handleChange}
                  required
                  minLength={5}
                />
              </div>

              <div className="form-group">
                <label htmlFor="passwordConfirm">Confirm Password:</label>
                <input
                  id="passwordConfirm"
                  className="form-input"
                  placeholder="******"
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
                <label htmlFor="securityQuestion">Security Question:</label>
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
                <label htmlFor="securityAnswer">Security Answer:</label>
                <input
                  id="securityAnswer"
                  className="form-input"
                  placeholder="Your answer"
                  name="securityAnswer"
                  type="text"
                  value={formState.securityAnswer}
                  onChange={handleChange}
                  required
                />
              </div>

              <button className="submit-button" type="submit">
                Submit
              </button>
            </form>
          )}

          {error && <div className="error-message">{error.message}</div>}
        </div>
      </div>
    </main>
  );
};

export default Signup;
