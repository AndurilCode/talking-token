import React from 'react';
import { Box, Paper, Typography, Avatar, Tooltip } from '@mui/material';
import { Participant } from '../types';
import { calculateCirclePosition } from '../utils/helpers';

interface TokenCircleProps {
  participants: Participant[];
  currentHolderId: string | null;
  previousHolderId: string | null;
  onParticipantClick: (id: string) => void;
}

const TokenCircle: React.FC<TokenCircleProps> = ({
  participants,
  currentHolderId,
  previousHolderId,
  onParticipantClick
}) => {
  // Skip rendering if no participants
  if (participants.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 3, mb: 3, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Token Circle
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ py: 4 }}>
          Add participants to visualize the token circle.
        </Typography>
      </Paper>
    );
  }

  // Calculate circle dimensions
  const circleRadius = 150;
  const participantSize = 50;
  const containerSize = circleRadius * 2 + participantSize;

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
      <Typography variant="h6" gutterBottom>
        Token Circle
      </Typography>
      
      <Box sx={{ 
        width: containerSize, 
        height: containerSize, 
        position: 'relative',
        margin: '0 auto',
        mt: 2
      }}>
        {/* Draw circle */}
        <Box sx={{ 
          width: circleRadius * 2, 
          height: circleRadius * 2, 
          borderRadius: '50%', 
          border: '2px dashed #ccc',
          position: 'absolute',
          top: participantSize / 2,
          left: participantSize / 2
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
          
          return (
            <Tooltip 
              key={participant.id} 
              title={`${participant.name} (Turns: ${participant.turnCount})`}
            >
              <Avatar
                sx={{
                  width: participantSize,
                  height: participantSize,
                  position: 'absolute',
                  top: containerSize / 2 - participantSize / 2 + y,
                  left: containerSize / 2 - participantSize / 2 + x,
                  cursor: 'pointer',
                  border: isCurrentHolder 
                    ? '3px solid #4caf50' 
                    : isPreviousHolder 
                      ? '3px solid #ff9800' 
                      : participant.hasSpoken 
                        ? '3px solid #e0e0e0' 
                        : 'none',
                  bgcolor: isCurrentHolder 
                    ? '#4caf50' 
                    : isPreviousHolder 
                      ? '#ff9800' 
                      : participant.hasSpoken 
                        ? '#9e9e9e' 
                        : '#2196f3',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.1)',
                  }
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
        <Typography variant="body2" color="text.secondary">
          Click on a participant to pass the token
        </Typography>
        {currentHolder && (
          <Typography variant="subtitle1" sx={{ mt: 1 }}>
            Current Speaker: <strong>{currentHolder.name}</strong>
          </Typography>
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
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="0"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#ff9800" />
        </marker>
      </defs>
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