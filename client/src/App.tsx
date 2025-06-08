import { Outlet } from "react-router-dom";
import Footer from "./components/Footer/Footer";
import Navbar from "./components/Navbar/Navbar";
import { AchievementProvider } from "./contexts/AchievementContext";
import AchievementNotification from "./components/AchievementNotification/AchievementNotification";
import { useAchievements } from "./contexts/AchievementContext";
import "./App.css";

// Create a separate component for the content
function AppContent() {
  const { newAchievements, clearNotifications } = useAchievements();

  return (
    <div className="viewport">
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
      <AchievementNotification
        achievements={newAchievements}
        onClose={clearNotifications}
      />
    </div>
  );
}

// Main App wraps everything with the provider
function App() {
  return (
    <AchievementProvider>
      <AppContent />
    </AchievementProvider>
  );
}

export default App;
