import { useQuery } from '@apollo/client';

import { QUERY_PROFILES } from '../../utils/queries';

const Home = () => {
  const { loading, data } = useQuery(QUERY_PROFILES);
  const profiles = data?.profiles || [];

  return (
    <main>
      <div>
        <h3>Home Page</h3>
        {loading ? (<div>If you want to browse card decks, please, login or signup</div>) : (
          <div>
            <h3>There are {profiles.length} users.</h3>
          </div>
        )}
      </div>
    </main>
  );
};

export default Home;
