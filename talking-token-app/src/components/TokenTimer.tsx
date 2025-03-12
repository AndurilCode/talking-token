import React, { useEffect, useRef } from 'react';
import { Box, Typography, Button, LinearProgress, Paper, Tooltip } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import { useTimer } from '../hooks/useTimer';

interface TokenTimerProps {
  initialTime: number;
  isActive: boolean;
  onTimeUp: () => void;
  onTimerStart: () => void;
  onTimerPause: () => void;
  onTimerReset: () => void;
  onPassToken: () => void;
  currentHolder: string | null;
}

const TokenTimer: React.FC<TokenTimerProps> = ({
  initialTime,
  isActive,
  onTimeUp,
  onTimerStart,
  onTimerPause,
  onTimerReset,
  onPassToken,
  currentHolder
}) => {
  const { time, startTimer, pauseTimer, resetTimer, formatTime } = useTimer({
    initialTime,
    onTimeUp
  });
  
  // Keep track of previous holder to detect changes
  const prevHolderRef = useRef<string | null>(null);
  
  // Reset timer when current holder changes
  useEffect(() => {
    if (currentHolder !== prevHolderRef.current && currentHolder !== null) {
      console.log('Current holder changed, resetting timer');
      resetTimer(initialTime);
      if (isActive) {
        startTimer();
      }
    }
    prevHolderRef.current = currentHolder;
  }, [currentHolder, initialTime, resetTimer, startTimer, isActive]);

  const handleStart = () => {
    startTimer();
    onTimerStart();
  };

  const handlePause = () => {
    pauseTimer();
    onTimerPause();
  };

  const handleReset = () => {
    resetTimer();
    onTimerReset();
  };

  const handlePass = () => {
    onPassToken();
  };

  // Calculate progress percentage
  const progress = (time / initialTime) * 100;
  
  // Determine color based on time remaining
  const getTimerColor = () => {
    if (progress > 60) return 'success';
    if (progress > 30) return 'warning';
    return 'error';
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Token Timer
      </Typography>
      
      {currentHolder ? (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h3" sx={{ fontFamily: 'monospace', flex: 1, textAlign: 'center' }}>
              {formatTime(time)}
            </Typography>
          </Box>
          
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            color={getTimerColor()} 
            sx={{ height: 10, borderRadius: 5, mb: 2 }}
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            {isActive ? (
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<PauseIcon />}
                onClick={handlePause}
              >
                Pause
              </Button>
            ) : (
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<PlayArrowIcon />}
                onClick={handleStart}
              >
                Start
              </Button>
            )}
            
            <Button 
              variant="outlined" 
              startIcon={<RestartAltIcon />}
              onClick={handleReset}
            >
              Reset
            </Button>
            
            <Tooltip title="Pass the token without speaking">
              <Button 
                variant="contained" 
                color="warning" 
                startIcon={<SkipNextIcon />}
                onClick={handlePass}
              >
                Pass
              </Button>
            </Tooltip>
          </Box>
        </>
      ) : (
        <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          No active speaker. Pass the token to start the timer.
        </Typography>
      )}
    </Paper>
  );
};

export default TokenTimer; 