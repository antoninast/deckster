import { useState, type FormEvent, type ChangeEvent, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { useMutation } from '@apollo/client';
import { ADD_PROFILE } from '../../utils/mutations';

import Auth from '../../utils/auth';
import './Signup.css';

const Signup = () => {
  const [formState, setFormState] = useState({
    login: '',
    email: '',
    password: '',
    passwordConfirm: '',
    securityQuestion: '',
    securityAnswer: '',
  });
  const [securityQuestions, setSecurityQuestions] = useState<string[]>([]);
  const [addProfile, { error, data }] = useMutation(ADD_PROFILE);

  useEffect(() => {
    // Fetch security questions from an API
    const fetchSecurityQuestions = async () => {
      const response = await fetch('/api/security-questions');
  
      if (!response.ok) {
        throw new Error('Failed to fetch security questions');
      }
      const questions = await response.json();
      console.log('Security Questions:', questions);
      setSecurityQuestions(questions);
      //Default to the first question if available and set the state
      setFormState((prevState) => ({
        ...prevState,
        securityQuestion: questions.length > 0 ? questions[0].question : '',
      }));
    };

    fetchSecurityQuestions();
  }, []);

  // update state based on form input changes
  const handleChange = (event: ChangeEvent) => {
    const { name, value } = event.target as HTMLInputElement;
    console.log('event.target:', event.target);
    console.log('name:', name, "value:", value);
    setFormState({
      ...formState,
      [name]: value,
    });
  };

  // submit form
  const handleFormSubmit = async (event: FormEvent) => {
    event.preventDefault();
    console.log(formState);
    // return

    // check if passwords match
    //TODO: Add a message saying that the passwords do not match
    if (formState.password !== formState.passwordConfirm) {
      console.error('Passwords do not match');
      return;
    }

    try {
      const { data } = await addProfile({
        variables: { input: { ...formState } },
      });

      Auth.login(data.addProfile.token);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <main>
      <div>
        <h4>Sign up</h4>
        <div>
          {data ? (
            <p>
              Success! You may now head{' '}
              <Link to="/">back to the homepage.</Link>
            </p>
          ) : (
            <form onSubmit={handleFormSubmit}>
              Username: <input
                placeholder="Your username"
                name="login"
                type="text"
                value={formState.login}
                onChange={handleChange}
              />
              Email address:
              <input
                placeholder="Your email"
                name="email"
                type="email"
                value={formState.email}
                onChange={handleChange}
              />
              Password:
              <input
                placeholder="******"
                name="password"
                type="password"
                value={formState.password}
                onChange={handleChange}
              />
              Confirm Password:
              <input
                placeholder="******"
                name="passwordConfirm"
                type="password"
                value={formState.passwordConfirm}
                onChange={handleChange}
              />
              Security Question:
              <select
                name="securityQuestion"
                id="drop-down"
                onChange={handleChange}
              >
                {securityQuestions.map((question, index) => (
                  <option key={index} value={question.question}>
                    {question.question}
                  </option>
                ))}
              </select>
              Security Answer:
              <input
                placeholder="Answer"
                name="securityAnswer"
                type="text"
                value={formState.securityAnswer}
                onChange={handleChange}
              />
              <button
                style={{ cursor: 'pointer' }}
                type="submit"
              >
                Submit
              </button>
            </form>
          )}
          {error && (
            <div>
              {error.message}
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default Signup;
