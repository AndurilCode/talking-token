import { useState, useEffect, useCallback } from 'react';

interface UseTimerProps {
  initialTime: number;
  onTimeUp?: () => void;
}

interface UseTimerReturn {
  time: number;
  isActive: boolean;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: (newTime?: number) => void;
  formatTime: (seconds: number) => string;
}

export const useTimer = ({ initialTime, onTimeUp }: UseTimerProps): UseTimerReturn => {
  const [time, setTime] = useState<number>(initialTime);
  const [isActive, setIsActive] = useState<boolean>(false);

  // Reset timer when initialTime changes
  useEffect(() => {
    setTime(initialTime);
  }, [initialTime]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime((prevTime) => {
          const newTime = prevTime - 1;
          if (newTime === 0 && onTimeUp) {
            onTimeUp();
          }
          return newTime;
        });
      }, 1000);
    } else if (time === 0) {
      setIsActive(false);
      if (interval) clearInterval(interval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, time, onTimeUp]);

  const startTimer = useCallback(() => {
    setIsActive(true);
  }, []);

  const pauseTimer = useCallback(() => {
    setIsActive(false);
  }, []);

  const resetTimer = useCallback((newTime?: number) => {
    setIsActive(false);
    setTime(newTime !== undefined ? newTime : initialTime);
  }, [initialTime]);

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return { time, isActive, startTimer, pauseTimer, resetTimer, formatTime };
}; 