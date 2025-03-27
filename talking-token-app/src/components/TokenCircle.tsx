import React from 'react';
import { Box, Paper, Typography, Avatar, Tooltip, IconButton, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { Participant } from '../types';
import { calculateCirclePosition } from '../utils/helpers';

interface TokenCircleProps {
  participants: Participant[];
  currentHolderId: string | null;
  previousHolderId: string | null;
  onParticipantClick: (id: string) => void;
  onAddParticipant?: () => void;
}

const TokenCircle: React.FC<TokenCircleProps> = ({
  participants,
  currentHolderId,
  previousHolderId,
  onParticipantClick,
  onAddParticipant
}) => {
  // Skip rendering if no participants
  if (participants.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 3, mb: 3, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Token Circle
        </Typography>
        <Box sx={{ 
          py: 4, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Add participants to visualize the token circle.
          </Typography>
          {onAddParticipant && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={onAddParticipant}
              sx={{
                borderRadius: '28px',
                px: 3
              }}
            >
              Add Participant
            </Button>
          )}
        </Box>
      </Paper>
    );
  }

  // Calculate circle dimensions
  const circleRadius = 150;
  const participantSize = 50;
  const containerSize = circleRadius * 2 + participantSize;
  const tableRadius = circleRadius * 0.7; // Table size (70% of the circle)

  // Get participant by ID helper
  const getParticipantById = (id: string | null) => {
    if (!id) return null;
    return participants.find(p => p.id === id) || null;
  };

  // Current and previous holders
  const currentHolder = getParticipantById(currentHolderId);
  const previousHolder = getParticipantById(previousHolderId);

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2
      }}>
        <Typography variant="h6">
          Token Circle
        </Typography>
        {onAddParticipant && (
          <IconButton 
            color="primary" 
            size="small"
            onClick={onAddParticipant}
            aria-label="Add participant"
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
              width: 36,
              height: 36
            }}
          >
            <AddIcon />
          </IconButton>
        )}
      </Box>
      
      <Box sx={{ 
        width: containerSize, 
        height: containerSize, 
        position: 'relative',
        margin: '0 auto',
        mt: 2
      }}>
        {/* Draw table */}
        <Box sx={{ 
          width: tableRadius * 2, 
          height: tableRadius * 2, 
          borderRadius: '50%', 
          backgroundColor: '#f5f5f5',
          border: '1px solid #e0e0e0',
          boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)',
          position: 'absolute',
          top: containerSize / 2 - tableRadius,
          left: containerSize / 2 - tableRadius,
          zIndex: 0
        }} />
        
        {/* Draw circle for participants */}
        <Box sx={{ 
          width: circleRadius * 2, 
          height: circleRadius * 2, 
          borderRadius: '50%', 
          border: '2px dashed #ccc',
          position: 'absolute',
          top: participantSize / 2,
          left: participantSize / 2,
          zIndex: 1
        }} />
        
        {/* Draw participants */}
        {participants.map((participant, index) => {
          const { x, y } = calculateCirclePosition(
            index, 
            participants.length, 
            circleRadius
          );
          
          const isCurrentHolder = participant.id === currentHolderId;
          const isPreviousHolder = participant.id === previousHolderId;
          
          // Get participant status for styling
          const getParticipantStyle = () => {
            if (isCurrentHolder) {
              return {
                border: '3px solid #4caf50',
                bgcolor: '#4caf50',
                boxShadow: '0 0 15px rgba(76, 175, 80, 0.7)'
              };
            }
            if (isPreviousHolder) {
              return {
                border: '3px solid #ff9800',
                bgcolor: '#ff9800',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
              };
            }
            if (participant.hasSpoken) {
              return {
                border: '3px solid #e0e0e0',
                bgcolor: '#9e9e9e',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                opacity: 0.7
              };
            }
            // Default style for participants who haven't spoken and are not current/previous
            return {
              border: 'none',
              bgcolor: '#2196f3', // Default blue
              boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
            };
          };

          const participantStyle = getParticipantStyle();
          
          return (
            <Tooltip 
              key={participant.id} 
              title={
                <Box>
                  <Typography variant="body2">
                    {participant.name}
                  </Typography>
                  <Typography variant="caption" component="div">
                    Turns: {participant.turnCount}
                    {participant.hasSpoken && ' • Has spoken'}
                  </Typography>
                </Box>
              }
            >
              <Avatar
                sx={{
                  width: participantSize,
                  height: participantSize,
                  position: 'absolute',
                  top: containerSize / 2 - participantSize / 2 + y,
                  left: containerSize / 2 - participantSize / 2 + x,
                  cursor: 'pointer',
                  ...participantStyle,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.1)',
                  },
                  zIndex: 2
                }}
                onClick={() => onParticipantClick(participant.id)}
              >
                {participant.name.substring(0, 2).toUpperCase()}
              </Avatar>
            </Tooltip>
          );
        })}
        
        {/* Draw token passing arrow if both current and previous holders exist */}
        {currentHolder && previousHolder && (
          <TokenPassingArrow 
            fromId={previousHolderId!} 
            toId={currentHolderId!}
            participants={participants}
            containerSize={containerSize}
            circleRadius={circleRadius}
          />
        )}
      </Box>
      
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          Click on a participant to pass the token
        </Typography>
        {currentHolder && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Current Speaker:
            </Typography>
            <Box sx={{ 
              p: 2, 
              borderRadius: 2, 
              bgcolor: 'primary.light', 
              display: 'inline-block',
              minWidth: '180px'
            }}>
              <Typography sx={{ 
                fontWeight: 'bold', 
                fontSize: '1.5rem',
                color: 'primary.contrastText'
              }}>
                {currentHolder.name}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

interface TokenPassingArrowProps {
  fromId: string;
  toId: string;
  participants: Participant[];
  containerSize: number;
  circleRadius: number;
}

const TokenPassingArrow: React.FC<TokenPassingArrowProps> = ({
  fromId,
  toId,
  participants,
  containerSize,
  circleRadius
}) => {
  // Find indices of participants
  const fromIndex = participants.findIndex(p => p.id === fromId);
  const toIndex = participants.findIndex(p => p.id === toId);
  
  if (fromIndex === -1 || toIndex === -1) return null;
  
  // Calculate positions
  const fromPos = calculateCirclePosition(
    fromIndex, 
    participants.length, 
    circleRadius
  );
  
  const toPos = calculateCirclePosition(
    toIndex, 
    participants.length, 
    circleRadius
  );
  
  // Calculate center points
  const centerX = containerSize / 2;
  const centerY = containerSize / 2;
  
  // Calculate actual positions of participant centers
  const x1 = centerX + fromPos.x;
  const y1 = centerY + fromPos.y;
  const x2 = centerX + toPos.x;
  const y2 = centerY + toPos.y;
  
  // Calculate angle for arrow
  const angle = Math.atan2(y2 - y1, x2 - x1);
  
  // Participant radius (half of participantSize which is 50)
  const participantRadius = 25;
  
  // Calculate the distance between the two points
  const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  
  // Calculate the ratio of the participant radius to the distance
  const ratio1 = participantRadius / distance;
  const ratio2 = participantRadius / distance;
  
  // Adjust start and end points to be exactly at the edge of the participant circles
  // Move from center of circle toward the edge in the direction of the other circle
  const adjustedX1 = x1 + (x2 - x1) * ratio1;
  const adjustedY1 = y1 + (y2 - y1) * ratio1;
  const adjustedX2 = x2 - (x2 - x1) * ratio2;
  const adjustedY2 = y2 - (y2 - y1) * ratio2;
  
  // Arrow head size
  const arrowSize = 10;
  
  // Calculate arrow head points
  const arrowPoint1X = adjustedX2 - arrowSize * Math.cos(angle - Math.PI / 6);
  const arrowPoint1Y = adjustedY2 - arrowSize * Math.sin(angle - Math.PI / 6);
  const arrowPoint2X = adjustedX2 - arrowSize * Math.cos(angle + Math.PI / 6);
  const arrowPoint2Y = adjustedY2 - arrowSize * Math.sin(angle + Math.PI / 6);
  
  return (
    <svg
      width={containerSize}
      height={containerSize}
      style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
    >
      <line
        x1={adjustedX1}
        y1={adjustedY1}
        x2={adjustedX2}
        y2={adjustedY2}
        stroke="#ff9800"
        strokeWidth="2"
        strokeDasharray="5,3"
      />
      <polygon
        points={`${adjustedX2},${adjustedY2} ${arrowPoint1X},${arrowPoint1Y} ${arrowPoint2X},${arrowPoint2Y}`}
        fill="#ff9800"
      />
    </svg>
  );
};

export default TokenCircle;
