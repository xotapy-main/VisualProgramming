import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  fetchDocuments, 
  createDocument, 
  deleteDocument, 
  duplicateDocument,
  fetchDocumentById 
} from '../store/slices/documentSlice';
import { setCreateModalOpen } from '../store/slices/uiSlice';

interface DashboardProps {
  onSelectDocument: (id: string) => void;
}

export default function Dashboard({ onSelectDocument }: DashboardProps) {
  const dispatch = useAppDispatch();
  
  const docs = useAppSelector((state) => state.documents.list);
  const isModalOpen = useAppSelector((state) => state.ui.isCreateModalOpen);
  
  const [newTitle, setNewTitle] = useState('');
  const [newRows, setNewRows] = useState(50);
  const [newCols, setNewCols] = useState(26);

  useEffect(() => {
    dispatch(fetchDocuments());
  }, [dispatch]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    
    const resultAction = await dispatch(createDocument({ title: newTitle, rowsCount: newRows, colsCount: newCols }));
    if (createDocument.fulfilled.match(resultAction)) {
      dispatch(setCreateModalOpen(false));
      setNewTitle('');
    }
  };

  const handleDelete = (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Вы уверены, что хотите удалить документ "${title}"?`)) {
      dispatch(deleteDocument(id));
    }
  };

  const handleDuplicate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(duplicateDocument(id));
  };

  const handleSelectDoc = (id: string) => {
    dispatch(fetchDocumentById(id));
    onSelectDocument(id);
  };

  return (
    <div style={{ padding: '24px', fontFamily: 'sans-serif', color: '#333' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>Мои документы</h2>
        <button 
          onClick={() => dispatch(setCreateModalOpen(true))}
          style={{ padding: '10px 16px', backgroundColor: '#0070f3', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          + Создать таблицу
        </button>
      </div>

      {docs.length === 0 ? (
        <p style={{ color: '#666' }}>У вас пока нет созданных документов. Нажмите кнопку выше, чтобы начать.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {docs.map((doc) => (
            <div 
              key={doc.id} 
              onClick={() => handleSelectDoc(doc.id)}
              style={{ border: '1px solid #eaeaea', borderRadius: '8px', padding: '16px', cursor: 'pointer', backgroundColor: '#fff', transition: 'box-shadow 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)'}
            >
              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.title}</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px', backgroundColor: '#ddd', border: '1px solid #ddd', borderRadius: '4px', margin: '12px 0', height: '60px' }}>
                {doc.preview && doc.preview.map((row, rIdx) => 
                  row.map((cellValue, cIdx) => (
                    <div key={`${rIdx}-${cIdx}`} style={{ backgroundColor: '#fff', fontSize: '10px', padding: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#777' }}>
                      {cellValue}
                    </div>
                  ))
                )}
              </div>

              <div style={{ fontSize: '12px', color: '#888', marginBottom: '12px' }}>
                Изменён: {new Date(doc.updatedAt).toLocaleDateString()}
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button 
                  onClick={(e) => handleDuplicate(doc.id, e)}
                  style={{ padding: '4px 8px', fontSize: '12px', backgroundColor: '#f5f5f5', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Копия
                </button>
                <button 
                  onClick={(e) => handleDelete(doc.id, doc.title, e)}
                  style={{ padding: '4px 8px', fontSize: '12px', backgroundColor: '#fff5f5', color: '#ff4d4f', border: '1px solid #ffccc7', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
          <form onSubmit={handleCreate} style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', width: '320px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            <h3 style={{ margin: '0 0 16px 0' }}>Новый документ</h3>
            
            <label style={{ display: 'block', marginBottom: '12px', fontSize: '14px' }}>
              Название:
              <input 
                type="text" 
                required 
                value={newTitle} 
                onChange={e => setNewTitle(e.target.value)} 
                style={{ width: '100%', padding: '8px', marginTop: '4px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px' }} 
              />
            </label>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              <label style={{ flex: 1, fontSize: '14px' }}>
                Строк:
                <input 
                  type="number" 
                  min="1" 
                  max="1000"
                  value={newRows} 
                  onChange={e => setNewRows(Number(e.target.value))} 
                  style={{ width: '100%', padding: '8px', marginTop: '4px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px' }} 
                />
              </label>
              <label style={{ flex: 1, fontSize: '14px' }}>
                Столбцов:
                <input 
                  type="number" 
                  min="1" 
                  max="26" 
                  value={newCols} 
                  onChange={e => setNewCols(Number(e.target.value))} 
                  style={{ width: '100%', padding: '8px', marginTop: '4px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px' }} 
                />
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" onClick={() => dispatch(setCreateModalOpen(false))} style={{ padding: '8px 12px', background: 'none', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}>Отмена</button>
              <button type="submit" style={{ padding: '8px 12px', backgroundColor: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Создать</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}