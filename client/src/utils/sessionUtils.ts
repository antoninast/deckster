import { v4 as uuidv4 } from "uuid";
import { DateTime, Duration } from "luxon";

export const createStudySession = (): string => {
  // generate new UUID
  const sessionId = uuidv4();

  // get current time as ISO string
  const startTime = DateTime.now().toISO();

  // store in localStorage to persist across page refreshes
  localStorage.setItem("currentStudySessionId", sessionId);
  localStorage.setItem("sessionStartTime", startTime);

  return sessionId;
};

export const getCurrentSessionId = (): string | null => {
  return localStorage.getItem("currentStudySessionId");
};

export const clearStudySession = (): void => {
  localStorage.removeItem("currentStudySessionId");
  localStorage.removeItem("sessionStartTime");
};

export const getSessionDuration = (): Duration | null => {
  const startTimeStr = localStorage.getItem("sessionStartTime");

  if (!startTimeStr) {
    return null;
  }

  const startTime = DateTime.fromISO(startTimeStr);
  const endTime = DateTime.now();
  console.log("DateTime Start", startTime);
  console.log("DateTime End", endTime);
  const duration = endTime.diff(startTime);

  return duration;
};

export const formatSessionDuration = (duration: Duration | null): string => {
  if (!duration) {
    return "00:00:00";
  }
  return `${duration.toFormat("hh:mm:ss")}`; // Format as hours:minutes:seconds
};
