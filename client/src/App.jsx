import { Navigate, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import PolicySettings from './pages/PolicySettings';
import ActivityLog from './pages/ActivityLog';

function Protected({ children }) { return localStorage.getItem('sdg_token') ? children : <Navigate to="/" replace />; }

export default function App() {
  return <Routes><Route path="/" element={<Login />} /><Route path="/signup" element={<Signup />} /><Route path="/policy" element={<Protected><PolicySettings /></Protected>} /><Route path="/activity" element={<Protected><ActivityLog /></Protected>} /><Route path="*" element={<Navigate to="/" replace />} /></Routes>;
}
