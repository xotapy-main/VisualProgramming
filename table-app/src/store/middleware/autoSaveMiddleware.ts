import type { Middleware } from '@reduxjs/toolkit';
import { documentService } from '../../service/documentService';
import { setSaveStatus } from '../slices/uiSlice';
import { resetUnsavedChanges } from '../slices/spreadSheetSlice';

let debounceTimeout: ReturnType<typeof setTimeout> | null = null;

export const autoSaveMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);
  const state = store.getState();

  const isSpreadsheetChange = 
    typeof action === 'object' && 
    action !== null && 
    'type' in action && 
    typeof action.type === 'string' &&
    (action.type.startsWith('spreadsheet/updateCell') || 
     action.type.startsWith('spreadsheet/addRow') || 
     action.type.startsWith('spreadsheet/deleteRow') ||
     action.type.startsWith('spreadsheet/importParsedCSV'));

  if (isSpreadsheetChange && state.spreadsheet.hasUnsavedChanges) {
    store.dispatch(setSaveStatus('saving'));

    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    debounceTimeout = setTimeout(async () => {
      const currentState = store.getState();
      const currentDoc = currentState.documents.currentDocument;

      if (currentDoc) {
        try {
          await documentService.patch(currentDoc.id, {
            cells: currentState.spreadsheet.cells,
            title: currentDoc.title,
          });
          store.dispatch(setSaveStatus('saved'));
          store.dispatch(resetUnsavedChanges());
        } catch {
          store.dispatch(setSaveStatus('error'));
        }
      }
    }, 500);
  }

  return result;
};