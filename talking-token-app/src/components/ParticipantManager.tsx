import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  IconButton, 
  Typography,
  Paper
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Participant } from '../types';
import { generateId } from '../utils/helpers';

interface ParticipantManagerProps {
  participants: Participant[];
  onAddParticipant: (participant: Participant) => void;
  onRemoveParticipant: (id: string) => void;
  onResetParticipants: () => void;
}

const ParticipantManager: React.FC<ParticipantManagerProps> = ({
  participants,
  onAddParticipant,
  onRemoveParticipant,
  onResetParticipants
}) => {
  const [newParticipantName, setNewParticipantName] = useState('');

  const handleAddParticipant = () => {
    if (newParticipantName.trim()) {
      const newParticipant: Participant = {
        id: generateId(),
        name: newParticipantName.trim(),
        hasSpoken: false,
        speakingTime: 0,
        turnCount: 0
      };
      onAddParticipant(newParticipant);
      setNewParticipantName('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddParticipant();
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Participants
      </Typography>
      
      <Box sx={{ display: 'flex', mb: 2 }}>
        <TextField
          fullWidth
          label="Add Participant"
          value={newParticipantName}
          onChange={(e) => setNewParticipantName(e.target.value)}
          onKeyPress={handleKeyPress}
          size="small"
          sx={{ mr: 1 }}
        />
        <Button 
          variant="contained" 
          onClick={handleAddParticipant}
          disabled={!newParticipantName.trim()}
        >
          Add
        </Button>
      </Box>
      
      {participants.length > 0 ? (
        <List dense sx={{ maxHeight: '300px', overflow: 'auto' }}>
          {participants.map((participant) => (
            <ListItem
              key={participant.id}
              secondaryAction={
                <IconButton 
                  edge="end" 
                  aria-label="delete"
                  onClick={() => onRemoveParticipant(participant.id)}
                >
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemText 
                primary={participant.name} 
                secondary={`Turns: ${participant.turnCount} | Time: ${participant.speakingTime}s`}
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          No participants added yet. Add participants to begin.
        </Typography>
      )}
      
      {participants.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Button 
            variant="outlined" 
            color="error" 
            size="small"
            onClick={onResetParticipants}
          >
            Reset All
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default ParticipantManager; 