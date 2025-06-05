import { useState, type FormEvent, type ChangeEvent } from "react";
import { Link } from "react-router-dom";
import { useLazyQuery, useMutation } from "@apollo/client";
import { QUERY_SINGLE_PROFILE_BY_USERNAME, COMPARE_SECURITY_ANSWERS } from "../../utils/queries";
// COMPARE_SECURITY_ANSWERS
import "./ResetPassword.css";
// import { PassThrough } from "stream";

const ResetPassword = () => {

  const [formState, setFormState] = useState({ 
    username: "", 
    securityAnswer: "", 
    newPassword: "", 
    confirmNewPassword: ""
  });
  const [fetchProfile] = useLazyQuery(QUERY_SINGLE_PROFILE_BY_USERNAME)
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [compareSecurityAnswers] = useLazyQuery(COMPARE_SECURITY_ANSWERS)
  const [passwordResetAvailable, setPasswordResetAvailable] = useState(false);

  // Update form state based on input changes
  const handleChange = (event: ChangeEvent) => {
    const { name, value } = event.target as HTMLInputElement;
    setFormState({
      ...formState,
      [name]: value,
    });
  };

  const fetchSecurityQuestion = async (event: FormEvent) => {
    event.preventDefault();
    console.log("fetchSecurityQuestion called with formState:", formState);
    const userData = await fetchProfile({
      // variables: { username: formState.username.toLowerCase() },
      variables: { username: formState.username },
    });
    if (!userData || !userData.data.profile) {
      console.error("User not found or profile data is missing.");
      //TODO: Make this be a modal instead of alert
      alert("This username was not found.");
      setSecurityQuestion("");
      return;
    }
    setSecurityQuestion(userData.data.profile.securityQuestion);
  };

  // Submit the security answer and verify it matches the stored answer
  const submitSecurityAnswer = async (event: FormEvent) => {
    event.preventDefault();
    // console.log("submitSecurityAnswer called with formState:", formState);

    const matchCheckResult = await compareSecurityAnswers({
      variables: {
        username: formState.username,
        securityAnswer: formState.securityAnswer,
      },
    });
    const answerMatch = matchCheckResult.data.compareSecurityAnswers;
    setPasswordResetAvailable(answerMatch);
    // TODO : Make this be a modal instead of alert
    if (!answerMatch) {
      alert("Security answer does not match. Please try again.");
      return;
    }
  };

  // // TODO : Implement logic to reset the password after verifying the security answer
  const setNewPassword = async (event: FormEvent) => {
    event.preventDefault();
    // console.log("newPassword called with formState:", formState);
    // if (formState.newPassword !== formState.confirmNewPassword) {
    //   setPasswordError("");
    //   alert("Passwords do not match. Please try again.");
    //   return;
    // }

    // // Call mutation to reset the password
  }



  const buttonHandler = !!passwordResetAvailable ? setNewPassword : !!securityQuestion ? submitSecurityAnswer : fetchSecurityQuestion;

  const buttonLabel = !!passwordResetAvailable ? "Reset Password" : !!securityQuestion ? "Submit Answer" : "Check Security Question";

  return (
    <main className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1 className="login-title">Forgot Password?</h1>
            <p className="login-subtitle">
              You can reset your password below
            </p>
          </div>

          {false ? (
            <p className="success-message">
              Success! You may now head{" "}
              <Link to="/">back to the homepage.</Link>
            </p>
          ) : (
            <>
              <form className="login-form">
                <div className="form-group">
                  {/* <label htmlFor="email">Email Address</label> */}
                  <label htmlFor="username">Username</label>
                  <input
                    id="username"
                    name="username"
                    placeholder="Enter your username"
                    type="text"
                    value={formState.username}
                    onChange={handleChange}
                    required
                    disabled={!!securityQuestion}
                  />
                </div>

                {securityQuestion && (
                  <div className="form-group">
                    <label htmlFor="securityQuestion">{securityQuestion}</label>
                    <input
                      id="securityAnswer"
                      name="securityAnswer"
                      placeholder="Enter your answer"
                      type="text"
                      onChange={handleChange}
                      required
                      disabled={!!passwordResetAvailable}
                    />
                  </div>
                )}

                {passwordResetAvailable && (
                  <div className="form-group">
                    <label htmlFor="newPassword">New Password</label>
                    <input
                      id="newPassword"
                      name="newPassword"
                      placeholder="Enter your new password"
                      type="password"
                      onChange={handleChange}
                      required
                    />
                  </div>
                )}
                {passwordResetAvailable && (
                  <div className="form-group">
                    <label htmlFor="confirmNewPassword">Confirm New Password</label>
                    <input
                      id="confirmNewPassword"
                      name="confirmNewPassword"
                      placeholder="Confirm your new password"
                      type="password"
                      onChange={handleChange}
                      required
                    />
                  </div>
                )}

                <button className="submit-button" type="submit" onClick={buttonHandler}>
                  {buttonLabel}
                </button>
              </form>

            </>
          )}
        </div>
      </div>
    </main>
  );
};

export default ResetPassword;
