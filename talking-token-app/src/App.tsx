import { useState, useEffect, useCallback, useRef } from 'react';
import { Container, Grid, CssBaseline, Typography, Box, AppBar, Toolbar, Button, Menu, MenuItem, IconButton, Divider, Popover, Paper } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import GitHubIcon from '@mui/icons-material/GitHub';
import MenuIcon from '@mui/icons-material/Menu';
import PeopleIcon from '@mui/icons-material/People';
import TopicIcon from '@mui/icons-material/Topic';
import SettingsIcon from '@mui/icons-material/Settings';
import { Participant, TokenState, TokenPassMethod, Topic, ParticipantTopicStatus } from './types';
import { saveToLocalStorage, loadFromLocalStorage, generateId } from './utils/helpers';
import './App.css';

// Import components
import ParticipantManager from './components/ParticipantManager';
import TokenTimer from './components/TokenTimer';
import TokenCircle from './components/TokenCircle';
import Settings from './components/Settings';
import TopicManager from './components/TopicManager';
import ParticipationTracker from './components/ParticipationTracker';

// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#ff9800',
    },
  },
});

// Local storage keys
const STORAGE_KEYS = {
  PARTICIPANTS: 'talking-token-participants',
  TOKEN_STATE: 'talking-token-state',
  SETTINGS: 'talking-token-settings',
  TOPICS: 'talking-token-topics',
  PARTICIPANT_TOPIC_STATUS: 'talking-token-participant-topic-status',
};

