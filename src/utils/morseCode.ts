// Morse code mapping
const MORSE_CODE: { [key: string]: string } = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
    'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
    'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
    'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
    'Y': '-.--', 'Z': '--..',
    '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
    '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
    '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.', '!': '-.-.--',
    '/': '-..-.', '(': '-.--.', ')': '-.--.-', '&': '.-...', ':': '---...',
    ';': '-.-.-.', '=': '-...-', '+': '.-.-.', '-': '-....-', '_': '..--.-',
    '"': '.-..-.', '$': '...-..-', '@': '.--.-.', ' ': ' '
};

// Reverse mapping for decoding
const REVERSE_MORSE: { [key: string]: string } = Object.fromEntries(
    Object.entries(MORSE_CODE).map(([key, value]) => [value, key])
);

export interface MorseTiming {
    dotDuration: number;
    dashDuration: number;
    letterPause: number;
    wordPause: number;
}

export const DEFAULT_TIMING: MorseTiming = {
    dotDuration: 100,    // milliseconds
    dashDuration: 300,   // milliseconds (3x dot)
    letterPause: 300,    // milliseconds (3x dot)
    wordPause: 700,      // milliseconds (7x dot)
};

/**
 * Encode text to morse code
 */
export function encodeToMorse(text: string): string {
    return text
        .toUpperCase()
        .split('')
        .map(char => MORSE_CODE[char] || '')
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Decode morse code to text
 */
export function decodeFromMorse(morse: string): string {
    return morse
        .split(' ')
        .map(code => REVERSE_MORSE[code] || '')
        .join('')
        .toLowerCase();
}

/**
 * Convert morse code string to timing sequence for audio playback
 */
export function morseToTiming(morse: string, timing: MorseTiming = DEFAULT_TIMING): number[] {
    const sequence: number[] = [];
    let isPlaying = false;

    for (let i = 0; i < morse.length; i++) {
        const char = morse[i];

        if (char === '.') {
            sequence.push(timing.dotDuration);
            isPlaying = true;
        } else if (char === '-') {
            sequence.push(timing.dashDuration);
            isPlaying = true;
        } else if (char === ' ') {
            // Space between letters
            if (isPlaying) {
                sequence.push(timing.letterPause);
                isPlaying = false;
            }
        }
    }

    return sequence;
}

/**
 * Validate if a string contains only valid morse code characters
 */
export function isValidMorse(morse: string): boolean {
    return /^[.\-\s]*$/.test(morse);
}

/**
 * Get morse code for a specific character
 */
export function getMorseForChar(char: string): string {
    return MORSE_CODE[char.toUpperCase()] || '';
}
