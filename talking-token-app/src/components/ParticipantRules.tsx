import React from 'react';
import { Box, Typography, List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import PanToolIcon from '@mui/icons-material/PanTool';
import TimerIcon from '@mui/icons-material/Timer';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import BuildIcon from '@mui/icons-material/Build';
import HearingIcon from '@mui/icons-material/Hearing';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupsIcon from '@mui/icons-material/Groups';

/**
 * Component that displays the key rules for participants in the talking token process
 */
const ParticipantRules: React.FC = () => {
  // Define rule sections with their items
  const ruleSections = [
    {
      title: "Token Basics",
      items: [
        { icon: <MicIcon color="primary" fontSize="small" />, text: "Only speak when you have the token" },
        { icon: <TimerIcon color="primary" fontSize="small" />, text: "Speak for up to 90 seconds max" },
        { icon: <SwapHorizIcon color="primary" fontSize="small" />, text: "Pass by saying \"I pass to [Name]\"" },
        { icon: <PanToolIcon color="primary" fontSize="small" />, text: "Use \"Raise Hand\" to request the token" }
      ]
    },
    {
      title: "When You Have the Token",
      items: [
        { icon: <VolumeUpIcon color="secondary" fontSize="small" />, text: "Be concise - make 1-2 clear points" },
        { icon: <BuildIcon color="secondary" fontSize="small" />, text: "Build on previous points when possible" },
        { icon: <SwapHorizIcon color="secondary" fontSize="small" />, text: "Say \"Pass for now\" if you have nothing to add" }
      ]
    },
    {
      title: "When Others Have the Token",
      items: [
        { icon: <HearingIcon color="info" fontSize="small" />, text: "Listen actively - take notes" },
        { icon: <PanToolIcon color="info" fontSize="small" />, text: "Raise hand for direct replies (30 sec max)" }
      ]
    },
    {
      title: "Meeting Flow",
      items: [
        { icon: <PlayArrowIcon color="success" fontSize="small" />, text: "Topic presentation (5 min max)" },
        { icon: <GroupsIcon color="success" fontSize="small" />, text: "Everyone contributes at least once" },
        { icon: <AccessTimeIcon color="success" fontSize="small" />, text: "30 min max per topic discussion" }
      ]
    }
  ];

  return (
    <Box sx={{ 
      height: '100%', 
      p: 1.5, 
      display: 'flex', 
      flexDirection: 'column', 
      bgcolor: 'background.paper',
      overflow: 'hidden'
    }}>
      <Typography variant="subtitle1" component="h2" gutterBottom align="center" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
        Participant Guidelines
      </Typography>
      
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {ruleSections.map((section, sectionIndex) => (
          <React.Fragment key={sectionIndex}>
            <Typography 
              variant="subtitle2" 
              component="h3" 
              sx={{ 
                mt: sectionIndex > 0 ? 1.5 : 0, 
                mb: 0.5, 
                fontWeight: 'bold',
                color: sectionIndex === 0 ? 'primary.dark' : 
                      sectionIndex === 1 ? 'secondary.dark' : 
                      sectionIndex === 2 ? 'info.dark' : 'success.dark',
                fontSize: '0.9rem'
              }}
            >
              {section.title}
            </Typography>
            
            <List dense disablePadding>
              {section.items.map((item, itemIndex) => (
                <ListItem key={itemIndex} sx={{ py: 0.25 }}>
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{ 
                      variant: 'body2',
                      sx: { 
                        fontWeight: 500,
                        fontSize: '0.8rem',
                        lineHeight: 1.3
                      }
                    }} 
                  />
                </ListItem>
              ))}
            </List>
            
            {sectionIndex < ruleSections.length - 1 && (
              <Divider sx={{ my: 1 }} />
            )}
          </React.Fragment>
        ))}
      </Box>
      
      <Box sx={{ mt: 1.5, pt: 0.5, borderTop: '1px solid', borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary" align="center" sx={{ fontStyle: 'italic', display: 'block' }}>
          Remember: The goal is balanced participation and productive discussions.
        </Typography>
      </Box>
    </Box>
  );
};

export default ParticipantRules; 