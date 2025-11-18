import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  historyList: [] as { path: string }[],
};

const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    pushHistory: (state, action: { payload: { path: string } }) => {
      const checkIssetPath = state.historyList?.some(
        (item) => item.path === action.payload.path,
      );

      if (!checkIssetPath) {
        state.historyList = [action.payload, ...(state.historyList || [])];
      } else {
        const deleteCurrentPath = state.historyList?.filter(
          (item) => item.path !== action.payload.path,
        );
        state.historyList = [action.payload, ...(deleteCurrentPath || [])];
      }
    },
    clearHistory: (state, action) => {
      state.historyList = state.historyList?.filter(
        (item) => item.path !== action.payload,
      );
    },
    clearAllHistory: () => initialState,
  },
});

const { reducer, actions } = historySlice;
export const { pushHistory, clearHistory, clearAllHistory } = actions;
export default reducer;
