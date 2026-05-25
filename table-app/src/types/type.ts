export type CellId = string;

export type CellType = 'number' | 'formula' | 'boolean' | 'empty';

export interface CellData {
  value: string;
  display: string;
  type: CellType;
}

export interface GridData {
  [key: string]: CellData;
}

export interface DocumentMetadata {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  rowsCount: number;
  colsCount: number;
  preview: string[][];
}

export interface DocumentModel extends DocumentMetadata {
  cells: GridData;
}

export type SaveStatus = 'saved' | 'saving' | 'error';

export interface UserMock {
  id: string;
  name: string;
  email: string;
}

export interface SelectionRange {
  start: CellId;
  end: CellId;
}