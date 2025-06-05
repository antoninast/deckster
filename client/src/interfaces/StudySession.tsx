export enum SessionStatus {
  active = "active",
  completed = "completed",
  abandoned = "abandoned",
}

export interface IStudySession {
  _id: string;
  userId: string;
  deckId: string;
  startTime: string;
  endTime: string | null;
  clientDuration: number;
  calculatedDuration: number | null;
  totalAttempts: number;
  correctAttempts: number;
  status: SessionStatus;
  sessionAccuracy: number;
  createdAt: string;
  updatedAt: string;
}

export interface IStudySessions {
  totalAttempts: number;
  correctAttempts: number;
  sessionAccuracy: number;
  clientDuration: number;
  status: SessionStatus;
}

export interface ISessionResponse {
  startStudySession: IStudySession;
}

export interface IEndSessionResponse {
  endStudySession: IStudySession;
}
