import { useQuery } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { QUERY_PROFILES } from "../../utils/queries";
import {
  FaPlay,
  FaBrain,
  FaUsers,
  FaChartLine,
  FaLayerGroup,
  FaUserPlus,
} from "react-icons/fa";
import auth from "../../utils/auth";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();
  const { loading, data } = useQuery(QUERY_PROFILES);
  const profiles = data?.profiles || [];
  const isLoggedIn = auth.loggedIn();

  return (
    <main className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Master Any Subject with
              <span className="hero-highlight"> Smart Flashcards ✨</span>
            </h1>
            <p className="hero-subtitle">
              🎯 Join {loading ? "..." : profiles.length} learners already using
              Deckster to ace their studies
            </p>

            <div className="hero-buttons">
              {isLoggedIn ? (
                <button
                  className="btn-hero-primary"
                  onClick={() => navigate("/browse-decks")}
                >
                  <FaLayerGroup className="btn-icon" />
                  <span>Go to My Decks</span>
                </button>
              ) : (
                <>
                  <button
                    className="btn-hero-primary"
                    onClick={() => navigate("/signup")}
                  >
                    <FaUserPlus className="btn-icon" />
                    <span>Start Learning Free</span>
                  </button>
                  <button
                    className="btn-hero-primary"
                    onClick={() => navigate("/browse-decks")}
                  >
                    <FaLayerGroup className="btn-icon" />
                    <span>Browse Public Decks</span>
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="hero-visual">
            <div className="floating-cards">
              <div className="float-card card-1">
                <h4>Q: What is React?</h4>
                <p>A: JS library for UIs</p>
              </div>
              <div className="float-card card-2">
                <h4>Q: Define GraphQL</h4>
                <p>A: Query language</p>
              </div>
              <div className="float-card card-3">
                <h4>Q: What is JWT?</h4>
                <p>A: JSON Web Token</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-container">
          <h2 className="section-title">Why Choose Deckster?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <FaPlay className="feature-icon" />
              <h3>Quick Start</h3>
              <p>
                Create your first deck in seconds. Import from CSV or start from
                scratch.
              </p>
            </div>
            <div className="feature-card">
              <FaBrain className="feature-icon" />
              <h3>Smart Learning</h3>
              <p>Track your progress with detailed analytics.</p>
            </div>
            <div className="feature-card">
              <FaUsers className="feature-icon" />
              <h3>Community Decks</h3>
              <p>Access public decks created by our community.</p>
            </div>
            <div className="feature-card">
              <FaChartLine className="feature-icon" />
              <h3>Track Progress</h3>
              <p>Monitor your accuracy and see your improvement over time.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
