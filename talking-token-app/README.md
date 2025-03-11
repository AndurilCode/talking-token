# Talking Token App

A React application for managing speaking turns in meetings, ensuring balanced participation and encouraging contributions from all team members.

## Features

- **Token Visualization**: Visual representation of who currently holds the token
- **Timer**: Configurable speaking time limits
- **Participant Management**: Add, remove, and track participation
- **Reply Queue**: Manage direct responses to the current speaker
- **Token Passing**: Multiple methods for passing the token (manual, automatic, facilitator)
- **Persistence**: All data is saved to localStorage

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/talking-token.git
   cd talking-token
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

1. **Add Participants**: Enter names in the Participant Manager
2. **Configure Settings**: Set the maximum speaking time and token passing method
3. **Start a Session**: Click on a participant in the Token Circle to pass them the token
4. **Manage the Timer**: Use the timer controls to start, pause, or reset the timer
5. **Track Participation**: Monitor who has spoken and for how long
6. **Manage Replies**: Use the Reply Queue for direct responses

## Deployment

### Deploying to GitHub Pages

1. Update the `homepage` field in `package.json` with your GitHub username:
   ```json
   "homepage": "https://yourusername.github.io/talking-token"
   ```

2. Deploy the application:
   ```
   npm run deploy
   ```

3. Your application will be available at `https://yourusername.github.io/talking-token`

## Development

### Project Structure

- `src/components`: React components
- `src/hooks`: Custom React hooks
- `src/types`: TypeScript type definitions
- `src/utils`: Utility functions

### Built With

- [React](https://reactjs.org/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Material UI](https://mui.com/) - Component library
- [Vite](https://vitejs.dev/) - Build tool

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by the need for more balanced participation in meetings
- Based on the concept of a "talking stick" used in some indigenous cultures
