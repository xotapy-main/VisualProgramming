import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { GridData, CellId, SelectionRange} from '../../types/type';
import { evaluateFormula, determineCellType } from '../../utils/formuls';

interface SpreadsheetState {
  cells: GridData;
  selectedCell: CellId | null;
  selectedRange: SelectionRange | null;
  rowsCount: number;
  colsCount: number;
  past: GridData[];
  future: GridData[];
  hasUnsavedChanges: boolean;
}

const initialState: SpreadsheetState = {
  cells: {},
  selectedCell: null,
  selectedRange: null,
  rowsCount: 50,
  colsCount: 26,
  past: [],
  future: [],
  hasUnsavedChanges: false,
};

const spreadsheetSlice = createSlice({
  name: 'spreadsheet',
  initialState,
  reducers: {
    initSpreadsheet: (state, action: PayloadAction<{ cells: GridData; rowsCount: number; colsCount: number }>) => {
      state.cells = action.payload.cells;
      state.rowsCount = action.payload.rowsCount;
      state.colsCount = action.payload.colsCount;
      state.selectedCell = null;
      state.selectedRange = null;
      state.past = [];
      state.future = [];
      state.hasUnsavedChanges = false;
    },
    selectCell: (state, action: PayloadAction<{ id: CellId; expandRange?: boolean }>) => {
      const { id, expandRange } = action.payload;
      
      if (!expandRange || !state.selectedCell) {
        state.selectedCell = id;
        state.selectedRange = null;
      } else {
        state.selectedRange = {
          start: state.selectedCell,
          end: id,
        };
      }
    },
    updateCell: (state, action: PayloadAction<{ id: CellId; value: string }>) => {
      const { id, value } = action.payload;
      
      state.past.push(JSON.parse(JSON.stringify(state.cells)));
      state.future = [];
      
      const cellType = determineCellType(value);
      const displayValue = evaluateFormula(value, state.cells);
      
      state.cells[id] = {
        value,
        display: displayValue,
        type: cellType,
      };
      state.hasUnsavedChanges = true;
    },
    addRow: (state, _action: PayloadAction<number>) => {
      state.past.push(JSON.parse(JSON.stringify(state.cells)));
      state.future = [];
      state.rowsCount += 1;
      state.hasUnsavedChanges = true;
    },
    deleteRow: (state, action: PayloadAction<number>) => {
      state.past.push(JSON.parse(JSON.stringify(state.cells)));
      state.future = [];
      const rowToDelete = action.payload;
      
      Object.keys(state.cells).forEach((key) => {
        const rowMatch = key.match(/\d+/);
        if (rowMatch && parseInt(rowMatch[0]) === rowToDelete) {
          delete state.cells[key];
        }
      });
      
      state.rowsCount = Math.max(1, state.rowsCount - 1);
      state.hasUnsavedChanges = true;
    },
    importParsedCSV: (state, action: PayloadAction<{ parsedCells: GridData; maxRows: number; maxCols: number }>) => {
      state.past.push(JSON.parse(JSON.stringify(state.cells)));
      state.future = [];
      state.cells = action.payload.parsedCells;
      state.rowsCount = action.payload.maxRows;
      state.colsCount = action.payload.maxCols;
      state.hasUnsavedChanges = true;
    },
    undo: (state) => {
      if (state.past.length === 0) return;
      const previous = state.past.pop()!;
      state.future.push(JSON.parse(JSON.stringify(state.cells)));
      state.cells = previous;
      state.hasUnsavedChanges = true;
    },
    redo: (state) => {
      if (state.future.length === 0) return;
      const next = state.future.pop()!;
      state.past.push(JSON.parse(JSON.stringify(state.cells)));
      state.cells = next;
      state.hasUnsavedChanges = true;
    },
    resetUnsavedChanges: (state) => {
      state.hasUnsavedChanges = false;
    },
  },
});

export const {
  initSpreadsheet,
  selectCell,
  updateCell,
  addRow,
  deleteRow,
  importParsedCSV,
  undo,
  redo,
  resetUnsavedChanges,
} = spreadsheetSlice.actions;

export default spreadsheetSlice.reducer;