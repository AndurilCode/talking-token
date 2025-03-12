import React from 'react';
import { 
  Typography, 
  Paper, 
  Box, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Container,
  Tooltip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { MeetingStats } from '../types';
import { jsPDF } from 'jspdf';

interface MeetingRecapProps {
  meetingStats: MeetingStats;
  onStartNewMeeting: () => void;
}

/**
 * Formats seconds into a human-readable time string (HH:MM:SS or MM:SS)
 */
const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Formats a timestamp into a readable date/time string
 */
const formatTimestamp = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString();
};

/**
 * Calculates the percentage of total time
 */
const calculatePercentage = (part: number, total: number): number => {
  return total > 0 ? Math.round((part / total) * 100) : 0;
};

/**
 * Get a random thank you message
 */
const getThankYouMessage = (): string => {
  const messages = [
    "Boom! Another productive meeting in the books! 💯",
    "Mission accomplished! Thanks for bringing your A-game today! ✨",
    "Dream team alert! Your insights made this meeting rock! 🚀",
    "That's a wrap! Your brilliance just leveled up this meeting! ⚡",
    "Meeting mastery achieved! Thanks for the epic contributions! 🔥",
    "Collaboration gold! Your energy made this meeting shine! ✌️"
  ];
  
  return messages[Math.floor(Math.random() * messages.length)];
};

/**
 * Generates a text-based meeting recap suitable for LLM input
 */
const generateTextRecap = (meetingStats: MeetingStats): string => {
  const lines: string[] = [];
  
  // Header
  lines.push('MEETING RECAP');
  lines.push('=============');
  lines.push('');
  
  // Meeting details
  lines.push(`Total Duration: ${formatTime(meetingStats.totalDuration)}`);
  lines.push('');
  
  // Participants
  const uniqueParticipants = new Set<string>();
  meetingStats.topicStats.forEach(topic => {
    topic.participantStats.forEach(participant => {
      uniqueParticipants.add(participant.name);
    });
  });
  
  lines.push('PARTICIPANTS');
  lines.push('-----------');
  Array.from(uniqueParticipants).forEach(name => {
    lines.push(`- ${name}`);
  });
  lines.push('');
  
  // Topics summary
  lines.push('TOPICS SUMMARY');
  lines.push('-------------');
  meetingStats.topicStats.forEach(topic => {
    const percentage = calculatePercentage(topic.totalDuration, meetingStats.totalDuration);
    lines.push(`- ${topic.title}: ${formatTime(topic.totalDuration)} (${percentage}% of meeting)`);
  });
  lines.push('');
  
  // Detailed topic participation
  lines.push('DETAILED TOPIC PARTICIPATION');
  lines.push('---------------------------');
  meetingStats.topicStats.forEach(topic => {
    lines.push(`Topic: ${topic.title} - Duration: ${formatTime(topic.totalDuration)}`);
    if (topic.description) {
      lines.push(`Description: ${topic.description}`);
    }
    lines.push('Participant Statistics:');
    topic.participantStats.forEach(participant => {
      const percentage = calculatePercentage(participant.speakingTime, topic.totalDuration);
      lines.push(`  - ${participant.name}: Speaking Time: ${formatTime(participant.speakingTime)} (${percentage}%), Turns: ${participant.turnCount}, Passes: ${participant.passCount}`);
    });
    lines.push('');
  });
  
  return lines.join('\n');
};

/**
 * Exports the meeting recap as a PDF file
 */
const exportToPDF = (meetingStats: MeetingStats) => {
  const textContent = generateTextRecap(meetingStats);
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(16);
  doc.text('Meeting Recap', 20, 20);
  
  // Add content with smaller font
  doc.setFontSize(10);
  
  // Split text into lines that fit on the page
  const textLines = doc.splitTextToSize(textContent, 170);
  doc.text(textLines, 20, 30);
  
  // Save the PDF with formatted timestamp in the filename
  const formattedDate = formatTimestamp(meetingStats.endTime).replace(/[/\\:]/g, '-');
  doc.save(`meeting-recap-${formattedDate}.pdf`);
};

