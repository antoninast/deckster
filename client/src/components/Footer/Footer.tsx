import "./Footer.css";

/**
 * Footer component displaying copyright and tagline
 */
const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <span>© 2025 Deckster</span>
        <span className="separator">•</span>
        <span>Smart Flashcards</span>
      </div>
    </footer>
  );
};

export default Footer;
