import { useState, type FormEvent, type ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { useDispatch } from "react-redux";
import { LOGIN_USER } from "../../utils/mutations";
import Auth from "../../utils/auth";
import "./Login.css";
import { setLogin } from "../../user/userState";

//TODO: Add option for "I forgot my password" to reset with security question

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formState, setFormState] = useState({ email: "", password: "" });
  const [login, { error, data }] = useMutation(LOGIN_USER);

  // update state based on form input changes
  const handleChange = (event: ChangeEvent) => {
    const { name, value } = event.target as HTMLInputElement;

    setFormState({
      ...formState,
      [name]: value,
    });
  };

  // submit form
  const handleFormSubmit = async (event: FormEvent) => {
    event.preventDefault();

    try {
      const { data } = await login({
        variables: { ...formState },
      });

      console.log("username here:", data.login.profile.username); // Changed
      dispatch(
        setLogin({
          username: data.login.profile.username, // Changed from 'name'
          _id: data.login.profile._id,
        })
      );

      Auth.login(data.login.token);
      navigate("/browse-decks");
    } catch (e) {
      console.error(e);
    }

    // clear form values
    setFormState({
      email: "",
      password: "",
    });
  };

  return (
    <main>
      <div>
        <div>
          <h4>Login</h4>
          <div className="signup-link">
            New user? Sign up <Link to="/signup">here</Link>!
          </div>
          <br></br>
          <div>
            {data ? (
              <p>
                Success! You may now head{" "}
                <Link to="/">back to the homepage.</Link>
              </p>
            ) : (
              <form onSubmit={handleFormSubmit}>
                <input
                  placeholder="Your email"
                  name="email"
                  type="email"
                  value={formState.email}
                  onChange={handleChange}
                />
                <input
                  placeholder="******"
                  name="password"
                  type="password"
                  value={formState.password}
                  onChange={handleChange}
                />
                <button className="submit-button" type="submit">
                  Submit
                </button>
              </form>
            )}
            {error && <div>{error.message}</div>}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Login;
