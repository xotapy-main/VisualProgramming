import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { documentService } from '../../service/documentService';
import type { DocumentMetadata, DocumentModel } from '../../types/type';

interface DocumentsState {
  list: DocumentMetadata[];
  currentDocument: DocumentModel | null;
  status: 'idle' | 'loading' | 'failed';
}

const initialState: DocumentsState = {
  list: [],
  currentDocument: null,
  status: 'idle',
};

export const fetchDocuments = createAsyncThunk('documents/fetchAll', async () => {
  return await documentService.getAll();
});

export const fetchDocumentById = createAsyncThunk('documents/fetchById', async (id: string) => {
  return await documentService.getById(id);
});

export const createDocument = createAsyncThunk(
  'documents/create',
  async (payload: { title: string; rowsCount: number; colsCount: number }) => {
    return await documentService.create(payload.title, payload.rowsCount, payload.colsCount);
  }
);

export const deleteDocument = createAsyncThunk('documents/delete', async (id: string) => {
  await documentService.delete(id);
  return id;
});

export const duplicateDocument = createAsyncThunk('documents/duplicate', async (id: string) => {
  return await documentService.duplicate(id);
});

const documentsSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    setCurrentDocument: (state, action: PayloadAction<DocumentModel | null>) => {
      state.currentDocument = action.payload;
    },
    updateCurrentTitleState: (state, action: PayloadAction<string>) => {
      if (state.currentDocument) {
        state.currentDocument.title = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDocuments.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchDocuments.fulfilled, (state, action: PayloadAction<DocumentMetadata[]>) => {
        state.status = 'idle';
        state.list = action.payload;
      })
      .addCase(fetchDocuments.rejected, (state) => {
        state.status = 'failed';
      })
      .addCase(fetchDocumentById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchDocumentById.fulfilled, (state, action: PayloadAction<DocumentModel | null>) => {
        state.status = 'idle';
        state.currentDocument = action.payload;
      })
      .addCase(fetchDocumentById.rejected, (state) => {
        state.status = 'failed';
      })
      .addCase(createDocument.fulfilled, (state, action: PayloadAction<DocumentModel>) => {
        state.list.push(action.payload);
        state.currentDocument = action.payload;
      })
      .addCase(deleteDocument.fulfilled, (state, action: PayloadAction<string>) => {
        state.list = state.list.filter((doc) => doc.id !== action.payload);
        if (state.currentDocument?.id === action.payload) {
          state.currentDocument = null;
        }
      })
      .addCase(duplicateDocument.fulfilled, (state, action: PayloadAction<DocumentModel | null>) => {
        if (action.payload) {
          state.list.push(action.payload);
        }
      });
  },
});

export const { setCurrentDocument, updateCurrentTitleState } = documentsSlice.actions;
export default documentsSlice.reducer;