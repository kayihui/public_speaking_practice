/**
 * Data module — word banks, topics, conductor commands, and difficulty configs.
 */

// ─── Word Association Riff: Word Banks ──────────────────────────────────────

export const WORDS = {
  easy: [
    'Sunrise', 'Kitchen', 'Bridge', 'Garden', 'Thunder', 'Blanket', 'River',
    'Candle', 'Shadow', 'Window', 'Mountain', 'Coffee', 'Ladder', 'Ocean',
    'Puzzle', 'Lantern', 'Feather', 'Compass', 'Mirror', 'Harvest',
    'Breeze', 'Castle', 'Honey', 'Anchor', 'Fireworks', 'Lighthouse',
    'Pebble', 'Treehouse', 'Rainbow', 'Telescope', 'Hammock', 'Fountain',
    'Snowflake', 'Carousel', 'Campfire', 'Butterfly', 'Waterfall', 'Kite',
    'Seashell', 'Clocktower',
  ],
  medium: [
    'Momentum', 'Blueprint', 'Paradox', 'Eclipse', 'Catalyst', 'Labyrinth',
    'Frequency', 'Threshold', 'Symmetry', 'Resonance', 'Mosaic', 'Cipher',
    'Pendulum', 'Kaleidoscope', 'Alchemy', 'Horizon', 'Nexus', 'Prism',
    'Vortex', 'Odyssey', 'Tapestry', 'Pinnacle', 'Crucible', 'Mirage',
    'Archipelago', 'Spectrum', 'Chronicle', 'Sanctuary', 'Monolith',
    'Equilibrium', 'Silhouette', 'Crescendo', 'Turbulence', 'Synthesis',
    'Metamorphosis', 'Undercurrent', 'Conundrum', 'Panorama', 'Kinetic',
    'Constellation',
  ],
  hard: [
    'Ephemeral', 'Solipsism', 'Entropy', 'Zeitgeist', 'Ontology',
    'Juxtaposition', 'Sublime', 'Simulacrum', 'Liminality', 'Absurdism',
    'Phenomenology', 'Dialectic', 'Transcendence', 'Hegemony', 'Apotheosis',
    'Palimpsest', 'Verisimilitude', 'Eschatology', 'Heterotopia',
    'Interstitial', 'Sonder', 'Qualia', 'Rhizome', 'Apophenia',
    'Defamiliarization', 'Synecdoche', 'Tessellation', 'Parallax',
    'Bifurcation', 'Superposition', 'Ambivalence', 'Catharsis',
    'Dissonance', 'Ineffable', 'Numinous', 'Recursion', 'Singularity',
    'Tautology', 'Uncanny', 'Xenogenesis',
  ],
};

// ─── Topics for Headline Drill & Telescoping ────────────────────────────────

export const TOPICS = {
  easy: [
    'Why breakfast is the most important meal',
    'The best way to spend a rainy day',
    'Why everyone should learn to cook',
    'The benefits of walking every day',
    'What makes a great neighbor',
    'Why reading books matters',
    'The perfect weekend getaway',
    'Why music makes everything better',
    'How to make a perfect cup of coffee',
    'The importance of a good night\'s sleep',
    'Why pets make us happier',
    'The joy of learning something new',
    'What makes a great first impression',
    'Why laughter is the best medicine',
    'The value of a handwritten letter',
  ],
  medium: [
    'Why failure is essential for success',
    'How social media is reshaping human connection',
    'The hidden cost of convenience',
    'Why curiosity is more important than intelligence',
    'The future of remote work',
    'How cities should be redesigned for people',
    'Why we should embrace boredom',
    'The power of saying no',
    'How storytelling shapes our reality',
    'Why creativity cannot be automated',
    'The paradox of choice in modern life',
    'How habits shape destiny',
    'The case for learning a second language',
    'Why discomfort drives growth',
    'How technology changes the way we remember',
  ],
  hard: [
    'Why consciousness might be an illusion',
    'The ethics of artificial intelligence making life-or-death decisions',
    'How the attention economy is eroding democracy',
    'Whether free will is compatible with neuroscience',
    'The philosophical implications of living in a simulation',
    'Why economic growth and sustainability are fundamentally at odds',
    'How language shapes the boundaries of thought',
    'The moral obligation of the present to future generations',
    'Whether truth is discovered or constructed',
    'How collective memory distorts history',
    'The paradox of tolerance in open societies',
    'Why meritocracy might be a myth',
    'The ethics of human enhancement technology',
    'How information abundance creates knowledge scarcity',
    'Whether empathy can scale beyond our immediate circle',
  ],
};

// ─── Conductor Commands ─────────────────────────────────────────────────────

