import { useEffect, useRef, useCallback } from 'react';

type TimerWorkerCallback = (time: number) => void;

/**
 * Hook to use a timer Web Worker for performance-optimized timing
 */
export const useTimerWorker = (onTimeUpdate: TimerWorkerCallback) => {
  const workerRef = useRef<Worker | null>(null);
  
  // Initialize the worker
  useEffect(() => {
    // Create the worker
    const worker = new Worker(new URL('../workers/timerWorker.ts', import.meta.url), { type: 'module' });
    
    // Set up message handler
    worker.onmessage = (event) => {
      const { type, time } = event.data;
      
      if (type === 'TIME_UPDATE' && time > 0) {
        onTimeUpdate(time);
      }
    };
    
    workerRef.current = worker;
    
    // Clean up the worker when the component unmounts
    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, [onTimeUpdate]);
  
  // Start the timer
  const startTimer = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'START' });
    }
  }, []);
  
  // Stop the timer
  const stopTimer = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'STOP' });
    }
  }, []);
  
  // Reset the timer
  const resetTimer = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'RESET' });
    }
  }, []);
  
  return { startTimer, stopTimer, resetTimer };
}; 