import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useBlocker } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchDocumentById, setCurrentDocument } from '../store/slices/documentSlice';
import Spreadsheet from '../components/table';

export default function SpreadsheetPage() {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const currentDocument = useAppSelector((state) => state.currentDocument);
  const status = useAppSelector((state) => state.documents.status);
  const hasUnsavedChanges = useAppSelector((state) => state.spreadsheet.hasUnsavedChanges);

  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    if (documentId) {
      setIsNotFound(false);
      dispatch(fetchDocumentById(documentId)).then((resultAction) => {
        if (fetchDocumentById.fulfilled.match(resultAction)) {
          if (!resultAction.payload) {
            setIsNotFound(true);
          }
        }
      });
    }
    return () => {
      dispatch(setCurrentDocument(null));
    };
  }, [documentId, dispatch]);

  useBlocker(({ currentValue, nextValue }) => {
    if (hasUnsavedChanges && currentValue.pathname !== nextValue.pathname) {
      const confirmLeave = window.confirm('У вас есть несохраненные изменения. Вы уверены, что хотите покинуть страницу?');
      return !confirmLeave;
    }
    return false;
  });

  const handleBack = () => {
    navigate('/dashboard');
  };

  if (isNotFound) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h2>Документ не найден</h2>
        <p>Запрашиваемый документ с ID "{documentId}" не существует.</p>
        <button onClick={handleBack} style={{ padding: '10px 15px', cursor: 'pointer' }}>Вернуться на главную</button>
      </div>
    );
  }

  if (status === 'loading' || !currentDocument) {
    return <div style={{ padding: '20px' }}>Загрузка документа...</div>;
  }

  return <Spreadsheet documentId={currentDocument.id} onBackToDashboard={handleBack} />;
}