export const CONDUCTOR_COMMANDS = {
  easy: [
    { text: 'LOUDER', icon: '🔊', category: 'volume' },
    { text: 'SOFTER', icon: '🤫', category: 'volume' },
    { text: 'FASTER', icon: '⚡', category: 'pace' },
    { text: 'SLOWER', icon: '🐢', category: 'pace' },
    { text: 'SMILE', icon: '😊', category: 'emotion' },
    { text: 'BIG GESTURES', icon: '🙌', category: 'energy' },
    { text: 'STAND TALL', icon: '🧍', category: 'energy' },
    { text: 'MAKE EYE CONTACT', icon: '👁️', category: 'energy' },
  ],
  medium: [
    { text: 'WHISPER', icon: '🤫', category: 'volume' },
    { text: 'PROJECT!', icon: '📢', category: 'volume' },
    { text: 'DOUBLE YOUR PACE', icon: '🏃', category: 'pace' },
    { text: 'HALF SPEED', icon: '🦥', category: 'pace' },
    { text: 'GET EXCITED', icon: '🎉', category: 'emotion' },
    { text: 'BE SERIOUS', icon: '🎭', category: 'emotion' },
    { text: 'TELL A STORY', icon: '📖', category: 'style' },
    { text: 'ASK A QUESTION', icon: '❓', category: 'style' },
    { text: 'USE A METAPHOR', icon: '🌊', category: 'style' },
    { text: 'PAUSE... THEN CONTINUE', icon: '⏸️', category: 'pace' },
    { text: 'SPEAK WITH AUTHORITY', icon: '👑', category: 'energy' },
    { text: 'BE CONVERSATIONAL', icon: '💬', category: 'style' },
  ],
  hard: [
    { text: 'WHISPER WITH INTENSITY', icon: '🔥', category: 'volume' },
    { text: 'SHOUT YOUR POINT', icon: '📣', category: 'volume' },
    { text: 'SPEAK AS IF TO A CHILD', icon: '👶', category: 'style' },
    { text: 'SPEAK AS IF TO A CEO', icon: '💼', category: 'style' },
    { text: 'PURE EMOTION', icon: '💔', category: 'emotion' },
    { text: 'COLD LOGIC ONLY', icon: '🧊', category: 'emotion' },
    { text: 'IMPROVISE A JOKE', icon: '😂', category: 'style' },
    { text: 'SWITCH TO THE OPPOSITE OPINION', icon: '🔄', category: 'style' },
    { text: 'DRAMATIC MONOLOGUE', icon: '🎭', category: 'style' },
    { text: 'RAPID FIRE — NO PAUSES', icon: '💥', category: 'pace' },
    { text: 'ONE. WORD. AT. A. TIME.', icon: '🎯', category: 'pace' },
    { text: 'CHANNEL A TED TALK', icon: '🎤', category: 'style' },
    { text: 'VULNERABLE AND RAW', icon: '💎', category: 'emotion' },
    { text: 'SARCASTIC EDGE', icon: '😏', category: 'emotion' },
    { text: 'POETIC — USE IMAGERY', icon: '🌌', category: 'style' },
  ],
};

// ─── Conductor Topic Pool ───────────────────────────────────────────────────

export const CONDUCTOR_TOPICS = [
  'The meaning of courage',
  'Why adventure matters',
  'What leadership really means',
  'The importance of trust',
  'Why we need art',
  'The power of persistence',
  'What it means to belong',
  'Why change is beautiful',
  'The nature of excellence',
  'What makes someone unforgettable',
  'The role of sacrifice',
  'Why passion is contagious',
  'The value of patience',
  'What defines a hero',
  'Why vulnerability is strength',
];

// ─── Difficulty Configurations ──────────────────────────────────────────────

export const DIFFICULTY = {
  'word-riff': {
    easy:   { wordInterval: 20, label: 'Easy — New word every 20s' },
    medium: { wordInterval: 15, label: 'Medium — New word every 15s' },
    hard:   { wordInterval: 8,  label: 'Hard — New word every 8s' },
  },
  'conductor': {
    easy:   { commandMinInterval: 15, commandMaxInterval: 20, label: 'Easy — Commands every 15–20s' },
    medium: { commandMinInterval: 10, commandMaxInterval: 15, label: 'Medium — Commands every 10–15s' },
    hard:   { commandMinInterval: 5,  commandMaxInterval: 10, label: 'Hard — Commands every 5–10s' },
  },
  'headline-drill': {
    easy:   { headlinePhase: 15, label: 'Easy — 15s for your headline' },
    medium: { headlinePhase: 10, label: 'Medium — 10s for your headline' },
    hard:   { headlinePhase: 7,  label: 'Hard — 7s for your headline' },
  },
  'telescoping': {
    easy:   { roundRatios: [1, 2, 3], label: 'Easy — Gentle scaling (1×, 2×, 3×)' },
    medium: { roundRatios: [1, 2, 4], label: 'Medium — Moderate scaling (1×, 2×, 4×)' },
    hard:   { roundRatios: [1, 3, 6], label: 'Hard — Steep scaling (1×, 3×, 6×)' },
  },
};

// ─── Exercise Metadata ──────────────────────────────────────────────────────

export const EXERCISES = {
  'word-riff': {
    id: 'word-riff',
    name: 'Word Association Riff',
    description: 'A random word appears — speak freely, associating ideas. New words keep arriving to challenge your flow.',
    shortDesc: 'Free-associate from random words',
    icon: '💬',
    accentVar: '--accent-word-riff',
    defaultDuration: 2,
  },
  'conductor': {
    id: 'conductor',
    name: 'The Conductor',
    description: 'Speak on a topic while the app throws style commands at you — adapt your energy, pace, and emotion in real time.',
    shortDesc: 'Adapt to live style commands',
    icon: '🎭',
    accentVar: '--accent-conductor',
    defaultDuration: 3,
  },
  'headline-drill': {
    id: 'headline-drill',
    name: 'The Headline Drill',
    description: 'Craft one punchy headline sentence in seconds, then expand on it. Train yourself to lead with the conclusion.',
    shortDesc: 'Lead with the headline',
    icon: '📰',
    accentVar: '--accent-headline',
    defaultDuration: 2,
  },
  'telescoping': {
    id: 'telescoping',
    name: 'Telescoping',
    description: 'Deliver the same idea in 3 rounds of increasing length. Master the art of compression and expansion.',
    shortDesc: 'Same idea, 3 different lengths',
    icon: '🔭',
    accentVar: '--accent-telescoping',
    defaultDuration: 4,
  },
};

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Pick a random element from an array */
export function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Pick N unique random elements from an array */
export function pickRandomN(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, arr.length));
}

/** Shuffle an array in place (Fisher-Yates) */
export function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