type ActionSection = 'participants' | 'topics' | 'settings' | null;

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
    loadFromLocalStorage<TokenPassMethod>(STORAGE_KEYS.SETTINGS, 'manual')
  );

  // State for topics
  const [topics, setTopics] = useState<Topic[]>(() => 
    loadFromLocalStorage<Topic[]>(STORAGE_KEYS.TOPICS, [])
  );

  // State for participant topic status
  const [participantTopicStatus, setParticipantTopicStatus] = useState<ParticipantTopicStatus[]>(() => 
    loadFromLocalStorage<ParticipantTopicStatus[]>(STORAGE_KEYS.PARTICIPANT_TOPIC_STATUS, [])
  );

  // Add state for navigation menu
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(menuAnchorEl);
  
  // Add refs for scrolling to sections
  const participantsRef = useRef<HTMLDivElement>(null);
  const topicsRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  
  // Add state for popover
  const [popoverAnchorEl, setPopoverAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedSection, setSelectedSection] = useState<ActionSection>(null);
  const popoverOpen = Boolean(popoverAnchorEl);
  
  // Handle menu open/close
  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  
  // Handle navigation to sections
  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    handleMenuClose();
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle popover open/close
  const handlePopoverClose = () => {
    setPopoverAnchorEl(null);
    setSelectedSection(null);
  };

  // Handle section selection
  const handleSectionSelect = (section: ActionSection, event: React.MouseEvent<HTMLElement>) => {
    handleMenuClose();
    setSelectedSection(section);
    setPopoverAnchorEl(event.currentTarget);
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
        speakingTime: 0,
        turnCount: 0
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
        speakingTime: 0,
        turnCount: 0
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
    setTokenState(prev => ({
      ...prev,
      currentTopicId: id
    }));
  }, []);

  // Token management
  const handlePassToken = useCallback((participantId: string) => {
    // Don't pass to the same person
    if (participantId === tokenState.currentHolder) return;
    
    // First reset the timer state
    handleTimerReset();
    
    // Then update the token state
    setTokenState(prev => ({
      ...prev,
      previousHolder: prev.currentHolder,
      currentHolder: participantId,
      timeRemaining: prev.maxSpeakingTime,
      isActive: true,
    }));
    
    // Update participant stats
    setParticipants(prev => 
      prev.map(p => 
        p.id === participantId 
          ? { ...p, hasSpoken: true, turnCount: p.turnCount + 1 } 
          : p
      )
    );
    
    // Update participant topic status if a topic is active
    if (tokenState.currentTopicId) {
      setParticipantTopicStatus(prev => {
        const statusIndex = prev.findIndex(
          status => status.participantId === participantId && status.topicId === tokenState.currentTopicId
        );
        
        if (statusIndex >= 0) {
          const updatedStatus = [...prev];
          updatedStatus[statusIndex] = {
            ...updatedStatus[statusIndex],
            hasSpoken: true,
            turnCount: updatedStatus[statusIndex].turnCount + 1
          };
          return updatedStatus;
        }
        
        // If no status exists yet, create one
        return [
          ...prev,
          {
            participantId,
            topicId: tokenState.currentTopicId!,
            hasSpoken: true,
            speakingTime: 0,
            turnCount: 1
          }
        ];
      });
    }
  }, [tokenState.currentHolder, tokenState.currentTopicId]);
  
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
  }, []);
  
  const handleTimerPause = useCallback(() => {
    setTokenState(prev => ({
      ...prev,
      isActive: false,
    }));
  }, []);
  
  const handleTimerReset = useCallback(() => {
    // Reset the timer state
    setTokenState(prev => ({
      ...prev,
      timeRemaining: prev.maxSpeakingTime,
      isActive: false,
    }));
    
    // The useTimer hook will detect the change in initialTime and reset the timer
  }, []);

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

  // Get current topic title
  const getCurrentTopicTitle = useCallback(() => {
    if (!tokenState.currentTopicId) return null;
    const topic = topics.find(t => t.id === tokenState.currentTopicId);
    return topic ? topic.title : null;
  }, [topics, tokenState.currentTopicId]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar position="static" sx={{ width: '100%' }}>
          <Toolbar variant="dense">
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Talking Token
            </Typography>
            
            <IconButton
              color="inherit"
              aria-label="navigation menu"
              aria-controls={menuOpen ? 'navigation-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={menuOpen ? 'true' : undefined}
              onClick={handleMenuClick}
              edge="end"
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
            </Menu>
            
            <Button 
              color="inherit" 
              startIcon={<GitHubIcon />}
              href="https://github.com/yourusername/talking-token"
              target="_blank"
              size="small"
            >
              GitHub
            </Button>
          </Toolbar>
        </AppBar>
        
        <Popover
          open={popoverOpen}
          anchorEl={popoverAnchorEl}
          onClose={handlePopoverClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          PaperProps={{
            sx: { width: '400px', maxHeight: '80vh', overflow: 'auto' }
          }}
        >
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
        </Popover>
        
        <Container 
          maxWidth="lg" 
          sx={{ 
            flexGrow: 1,
            py: 1,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Grid 
            container 
            spacing={2}
            sx={{ flexGrow: 1 }}
          >
            {/* Timer and Current Topic */}
            <Grid item xs={12} md={6}>
              <Paper elevation={1} sx={{ p: 2, height: '100%' }}>
                <TokenTimer 
                  initialTime={tokenState.timeRemaining}
                  isActive={tokenState.isActive}
                  onTimeUp={handleTimeUp}
                  onTimerStart={handleTimerStart}
                  onTimerPause={handleTimerPause}
                  onTimerReset={handleTimerReset}
                  currentHolder={getCurrentHolderName()}
                />
                
                {tokenState.currentTopicId && (
                  <Box 
                    sx={{ 
                      mt: 2,
                      p: 1.5,
                      backgroundColor: 'primary.light',
                      borderRadius: 1,
                      boxShadow: 1
                    }}
                  >
                    <Typography 
                      variant="h6" 
                      align="center" 
                      sx={{ 
                        fontWeight: 'bold',
                        color: 'primary.contrastText'
                      }}
                    >
                      Current Topic:
                    </Typography>
                    <Typography 
                      variant="h5" 
                      align="center"
                      sx={{ 
                        fontWeight: 'bold',
                        color: 'primary.contrastText',
                        mt: 0.5
                      }}
                    >
                      {getCurrentTopicTitle()}
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* Token Circle */}
            <Grid item xs={12} md={6}>
              <Paper elevation={1} sx={{ p: 2, height: '100%' }}>
                <TokenCircle 
                  participants={participants}
                  currentHolderId={tokenState.currentHolder}
                  previousHolderId={tokenState.previousHolder}
                  onParticipantClick={handlePassToken}
                />
              </Paper>
            </Grid>

            {/* Participation Tracker */}
            <Grid item xs={12}>
              <Paper elevation={1} sx={{ p: 2 }}>
                <ParticipationTracker
                  participants={participants}
                  topics={topics}
                  participantTopicStatus={participantTopicStatus}
                  currentTopicId={tokenState.currentTopicId}
                />
              </Paper>
            </Grid>
          </Grid>
        </Container>
        
        <Box 
          component="footer"
          sx={{
            py: 0.5,
            mt: 'auto',
            backgroundColor: 'background.paper',
            borderTop: 1,
            borderColor: 'divider',
            textAlign: 'center'
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Talking Token App © {new Date().getFullYear()}
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
