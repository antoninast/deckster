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

import App from "./App.jsx";
import Home from "./components/HomePage/Home.js";
import Profile from "./components/Profile/Profile.js";
import Signup from "./components/Signup/Signup.js";
import Login from "./components/Login/Login.js";
import Error from "./components/Error/Error.js";
import BrowseDecks from "./components/BrowseDecks/BrowseDecks.js";
import Study from "./components/Study/Study.js";
import ManageFlashcards from "./components/ManageFlashcards/ManageFlashcards.js";
import ImportPage from "./pages/ImportPage.js";
import { store } from "./app/store";
import "./styles/variables.css";
import "./styles/animations.css";

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
        element: <div>Forgot Password Page (not implemented)</div>,
      }
    ],
  },
]);

const client = new ApolloClient({
  link: authLink.concat(httpLink),
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
