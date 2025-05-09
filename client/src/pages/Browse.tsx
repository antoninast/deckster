import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { jwtDecode } from 'jwt-decode';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import type { CardDeck } from '../interfaces/CardDeck';
import auth from '../utils/auth';
import '../styles/index.css';
import '../styles/browse.css';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const BrowsePage = () => {
    const [deck, setDeck] = useState< CardDeck | null>(null);
    const [loading, setLoading] = useState(true);
    const [show, setShow] = useState(false);
    const [modalText, setModalText] = useState('');

    const handleClose = () => setShow(false);
    const handleShow = (data: string) => {
        setModalText(data);
        setShow(true)
    };

    const params = useParams(); // useParams is a hook that returns an object of key/value pairs of URL parameters -JH
    console.log(params.id)

    const { username } = jwtDecode(auth.getToken()) as { username: string };

    //TODO User does not need to be logged in to be able to browse, but if they are logged in, they will see the ability to add a deck to their Personal Library
    const getUserIdByUsername = async () => {
        const response = await fetch(`${BASE_URL}/api/users/username/${username}`);
        const data = await response.json();
        return data.id;
    }

    const fetchDeckstchProduct = async () => {
        try {
            const response = await fetch(`${BASE_URL}/api/decks/` + params.id);
            if (!response.ok) {
                throw new Error("Network response was not ok 😅");
            }
            const data = await response.json();
            setDeck(data);
        } catch (error) {
            console.error("Error fetching available flashcard decks:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToPersonalLibrary = async () => {
        const userId = await getUserIdByUsername();
        const response = await fetch(`${BASE_URL}/api/users/${userId}/decks`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${auth.getToken()}`
            },
            body: JSON.stringify({
                deck_id: params.id,
                quantity: 1
            })
        });
        const data = await response.json();
        handleShow(data.message);
    }

    useEffect(() => {
        fetchDecks();
    }, []);

    if (loading) {
        return <div>Loading available decks...</div>;
    }

    if (!deck) {
        return <div>No item found</div>;
    }

    return (
        <div className="browse-page">
            {/* <Modal show={show} onHide={handleClose}>
                <Modal.Body><h4>{modalText}</h4></Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={handleClose}>Ok</Button>
                </Modal.Footer>
            </Modal> */}
            <div className="deck-title">
                <h1 className="deck-name">{deck.name}</h1>
                <p><i>Category: {deck.category}</i></p>
            </div>
            <div className="deck-details">
                <div className="deck-image-container">
                    <img className="deck-image" src={deck.image_url} alt={deck.name} />
                </div>
                <div className="deck-buttons">
                    <p className="deck-description">{deck.description}</p>
                    <p className="deck-user-count">Price: ${deck.usercount}</p>
                    <button className="btn-primary add" onClick={() => handleAddToPersonalLibrary()}>Add to Personal Library</button>
                </div>
            </div>
        </div>
    );
};

export default BrowsePage;
