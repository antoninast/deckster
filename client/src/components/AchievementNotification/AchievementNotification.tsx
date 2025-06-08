import React, { useState, useEffect } from "react";
import Confetti from "react-confetti";
import "./AchievementNotification.css";

interface Achievement {
  id: string;
  icon: string;
  title: string;
  description: string;
}

interface AchievementNotificationProps {
  achievements: Achievement[];
  onClose: () => void;
}

const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  achievements,
  onClose,
}) => {
  const [show, setShow] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (achievements && achievements.length > 0) {
      setShow(true);
      setShowConfetti(true);

      // Hide notifications after 5 seconds
      const notificationTimer = setTimeout(() => {
        setShow(false);
      }, 5000);

      // Clean up after animations complete
      const cleanupTimer = setTimeout(() => {
        setShowConfetti(false);
        onClose();
      }, 5500);

      return () => {
        clearTimeout(notificationTimer);
        clearTimeout(cleanupTimer);
      };
    }
  }, [achievements, onClose]);

  if (!achievements || achievements.length === 0) return null;

  return (
    <>
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={400}
          gravity={0.15}
          initialVelocityX={4}
          initialVelocityY={-10}
          colors={["#ccd5ae", "#e9edc9", "#fefae0", "#faedcd", "#d4a373"]}
          wind={0.01}
        />
      )}
      <div className="achievement-container">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`achievement-notification ${show ? "show" : ""}`}
          >
            <div className="achievement-icon">{achievement.icon}</div>
            <div className="achievement-content">
              <h3>Achievement Unlocked!</h3>
              <h4>{achievement.title}</h4>
              <p>{achievement.description}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default AchievementNotification;
