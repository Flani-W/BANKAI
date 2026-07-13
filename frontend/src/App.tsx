import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './store/auth';
import { primeSpeech } from './lib/audio';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/Login';
import { LineupPage } from './pages/Lineup';
import { CharacterPage } from './pages/CharacterPage';

export function App() {
  const restore = useAuth((s) => s.restore);

  useEffect(() => {
    restore();
    primeSpeech();
  }, [restore]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/lineup"
        element={
          <ProtectedRoute>
            <LineupPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/character/:id"
        element={
          <ProtectedRoute>
            <CharacterPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/lineup" replace />} />
    </Routes>
  );
}
