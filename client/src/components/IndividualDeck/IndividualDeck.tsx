import { useState } from "react";
import { FaCog, FaBookOpen, FaFileImport, FaLock } from "react-icons/fa";
import { MdLeaderboard, MdPublic } from "react-icons/md";
import { GrTrash } from "react-icons/gr";
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
  const [showLeaderBoard, setShowLeaderBoard] = useState(false);

  const handleLeaderBoard = (isFront: boolean) => {
    setShowLeaderBoard(isFront);
  }
  return (
    <div className="deck-wrapper" onMouseLeave={() => setShowLeaderBoard(false)}>
      <div
        className={`deck ${showLeaderBoard ? 'flipped' : ''}`}
      >  
        <div className={`deck-front ${showLeaderBoard ? 'show-leader-board' : ''}`}>
          <div className="card-header">
            <h3 className="card-title">{deck.name}</h3>
            {user?._id === deck?.user?._id && (
              <div
                className="deck-delete-button-wrapper"
                onClick={() => handleRemoveCardDeck(deck._id)}
                aria-label="Delete deck"
              >
                <GrTrash />
              </div>
            )}
          </div>
          <div className="deck-details">
            <div className="deck-stat">
              <span className="deck-stat-label stat-category">Category:</span>
              <span className="deck-stat-value">{deck.categoryName}</span>
            </div>
            <div className="deck-stat">
              <span className="deck-stat-label stat-total">Number of cards:</span>
              <span className="deck-stat-value">{deck.numberOfCards}</span>
            </div>
            <div className="deck-stat">
              <span className="deck-stat-label stat-accuracy">Accuracy:</span>
              <span className="deck-stat-value">
                {deck.userStudyAttemptStats?.attemptAccuracy?.toFixed(1) ||
                  "0.0"}
                %
              </span>
            </div>
            <div className="deck-stat">
              <span className="deck-stat-label stat-proficiency">Proficiency:</span>
              <span
                className={`proficiency-badge ${getProficiencyClass(
                  deck.userStudyAttemptStats?.proficiency
                )}`}
              >
                {deck.userStudyAttemptStats?.proficiency || "No Data"}
              </span>
            </div>
            {user?._id === deck.user._id ? 
              <div className="deck-stat visibility">
                <span className="deck-stat-label stat-visibility">Visibility:</span>
                <div className="dropdown">
                  {deck.isPublic ? <MdPublic /> : <FaLock />}
                  <button className="btn dropdown-toggle visibility" type="button" data-bs-toggle="dropdown" aria-expanded="false"></button>
                  <ul className="dropdown-menu">
                    <li onClick={() => handleVisibility(deck._id, false)} id="only-me"><a className="dropdown-item" href="#">Only me</a></li>
                    <li onClick={() => handleVisibility(deck._id, true)} id="public"><a className="dropdown-item" href="#">Public</a></li>
                  </ul>
                </div>
              </div> : null
            }
            {user?._id !== deck.user._id ?
              <div className="deck-stat">
                <span className="deck-stat-label stat-creator">Created by:</span>
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
            {deck.isPublic ?          
              <button
                onClick={() => handleLeaderBoard(true)}
                type="button"
                className="deck-action-btn btn-leader-board"
              >
                <MdLeaderboard className="btn-icon"/>
                Rankings
              </button> : null
            }
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
        <div className="deck-back">
          <div className="card-header">
            <h3 className="card-title">Leader Board</h3>
          </div>
          <div className="leader-board-details">
            {deck?.leaderBoard?.length ? (
              <div className="leader-board">
                <div className="leader-board-header">
                  <span>Rank</span>
                  <span>Username</span>
                  <span>Accuracy</span>
                </div>
                {deck.leaderBoard.map((row, index) => (
                  <div className="leader-board-row" key={row.username + index}>
                    <span>{index + 1}</span>
                    <span>{row.username}</span>
                    <span>{row.attemptAccuracy.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            ) : (
              <h5>This deck hasn't been studied by any users yet.</h5>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default IndividualDeck;
