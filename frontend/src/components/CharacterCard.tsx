import { Link } from 'react-router-dom';
import type { Character } from '../data/characters';
import { Portrait } from './Portrait';

export function CharacterCard({ character }: { character: Character }) {
  return (
    <Link
      to={`/character/${character.id}`}
      className="card"
      style={{ ['--c' as string]: character.color } as React.CSSProperties}
      aria-label={`Open ${character.name}`}
    >
      <Portrait character={character} />
      <div className="glow" />
      <div className="meta">
        <div className="bankai-tag" style={{ color: character.color }}>
          Bankai · {character.bankai}
        </div>
        <h3>{character.name}</h3>
        <div className="title">{character.title}</div>
      </div>
    </Link>
  );
}
