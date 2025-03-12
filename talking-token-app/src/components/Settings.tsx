import React from 'react';
import { 
  Paper, 
  Typography, 
  Slider, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Box,
  SelectChangeEvent,
  Alert,
  Divider
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { TokenPassMethod } from '../types';

interface SettingsProps {
  maxSpeakingTime: number;
  onMaxSpeakingTimeChange: (value: number) => void;
  tokenPassMethod: TokenPassMethod;
  onTokenPassMethodChange: (method: TokenPassMethod) => void;
}

const Settings: React.FC<SettingsProps> = ({
  maxSpeakingTime,
  onMaxSpeakingTimeChange,
  tokenPassMethod,
  onTokenPassMethodChange
}) => {
  const handleTimeChange = (_event: Event, value: number | number[]) => {
    onMaxSpeakingTimeChange(value as number);
  };

  const handleMethodChange = (event: SelectChangeEvent) => {
    onTokenPassMethodChange(event.target.value as TokenPassMethod);
  };

  // Format time for display
  const formatTime = (seconds: number) => {
    return `${seconds} seconds`;
  };

  // Get explanation for current token passing method
  const getTokenPassMethodExplanation = () => {
    switch (tokenPassMethod) {
      case 'automatic':
        return "When a speaker's time expires, the token automatically passes to the next participant in the circle. This ensures a smooth flow and equal time distribution without requiring facilitator intervention.";
      case 'facilitator':
        return "As the facilitator, you have full control over token movement. You decide when to pass the token and to whom, allowing for more structured discussions and ensuring all voices are heard in the appropriate order.";
      default:
        return "";
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Settings
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Typography id="speaking-time-slider" gutterBottom>
          Maximum Speaking Time
        </Typography>
        <Slider
          value={maxSpeakingTime}
          onChange={handleTimeChange}
          aria-labelledby="speaking-time-slider"
          valueLabelDisplay="auto"
          valueLabelFormat={formatTime}
          step={10}
          marks={[
            { value: 30, label: '30s' },
            { value: 60, label: '60s' },
            { value: 90, label: '90s' },
            { value: 120, label: '120s' }
          ]}
          min={10}
          max={180}
        />
      </Box>
      
      <Divider sx={{ my: 3 }} />
      
      <Typography variant="subtitle1" gutterBottom>
        Token Passing Method
      </Typography>
      
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="token-pass-method-label">Select Method</InputLabel>
        <Select
          labelId="token-pass-method-label"
          id="token-pass-method"
          value={tokenPassMethod}
          label="Select Method"
          onChange={handleMethodChange}
        >
          <MenuItem value="automatic">Automatic (When Time Expires)</MenuItem>
          <MenuItem value="facilitator">Facilitator Controlled</MenuItem>
        </Select>
      </FormControl>
      
      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
        <InfoIcon color="info" sx={{ mr: 1, mt: 0.5 }} />
        <Typography variant="body2" color="text.secondary">
          {getTokenPassMethodExplanation()}
        </Typography>
      </Box>
      
      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="body2">
          <strong>Automatic:</strong> Token passes to the next person when time expires - ensures equal speaking time for all participants.<br />
          <strong>Facilitator:</strong> You control token movement - ideal for structured discussions where specific order matters or when you need to adjust the flow based on the group's needs.
        </Typography>
      </Alert>
    </Paper>
  );
};

export default Settings; 