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
  hasPassed: boolean;  // Whether the participant has passed on this topic
  speakingTime: number;
  turnCount: number;
  passCount: number;   // Number of times they've passed on this topic
}

export interface TokenState {
  currentHolder: string | null;
  previousHolder: string | null;
  timeRemaining: number; // Time remaining in seconds for current holder
  isActive: boolean;     // Whether the timer is currently running
  maxSpeakingTime: number; // Maximum speaking time in seconds
  currentTopicId: string | null; // Current active topic
}

export type TokenPassMethod = 'automatic' | 'facilitator'; 

export interface TopicStats {
  topicId: string;
  title: string;
  description?: string;
  totalDuration: number; // Total time spent on this topic in seconds
  participantStats: {
    participantId: string;
    name: string;
    speakingTime: number;
    turnCount: number;
    passCount: number;
  }[];
}

export interface MeetingStats {
  startTime: number; // Timestamp when meeting started
  endTime: number; // Timestamp when meeting ended
  totalDuration: number; // Total meeting duration in seconds
  topicStats: TopicStats[];
}

export interface AppState {
  isInMeeting: boolean;
  currentMeetingStats: MeetingStats | null;
} 