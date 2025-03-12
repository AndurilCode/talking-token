import React, { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography,
  Paper
} from '@mui/material';
import { Topic } from '../types';
import { generateId } from '../utils/helpers';

interface AddTopicFormProps {
  onAddTopic: (topic: Topic) => void;
  onClose?: () => void;
  initialTopic?: Topic;
  isEditing?: boolean;
}

const AddTopicForm: React.FC<AddTopicFormProps> = ({
  onAddTopic,
  onClose,
  initialTopic,
  isEditing = false
}) => {
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicDescription, setNewTopicDescription] = useState('');

  // Initialize form with existing topic data if editing
  useEffect(() => {
    if (initialTopic) {
      setNewTopicTitle(initialTopic.title);
      setNewTopicDescription(initialTopic.description || '');
    }
  }, [initialTopic]);

  const handleAddTopic = () => {
    if (newTopicTitle.trim()) {
      const topicData: Topic = {
        id: initialTopic ? initialTopic.id : generateId(),
        title: newTopicTitle.trim(),
        description: newTopicDescription.trim() || undefined,
        isActive: initialTopic ? initialTopic.isActive : false
      };
      onAddTopic(topicData);
      setNewTopicTitle('');
      setNewTopicDescription('');
      if (onClose) {
        onClose();
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddTopic();
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3, maxWidth: '100%', overflow: 'hidden' }}>
      <Typography variant="h6" gutterBottom>
        {isEditing ? 'Edit Topic' : 'Add New Topic'}
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          label="Topic Title"
          value={newTopicTitle}
          onChange={(e) => setNewTopicTitle(e.target.value)}
          onKeyPress={handleKeyPress}
          size="small"
          sx={{ mb: 1 }}
          autoFocus
        />
        <TextField
          fullWidth
          label="Description (optional)"
          value={newTopicDescription}
          onChange={(e) => setNewTopicDescription(e.target.value)}
          onKeyPress={handleKeyPress}
          size="small"
          multiline
          rows={2}
          sx={{ mb: 1 }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          {onClose && (
            <Button 
              variant="outlined" 
              onClick={onClose}
            >
              Cancel
            </Button>
          )}
          <Button 
            variant="contained" 
            onClick={handleAddTopic}
            disabled={!newTopicTitle.trim()}
            sx={{ ml: onClose ? 1 : 0 }}
          >
            {isEditing ? 'Save Changes' : 'Add Topic'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default AddTopicForm; 