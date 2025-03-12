import { Participant, Topic, ParticipantTopicStatus, MeetingStats, TopicStats } from '../types';

/**
 * Generates meeting statistics from the current meeting data
 */
export const generateMeetingStats = (
  startTime: number,
  participants: Participant[],
  topics: Topic[],
  participantTopicStatus: ParticipantTopicStatus[]
): MeetingStats => {
  const endTime = Date.now();
  const totalDuration = Math.round((endTime - startTime) / 1000); // Convert to seconds
  
  const topicStats: TopicStats[] = topics.map(topic => {
    // Get all participant statuses for this topic
    const topicStatuses = participantTopicStatus.filter(
      status => status.topicId === topic.id
    );
    
    // Calculate total duration for this topic (sum of all participant speaking times)
    const totalTopicDuration = topicStatuses.reduce(
      (sum, status) => sum + status.speakingTime, 
      0
    );
    
    // Generate participant stats for this topic
    const participantStats = participants.map(participant => {
      const status = topicStatuses.find(
        status => status.participantId === participant.id
      );
      
      return {
        participantId: participant.id,
        name: participant.name,
        speakingTime: status?.speakingTime || 0,
        turnCount: status?.turnCount || 0,
        passCount: status?.passCount || 0
      };
    });
    
    return {
      topicId: topic.id,
      title: topic.title,
      description: topic.description,
      totalDuration: totalTopicDuration,
      participantStats
    };
  });
  
  return {
    startTime,
    endTime,
    totalDuration,
    topicStats
  };
}; 