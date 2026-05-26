export type CellId = string;

export type CellType = 'number' | 'formula' | 'boolean' | 'empty' | 'text'; 

export interface CellData {
  value: string;
  display: string;
  type: CellType;
}

export type GridData = Record<CellId, CellData>;

export interface SelectionRange {
  start: CellId;
  end: CellId;
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

export interface UserMock {
  id: string;
  name: string;
  email: string;
}

export type SaveStatus = 'saved' | 'saving' | 'error';