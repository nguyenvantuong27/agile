import { Outlet, Navigate } from 'react-router-dom';
import { useAppSelector } from '../../../hooks/HookRouter';
import { RootState } from '~/redux/storage/store';

export function NotLoggedMiddleware() {
  const auth = useAppSelector((state: RootState) => state.auth);

  if (auth.loggedIn && auth.currentUser.token) {
    switch (auth.currentUser.role) {
      case 'employee':
        return <Navigate to="/employee" />;
      case 'admin':
        return <Navigate to="/admin" />;
      case 'artist':
        return <Navigate to="/artist/schedules" />;
      case 'user':
        return <Navigate to="/" />;
    }
  } else {
    return <Outlet />;
  }
}
