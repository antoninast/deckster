import type { CardDeck } from '../../interfaces/CardDeck';
import { useQuery } from '@apollo/client';
import { QUERY_USER_DECKS } from '../../utils/queries';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const BrowseDecks = () => {
    const { loading, data } = useQuery(QUERY_USER_DECKS,
        // userId is hardcoded value, must change it later 
        { variables: { userId: '6542b3b0a8e9b2b4d7b6c8e0' } }
    );

    const decks = data?.cardDecksByUser || [];
    console.log(decks);

    // const { username } = jwtDecode(auth.getToken()) as { username: string };

    //TODO User does not need to be logged in to be able to browse, but if they are logged in, they will see the ability to add a deck to their Personal Library
    // const getUserIdByUsername = async () => {
    //     const response = await fetch(`${BASE_URL}/api/users/username/${username}`);
    //     const data = await response.json();
    //     return data.id;
    // }

    if (loading) {
        return <div>Loading available decks...</div>;
    }

    if (!decks.length) {
        return <div>No item found</div>;
    }

    return (
        <div className="browse-page">
            <h2>Browse decks page</h2>
            {decks.map((deck: { _id: string, deckName: string, categoryId: string, image_url: string }) => {
                return (
                <div>
                   <p>Deck id:{deck._id}</p>
                   <p>Deck name: {deck.deckName}</p>
                   <p>Deck category: {deck.categoryId}</p>
                   <img src={deck.image_url}></img>
                </div>)
            })}
        </div>
    );
};

export default BrowseDecks;
