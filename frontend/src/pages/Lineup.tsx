import { useNavigate } from 'react-router-dom';
import { CHARACTERS } from '../data/characters';
import { CharacterCard } from '../components/CharacterCard';
import { useAuth } from '../store/auth';

export function LineupPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <>
      <div className="backdrop" />
      <div className="lineup">
        <div className="topbar">
          <h1>BANKAI</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span className="who">{user?.email}</span>
            <button
              className="logout"
              onClick={() => {
                logout();
                navigate('/login', { replace: true });
              }}
            >
              Sign out
            </button>
          </div>
        </div>
        <p className="lineup-sub">Choose a Soul Reaper · Release their Bankai</p>

        <div className="grid">
          {CHARACTERS.map((c) => (
            <CharacterCard key={c.id} character={c} />
          ))}
        </div>
      </div>
    </>
  );
}
