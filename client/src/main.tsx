import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";

import App from "./App.jsx";
import Avatar from "./components/Avatar/Avatar.js";
import BrowseDecks from "./components/BrowseDecks/BrowseDecks.js";
import Error from "./components/Error/Error.js";
import Home from "./components/HomePage/Home.js";
import ImportPage from "./pages/ImportPage.js";
import Login from "./components/Login/Login.js";
import ManageFlashcards from "./components/ManageFlashcards/ManageFlashcards.js";
import Profile from "./components/Profile/Profile.js";
import ResetPassword from "./components/ResetPassword/ResetPassword.js";
import Signup from "./components/Signup/Signup.js";
import Study from "./components/Study/Study.js";
import { store } from "./app/store";
import "./styles/animations.css";
import "./styles/variables.css";

// Apollo Client configuration
const httpLink = createHttpLink({
  uri: "/graphql",
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("id_token");
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

// Handle GraphQL errors (401, etc.)
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    for (let err of graphQLErrors) {
      if (err.message === "Invalid or expired token") {
        // Remove token and redirect
        localStorage.removeItem("id_token");
        localStorage.removeItem("userId");
        window.location.href = "/login";
      }
    }
  }

  if (networkError) {
    localStorage.removeItem("id_token");
    localStorage.removeItem("userId");
    window.location.href = "/login";
  }
});

// Route configuration
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <Error />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/signup",
        element: <Signup />,
      },
      {
        path: "/profile/:profileId",
        element: <Profile />,
      },
      {
        path: "/me",
        element: <Profile />,
      },
      {
        path: "/profile/avatars",
        element: <Avatar />,
      },
      {
        path: "/browse-decks",
        element: <BrowseDecks />,
      },
      {
        path: "/study-deck/:deckId",
        element: <Study />,
      },
      {
        path: "/browse-decks/:deckId",
        element: <ManageFlashcards />,
      },
      {
        path: "/import",
        element: <ImportPage />,
      },
      {
        path: "/deck/:deckId/import",
        element: <ImportPage />,
      },
      {
        path: "/forgot-password",
        element: <ResetPassword />,
      }

    ],
  },
]);

const client = new ApolloClient({
  link: errorLink.concat(authLink.concat(httpLink)),
  cache: new InMemoryCache(),
});

// Application root
const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <Provider store={store}>
      <ApolloProvider client={client}>
        <RouterProvider router={router} />
      </ApolloProvider>
    </Provider>
  );
}
