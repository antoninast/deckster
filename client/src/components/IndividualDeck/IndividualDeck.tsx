import { FaCog, FaBookOpen, FaFileImport, FaLock } from "react-icons/fa";
import { MdPublic } from "react-icons/md";
import { CardDeck } from "../../interfaces/CardDeck";
import "./IndividualDeck.css";

interface Props {
    deck: CardDeck;
    user: any;
    handleRemoveCardDeck: (id: string) => void;
    handleManageDeck: (id: string) => void;
    handleStudyDeck: (id: string) => void;
    handleImportFlashcard: (id: string) => void;
    getProficiencyClass: (proficiency: string | undefined) => void;
    handleVisibility: (id: string, isPublic: boolean) => void;
}

const IndividualDeck = ({
    deck,
    user,
    handleRemoveCardDeck,
    handleManageDeck,
    handleStudyDeck,
    handleImportFlashcard,
    getProficiencyClass,
    handleVisibility,
}: Props) => {
    return (
        <div className="deck card">
          <div className="card-header">
            <h3 className="card-title">{deck.name}</h3>
            {user?._id === deck?.user?._id && (
              <div
                className="deck-delete-button-wrapper"
                onClick={() => handleRemoveCardDeck(deck._id)}
                aria-label="Delete deck"
              >
                <svg xmlns="http://www.w3.org/2000/svg"
                  width="17" height="17" fill="gray" className="bi bi-x-square delete-icon" viewBox="0 0 16 16">
                  <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/>
                  <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
                </svg>
              </div>
            )}
          </div>
          <div className="deck-details">
            <div className="deck-stat">
              <span className="deck-stat-label">Category:</span>
              <span className="deck-stat-value">{deck.categoryName}</span>
            </div>
            <div className="deck-stat">
              <span className="deck-stat-label">Accuracy:</span>
              <span className="deck-stat-value">
                {deck.userStudyAttemptStats?.attemptAccuracy?.toFixed(1) ||
                  "0.0"}
                %
              </span>
            </div>
            <div className="deck-stat">
              <span className="deck-stat-label">Total flashcards:</span>
              <span className="deck-stat-value">{deck.isPublic}</span>
            </div>
            <div className="deck-stat">
              <span className="deck-stat-label">Proficiency:</span>
              <span
                className={`proficiency-badge ${getProficiencyClass(
                  deck.userStudyAttemptStats?.proficiency
                )}`}
              >
                {deck.userStudyAttemptStats?.proficiency || "No Data"}
              </span>
            </div>
            <div className="deck-stat visibility">
              <span className="deck-stat-label">Visibility:</span>
              <div className="dropdown">
                {deck.isPublic ? <MdPublic /> : <FaLock />}
                {user._id === deck.user._id ?
                  <>
                    <button className="btn dropdown-toggle visibility" type="button" data-bs-toggle="dropdown" aria-expanded="false"></button>
                    <ul className="dropdown-menu">
                      <li onClick={() => handleVisibility(deck._id, false)} id="only-me"><a className="dropdown-item" href="#">Only me</a></li>
                      <li onClick={() => handleVisibility(deck._id, true)} id="public"><a className="dropdown-item" href="#">Public</a></li>
                    </ul>
                  </> : null
                }
              </div>
            </div>
            {deck?.user?.username ?
              <div className="deck-stat">
                <span className="deck-stat-label">Created by:</span>
                <span className="deck-stat-value">{deck?.user?.username}</span>
              </div> : null
            }
          </div>
          <div className="action-buttons">
            {user?._id === deck?.user?._id ?
              <button
                onClick={() => handleManageDeck(deck._id)}
                type="button"
                className="deck-action-btn btn-manage"
              >
                <FaCog className="btn-icon" />
                Manage
              </button> : null
            }
            <button
              onClick={() => handleStudyDeck(deck._id)}
              type="button"
              className="deck-action-btn btn-study"
            >
              <FaBookOpen className="btn-icon" />
              Study
            </button>
            {user?._id === deck?.user?._id ?
              <button
                onClick={() => handleImportFlashcard(deck._id)}
                type="button"
                className="deck-action-btn btn-import"
              >
                <FaFileImport className="btn-icon" />
                Import
              </button> : null
            }
          </div>
        </div>
    )
}

export default IndividualDeck;
