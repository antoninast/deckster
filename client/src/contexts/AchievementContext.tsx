import React, { createContext, useContext, useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { QUERY_USER_ACHIEVEMENT_STATS } from "../utils/queries";
import auth from "../utils/auth";

interface Achievement {
  id: string;
  icon: string;
  title: string;
  description: string;
}

interface AchievementContextType {
  checkAchievements: () => void;
  newAchievements: Achievement[];
  clearNotifications: () => void;
}

const AchievementContext = createContext<AchievementContextType | undefined>(
  undefined
);

export const useAchievements = () => {
  const context = useContext(AchievementContext);
  if (!context) {
    throw new Error("useAchievements must be used within AchievementProvider");
  }
  return context;
};

export const AchievementProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [earnedAchievements, setEarnedAchievements] = useState<string[]>([]);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);

  const isLoggedIn = auth.loggedIn();

  const { refetch } = useQuery(QUERY_USER_ACHIEVEMENT_STATS, {
    skip: !isLoggedIn,
    fetchPolicy: "network-only",
  });

  // Load earned achievements from localStorage
  useEffect(() => {
    if (isLoggedIn) {
      const userId = auth.getProfile().data._id;
      const stored = localStorage.getItem(`achievements_${userId}`);
      if (stored) {
        setEarnedAchievements(JSON.parse(stored));
      }
    }
  }, [isLoggedIn]);


 const checkAchievements = async () => {
    console.log("🔍 Checking achievements...");

    if (!auth.loggedIn()) {
      console.log("❌ Not logged in");
      return;
    }

    const { data: freshData } = await refetch();

    if (!freshData?.userAchievementStats) {
      console.log("❌ No stats data after refetch");
      return;
    }

    const stats = freshData.userAchievementStats;
    console.log("📊 Fresh stats:", stats);
    const userId = auth.getProfile().data._id;
    const possibleAchievements: Achievement[] = [];

    // Check each achievement condition
    if (stats.totalSessions >= 1) {
      possibleAchievements.push({
        id: "first_steps",
        icon: "🎯",
        title: "First Steps",
        description: "Completed your first study session!",
      });
    }

    if (stats.bestAccuracy >= 80) {
      possibleAchievements.push({
        id: "sharp_mind",
        icon: "🧠",
        title: "Sharp Mind",
        description: "Achieved 80% accuracy or higher!",
      });
    }

    if (stats.currentStreak >= 3) {
      possibleAchievements.push({
        id: "dedicated_learner",
        icon: "🔥",
        title: "Dedicated Learner",
        description: `${stats.currentStreak} day study streak!`,
      });
    }

    if (stats.totalCardsStudied >= 100) {
      possibleAchievements.push({
        id: "century_club",
        icon: "💯",
        title: "Century Club",
        description: "Studied 100 cards total!",
      });
    }

    if (stats.bestAccuracy >= 90) {
      possibleAchievements.push({
        id: "deck_master",
        icon: "👑",
        title: "Deck Master",
        description: "Achieved 90% accuracy or higher!",
      });
    }

    if (stats.fastestSession && stats.fastestSession < 120) {
      possibleAchievements.push({
        id: "speed_demon",
        icon: "⚡",
        title: "Speed Demon",
        description: "Completed a session in under 2 minutes!",
      });
    }

    // Find newly earned achievements
   const newlyEarned = possibleAchievements.filter(
      (achievement) => !earnedAchievements.includes(achievement.id)
    );

    if (newlyEarned.length > 0) {
      console.log(`🎉 ${newlyEarned.length} new achievements!`);

      // Show all achievements at once
      setNewAchievements(newlyEarned);

      // Update earned list
      const newEarnedIds = [
        ...earnedAchievements,
        ...newlyEarned.map((a) => a.id),
      ];
      setEarnedAchievements(newEarnedIds);
      localStorage.setItem(
        `achievements_${userId}`,
        JSON.stringify(newEarnedIds)
      );
    }
  };

  const clearNotifications = () => {
    setNewAchievements([]);
  };

  return (
    <AchievementContext.Provider
      value={{
        checkAchievements,
        newAchievements, // Now plural
        clearNotifications // Now plural
      }}
    >
      {children}
    </AchievementContext.Provider>
  );
};
