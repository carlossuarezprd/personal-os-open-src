import { Routes, Route } from 'react-router-dom';
import SessionList from './SessionList';
import SessionDetail from './SessionDetail';
import ExerciseDetail from './ExerciseDetail';
import LibraryPage from './LibraryPage';
import LibraryExerciseDetail from './LibraryExerciseDetail';

export default function TrainingPage() {
  return (
    <Routes>
      <Route index element={<SessionList />} />
      <Route path="library" element={<LibraryPage />} />
      <Route path="library/:exerciseId" element={<LibraryExerciseDetail />} />
      <Route path="session/:sessionId" element={<SessionDetail />} />
      <Route path="session/:sessionId/exercise/:exerciseLogId" element={<ExerciseDetail />} />
    </Routes>
  );
}
