import type { DocumentModel, DocumentMetadata, GridData } from '../types/type';

const STORAGE_KEY = 'spreadsheet_documents';

const generatePreview = (cells: GridData): string[][] => {
  const preview: string[][] = [];
  for (let r = 1; r <= 3; r++) {
    const row: string[] = [];
    for (let c = 0; c < 3; c++) {
      const colLetter = String.fromCharCode(65 + c);
      row.push(cells[`${colLetter}${r}`]?.display || '');
    }
    preview.push(row);
  }
  return preview;
};

const getStoredDocuments = (): DocumentModel[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const saveStoredDocuments = (docs: DocumentModel[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
};

export const documentService = {
  getAll: async (): Promise<DocumentMetadata[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const docs = getStoredDocuments();
        resolve(docs.map(({ cells, ...meta }) => meta));
      }, 300);
    });
  },

  getById: async (id: string): Promise<DocumentModel | null> => {
    return new Promise((resolve) => {
      const docs = getStoredDocuments();
      const doc = docs.find((d) => d.id === id) || null;
      resolve(doc);
    });
  },

  create: async (title: string, rowsCount: number, colsCount: number): Promise<DocumentModel> => {
    return new Promise((resolve) => {
      const now = new Date().toISOString();
      const newDoc: DocumentModel = {
        id: crypto.randomUUID(),
        title,
        createdAt: now,
        updatedAt: now,
        rowsCount,
        colsCount,
        cells: {},
        preview: [['', '', ''], ['', '', ''], ['', '', '']],
      };

      const docs = getStoredDocuments();
      docs.push(newDoc);
      saveStoredDocuments(docs);
      resolve(newDoc);
    });
  },

  patch: async (id: string, updates: { cells?: GridData; title?: string }): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const docs = getStoredDocuments();
        const index = docs.findIndex((d) => d.id === id);

        if (index === -1) {
          reject(new Error('Документ не найден'));
          return;
        }

        const currentDoc = docs[index];
        const updatedCells = updates.cells ? { ...currentDoc.cells, ...updates.cells } : currentDoc.cells;

        docs[index] = {
          ...currentDoc,
          title: updates.title ?? currentDoc.title,
          cells: updatedCells,
          preview: updates.cells ? generatePreview(updatedCells) : currentDoc.preview,
          updatedAt: new Date().toISOString(),
        };

        saveStoredDocuments(docs);
        resolve();
      }, 400);
    });
  },

  delete: async (id: string): Promise<void> => {
    return new Promise((resolve) => {
      const docs = getStoredDocuments();
      const filtered = docs.filter((d) => d.id !== id);
      saveStoredDocuments(filtered);
      resolve();
    });
  },

  duplicate: async (id: string): Promise<DocumentModel | null> => {
    return new Promise((resolve) => {
      const docs = getStoredDocuments();
      const original = docs.find((d) => d.id === id);
      if (!original) {
        resolve(null);
        return;
      }

      const now = new Date().toISOString();
      const clone: DocumentModel = {
        ...original,
        id: crypto.randomUUID(),
        title: `${original.title} (Копия)`,
        createdAt: now,
        updatedAt: now,
      };

      docs.push(clone);
      saveStoredDocuments(docs);
      resolve(clone);
    });
  },
};