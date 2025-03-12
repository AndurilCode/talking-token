// Timer Web Worker
// This worker handles timing operations off the main UI thread

// Define message types
type TimerMessage = {
  type: 'START' | 'STOP' | 'RESET' | 'UPDATE';
  data?: any;
};

let timerId: number | null = null;
let accumulatedTime = 0;
let isRunning = false;

// Handle messages from the main thread
self.onmessage = (event: MessageEvent<TimerMessage>) => {
  const { type } = event.data;
  
  switch (type) {
    case 'START':
      if (!isRunning) {
        isRunning = true;
        startTimer();
      }
      break;
      
    case 'STOP':
      if (isRunning) {
        isRunning = false;
        stopTimer();
        // Send final accumulated time
        if (accumulatedTime > 0) {
          self.postMessage({ type: 'TIME_UPDATE', time: accumulatedTime });
          accumulatedTime = 0;
        }
      }
      break;
      
    case 'RESET':
      isRunning = false;
      stopTimer();
      accumulatedTime = 0;
      break;
      
    default:
      break;
  }
};

// Start the timer
function startTimer() {
  if (timerId !== null) {
    clearInterval(timerId);
  }
  
  let lastUpdateTime = Date.now();
  
  timerId = self.setInterval(() => {
    if (!isRunning) return;
    
    // Increment accumulated time
    accumulatedTime += 1;
    
    // Only send updates every 3 seconds or when accumulated time reaches 5 seconds
    const now = Date.now();
    if (now - lastUpdateTime >= 3000 || accumulatedTime >= 5) {
      self.postMessage({ type: 'TIME_UPDATE', time: accumulatedTime });
      lastUpdateTime = now;
      accumulatedTime = 0;
    }
  }, 1000);
}

// Stop the timer
function stopTimer() {
  if (timerId !== null) {
    clearInterval(timerId);
    timerId = null;
  }
}

export {}; 