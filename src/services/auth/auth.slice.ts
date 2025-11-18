import { createSlice, isAnyOf } from '@reduxjs/toolkit';
import { authApi } from './auth.services';
import { IAuth } from '../../interfaces/types/auth/auth';
import { IUserLogin } from '../../domain/types/user/user.model';
const initialState: IAuth = {
  loggedIn: false,
  errorMessage: null,
  currentUser: {} as IUserLogin,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logoutUser: () => initialState,
    clearLoginErrorMessage: (state) => ({
      ...state,
      errorMessage: null,
    }),
    assignNewToken: (state, action) => ({
      ...state,
      currentUser: {
        ...state.currentUser,
        token: action.payload,
      },
    }),
    setAuthCurrentUser: (state, action) => ({
      ...state,
      currentUser: action.payload,
    }),
    setBrandCurrentUser: (state, action) => ({
      ...state,
      currentUser: {
        ...state.currentUser,
        branchId: action.payload,
      },
    }),
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      isAnyOf(authApi.endpoints.login.matchFulfilled),
      (state, action) => {
        const response = action.payload;
        if (response?.statusCode === 200) {
          state.loggedIn = true;
          state.errorMessage = null;
          if (state.currentUser) {
            state.currentUser = response?.data.userData;
          }
        } else {
          state.loggedIn = false;
          state.errorMessage = response?.data?.status;
          state.currentUser = {} as IUserLogin;
        }
      },
    );
  },
});

const { reducer, actions } = authSlice;
export const {
  logoutUser,
  clearLoginErrorMessage,
  assignNewToken,
  setAuthCurrentUser,
  setBrandCurrentUser,
} = actions;
export default reducer;
