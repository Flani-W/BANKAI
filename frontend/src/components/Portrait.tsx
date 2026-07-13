import { useState } from 'react';
import type { Character } from '../data/characters';

/**
 * Renders the character portrait. If you drop a real image at
 * `frontend/public/characters/<id>.jpg` it is used; otherwise we render a procedural
 * portrait (signature gradient + thematic kanji) so the lineup always looks complete.
 */
export function Portrait({ character }: { character: Character }) {
  const [failed, setFailed] = useState(false);
  const src = `${import.meta.env.BASE_URL}characters/${character.id}.jpg`;

  if (!failed) {
    return (
      <img
        className="portrait"
        src={src}
        alt={character.name}
        loading="lazy"
        onError={() => setFailed(true)}
        style={{ objectFit: 'cover' }}
      />
    );
  }

  return (
    <div
      className="portrait portrait-proc"
      style={
        {
          ['--c' as string]: character.color,
          background: `radial-gradient(120% 100% at 50% 0%, ${character.color}33, transparent 55%),
                       linear-gradient(160deg, ${character.accent}22, #05060a 70%)`,
        } as React.CSSProperties
      }
      aria-label={character.name}
    >
      <span className="kanji" style={{ fontSize: '46%' }}>
        {character.glyph}
      </span>
    </div>
  );
}
