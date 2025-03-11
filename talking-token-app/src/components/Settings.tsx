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
  SelectChangeEvent
} from '@mui/material';
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
      
      <FormControl fullWidth>
        <InputLabel id="token-pass-method-label">Token Passing Method</InputLabel>
        <Select
          labelId="token-pass-method-label"
          id="token-pass-method"
          value={tokenPassMethod}
          label="Token Passing Method"
          onChange={handleMethodChange}
        >
          <MenuItem value="manual">Manual (Click to Pass)</MenuItem>
          <MenuItem value="automatic">Automatic (When Time Expires)</MenuItem>
          <MenuItem value="facilitator">Facilitator Controlled</MenuItem>
        </Select>
      </FormControl>
    </Paper>
  );
};

export default Settings; 