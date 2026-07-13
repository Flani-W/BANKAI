// Character catalog. Short, factual references (character + zanpakuto/bankai names are
// titles) plus ORIGINAL flavor text written for this project. No copyrighted prose or
// incantations are embedded. Signature colors drive the 3D energy field per character.
//
// To make this DB-driven later, mirror these fields in a MongoDB `characters` collection
// (see docs/database_schema.md) and fetch them instead of importing this module.

export type ElementId =
  | 'void'
  | 'blossom'
  | 'ice'
  | 'frost'
  | 'serpent'
  | 'raw'
  | 'venom'
  | 'thunder'
  | 'silver'
  | 'flame'
  | 'bloom';

export interface Character {
  id: string;
  name: string;
  title: string;
  zanpakuto: string;
  bankai: string;
  element: ElementId;
  /** Primary signature color (hex) used by the 3D energy field + UI accents. */
  color: string;
  /** Secondary accent color (hex). */
  accent: string;
  /** Single kanji used by the procedural portrait/avatar. */
  glyph: string;
  /** Short original description (our words). */
  blurb: string;
}

export const CHARACTERS: Character[] = [
  {
    id: 'ichigo',
    name: 'Ichigo Kurosaki',
    title: 'Substitute Soul Reaper',
    zanpakuto: 'Zangetsu',
    bankai: 'Tensa Zangetsu',
    element: 'void',
    color: '#1ec8ff',
    accent: '#e7003b',
    glyph: '月',
    blurb:
      'A human turned Soul Reaper whose resolve compresses raw power into a blade of midnight. ' +
      'When he releases, the air itself seems to fold around the edge.',
  },
  {
    id: 'byakuya',
    name: 'Byakuya Kuchiki',
    title: 'Captain — Squad 6',
    zanpakuto: 'Senbonzakura',
    bankai: 'Senbonzakura Kageyoshi',
    element: 'blossom',
    color: '#ff5d8f',
    accent: '#ffd0e0',
    glyph: '桜',
    blurb:
      'Nobility made lethal. His blade scatters into a storm of countless petal-blades that ' +
      'drift like spring and cut like winter.',
  },
  {
    id: 'toshiro',
    name: 'Toshiro Hitsugaya',
    title: 'Captain — Squad 10',
    zanpakuto: 'Hyorinmaru',
    bankai: 'Daiguren Hyorinmaru',
    element: 'ice',
    color: '#6fe9ff',
    accent: '#bff4ff',
    glyph: '氷',
    blurb:
      'The strongest ice wielder of his generation. On release, frozen wings unfold and the ' +
      'battlefield is claimed by an advancing winter.',
  },
  {
    id: 'rukia',
    name: 'Rukia Kuchiki',
    title: 'Captain — Squad 13',
    zanpakuto: 'Sode no Shirayuki',
    bankai: 'Hakka no Togame',
    element: 'frost',
    color: '#dff3ff',
    accent: '#8ec5ff',
    glyph: '雪',
    blurb:
      'The most beautiful blade in the Soul Society. Her release lowers the world to absolute ' +
      'cold — pure, white, and final.',
  },
  {
    id: 'renji',
    name: 'Renji Abarai',
    title: 'Lieutenant — Squad 6',
    zanpakuto: 'Zabimaru',
    bankai: 'Hihio Zabimaru',
    element: 'serpent',
    color: '#ff3b2f',
    accent: '#ffb35c',
    glyph: '蛇',
    blurb:
      'Relentless and loyal, he fights forward and never back. His bankai uncoils into a vast ' +
      'serpent of bone that strikes like an avalanche.',
  },
  {
    id: 'kenpachi',
    name: 'Kenpachi Zaraki',
    title: 'Captain — Squad 11',
    zanpakuto: 'Nozarashi',
    bankai: 'Unnamed',
    element: 'raw',
    color: '#ffd400',
    accent: '#ff7a00',
    glyph: '剣',
    blurb:
      'Combat distilled to instinct. His power is so vast it was sealed from him for years; when ' +
      'it finally answers, the ground gives way first.',
  },
  {
    id: 'mayuri',
    name: 'Mayuri Kurotsuchi',
    title: 'Captain — Squad 12',
    zanpakuto: 'Ashisogi Jizo',
    bankai: 'Konjiki Ashisogi Jizo',
    element: 'venom',
    color: '#9b5cff',
    accent: '#8dff5c',
    glyph: '毒',
    blurb:
      'A scientist who treats every battle as an experiment. His release blooms into a toxic ' +
      'colossus that severs the body from the will to move it.',
  },
  {
    id: 'soifon',
    name: 'Suì-Fēng',
    title: 'Captain — Squad 2',
    zanpakuto: 'Suzumebachi',
    bankai: 'Jakuho Raikoben',
    element: 'thunder',
    color: '#ffd24a',
    accent: '#ff4a4a',
    glyph: '雷',
    blurb:
      'A master of stealth who prizes the single, perfect strike. Her bankai trades subtlety for ' +
      'one overwhelming missile of golden lightning.',
  },
  {
    id: 'gin',
    name: 'Gin Ichimaru',
    title: 'Captain — Squad 3',
    zanpakuto: 'Shinso',
    bankai: 'Kamishini no Yari',
    element: 'silver',
    color: '#b9c6da',
    accent: '#7a5cff',
    glyph: '槍',
    blurb:
      'A smile that never quite reaches the eyes, and a blade that strikes from impossibly far. ' +
      'His release is a silver line that crosses the field before you register the motion.',
  },
  {
    id: 'ikkaku',
    name: 'Ikkaku Madarame',
    title: 'Lieutenant — Squad 11',
    zanpakuto: 'Hozukimaru',
    bankai: 'Ryumon Hozukimaru',
    element: 'flame',
    color: '#e1352a',
    accent: '#ffbf3c',
    glyph: '龍',
    blurb:
      'A brawler who lives for the fight and hides his strength out of pride. When he finally lets ' +
      'go, a dragon-crest blazes to life and the heat warps the air around the blade.',
  },
  {
    id: 'shunsui',
    name: 'Shunsui Kyoraku',
    title: 'Captain — Squad 1',
    zanpakuto: 'Katen Kyokotsu',
    bankai: 'Katen Kyokotsu: Karamatsu Shinju',
    element: 'bloom',
    color: '#e0588f',
    accent: '#6e3f8f',
    glyph: '花',
    blurb:
      'Easygoing to a fault, until the petals fall. His bankai turns the battlefield into a somber ' +
      'children’s game where every flower that drifts down carries a hidden, blooming cost.',
  },
];

export function getCharacter(id: string | undefined): Character | undefined {
  return CHARACTERS.find((c) => c.id === id);
}
