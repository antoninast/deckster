import { useMutation, useQuery } from "@apollo/client";
import { useSelector } from "react-redux";
import { QUERY_MY_DECKS, QUERY_CARD_DECKS } from "../../utils/queries";
import { CardDeck } from "../../interfaces/CardDeck";
import { REMOVE_CARDDECK } from "../../utils/mutations";
import { useNavigate } from "react-router-dom";

const BrowseDecks = () => {
  const navigate = useNavigate();
  const user = useSelector((state: any) => {
    console.log("user here", state.user.value);
    return state.user.value;
  });

  const { loading, data } = useQuery(
    !user ? QUERY_CARD_DECKS : QUERY_MY_DECKS,
    !user ? { variables: { isPublic: true } } : {}
  );

  const decks = !user ? data?.cardDecks || [] : data?.myCardDecks || [];

  const [removeCardDeck, { error }] = useMutation(REMOVE_CARDDECK);

  const handleRemoveCardDeck = async (deckId: string) => {
    try {
      const { data } = await removeCardDeck({
        variables: { deckId } 
      });
      console.log('removed card deck', data, error);
    } catch (error) {
      throw new Error(`Failed to remove the deck, ${error}`);
    }
  }

  const handleOpenDeck = (deckId: string) => {
    navigate(`/browse-decks/${deckId}`)
  }

  if (loading) {
    return <div>Loading available decks...</div>;
  }

  if (!decks.length) {
    return <div>You don't have decks.</div>;
  }

  return (
    <div className="browse-page">
      <h2>Browse decks page</h2>
      {decks.map((deck: CardDeck) => {
        return (
          <div key={deck._id}>
            <p>Deck id:{deck._id}</p>
            <p>Deck name: {deck.name}</p>
            <p>Deck category: {deck.categoryName}</p>
            <p>
              Accuracy: {deck.userStudyAttemptStats?.attemptAccuracy?.toFixed(1)}%
            </p>
            <p>
              Proficiency: {deck.userStudyAttemptStats?.proficiency || "No Data"}
            </p>
            <img src={deck.image_url} alt={deck.name}></img>
            <button onClick={() => handleRemoveCardDeck(deck._id)}>Delete</button>
            <button onClick={() => handleOpenDeck(deck._id)}>Open deck</button>
          </div>
        );
      })}
    </div>
  );
};

export default BrowseDecks;
