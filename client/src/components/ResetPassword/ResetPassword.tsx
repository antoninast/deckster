import { useState, type FormEvent, type ChangeEvent } from "react";
import { Link } from "react-router-dom";
import { useLazyQuery } from "@apollo/client";
import { QUERY_SINGLE_PROFILE_BY_USERNAME } from "../../utils/queries";
import "./ResetPassword.css";



const ResetPassword = () => {

  const [formState, setFormState] = useState({ username: ""});
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [fetchProfile] = useLazyQuery(QUERY_SINGLE_PROFILE_BY_USERNAME)


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
      variables: { username: formState.username },
    });
    setSecurityQuestion(userData.data.profile.securityQuestion);
  }

  const submitSecurityAnswer = async (event: FormEvent) => {
    event.preventDefault();
    console.log("submitSecurityAnswer called with formState:", formState);
    // TODO: Implement logic to verify the security answer
    // const userData = await fetchProfile({
    //   variables: { username: formState.username },
    // });
    

  }

  // TODO : Implement logic to reset the password after verifying the security answer
  // const newPassword = async (event: FormEvent) => {
  //   event.preventDefault();

  // }

  const buttonHandler = !!securityQuestion ? submitSecurityAnswer : fetchSecurityQuestion;

  const buttonLabel = !!securityQuestion ? "Submit Answer" : "Check Security Question";

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
                    />
                  </div>
                )}

                <button className="submit-button" type="submit" onClick={buttonHandler}>
                  {buttonLabel}
                </button>
              </form>

              {/* {error && <div className="error-message">{error.message}</div>} */}

            </>
          )}
        </div>
      </div>
    </main>
  );
};

export default ResetPassword;
