import { useAppDispatch } from '~/hooks/HookRouter';
import { logoutUser } from '~/services/auth/auth.slice';

export const useLogoutHandler = () => {
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return { handleLogout };
};
