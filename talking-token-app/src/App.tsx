import { useState, useEffect, useCallback } from 'react';
import { Grid, CssBaseline, Typography, Box, AppBar, Toolbar, Button, Menu, MenuItem, IconButton, Popover, Paper } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import GitHubIcon from '@mui/icons-material/GitHub';
import MenuIcon from '@mui/icons-material/Menu';
import PeopleIcon from '@mui/icons-material/People';
import TopicIcon from '@mui/icons-material/Topic';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpIcon from '@mui/icons-material/Help';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Participant, TokenState, TokenPassMethod, Topic, ParticipantTopicStatus, AppState } from './types';
import { saveToLocalStorage, loadFromLocalStorage } from './utils/helpers';
import { generateMeetingStats } from './utils/meetingStats';
import { useTimerWorker } from './hooks/useTimerWorker';
import './App.css';

// Import components
import ParticipantManager from './components/ParticipantManager';
import TokenTimer from './components/TokenTimer';
import TokenCircle from './components/TokenCircle';
import Settings from './components/Settings';
import TopicManager from './components/TopicManager';
import ParticipationTracker from './components/ParticipationTracker';
import ParticipantRules from './components/ParticipantRules';
import FacilitatorGuide from './components/FacilitatorGuide';
import AddTopicForm from './components/AddTopicForm';
import MeetingRecap from './components/MeetingRecap';

// Import Google Fonts in index.html or add this to your CSS
// @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@600&family=Poppins:wght@500;700&display=swap');

// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#00665A', // Updated main color
    },
    secondary: {
      main: '#ff9800', // Keeping secondary color for now
    },
  },
  typography: {
    fontFamily: [
      'Poppins',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif'
    ].join(','),
    h6: {
      fontWeight: 600,
      letterSpacing: '0.05em'
    }
  }
});

// Local storage keys
const STORAGE_KEYS = {
  PARTICIPANTS: 'talking-token-participants',
  TOKEN_STATE: 'talking-token-state',
  SETTINGS: 'talking-token-settings',
  TOPICS: 'talking-token-topics',
  PARTICIPANT_TOPIC_STATUS: 'talking-token-participant-topic-status',
  APP_STATE: 'talking-token-app-state',
  MEETING_STATS: 'talking-token-meeting-stats',
};

type ActionSection = 'participants' | 'topics' | 'settings' | 'facilitator-guide' | null;

