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
  Paper,
  Chip,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
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
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
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
        >
          Add Topic
        </Button>
      </Box>
      
      {topics.length > 0 ? (
        <List dense sx={{ maxHeight: '300px', overflow: 'auto' }}>
          {topics.map((topic) => (
            <ListItem
              key={topic.id}
              secondaryAction={
                <Box>
                  <IconButton 
                    edge="end" 
                    aria-label="edit"
                    onClick={() => handleOpenEditDialog(topic)}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    edge="end" 
                    aria-label="delete"
                    onClick={() => onRemoveTopic(topic.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              }
              sx={{
                bgcolor: topic.id === currentTopicId ? 'rgba(33, 150, 243, 0.1)' : 'transparent',
                borderLeft: topic.id === currentTopicId ? '4px solid #2196f3' : 'none',
                pl: topic.id === currentTopicId ? 2 : 2
              }}
            >
              <IconButton 
                size="small" 
                onClick={() => handleSetActiveTopic(topic.id)}
                sx={{ mr: 1 }}
              >
                {topic.id === currentTopicId ? (
                  <CheckCircleIcon color="primary" />
                ) : (
                  <RadioButtonUncheckedIcon />
                )}
              </IconButton>
              <ListItemText 
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {topic.title}
                    {topic.id === currentTopicId && (
                      <Chip 
                        label="Current" 
                        color="primary" 
                        size="small" 
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Box>
                }
                secondary={topic.description}
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          No topics added yet. Add topics to begin tracking participation by topic.
        </Typography>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={handleCloseEditDialog}>
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