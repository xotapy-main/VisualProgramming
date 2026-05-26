import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { SaveStatus } from '../../types/type';

interface UiState {
  isCreateModalOpen: boolean;
  saveStatus: SaveStatus;
  notification: string | null;
}

const initialState: UiState = {
  isCreateModalOpen: false,
  saveStatus: 'saved',
  notification: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setCreateModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isCreateModalOpen = action.payload;
    },
    setSaveStatus: (state, action: PayloadAction<SaveStatus>) => {
      state.saveStatus = action.payload;
    },
    setNotification: (state, action: PayloadAction<string | null>) => {
      state.notification = action.payload;
    },
  },
});

export const { setCreateModalOpen, setSaveStatus, setNotification } = uiSlice.actions;
export default uiSlice.reducer;