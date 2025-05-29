import { useQuery } from "@apollo/client";
import { useSelector } from "react-redux";
import { QUERY_MY_DECKS, QUERY_CARD_DECKS } from "../../utils/queries";
import { CardDeck } from "../../interfaces/CardDeck";

const BrowseDecks = () => {
  const user = useSelector((state: any) => {
    console.log("user here", state.user.value);
    return state.user.value;
  });

  const { loading, data } = useQuery(
    !user ? QUERY_CARD_DECKS : QUERY_MY_DECKS,
    !user ? { variables: { isPublic: true } } : {}
  );
  console.log("$$$$$$$$$$$$$$$$$$$$$$$");
  console.log("data", data);
 

  const decks = !user ? data?.cardDecks || [] : data?.myCardDecks || [];

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
            <img src={deck.image_url}></img>
          </div>
        );
      })}
    </div>
  );
};

export default BrowseDecks;
