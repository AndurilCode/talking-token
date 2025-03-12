import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  List, 
  ListItem, 
  IconButton, 
  Typography,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { Topic } from '../types';
import { generateId } from '../utils/helpers';

interface TopicManagerProps {
  topics: Topic[];
  currentTopicId: string | null;
  onAddTopic: (topic: Topic) => void;
  onEditTopic: (topic: Topic) => void;
  onRemoveTopic: (id: string) => void;
  onSetActiveTopic: (id: string) => void;
}

const TopicManager: React.FC<TopicManagerProps> = ({
  topics,
  currentTopicId,
  onAddTopic,
  onEditTopic,
  onRemoveTopic,
  onSetActiveTopic
}) => {
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicDescription, setNewTopicDescription] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentEditTopic, setCurrentEditTopic] = useState<Topic | null>(null);

  const handleAddTopic = () => {
    if (newTopicTitle.trim()) {
      const newTopic: Topic = {
        id: generateId(),
        title: newTopicTitle.trim(),
        description: newTopicDescription.trim() || undefined,
        isActive: topics.length === 0 // First topic is active by default
      };
      onAddTopic(newTopic);
      setNewTopicTitle('');
      setNewTopicDescription('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddTopic();
    }
  };

  const handleOpenEditDialog = (topic: Topic) => {
    setCurrentEditTopic(topic);
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setCurrentEditTopic(null);
  };

  const handleSaveEdit = () => {
    if (currentEditTopic && currentEditTopic.title.trim()) {
      onEditTopic(currentEditTopic);
      handleCloseEditDialog();
    }
  };

  const handleSetActiveTopic = (id: string) => {
    onSetActiveTopic(id);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3, maxWidth: '100%', overflow: 'hidden' }}>
      <Typography variant="h6" gutterBottom>
        Topics
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
        <Button 
          variant="contained" 
          onClick={handleAddTopic}
          disabled={!newTopicTitle.trim()}
          fullWidth
          sx={{ mt: 1 }}
        >
          Add Topic
        </Button>
      </Box>
      
      {topics.length > 0 ? (
        <List dense sx={{ maxHeight: '300px', overflow: 'auto' }}>
          {topics.map((topic) => (
            <ListItem
              key={topic.id}
              sx={{
                bgcolor: topic.id === currentTopicId ? 'rgba(33, 150, 243, 0.1)' : 'transparent',
                borderLeft: topic.id === currentTopicId ? '4px solid #2196f3' : 'none',
                pl: topic.id === currentTopicId ? 2 : 2,
                pr: 9, // Add right padding to make room for action buttons
                position: 'relative',
                mb: 1,
                borderRadius: 1
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
                <IconButton 
                  size="small" 
                  onClick={() => handleSetActiveTopic(topic.id)}
                  sx={{ mr: 1, mt: 0.5 }}
                >
                  {topic.id === currentTopicId ? (
                    <CheckCircleIcon color="primary" />
                  ) : (
                    <RadioButtonUncheckedIcon />
                  )}
                </IconButton>
                <Box sx={{ flexGrow: 1, overflow: 'hidden', mr: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontWeight: 'medium',
                        mr: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {topic.title}
                    </Typography>
                    {topic.id === currentTopicId && (
                      <Chip 
                        label="Current" 
                        color="primary" 
                        size="small" 
                        sx={{ ml: 0.5 }}
                      />
                    )}
                  </Box>
                  {topic.description && (
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}
                    >
                      {topic.description}
                    </Typography>
                  )}
                </Box>
              </Box>
              <Box 
                sx={{ 
                  position: 'absolute', 
                  right: 8, 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  display: 'flex'
                }}
              >
                <IconButton 
                  edge="end" 
                  aria-label="edit"
                  onClick={() => handleOpenEditDialog(topic)}
                  size="small"
                  sx={{ mr: 0.5 }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton 
                  edge="end" 
                  aria-label="delete"
                  onClick={() => onRemoveTopic(topic.id)}
                  size="small"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          No topics added yet. Add topics to begin tracking participation by topic.
        </Typography>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Topic</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Topic Title"
            fullWidth
            value={currentEditTopic?.title || ''}
            onChange={(e) => setCurrentEditTopic(prev => 
              prev ? { ...prev, title: e.target.value } : null
            )}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            margin="dense"
            label="Description (optional)"
            fullWidth
            multiline
            rows={3}
            value={currentEditTopic?.description || ''}
            onChange={(e) => setCurrentEditTopic(prev => 
              prev ? { ...prev, description: e.target.value } : null
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button 
            onClick={handleSaveEdit} 
            variant="contained"
            disabled={!currentEditTopic?.title.trim()}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default TopicManager; 