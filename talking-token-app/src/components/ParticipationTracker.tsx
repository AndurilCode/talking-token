import React from 'react';
import { 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Chip,
  Box,
  Tooltip
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import PanToolIcon from '@mui/icons-material/PanTool';
import { Participant, Topic, ParticipantTopicStatus } from '../types';

interface ParticipationTrackerProps {
  participants: Participant[];
  topics: Topic[];
  participantTopicStatus: ParticipantTopicStatus[];
  currentTopicId: string | null;
}

const ParticipationTracker: React.FC<ParticipationTrackerProps> = ({
  participants,
  topics,
  participantTopicStatus,
  currentTopicId
}) => {
  // Skip rendering if no participants or topics
  if (participants.length === 0 || topics.length === 0) {
    return (
      <Box sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Participation Tracker
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
          Add both participants and topics to track participation.
        </Typography>
      </Box>
    );
  }

  // Helper to get participation status
  const getParticipationStatus = (participantId: string, topicId: string) => {
    return participantTopicStatus.find(
      status => status.participantId === participantId && status.topicId === topicId
    );
  };

  // Calculate participation statistics
  const calculateStats = () => {
    const stats = {
      totalParticipants: participants.length,
      totalTopics: topics.length,
      participationByTopic: topics.map(topic => {
        const participantsSpoken = participantTopicStatus.filter(
          status => status.topicId === topic.id && status.hasSpoken
        ).length;
        
        return {
          topicId: topic.id,
          title: topic.title,
          participantsSpoken,
          participationRate: participants.length > 0 
            ? (participantsSpoken / participants.length) * 100 
            : 0
        };
      })
    };
    
    return stats;
  };

  const stats = calculateStats();

  return (
    <Box sx={{ width: '100%' }}>
      <TableContainer sx={{ mb: 3, width: '100%' }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'rgba(0, 0, 0, 0.04)' }}>
              <TableCell>Participant</TableCell>
              {topics.map(topic => (
                <TableCell key={topic.id} align="center">
                  <Tooltip title={topic.description || topic.title}>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'center',
                      fontWeight: topic.id === currentTopicId ? 'bold' : 'normal',
                      color: topic.id === currentTopicId ? 'primary.main' : 'inherit'
                    }}>
                      {topic.title}
                      {topic.id === currentTopicId && (
                        <Chip 
                          label="Current" 
                          color="primary" 
                          size="small" 
                          sx={{ mt: 0.5, height: 20 }}
                        />
                      )}
                    </Box>
                  </Tooltip>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {participants.map(participant => (
              <TableRow key={participant.id}>
                <TableCell component="th" scope="row">
                  {participant.name}
                </TableCell>
                {topics.map(topic => {
                  const status = getParticipationStatus(participant.id, topic.id);
                  return (
                    <TableCell key={`${participant.id}-${topic.id}`} align="center">
                      {status?.hasSpoken ? (
                        <Tooltip title={`Turns: ${status.turnCount}, Time: ${status.speakingTime}s`}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CheckCircleIcon color="success" />
                            <Typography variant="caption" sx={{ ml: 0.5, fontWeight: 'bold' }}>
                              {status.turnCount}
                            </Typography>
                          </Box>
                        </Tooltip>
                      ) : status?.hasPassed ? (
                        <Tooltip title={`Passed: ${status.passCount} times`}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <PanToolIcon sx={{ color: 'warning.main' }} />
                            <Typography variant="caption" sx={{ ml: 0.5, fontWeight: 'bold' }}>
                              {status.passCount}
                            </Typography>
                          </Box>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Has not spoken on this topic">
                          <RemoveCircleIcon color="disabled" />
                        </Tooltip>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Typography variant="subtitle2" gutterBottom>
        Participation Summary
      </Typography>
      
      <TableContainer sx={{ width: '100%' }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'rgba(0, 0, 0, 0.04)' }}>
              <TableCell>Topic</TableCell>
              <TableCell align="center">Participants Spoken</TableCell>
              <TableCell align="center">Participation Rate</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stats.participationByTopic.map(topicStat => (
              <TableRow key={topicStat.topicId}>
                <TableCell component="th" scope="row">
                  {topicStat.title}
                </TableCell>
                <TableCell align="center">
                  {topicStat.participantsSpoken} / {stats.totalParticipants}
                </TableCell>
                <TableCell align="center">
                  {topicStat.participationRate.toFixed(0)}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ParticipationTracker; 