const MeetingRecap: React.FC<MeetingRecapProps> = ({ meetingStats, onStartNewMeeting }) => {
  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        py: 4, 
        flexGrow: 1, 
        overflow: 'auto',
        height: '100%'
      }}
    >
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          mb: 4,
          textAlign: 'center',
          background: 'white',
          borderRadius: 2
        }}
      >
        <Box 
          sx={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2
          }}
        >
          <Typography 
            variant="h4" 
            gutterBottom
            sx={{ 
              fontWeight: 'bold',
              color: '#0277bd',
              textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
            }}
          >
            🎉 Meeting Recap 🎯
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              fontStyle: 'italic',
              color: '#01579b',
              maxWidth: '85%',
              mx: 'auto',
              mb: 3,
              fontWeight: 500,
              lineHeight: 1.4,
              padding: 2,
              borderRadius: 2,
              background: 'rgba(25, 118, 210, 0.08)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}
          >
            {getThankYouMessage()}
          </Typography>
          
          {/* Participant names with enhanced styling */}
          <Typography 
            variant="subtitle1" 
            sx={{ 
              fontWeight: 'bold', 
              color: '#01579b',
              mb: 2
            }}
          >
            Special thanks to our participants:
          </Typography>
          
          <Box sx={{ 
            mb: 3, 
            display: 'flex', 
            flexWrap: 'wrap', 
            justifyContent: 'center', 
            gap: 1.5 
          }}>
            {Array.from(new Set(meetingStats.topicStats.flatMap(topic => 
              topic.participantStats.map(p => p.name)
            ))).map((name, index) => (
              <Chip 
                key={index}
                label={name}
                color="primary"
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  py: 2.5,
                  px: 1,
                  bgcolor: 'rgba(25, 118, 210, 0.15)',
                  color: '#01579b',
                  border: '2px solid #1976d2',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  '&:hover': { 
                    bgcolor: 'rgba(25, 118, 210, 0.25)',
                    boxShadow: '0 3px 6px rgba(0,0,0,0.15)'
                  }
                }}
              />
            ))}
          </Box>
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#01579b' }}>
            ⏳ Total Duration: {formatTime(meetingStats.totalDuration)}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<RestartAltIcon />}
            onClick={onStartNewMeeting}
            sx={{ 
              px: 3,
              py: 1,
              borderRadius: 28,
              fontWeight: 'bold',
              bgcolor: '#0288d1',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
              '&:hover': {
                bgcolor: '#0277bd',
                boxShadow: '0 6px 12px rgba(0,0,0,0.3)',
              }
            }}
          >
            START NEW MEETING
          </Button>
          
          <Tooltip title="Export as PDF for LLM input">
            <Button 
              variant="outlined" 
              color="primary" 
              startIcon={<PictureAsPdfIcon />}
              onClick={() => exportToPDF(meetingStats)}
              sx={{ 
                px: 3,
                py: 1,
                borderRadius: 28,
                fontWeight: 'bold',
                borderWidth: 2,
                borderColor: '#0288d1',
                color: '#0288d1',
                '&:hover': {
                  borderWidth: 2,
                  bgcolor: 'rgba(2, 136, 209, 0.1)',
                  borderColor: '#0277bd',
                }
              }}
            >
              EXPORT AS PDF
            </Button>
          </Tooltip>
        </Box>
      </Paper>
      
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ marginRight: '8px' }}>📊</span> Topics Summary
        </Typography>
        
        <TableContainer sx={{ mb: 3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'rgba(0, 0, 0, 0.04)' }}>
                <TableCell>Topic</TableCell>
                <TableCell align="right">Duration</TableCell>
                <TableCell align="right">% of Meeting</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {meetingStats.topicStats.map((topic) => (
                <TableRow key={topic.topicId}>
                  <TableCell component="th" scope="row">
                    {topic.title}
                  </TableCell>
                  <TableCell align="right">
                    {formatTime(topic.totalDuration)}
                  </TableCell>
                  <TableCell align="right">
                    {calculatePercentage(topic.totalDuration, meetingStats.totalDuration)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ marginRight: '8px' }}>👥</span> Detailed Topic Participation
      </Typography>
      
      {meetingStats.topicStats.map((topic) => (
        <Accordion key={topic.topicId} sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">{topic.title}</Typography>
            <Chip 
              label={formatTime(topic.totalDuration)} 
              size="small" 
              sx={{ ml: 2, bgcolor: '#e1f5fe', color: '#0277bd' }} 
            />
          </AccordionSummary>
          <AccordionDetails>
            {topic.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {topic.description}
              </Typography>
            )}
            
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'rgba(0, 0, 0, 0.04)' }}>
                    <TableCell>Participant</TableCell>
                    <TableCell align="right">Speaking Time</TableCell>
                    <TableCell align="right">% of Topic</TableCell>
                    <TableCell align="right">Turns</TableCell>
                    <TableCell align="right">Passes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topic.participantStats.map((participant) => (
                    <TableRow key={`${topic.topicId}-${participant.participantId}`}>
                      <TableCell component="th" scope="row">
                        {participant.name}
                      </TableCell>
                      <TableCell align="right">
                        {formatTime(participant.speakingTime)}
                      </TableCell>
                      <TableCell align="right">
                        {calculatePercentage(participant.speakingTime, topic.totalDuration)}%
                      </TableCell>
                      <TableCell align="right">
                        {participant.turnCount}
                      </TableCell>
                      <TableCell align="right">
                        {participant.passCount}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
      ))}
    </Container>
  );
};

export default MeetingRecap; 