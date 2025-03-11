export interface Participant {
  id: string;
  name: string;
  hasSpoken: boolean;
  speakingTime: number; // Total time in seconds
  turnCount: number;    // Number of times they've had the token
}

export interface Topic {
  id: string;
  title: string;
  description?: string;
  isActive: boolean;
}

export interface ParticipantTopicStatus {
  participantId: string;
  topicId: string;
  hasSpoken: boolean;
  speakingTime: number;
  turnCount: number;
}

export interface TokenState {
  currentHolder: string | null;
  previousHolder: string | null;
  timeRemaining: number; // Time remaining in seconds for current holder
  isActive: boolean;     // Whether the timer is currently running
  maxSpeakingTime: number; // Maximum speaking time in seconds
  currentTopicId: string | null; // Current active topic
}

export type TokenPassMethod = 'manual' | 'automatic' | 'facilitator'; 