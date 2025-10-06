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
    dotDuration: 80,     // milliseconds
    dashDuration: 240,   // milliseconds (3x dot)
    letterPause: 240,    // milliseconds (3x dot)
    wordPause: 560,      // milliseconds (7x dot)
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
 * Decode continuous morse code (without spaces) by trying to match valid patterns
 * Uses a greedy approach that prefers longer patterns first
 */
export function decodeContinuousMorse(morse: string): string {
    if (!morse.trim()) return '';

    const morseStr = morse.trim();

    // First, try to find common patterns that make sense
    const commonPatterns = [
        '...---...', // SOS
        '....',      // H
        '---',       // O
        '...',       // S
        '..',        // I
        '.',         // E
        '-',         // T
        '.-',        // A
        '-.',        // N
        '--',        // M
    ];

    // Check if the morse code matches any common patterns exactly
    for (const pattern of commonPatterns) {
        if (morseStr === pattern) {
            const letter = REVERSE_MORSE[pattern];
            if (letter) {
                console.log(`Exact match for pattern "${pattern}" -> "${letter}"`);
                return letter.toLowerCase();
            }
        }
    }

    // If no exact match, try the recursive approach but with better scoring
    const allDecodings = findAllPossibleDecodings(morseStr);

    if (allDecodings.length === 0) return '';

    // Simple scoring: prefer shorter decodings with common letters
    const scoring = (decoding: string[]) => {
        let score = 0;

        // Heavy penalty for length
        score -= decoding.length * 10;

        // Bonus for common letters
        const commonLetters = 'ETAOINSHRDLCUMWFGYPBVKJXQZ';
        for (const letter of decoding) {
            const upperLetter = letter.toUpperCase();
            if (commonLetters.includes(upperLetter)) {
                score += 5;
            } else if (/[0-9]/.test(letter)) {
                score -= 50;
            }
        }

        return score;
    };

    // Sort by score and return the best
    allDecodings.sort((a, b) => scoring(b) - scoring(a));

    console.log('Best decoding:', allDecodings[0].join(''));

    return allDecodings[0].join('').toLowerCase();
}

function findAllPossibleDecodings(morse: string): string[][] {
    if (morse.length === 0) return [[]];

    const results: string[][] = [];

    // Try all possible lengths for the first letter
    for (let length = 1; length <= Math.min(morse.length, 6); length++) {
        const firstPart = morse.substring(0, length);
        const remaining = morse.substring(length);

        if (REVERSE_MORSE[firstPart]) {
            const letter = REVERSE_MORSE[firstPart];
            const remainingDecodings = findAllPossibleDecodings(remaining);

            for (const remainingDecoding of remainingDecodings) {
                results.push([letter, ...remainingDecoding]);
            }
        }
    }

    return results;
}

/**
 * Convert morse code string to timing sequence for audio playback
 */
export function morseToTiming(morse: string, timing: MorseTiming = DEFAULT_TIMING): number[] {
    const sequence: number[] = [];

    for (let i = 0; i < morse.length; i++) {
        const char = morse[i];

        if (char === '.') {
            // Add dot tone
            sequence.push(timing.dotDuration);
            // Add pause between elements (1 dot duration)
            sequence.push(timing.dotDuration);
        } else if (char === '-') {
            // Add dash tone
            sequence.push(timing.dashDuration);
            // Add pause between elements (1 dot duration)
            sequence.push(timing.dotDuration);
        } else if (char === ' ') {
            // Space between letters - replace the last pause with letter pause
            if (sequence.length > 0) {
                sequence[sequence.length - 1] = timing.letterPause;
            }
        }
    }

    // Remove the last pause if it exists (no pause after the last tone)
    if (sequence.length > 0 && sequence.length % 2 === 0) {
        sequence.pop();
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
