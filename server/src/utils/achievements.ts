export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  check: (stats: any) => boolean;
}

export const achievements: Achievement[] = [
  {
    id: "first_session",
    title: "First Steps",
    description: "Complete your first study session",
    icon: "🎯",
    check: (stats) => stats.totalSessions >= 1
  },
  {
    id: "accuracy_80",
    title: "Sharp Mind",
    description: "Achieve 80%+ accuracy on any deck",
    icon: "🎯",
    check: (stats) => stats.bestAccuracy >= 80
  },
  {
    id: "study_streak_3",
    title: "Dedicated Learner",
    description: "Study 3 days in a row",
    icon: "🔥",
    check: (stats) => stats.currentStreak >= 3
  },
  {
    id: "cards_100",
    title: "Century Club",
    description: "Study 100+ total cards",
    icon: "💯",
    check: (stats) => stats.totalCardsStudied >= 100
  },
  {
    id: "deck_master",
    title: "Deck Master",
    description: "Achieve 90%+ accuracy on a deck",
    icon: "👑",
    check: (stats) => stats.bestAccuracy >= 90
  },
  {
    id: "speed_demon",
    title: "Speed Demon",
    description: "Complete a session in under 2 minutes",
    icon: "⚡",
    check: (stats) => stats.fastestSession && stats.fastestSession < 120
  }
];

export const checkAchievements = (userStats: any): string[] => {
  const earnedIds: string[] = [];

  achievements.forEach(achievement => {
    if (achievement.check(userStats)) {
      earnedIds.push(achievement.id);
    }
  });

  return earnedIds;
};