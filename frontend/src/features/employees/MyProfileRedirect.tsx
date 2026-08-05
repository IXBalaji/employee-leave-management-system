import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function MyProfileRedirect() {
  const { user } = useAuth();
  if (!user) return null;
  return <Navigate to={`/employees/${user.id}`} replace />;
}
