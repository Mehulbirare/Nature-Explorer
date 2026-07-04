/**
 * Hunt catalog. Each entry is a self-contained "activity" the child can pick from
 * the Pick screen — the Hunt and Win screens are fully driven by whichever one is
 * chosen, so adding a new activity here makes it playable end-to-end with no other
 * code changes.
 */

export type HuntTheme = {
  /** Machine key (also the navigation param). */
  id: string;
  /** Short name shown on the pick card, e.g. "Flowers". */
  title: string;
  /** Singular noun used in the reward card, e.g. "flower" -> "It's a flower! ⭐". */
  targetLabel: string;
  /** Big emoji shown on the card and in the mission bar. */
  emoji: string;
  /** Mission copy, kept short for young kids. */
  missionText: string;
  /** Accent color for the pick card. */
  color: string;
  /** How many finds win the game. */
  goal: number;
  /** Case-insensitive keyword list matched against Google Vision labels. */
  matchKeywords: string[];
};

export const THEMES: Record<string, HuntTheme> = {
  flowers: {
    id: 'flowers',
    title: 'Flowers',
    targetLabel: 'flower',
    emoji: '🌸',
    missionText: 'Find 5 flowers',
    color: '#FF6B6B',
    goal: 5,
    matchKeywords: [
      'flower',
      'flowering plant',
      'plant',
      'petal',
      'blossom',
      'rose',
      'flowerpot',
      'flora',
      'garden',
      'daisy',
      'tulip',
      'sunflower',
      'leaf',
    ],
  },
  animals: {
    id: 'animals',
    title: 'Animals',
    targetLabel: 'animal',
    emoji: '🐾',
    missionText: 'Find 5 animals',
    color: '#F4A259',
    goal: 5,
    matchKeywords: [
      'animal',
      'dog',
      'cat',
      'bird',
      'pet',
      'mammal',
      'wildlife',
      'fish',
      'insect',
      'butterfly',
      'horse',
      'cow',
      'rabbit',
      'squirrel',
      'duck',
      'chicken',
      'fur',
    ],
  },
  fruits: {
    id: 'fruits',
    title: 'Fruits',
    targetLabel: 'fruit',
    emoji: '🍎',
    missionText: 'Find 5 fruits',
    color: '#E63946',
    goal: 5,
    matchKeywords: [
      'fruit',
      'apple',
      'banana',
      'orange',
      'grape',
      'strawberry',
      'mango',
      'watermelon',
      'lemon',
      'pear',
      'peach',
      'berry',
      'food',
      'produce',
    ],
  },
  vehicles: {
    id: 'vehicles',
    title: 'Vehicles',
    targetLabel: 'vehicle',
    emoji: '🚗',
    missionText: 'Find 5 vehicles',
    color: '#4DA6FF',
    goal: 5,
    matchKeywords: [
      'vehicle',
      'car',
      'truck',
      'bus',
      'bicycle',
      'bike',
      'motorcycle',
      'train',
      'airplane',
      'boat',
      'wheel',
      'tire',
      'toy vehicle',
      'automobile',
    ],
  },
  toys: {
    id: 'toys',
    title: 'Toys',
    targetLabel: 'toy',
    emoji: '🧸',
    missionText: 'Find 5 toys',
    color: '#9B5DE5',
    goal: 5,
    matchKeywords: [
      'toy',
      'teddy bear',
      'doll',
      'ball',
      'lego',
      'building block',
      'action figure',
      'stuffed toy',
      'plush',
      'puzzle',
      'game',
      'figurine',
    ],
  },
  books: {
    id: 'books',
    title: 'Books',
    targetLabel: 'book',
    emoji: '📚',
    missionText: 'Find 5 books',
    color: '#2A9D8F',
    goal: 5,
    matchKeywords: [
      'book',
      'novel',
      'notebook',
      'magazine',
      'paper',
      'page',
      'publication',
      'comic book',
      'textbook',
      'bookcase',
      'library',
    ],
  },
  devices: {
    id: 'devices',
    title: 'Gadgets',
    targetLabel: 'gadget',
    emoji: '🔌',
    missionText: 'Find 5 gadgets',
    color: '#495867',
    goal: 5,
    matchKeywords: [
      'television',
      'fan',
      'laptop',
      'refrigerator',
      'lamp',
      'microwave',
      'computer',
      'monitor',
      'keyboard',
      'mobile phone',
      'remote control',
      'electronic device',
      'home appliance',
    ],
  },
};

/** Ordered list the Pick screen renders as a grid of cards. */
export const HUNTS: HuntTheme[] = [
  THEMES.flowers,
  THEMES.animals,
  THEMES.fruits,
  THEMES.vehicles,
  THEMES.toys,
  THEMES.books,
  THEMES.devices,
];

/** Fallback hunt if a screen is opened without a valid id. */
export const DEFAULT_HUNT: HuntTheme = THEMES.flowers;

/** Resolve a hunt id (from navigation params) to its theme, with a safe fallback. */
export function getHunt(id?: string): HuntTheme {
  return (id && THEMES[id]) || DEFAULT_HUNT;
}

/** Case-insensitive: does any returned label fall inside the theme keyword set? */
export function labelsMatch(labels: string[], theme: HuntTheme): string | null {
  const keys = theme.matchKeywords.map(k => k.toLowerCase());
  for (const raw of labels) {
    const label = raw.toLowerCase().trim();
    if (keys.some(k => label === k || label.includes(k) || k.includes(label))) {
      return raw;
    }
  }
  return null;
}
