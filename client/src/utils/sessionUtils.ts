import { v4 as uuidv4 } from "uuid";

export const createStudySession = (): string => {
  // generate new UUID
  const sessionId = uuidv4();

  // store in localStorage to persist across page refreshes
  localStorage.setItem("currentStudySessionId", sessionId);

  return sessionId;
};

export const getCurrentSessionId = (): string | null => {
  return localStorage.getItem("currentStudySessionId");
};

export const clearStudySession = (): void => {
  localStorage.removeItem("currentStudySessionId");
};
