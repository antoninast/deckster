import { useQuery } from '@apollo/client';
import { useSelector } from 'react-redux';
import { QUERY_USER_DECKS } from '../../utils/queries';

const BrowseDecks = () => {
    const user = useSelector((state: any) => {
        console.log('user here', state.user.value);
        return state.user.value
    });
    const { loading, data } = useQuery(QUERY_USER_DECKS,
        // userId is hardcoded value, must change it later 
        { variables: { userId: user?._id } }
    );

    const decks = data?.cardDecksByUser || [];

    if (loading) {
        return <div>Loading available decks...</div>;
    }

    if (!decks.length) {
        return <div>You don't have decks.</div>;
    }

    return (
        <div className="browse-page">
            <h2>Browse decks page</h2>
            {decks.map((deck: { _id: string, deckName: string, categoryId: string, image_url: string }) => {
                return (
                <div key={deck._id}>
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
