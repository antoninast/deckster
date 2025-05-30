import { useQuery } from "@apollo/client";
import { useNavigate } from "react-router-dom";

import { QUERY_PROFILES } from "../../utils/queries";

const Home = () => {
  const navigate = useNavigate();
  const { loading, data } = useQuery(QUERY_PROFILES);
  const profiles = data?.profiles || [];

  return (
    <main>
      <div>
        <h3>Home Page</h3>
        {loading ? (
          <div>Please wait while the page loads</div>
        ) : (
          <div>
            <h3>There are {profiles.length} users.</h3>
            <h3>Browse public decks</h3>
            <button onClick={() => navigate("/browse-decks")}>
              View Public Decks
            </button>
          </div>
        )}
      </div>
    </main>
  );
};

export default Home;
