import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import InfoIcon from '@mui/icons-material/Info';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';

const FacilitatorGuide: React.FC = () => {
  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3, maxWidth: '100%', overflow: 'hidden' }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        Facilitator Guide
      </Typography>
      
      <Typography variant="body1" paragraph>
        This guide provides tips and best practices for facilitating discussions using the Talking Token app.
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <InfoIcon sx={{ mr: 1 }} /> What is Talking Token?
        </Typography>
        <Typography variant="body1" paragraph>
          Talking Token is a facilitation tool designed to promote balanced participation in group discussions. 
          It helps ensure that everyone has an opportunity to speak and prevents any single person from dominating the conversation.
        </Typography>
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <TipsAndUpdatesIcon sx={{ mr: 1 }} /> Facilitator Best Practices
        </Typography>
        
        <List>
          <ListItem>
            <ListItemIcon>
              <CheckCircleOutlineIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Set clear expectations" 
              secondary="Begin by explaining the token concept and how it will be used in the discussion."
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <CheckCircleOutlineIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Establish time limits" 
              secondary="Adjust the speaking time based on the group size and discussion topic. Shorter times (60-90 seconds) work well for larger groups."
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <CheckCircleOutlineIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Create a safe space" 
              secondary="Remind participants that they can pass the token if they don't wish to speak on a particular topic."
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <CheckCircleOutlineIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Track participation" 
              secondary="Use the Participation Tracker to identify who hasn't spoken yet and encourage their participation."
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <CheckCircleOutlineIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Be flexible" 
              secondary="Adjust the token passing method based on the flow of the discussion. Switch between automatic and facilitator-controlled as needed."
            />
          </ListItem>
        </List>
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      <Box>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <InfoIcon sx={{ mr: 1 }} /> Token Passing Methods
        </Typography>
        
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>
          Automatic
        </Typography>
        <Typography variant="body2" paragraph>
          When a participant's time is up, the token automatically passes to the next person in the circle.
          This method keeps the discussion moving at a steady pace and ensures everyone gets a turn.
        </Typography>
        
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>
          Facilitator-Controlled
        </Typography>
        <Typography variant="body2" paragraph>
          The facilitator decides who receives the token next. This method allows for more flexibility
          in the discussion flow and can be useful when specific expertise or perspectives are needed.
        </Typography>
      </Box>
    </Paper>
  );
};

export default FacilitatorGuide; 