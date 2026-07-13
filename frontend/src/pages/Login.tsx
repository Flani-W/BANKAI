import { useState, type FormEvent } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../store/auth';

export function LoginPage() {
  const navigate = useNavigate();
  const { user, login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/lineup" replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === 'login') await login(email, password);
      else await register(email, password);
      navigate('/lineup', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="backdrop" />
      <div className="login-wrap">
        <form className="login-card" onSubmit={onSubmit}>
          <h1 className="brand">BANKAI</h1>
          <p className="brand-sub">Soul Reaper Archive</p>

          {error && (
            <div className="form-error" role="alert">
              {error}
            </div>
          )}

          <label className="field">
            <span>Email</span>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
            />
          </label>

          <button className="btn-primary" type="submit" disabled={busy}>
            {busy ? 'Channeling…' : mode === 'login' ? 'Enter' : 'Create Account'}
          </button>

          <div className="toggle-line">
            {mode === 'login' ? (
              <>
                No account?
                <button type="button" onClick={() => setMode('register')}>
                  Register
                </button>
              </>
            ) : (
              <>
                Already enlisted?
                <button type="button" onClick={() => setMode('login')}>
                  Sign in
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </>
  );
}