function App() {
  // State for participants
  const [participants, setParticipants] = useState<Participant[]>(() => 
    loadFromLocalStorage<Participant[]>(STORAGE_KEYS.PARTICIPANTS, [])
  );
  
  // State for token
  const [tokenState, setTokenState] = useState<TokenState>(() => 
    loadFromLocalStorage<TokenState>(STORAGE_KEYS.TOKEN_STATE, {
      currentHolder: null,
      previousHolder: null,
      timeRemaining: 90,
      isActive: false,
      maxSpeakingTime: 90,
      currentTopicId: null,
    })
  );
  
  // State for settings
  const [tokenPassMethod, setTokenPassMethod] = useState<TokenPassMethod>(() => 
    loadFromLocalStorage<TokenPassMethod>(STORAGE_KEYS.SETTINGS, 'facilitator')
  );

  // State for topics
  const [topics, setTopics] = useState<Topic[]>(() => 
    loadFromLocalStorage<Topic[]>(STORAGE_KEYS.TOPICS, [])
  );

  // State for participant topic status
  const [participantTopicStatus, setParticipantTopicStatus] = useState<ParticipantTopicStatus[]>(() => 
    loadFromLocalStorage<ParticipantTopicStatus[]>(STORAGE_KEYS.PARTICIPANT_TOPIC_STATUS, [])
  );

  // State for app state (meeting or recap)
  const [appState, setAppState] = useState<AppState>(() => 
    loadFromLocalStorage<AppState>(STORAGE_KEYS.APP_STATE, {
      isInMeeting: false,
      isMeetingReady: false,
      currentMeetingStats: null
    })
  );

  // State for meeting start time
  const [meetingStartTime, setMeetingStartTime] = useState<number>(0);

  // Menu state
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(menuAnchorEl);
  
  // Popover state
  const [popoverAnchorEl, setPopoverAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedSection, setSelectedSection] = useState<ActionSection>(null);
  const popoverOpen = Boolean(popoverAnchorEl);
  
  // Add state for Participation Tracker collapse
  const [trackerCollapsed, setTrackerCollapsed] = useState(false);
  
  // Add state for topic description collapse
  const [collapsedTopicDescriptions, setCollapsedTopicDescriptions] = useState<Record<string, boolean>>({});
  
  // Add state for showing the add topic form
  const [showAddTopicForm, setShowAddTopicForm] = useState(false);
  
  // Add state for topic menu
  const [topicMenuAnchorEl, setTopicMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const topicMenuOpen = Boolean(topicMenuAnchorEl);
  
  // Add state for edit topic form
  const [showEditTopicForm, setShowEditTopicForm] = useState(false);
  const [topicToEdit, setTopicToEdit] = useState<Topic | null>(null);
  
  // Handle menu open/close
  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  
  // Popover handlers
  const handlePopoverClose = () => {
    setPopoverAnchorEl(null);
    setSelectedSection(null);
  };
  
  // Section selection handler
  const handleSectionSelect = (section: ActionSection, event: React.MouseEvent<HTMLElement>) => {
    setSelectedSection(section);
    setPopoverAnchorEl(event.currentTarget);
    handleMenuClose();
  };

  // Add handler for showing the add topic form
  const handleShowAddTopicForm = (event: React.MouseEvent<HTMLElement>) => {
    setShowAddTopicForm(true);
    setPopoverAnchorEl(event.currentTarget);
  };
  
  // Add handler for closing the add topic form
  const handleCloseAddTopicForm = () => {
    setShowAddTopicForm(false);
    setPopoverAnchorEl(null);
  };

  // Save state to localStorage whenever it changes
  useEffect(() => {
    saveToLocalStorage(STORAGE_KEYS.PARTICIPANTS, participants);
  }, [participants]);
  
  useEffect(() => {
    saveToLocalStorage(STORAGE_KEYS.TOKEN_STATE, tokenState);
  }, [tokenState]);
  
  useEffect(() => {
    saveToLocalStorage(STORAGE_KEYS.SETTINGS, tokenPassMethod);
  }, [tokenPassMethod]);

  useEffect(() => {
    saveToLocalStorage(STORAGE_KEYS.TOPICS, topics);
  }, [topics]);

  useEffect(() => {
    saveToLocalStorage(STORAGE_KEYS.PARTICIPANT_TOPIC_STATUS, participantTopicStatus);
  }, [participantTopicStatus]);

  // Save app state to local storage when it changes
  useEffect(() => {
    saveToLocalStorage(STORAGE_KEYS.APP_STATE, appState);
  }, [appState]);
  
  // Initialize meeting start time when app loads
  useEffect(() => {
    if (appState.isInMeeting && meetingStartTime === 0) {
      setMeetingStartTime(Date.now());
    }
  }, [appState.isInMeeting, meetingStartTime]);

  // Handle timer updates from the Web Worker
  const handleTimerUpdate = useCallback((time: number) => {
    if (tokenState.currentHolder && tokenState.currentTopicId) {
      setParticipantTopicStatus(prev => {
        return prev.map(status => {
          if (status.participantId === tokenState.currentHolder && 
              status.topicId === tokenState.currentTopicId) {
            return {
              ...status,
              speakingTime: status.speakingTime + time
            };
          }
          return status;
        });
      });
    }
  }, [tokenState.currentHolder, tokenState.currentTopicId]);

  // Initialize the timer worker
  const { startTimer, stopTimer, resetTimer } = useTimerWorker(handleTimerUpdate);

  // Control the timer worker based on token state
  useEffect(() => {
    if (tokenState.isActive && tokenState.currentHolder && tokenState.currentTopicId) {
      startTimer();
    } else {
      stopTimer();
    }
    
    return () => {
      stopTimer();
    };
  }, [tokenState.isActive, tokenState.currentHolder, tokenState.currentTopicId, startTimer, stopTimer]);

  // Debounce saving participantTopicStatus to localStorage to prevent UI freezes
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      saveToLocalStorage(STORAGE_KEYS.PARTICIPANT_TOPIC_STATUS, participantTopicStatus);
    }, 500); // Debounce for 500ms
    
    return () => clearTimeout(saveTimeout);
  }, [participantTopicStatus]);

  // Participant management
  const handleAddParticipant = useCallback((participant: Participant) => {
    setParticipants(prev => [...prev, participant]);
    
    // Initialize participant status for all topics
    setParticipantTopicStatus(prev => [
      ...prev,
      ...topics.map(topic => ({
        participantId: participant.id,
        topicId: topic.id,
        hasSpoken: false,
        hasPassed: false,
        speakingTime: 0,
        turnCount: 0,
        passCount: 0
      }))
    ]);
  }, [topics]);
  
  const handleRemoveParticipant = useCallback((id: string) => {
    setParticipants(prev => prev.filter(p => p.id !== id));
    
    // If this participant had the token, reset the token state
    setTokenState(prev => {
      if (prev.currentHolder === id) {
        return {
          ...prev,
          currentHolder: null,
          previousHolder: null,
          isActive: false,
        };
      }
      return prev;
    });
    
    // Remove participant topic status
    setParticipantTopicStatus(prev => 
      prev.filter(status => status.participantId !== id)
    );
  }, []);
  
  const handleResetParticipants = useCallback(() => {
    setParticipants([]);
    setTokenState(prev => ({
      ...prev,
      currentHolder: null,
      previousHolder: null,
      timeRemaining: prev.maxSpeakingTime,
      isActive: false,
    }));
    setParticipantTopicStatus([]);
  }, []);

  // Topic management
  const handleAddTopic = useCallback((topic: Topic) => {
    setTopics(prev => [...prev, topic]);
    
    // If this is the first topic, set it as current
    if (tokenState.currentTopicId === null) {
      setTokenState(prev => ({
        ...prev,
        currentTopicId: topic.id
      }));
    }
    
    // Initialize status for all participants for this topic
    setParticipantTopicStatus(prev => [
      ...prev,
      ...participants.map(participant => ({
        participantId: participant.id,
        topicId: topic.id,
        hasSpoken: false,
        hasPassed: false,
        speakingTime: 0,
        turnCount: 0,
        passCount: 0
      }))
    ]);
  }, [participants, tokenState.currentTopicId]);
  
  const handleEditTopic = useCallback((topic: Topic) => {
    setTopics(prev => 
      prev.map(t => t.id === topic.id ? topic : t)
    );
  }, []);
  
  const handleRemoveTopic = useCallback((id: string) => {
    setTopics(prev => prev.filter(t => t.id !== id));
    
    // If this was the current topic, reset current topic
    setTokenState(prev => {
      if (prev.currentTopicId === id) {
        return {
          ...prev,
          currentTopicId: null
        };
      }
      return prev;
    });
    
    // Remove topic status
    setParticipantTopicStatus(prev => 
      prev.filter(status => status.topicId !== id)
    );
  }, []);

  const handleSetActiveTopic = useCallback((id: string) => {
    setTokenState(prevTokenState => {
      // Only update if the topic is actually changing
      if (prevTokenState.currentTopicId !== id) {
        // Reset hasSpoken for all participants when changing topics
        setParticipants(prevParticipants =>
          prevParticipants.map(p => ({ ...p, hasSpoken: false }))
        );
        // Return the new token state with the updated topic ID
        return {
          ...prevTokenState,
          currentTopicId: id,
          // Resetting previousHolder might be good practice here too
          previousHolder: null, 
        };
      }
      // If the topic ID is the same, return the previous state unchanged
      return prevTokenState; 
    });
  }, [setParticipants]); // Correct dependency

  // Token management
  const handlePassToken = (participantId: string) => {
    if (tokenState.currentHolder === participantId) {
      return; // Can't pass to self
    }

    // Capture the ID of the participant who just finished speaking
    const previousHolderId = tokenState.currentHolder;
    
    // Update token state
    const newTokenState = {
      ...tokenState,
      previousHolder: previousHolderId, // Use the captured ID
      currentHolder: participantId,
      timeRemaining: tokenState.maxSpeakingTime, // Reset timer duration
      isActive: true // Start timer automatically when token is passed
    };
    
    setTokenState(newTokenState);
    saveToLocalStorage(STORAGE_KEYS.TOKEN_STATE, newTokenState);

    // Reset the timer worker explicitly
    resetTimer(); 

    // Update the main 'hasSpoken' status for the participant who just spoke
    if (previousHolderId) { // Use the captured ID
      setParticipants(prevParticipants =>
        prevParticipants.map(p =>
          p.id === previousHolderId ? { ...p, hasSpoken: true } : p // Mark the previous holder as spoken
        )
      );
    }
    
    // Update participant topic status for previous holder
    if (previousHolderId && tokenState.currentTopicId) { // Use the captured ID
      updateParticipantTopicStatus(previousHolderId, tokenState.currentTopicId, false);
    }
    
    // Update participant topic status for new holder - increment turn count
    if (participantId && tokenState.currentTopicId) {
      // Use false for isPassing since this is a normal token pass
      updateParticipantTopicStatus(participantId, tokenState.currentTopicId, false);
    }
  };

  // Handle passing token without speaking
  const handlePassTokenWithoutSpeaking = () => {
    if (!tokenState.currentHolder || !tokenState.currentTopicId) return;
    
    // Find the next participant (simple circular implementation)
    const currentIndex = participants.findIndex(p => p.id === tokenState.currentHolder);
    if (currentIndex === -1) return;
    
    const nextIndex = (currentIndex + 1) % participants.length;
    const nextParticipantId = participants[nextIndex].id;
    
    // Update token state
    const newTokenState = {
      ...tokenState,
      previousHolder: tokenState.currentHolder,
      currentHolder: nextParticipantId,
      timeRemaining: tokenState.maxSpeakingTime,
      isActive: false // Pause timer when token is passed
    };
    
    setTokenState(newTokenState);
    saveToLocalStorage(STORAGE_KEYS.TOKEN_STATE, newTokenState);
    
    // Update participant topic status for pass
    updateParticipantTopicStatus(tokenState.currentHolder, tokenState.currentTopicId, true);
  };

  // Update participant topic status
  const updateParticipantTopicStatus = (participantId: string, topicId: string, isPassing: boolean) => {
    const existingStatusIndex = participantTopicStatus.findIndex(
      status => status.participantId === participantId && status.topicId === topicId
    );
    
    let newStatus;
    
    if (existingStatusIndex >= 0) {
      // Update existing status
      const existingStatus = participantTopicStatus[existingStatusIndex];
      newStatus = {
        ...existingStatus,
        hasSpoken: isPassing ? existingStatus.hasSpoken : true,
        hasPassed: isPassing ? true : existingStatus.hasPassed,
        turnCount: isPassing ? existingStatus.turnCount : existingStatus.turnCount + 1,
        passCount: isPassing ? existingStatus.passCount + 1 : existingStatus.passCount,
        // For speaking time, we don't modify it here since it's updated by the timer effect
      };
    } else {
      // Create new status (shouldn't happen in normal flow)
      newStatus = {
        participantId,
        topicId,
        hasSpoken: !isPassing,
        hasPassed: isPassing,
        speakingTime: 0,
        turnCount: isPassing ? 0 : 1,
        passCount: isPassing ? 1 : 0
      };
    }
    
    // Update the status in the array
    const newParticipantTopicStatus = [...participantTopicStatus];
    if (existingStatusIndex >= 0) {
      newParticipantTopicStatus[existingStatusIndex] = newStatus;
    } else {
      newParticipantTopicStatus.push(newStatus);
    }
    
    setParticipantTopicStatus(newParticipantTopicStatus);
    // localStorage is now handled by the debounced effect
  };

  const handleTimeUp = useCallback(() => {
    // Update speaking time for the current holder
    if (tokenState.currentHolder && tokenState.currentTopicId) {
      // Update participant total speaking time
      setParticipants(prev => 
        prev.map(p => 
          p.id === tokenState.currentHolder 
            ? { ...p, speakingTime: p.speakingTime + tokenState.maxSpeakingTime } 
            : p
        )
      );
      
      // Update participant topic speaking time
      setParticipantTopicStatus(prev => {
        const statusIndex = prev.findIndex(
          status => status.participantId === tokenState.currentHolder && status.topicId === tokenState.currentTopicId
        );
        
        if (statusIndex >= 0) {
          const updatedStatus = [...prev];
          updatedStatus[statusIndex] = {
            ...updatedStatus[statusIndex],
            speakingTime: updatedStatus[statusIndex].speakingTime + tokenState.maxSpeakingTime
          };
          return updatedStatus;
        }
        
        return prev;
      });
    }
    
    // If automatic token passing is enabled, pass to the next participant
    if (tokenPassMethod === 'automatic' && participants.length > 1) {
      const currentIndex = participants.findIndex(p => p.id === tokenState.currentHolder);
      const nextIndex = (currentIndex + 1) % participants.length;
      handlePassToken(participants[nextIndex].id);
    } else {
      // Just stop the timer
      setTokenState(prev => ({
        ...prev,
        isActive: false,
      }));
    }
  }, [tokenPassMethod, participants, tokenState.currentHolder, tokenState.currentTopicId, tokenState.maxSpeakingTime, handlePassToken]);
  
  const handleTimerStart = useCallback(() => {
    setTokenState(prev => ({
      ...prev,
      isActive: true,
    }));
    // The timer worker will be started by the effect that watches tokenState.isActive
  }, []);
  
  const handleTimerPause = useCallback(() => {
    setTokenState(prev => ({
      ...prev,
      isActive: false,
    }));
    // The timer worker will be stopped by the effect that watches tokenState.isActive
  }, []);
  
  const handleTimerReset = useCallback(() => {
    // Reset the timer state
    setTokenState(prev => ({
      ...prev,
      timeRemaining: prev.maxSpeakingTime,
      isActive: false,
    }));
    
    // Reset the timer worker
    resetTimer();
  }, [resetTimer]);

  // Settings management
  const handleMaxSpeakingTimeChange = useCallback((value: number) => {
    setTokenState(prev => ({
      ...prev,
      maxSpeakingTime: value,
      timeRemaining: prev.isActive ? prev.timeRemaining : value,
    }));
  }, []);
  
  const handleTokenPassMethodChange = useCallback((method: TokenPassMethod) => {
    setTokenPassMethod(method);
  }, []);

  // Get current holder name
  const getCurrentHolderName = useCallback(() => {
    if (!tokenState.currentHolder) return null;
    const holder = participants.find(p => p.id === tokenState.currentHolder);
    return holder ? holder.name : null;
  }, [participants, tokenState.currentHolder]);

  // Add handler for toggling tracker collapse
  const handleToggleTracker = useCallback(() => {
    setTrackerCollapsed(prev => !prev);
  }, []);

  // Toggle description collapse for a specific topic
  const handleToggleTopicDescription = useCallback((topicId: string) => {
    setCollapsedTopicDescriptions(prev => ({
      ...prev,
      [topicId]: !prev[topicId]
    }));
  }, []);
  
  // Check if a topic description is collapsed
  const isTopicDescriptionCollapsed = useCallback((topicId: string) => {
    return collapsedTopicDescriptions[topicId] ?? true; // Default to collapsed
  }, [collapsedTopicDescriptions]);

  // Add handler for opening topic menu
  const handleOpenTopicMenu = (event: React.MouseEvent<HTMLElement>, topicId: string) => {
    event.stopPropagation();
    setSelectedTopicId(topicId);
    setTopicMenuAnchorEl(event.currentTarget);
  };
  
  // Add handler for closing topic menu
  const handleCloseTopicMenu = () => {
    setTopicMenuAnchorEl(null);
    setSelectedTopicId(null);
  };
  
  // Add handler for editing a topic
  const handleOpenEditTopicForm = () => {
    if (selectedTopicId) {
      const topic = topics.find(t => t.id === selectedTopicId);
      if (topic) {
        setTopicToEdit(topic);
        setShowEditTopicForm(true);
        setPopoverAnchorEl(topicMenuAnchorEl);
      }
    }
    handleCloseTopicMenu();
  };
  
  // Add handler for deleting a topic
  const handleDeleteTopic = () => {
    if (selectedTopicId) {
      handleRemoveTopic(selectedTopicId);
    }
    handleCloseTopicMenu();
  };
  
  // Add handler for closing the edit topic form
  const handleCloseEditTopicForm = () => {
    setShowEditTopicForm(false);
    setTopicToEdit(null);
    setPopoverAnchorEl(null);
  };
  
  // Add handler for saving edited topic
  const handleSaveEditedTopic = (editedTopic: Topic) => {
    handleEditTopic(editedTopic);
    handleCloseEditTopicForm();
  };

  // Add handler for resetting all data
  const handleResetAll = useCallback(() => {
    if (window.confirm('Are you sure you want to reset all data? This will delete all topics and participants.')) {
      handleResetParticipants();
      setTopics([]);
      setTokenState(prev => ({
        ...prev,
        currentTopicId: null,
        currentHolder: null,
        previousHolder: null,
        timeRemaining: prev.maxSpeakingTime,
        isActive: false,
      }));
    }
  }, [handleResetParticipants]);

  // Handle ending the meeting
  const handleEndMeeting = () => {
    // Pause the token timer if it's active
    if (tokenState.isActive) {
      const newTokenState = {
        ...tokenState,
        isActive: false
      };
      setTokenState(newTokenState);
      saveToLocalStorage(STORAGE_KEYS.TOKEN_STATE, newTokenState);
      
      // Explicitly stop the timer worker
      stopTimer();
    }
    
    // Small delay to ensure any final speaking time updates are processed
    setTimeout(() => {
      // Generate meeting statistics
      const meetingStats = generateMeetingStats(
        meetingStartTime,
        participants,
        topics,
        participantTopicStatus
      );
      
      // Update app state
      const newAppState: AppState = {
        isInMeeting: false,
        isMeetingReady: false, // Reset meeting readiness
        currentMeetingStats: meetingStats
      };
      
      setAppState(newAppState);
      saveToLocalStorage(STORAGE_KEYS.APP_STATE, newAppState);
      saveToLocalStorage(STORAGE_KEYS.MEETING_STATS, meetingStats);
    }, 100);
  };
  
  // Handle starting the meeting
  const handleStartMeeting = () => {
    const newStartTime = Date.now();
    setMeetingStartTime(newStartTime);
    
    // Update app state
    const newAppState = {
      ...appState,
      isInMeeting: true,
      isMeetingReady: true
    };
    setAppState(newAppState);
    saveToLocalStorage(STORAGE_KEYS.APP_STATE, newAppState);
  };

  // Handle starting a new meeting
  const handleStartNewMeeting = () => {
    // Reset meeting state
    const newStartTime = Date.now();
    setMeetingStartTime(newStartTime);
    
    // Reset token state
    const newTokenState = {
      currentHolder: null,
      previousHolder: null,
      timeRemaining: tokenState.maxSpeakingTime,
      isActive: false,
      maxSpeakingTime: tokenState.maxSpeakingTime,
      currentTopicId: null,
    };
    setTokenState(newTokenState);
    
    // Reset participant topic status
    const resetParticipantTopicStatus: ParticipantTopicStatus[] = [];
    setParticipantTopicStatus(resetParticipantTopicStatus);
    
    // Reset participants' speaking time and turn count
    const resetParticipants = participants.map(p => ({
      ...p,
      hasSpoken: false,
      speakingTime: 0,
      turnCount: 0
    }));
    setParticipants(resetParticipants);
    
    // Update app state
    const newAppState = {
      isInMeeting: true,
      isMeetingReady: false,
      currentMeetingStats: null
    };
    setAppState(newAppState);
    
    // Save all changes to local storage
    saveToLocalStorage(STORAGE_KEYS.TOKEN_STATE, newTokenState);
    saveToLocalStorage(STORAGE_KEYS.PARTICIPANT_TOPIC_STATUS, resetParticipantTopicStatus);
    saveToLocalStorage(STORAGE_KEYS.PARTICIPANTS, resetParticipants);
    saveToLocalStorage(STORAGE_KEYS.APP_STATE, newAppState);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {appState.isInMeeting ? (
        // Meeting view
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          height: '100vh', 
          width: '100vw',
          overflow: 'hidden',
          margin: 0,
          padding: 0
        }}>
          <AppBar position="static" sx={{ width: '100%' }}>
            <Toolbar variant="dense">
              <Typography 
                variant="h6" 
                component="div" 
                className="app-title"
                sx={{ 
                  flexGrow: 1, 
                  fontFamily: '"Montserrat", sans-serif',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  background: 'linear-gradient(45deg, #FFF 30%, rgba(255,255,255,0.8) 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0px 1px 2px rgba(0,0,0,0.1)',
                  fontSize: { xs: '1.1rem', sm: '1.25rem' }
                }}
              >
                TALKING TOKEN
              </Typography>
              
              {!appState.isMeetingReady && participants.length > 0 && topics.length > 0 && (
                <Button 
                  color="success" 
                  size="small"
                  variant="contained"
                  onClick={handleStartMeeting}
                  sx={{ 
                    mr: 2,
                    fontWeight: 'bold',
                  }}
                >
                  START MEETING
                </Button>
              )}
              
              {appState.isMeetingReady && (
                <Button 
                  color="primary" 
                  size="small"
                  variant="contained"
                  onClick={handleEndMeeting}
                  sx={{ 
                    mr: 2,
                    bgcolor: 'white',
                    color: 'primary.main',
                    fontWeight: 'bold',
                    '&:hover': {
                      bgcolor: '#f5f5f5',
                    }
                  }}
                >
                  END MEETING
                </Button>
              )}
              
              {(participants.length > 0 || topics.length > 0) && (
                <Button 
                  color="primary" 
                  size="small"
                  variant="contained"
                  onClick={handleResetAll}
                  sx={{ 
                    mr: 2,
                    bgcolor: 'white',
                    color: 'primary.main',
                    fontWeight: 'bold',
                    '&:hover': {
                      bgcolor: '#f5f5f5',
                    }
                  }}
                >
                  RESET ALL
                </Button>
              )}
              
              <IconButton
                color="inherit"
                aria-label="navigation menu"
                aria-controls={menuOpen ? 'navigation-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={menuOpen ? 'true' : undefined}
                onClick={handleMenuClick}
                edge="end"
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="navigation-menu"
                anchorEl={menuAnchorEl}
                open={menuOpen}
                onClose={handleMenuClose}
                MenuListProps={{
                  'aria-labelledby': 'navigation-button',
                }}
              >
                <MenuItem onClick={(event) => handleSectionSelect('participants', event)}>
                  <PeopleIcon sx={{ mr: 1 }} /> Participants
                </MenuItem>
                <MenuItem onClick={(event) => handleSectionSelect('topics', event)}>
                  <TopicIcon sx={{ mr: 1 }} /> Topics
                </MenuItem>
                <MenuItem onClick={(event) => handleSectionSelect('settings', event)}>
                  <SettingsIcon sx={{ mr: 1 }} /> Settings
                </MenuItem>
                <MenuItem onClick={(event) => handleSectionSelect('facilitator-guide', event)}>
                  <HelpIcon sx={{ mr: 1 }} /> Facilitator Guide
                </MenuItem>
              </Menu>
              
              <Button 
                color="inherit" 
                startIcon={<GitHubIcon />}
                href="https://github.com/andurilcode/talking-token"
                target="_blank"
                size="small"
              >
                GitHub
              </Button>
            </Toolbar>
          </AppBar>
          
          <Popover
            open={popoverOpen || showAddTopicForm || showEditTopicForm}
            anchorEl={popoverAnchorEl}
            onClose={showAddTopicForm ? handleCloseAddTopicForm : showEditTopicForm ? handleCloseEditTopicForm : handlePopoverClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            PaperProps={{
              sx: { width: '80vw', maxWidth: '800px', maxHeight: '80vh', overflow: 'auto' }
            }}
          >
            {showAddTopicForm ? (
              <AddTopicForm 
                onAddTopic={handleAddTopic}
                onClose={handleCloseAddTopicForm}
              />
            ) : showEditTopicForm && topicToEdit ? (
              <AddTopicForm 
                onAddTopic={handleSaveEditedTopic}
                onClose={handleCloseEditTopicForm}
                initialTopic={topicToEdit}
                isEditing={true}
              />
            ) : (
              <>
                {selectedSection === 'participants' && (
                  <ParticipantManager 
                    participants={participants}
                    onAddParticipant={handleAddParticipant}
                    onRemoveParticipant={handleRemoveParticipant}
                    onResetParticipants={handleResetParticipants}
                  />
                )}
                {selectedSection === 'topics' && (
                  <TopicManager
                    topics={topics}
                    currentTopicId={tokenState.currentTopicId}
                    onAddTopic={handleAddTopic}
                    onEditTopic={handleEditTopic}
                    onRemoveTopic={handleRemoveTopic}
                    onSetActiveTopic={handleSetActiveTopic}
                  />
                )}
                {selectedSection === 'settings' && (
                  <Settings 
                    maxSpeakingTime={tokenState.maxSpeakingTime}
                    onMaxSpeakingTimeChange={handleMaxSpeakingTimeChange}
                    tokenPassMethod={tokenPassMethod}
                    onTokenPassMethodChange={handleTokenPassMethodChange}
                  />
                )}
                {selectedSection === 'facilitator-guide' && (
                  <FacilitatorGuide />
                )}
              </>
            )}
          </Popover>
          
          {/* Topic Menu */}
          <Menu
            id="topic-menu"
            anchorEl={topicMenuAnchorEl}
            open={topicMenuOpen}
            onClose={handleCloseTopicMenu}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={handleOpenEditTopicForm}>
              <EditIcon fontSize="small" sx={{ mr: 1 }} />
              Edit Topic
            </MenuItem>
            <MenuItem onClick={handleDeleteTopic}>
              <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
              Delete Topic
            </MenuItem>
          </Menu>
          
          <Box
            sx={{ 
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              width: '100%',
              margin: 0,
              padding: 0
            }}
          >
            <Grid 
              container 
              spacing={0}
              sx={{ 
                flexGrow: 1, 
                height: '100%', 
                margin: 0, 
                width: '100%', 
                maxWidth: '100%',
                boxSizing: 'border-box'
              }}
            >
              {/* Participant Rules Column */}
              <Grid item xs={12} md={2.5} lg={2} sx={{ 
                borderRight: 1, 
                borderColor: 'divider', 
                height: '100%', 
                overflow: 'hidden',
                padding: 0,
                margin: 0
              }}>
                <ParticipantRules />
              </Grid>
              
              {/* Main Content Area */}
              <Grid item xs={12} md={9.5} lg={10} sx={{ 
                height: '100%', 
                overflow: 'auto',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column'
              }}>
                {/* All content in a single scrollable area */}
                <Box sx={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: '100%'
                }}>
                  <Grid 
                    container 
                    spacing={0}
                    sx={{ 
                      width: '100%',
                      maxWidth: '100%',
                      boxSizing: 'border-box',
                      flexGrow: 0
                    }}
                  >
                    {/* Timer and Current Topic */}
                    <Grid item xs={12} md={6} sx={{ 
                      borderBottom: { xs: 1, md: 0 }, 
                      borderColor: 'divider',
                      padding: 0,
                      margin: 0
                    }}>
                      <Box sx={{ p: 2 }}>
                        <TokenTimer 
                          initialTime={tokenState.timeRemaining}
                          isActive={tokenState.isActive}
                          onTimeUp={handleTimeUp}
                          onTimerStart={handleTimerStart}
                          onTimerPause={handleTimerPause}
                          onTimerReset={handleTimerReset}
                          onPassToken={handlePassTokenWithoutSpeaking}
                          currentHolder={getCurrentHolderName()}
                        />
                        
                        {/* All Topics Section */}
                        <Box sx={{ mt: 3 }}>
                          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                            <Box sx={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center',
                              mb: 2
                            }}>
                              <Typography variant="h6">
                                All Topics
                              </Typography>
                              
                              {topics.length > 0 && (
                                <IconButton 
                                  color="primary" 
                                  size="small"
                                  onClick={handleShowAddTopicForm}
                                  sx={{ 
                                    bgcolor: 'primary.main',
                                    color: 'white',
                                    '&:hover': {
                                      bgcolor: 'primary.dark',
                                    },
                                    width: 36,
                                    height: 36
                                  }}
                                  aria-label="Add new topic"
                                >
                                  <AddIcon />
                                </IconButton>
                              )}
                            </Box>
                            
                            {topics.length === 0 ? (
                              <Box sx={{ 
                                display: 'flex', 
                                flexDirection: 'column', 
                                alignItems: 'center',
                                justifyContent: 'center',
                                py: 4
                              }}>
                                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                                  No topics added yet.
                                </Typography>
                                <Button
                                  variant="contained"
                                  startIcon={<AddIcon />}
                                  onClick={handleShowAddTopicForm}
                                  sx={{
                                    borderRadius: '28px',
                                    px: 3
                                  }}
                                >
                                  Add Topic
                                </Button>
                              </Box>
                            ) : (
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                {topics.map(topic => (
                                  <Box 
                                    key={topic.id}
                                    sx={{ 
                                      p: 1.5,
                                      borderRadius: 1,
                                      border: '1px solid',
                                      borderColor: 'divider',
                                      backgroundColor: tokenState.currentTopicId === topic.id 
                                        ? 'primary.light' 
                                        : 'background.paper',
                                      cursor: 'pointer',
                                      '&:hover': {
                                        backgroundColor: tokenState.currentTopicId === topic.id 
                                          ? 'primary.light' 
                                          : 'action.hover',
                                      },
                                      boxShadow: tokenState.currentTopicId === topic.id ? 2 : 0,
                                      transition: 'all 0.2s ease'
                                    }}
                                    onClick={() => handleSetActiveTopic(topic.id)}
                                  >
                                    <Box sx={{ 
                                      display: 'flex', 
                                      justifyContent: 'space-between', 
                                      alignItems: 'center'
                                    }}>
                                      <Typography 
                                        variant="subtitle1" 
                                        sx={{ 
                                          fontWeight: tokenState.currentTopicId === topic.id ? 'bold' : 'normal',
                                          color: tokenState.currentTopicId === topic.id ? 'primary.contrastText' : 'text.primary'
                                        }}
                                      >
                                        {topic.title}
                                      </Typography>
                                      
                                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        {topic.description && (
                                          <IconButton 
                                            size="small" 
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleToggleTopicDescription(topic.id);
                                            }}
                                            sx={{ 
                                              color: tokenState.currentTopicId === topic.id ? 'primary.contrastText' : 'action.active'
                                            }}
                                          >
                                            {isTopicDescriptionCollapsed(topic.id) 
                                              ? <KeyboardArrowDownIcon fontSize="small" /> 
                                              : <KeyboardArrowUpIcon fontSize="small" />}
                                          </IconButton>
                                        )}
                                        <IconButton 
                                          size="small" 
                                          onClick={(e) => handleOpenTopicMenu(e, topic.id)}
                                          sx={{ 
                                            color: tokenState.currentTopicId === topic.id ? 'primary.contrastText' : 'action.active',
                                            ml: 0.5
                                          }}
                                        >
                                          <MoreVertIcon fontSize="small" />
                                        </IconButton>
                                      </Box>
                                    </Box>
                                    
                                    {/* Collapsible Description */}
                                    {topic.description && !isTopicDescriptionCollapsed(topic.id) && (
                                      <Box 
                                        sx={{ 
                                          mt: 1, 
                                          pt: 1, 
                                          borderTop: '1px solid',
                                          borderColor: tokenState.currentTopicId === topic.id 
                                            ? 'rgba(255,255,255,0.3)' 
                                            : 'divider'
                                        }}
                                      >
                                        <Typography 
                                          variant="body2" 
                                          sx={{ 
                                            fontStyle: 'italic',
                                            color: tokenState.currentTopicId === topic.id 
                                              ? 'primary.contrastText' 
                                              : 'text.secondary',
                                            opacity: tokenState.currentTopicId === topic.id ? 0.9 : 1
                                          }}
                                        >
                                          {topic.description}
                                        </Typography>
                                      </Box>
                                    )}
                                    
                                    {/* Current Topic Indicator */}
                                    {tokenState.currentTopicId === topic.id && (
                                      <Typography 
                                        variant="caption" 
                                        sx={{ 
                                          display: 'block', 
                                          mt: 0.5, 
                                          color: 'primary.contrastText',
                                          fontWeight: 'bold'
                                        }}
                                      >
                                        Current Topic
                                      </Typography>
                                    )}
                                  </Box>
                                ))}
                              </Box>
                            )}
                          </Paper>
                        </Box>
                      </Box>
                    </Grid>

                    {/* Token Circle */}
                    <Grid item xs={12} md={6} sx={{ 
                      borderBottom: 1, 
                      borderColor: 'divider',
                      padding: 0,
                      margin: 0
                    }}>
                      <Box sx={{ p: 2 }}>
                        <TokenCircle 
                          participants={participants}
                          currentHolderId={tokenState.currentHolder}
                          previousHolderId={tokenState.previousHolder}
                          onParticipantClick={handlePassToken}
                          onAddParticipant={() => {
                            const event = { currentTarget: document.body } as React.MouseEvent<HTMLElement>;
                            handleSectionSelect('participants', event);
                          }}
                        />
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Participation Tracker with Collapse Toggle */}
                  <Box sx={{ 
                    borderTop: 1, 
                    borderColor: 'divider'
                  }}>
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        px: 2,
                        py: 1,
                        cursor: 'pointer',
                        bgcolor: 'background.paper',
                        '&:hover': {
                          bgcolor: 'action.hover'
                        }
                      }}
                      onClick={handleToggleTracker}
                    >
                      <Typography variant="h6" component="h2">
                        Participation Tracker
                      </Typography>
                      <IconButton size="small">
                        {trackerCollapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
                      </IconButton>
                    </Box>
                    
                    <Box sx={{ 
                      p: 2, 
                      display: trackerCollapsed ? 'none' : 'block'
                    }}>
                      <ParticipationTracker
                        participants={participants}
                        topics={topics}
                        participantTopicStatus={participantTopicStatus}
                        currentTopicId={tokenState.currentTopicId}
                      />
                    </Box>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>
          
          <Box 
            component="footer"
            sx={{
              py: 0.5,
              backgroundColor: 'background.paper',
              borderTop: 1,
              borderColor: 'divider',
              textAlign: 'center',
              width: '100%'
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Talking Token App © {new Date().getFullYear()}
            </Typography>
          </Box>
        </Box>
      ) : (
        // Meeting recap view
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          height: '100vh',
          overflow: 'hidden'
        }}>
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ 
                flexGrow: 1, 
                fontFamily: '"Montserrat", sans-serif',
                fontWeight: 600,
                letterSpacing: '0.05em',
                background: 'linear-gradient(45deg, #FFF 30%, rgba(255,255,255,0.8) 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0px 1px 2px rgba(0,0,0,0.1)',
                fontSize: { xs: '1.1rem', sm: '1.25rem' }
              }}>
                TALKING TOKEN
              </Typography>
              
              <Button 
                color="inherit" 
                startIcon={<GitHubIcon />}
                href="https://github.com/andurilcode/talking-token"
                target="_blank"
                size="small"
              >
                GitHub
              </Button>
            </Toolbar>
          </AppBar>
          
          <Box sx={{ 
            flexGrow: 1, 
            overflow: 'auto'
          }}>
            <MeetingRecap 
              meetingStats={appState.currentMeetingStats!}
              onStartNewMeeting={handleStartNewMeeting}
            />
          </Box>
          
          <Box 
            component="footer"
            sx={{
              py: 0.5,
              backgroundColor: 'background.paper',
              borderTop: 1,
              borderColor: 'divider',
              textAlign: 'center',
              width: '100%'
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Talking Token App © {new Date().getFullYear()}
            </Typography>
          </Box>
        </Box>
      )}
    </ThemeProvider>
  );
}

export default App;
