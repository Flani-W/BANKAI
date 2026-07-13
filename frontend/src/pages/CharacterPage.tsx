import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { getCharacter } from '../data/characters';
import { releaseBankai } from '../lib/audio';
import { BankaiScene } from '../three/BankaiScene';

export function CharacterPage() {
  const { id } = useParams();
  const character = getCharacter(id);
  const [released, setReleased] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [audioMode, setAudioMode] = useState<'clip' | 'speech' | 'silent' | null>(null);

  if (!character) return <Navigate to="/lineup" replace />;

  async function onRelease() {
    if (!character) return;
    setReleased(true);
    setPlaying(true);
    const result = await releaseBankai(character);
    setAudioMode(result.mode);
    await result.done;
    setPlaying(false);
  }

  const cssVars = {
    ['--c' as string]: character.color,
    ['--accent' as string]: character.accent,
  } as React.CSSProperties;

  return (
    <div className="char-page" style={cssVars}>
      <BankaiScene character={character} released={released} />

      <div className="char-ui">
        <Link to="/lineup" className="back">
          ← Lineup
        </Link>

        <div className="char-info">
          <p className="role">{character.title}</p>
          <h1 className="kana">{character.name}</h1>
          <p className="blurb">{character.blurb}</p>

          <div className="bankai-line">
            Zanpakutō: <b>{character.zanpakuto}</b> &nbsp;·&nbsp; Bankai:{' '}
            <b>{character.bankai}</b>
          </div>

          <div className="release-row">
            {!released ? (
              <button className="btn-release" onClick={onRelease} disabled={playing}>
                Release Bankai
              </button>
            ) : (
              <>
                <div className="released-name" style={{ color: character.accent }}>
                  {character.bankai}
                </div>
                <button
                  className="btn-release"
                  onClick={onRelease}
                  disabled={playing}
                  style={{ padding: '12px 22px', fontSize: 13 }}
                >
                  {playing ? 'Resonating…' : 'Again'}
                </button>
              </>
            )}
          </div>
        </div>

        <div className="audio-hint">
          {audioMode === 'speech' &&
            'No clip for this one yet — voiced by your browser’s speech engine.'}
          {audioMode === 'clip' && 'Playing the bankai clip.'}
          {audioMode === null &&
            'Tip: drop a .glb at public/models/' +
              character.id +
              '.glb to use your own 3D model.'}
        </div>
      </div>
    </div>
  );
}
