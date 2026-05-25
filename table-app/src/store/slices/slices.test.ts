import { describe, test, expect } from 'vitest';
import spreadsheetReducer, { 
  initSpreadsheet, 
  updateCell, 
  undo, 
  redo 
} from './spreadSheetSlice';
import uiReducer, { setSaveStatus } from './uiSlice';
import authReducer, { logout } from './authSlice';

describe('Redux Slices Unit Tests', () => {
  
  test('authSlice should handle logout', () => {
    const initialState = { user: { id: '1', name: 'Test', email: 't@t.com' }, isAuthenticated: true };
    const nextState = authReducer(initialState, logout());
    expect(nextState.user).toBeNull();
    expect(nextState.isAuthenticated).toBe(false);
  });

  test('uiSlice should handle setSaveStatus', () => {
    const initialState = { isCreateModalOpen: false, saveStatus: 'saved' as const, notification: null };
    const nextState = uiReducer(initialState, setSaveStatus('saving'));
    expect(nextState.saveStatus).toBe('saving');
  });

  test('spreadsheetSlice should initialize and update cells with history (Undo/Redo)', () => {
    const initialState = {
      cells: {},
      selectedCell: null,
      selectedRange: null,
      rowsCount: 50,
      colsCount: 26,
      past: [],
      future: [],
      hasUnsavedChanges: false,
    };

    const stateWithData = spreadsheetReducer(
      initialState, 
      initSpreadsheet({ cells: { A1: { value: '10', display: '10', type: 'number' } }, rowsCount: 50, colsCount: 26 })
    );
    expect(stateWithData.cells['A1'].value).toBe('10');

    const stateAfterUpdate = spreadsheetReducer(
      stateWithData, 
      updateCell({ id: 'A1', value: '25' })
    );
    expect(stateAfterUpdate.cells['A1'].value).toBe('25');
    expect(stateAfterUpdate.past.length).toBe(1);

    const stateAfterUndo = spreadsheetReducer(stateAfterUpdate, undo());
    expect(stateAfterUndo.cells['A1'].value).toBe('10');
    expect(stateAfterUndo.future.length).toBe(1);

    const stateAfterRedo = spreadsheetReducer(stateAfterUndo, redo());
    expect(stateAfterRedo.cells['A1'].value).toBe('25');
    expect(stateAfterRedo.past.length).toBe(1);
  });
});