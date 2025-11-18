import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '~/hooks/HookRouter';
import { RootState } from '~/redux/storage/store';
import { Toastify } from '~/helpers/Toastify';
import { useEffect } from 'react';
import NotAccessible from '~/pages/403/Forbidden';

interface PrivateRouteProps {
  allowedRoles?: string[];
}

function PrivateRoute({ allowedRoles = [] }: PrivateRouteProps) {
  const auth = useAppSelector((state: RootState) => state.auth);
  const location = useLocation();
  const history = useAppSelector(
    (state: RootState) => state.history.historyList,
  );

  const authorized: boolean =
    allowedRoles.length > 0
      ? allowedRoles.some((role) => role === auth.currentUser.role)
      : true;

  useEffect(() => {
    if (!auth.loggedIn || !auth.currentUser.token) {
      Toastify('Vui lòng đăng nhập để tiếp tục', 301);
    }
  }, [auth.loggedIn, auth.currentUser.token]);

  if (!auth.loggedIn || !auth.currentUser.token) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (auth.loggedIn && auth.currentUser.token) {
    if (!authorized) {
      return <NotAccessible />;
    }
    if (auth.currentUser.role === 'admin') {
      return <Outlet />;
    }
    if (auth.currentUser.role === 'user') {
      return <Outlet />;
    }
    if (auth.currentUser.role === 'artist') {
      return <Outlet />;
    }
    if (auth.currentUser.role === 'employee') {
      return <Outlet />;
    }
  }

  if (auth.loggedIn && history[0]?.path) {
    return <Navigate to={history[0].path} replace />;
  }

  return <Navigate to="/auth/login" state={{ from: location }} replace />;
}

export default PrivateRoute;
