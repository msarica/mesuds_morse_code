# Morse Code Translator

A mobile-friendly web application for translating text to morse code and vice versa, with audio playback functionality.

## Features

- **Encode Mode**: Convert text to morse code with real-time audio playback
- **Decode Mode**: Convert morse code back to text with audio playback
- **Mobile Optimized**: Touch-friendly interface designed for mobile devices
- **Audio Playback**: Hear morse code as you type or decode
- **Character Mapping**: Visual reference for morse code characters
- **Copy/Paste Support**: Easy sharing of morse code and decoded text
- **Volume Control**: Adjustable audio volume

## Getting Started

### Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to the local development URL (usually `http://localhost:5173`)

### Building for Production

```bash
npm run build
```

This will create a `dist` folder with the production build.

## Deployment to GitHub Pages

This project is configured to deploy to GitHub Pages in a subfolder (`/morse_code/`).

### Prerequisites

1. Create a GitHub repository
2. Push your code to the repository
3. Enable GitHub Pages in your repository settings

### Deploy

```bash
npm run deploy
```

This will:
1. Build the project for production
2. Deploy the `dist` folder to the `gh-pages` branch
3. Make your app available at `https://yourusername.github.io/morse_code`

### Manual Deployment

If you prefer to deploy manually:

1. Build the project: `npm run build`
2. Copy the contents of the `dist` folder to your `gh-pages` branch
3. Push the `gh-pages` branch to GitHub

## Usage

### Encode Mode
1. Select "Encode" from the main menu
2. Type your message in the text input
3. View the morse code output
4. Use the "Play" button to hear the morse code
5. Copy the morse code to share

### Decode Mode
1. Select "Decode" from the main menu
2. Enter morse code using dots (.) and dashes (-)
3. View the decoded text
4. Use the "Play" button to hear the morse code
5. Copy the decoded text

## Technical Details

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Audio**: Web Audio API for morse code sound generation
- **Styling**: CSS with mobile-first responsive design
- **Deployment**: GitHub Pages with subfolder configuration

## Browser Support

- Modern browsers with Web Audio API support
- Mobile browsers (iOS Safari, Chrome Mobile, etc.)
- Desktop browsers (Chrome, Firefox, Safari, Edge)

## Morse Code Reference

The app supports the standard International Morse Code including:
- Letters A-Z
- Numbers 0-9
- Common punctuation marks
- Spaces for word separation

## License

This project is open source and available under the MIT License.