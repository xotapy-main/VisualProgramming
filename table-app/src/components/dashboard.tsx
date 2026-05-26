import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  fetchDocuments, 
  createDocument, 
  deleteDocument, 
  duplicateDocument
} from '../store/slices/documentSlice';
import { setCreateModalOpen } from '../store/slices/uiSlice';

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
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
      navigate(`/documents/${resultAction.payload.id}`);
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

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Мои таблицы</h2>
        <button 
          onClick={() => dispatch(setCreateModalOpen(true))}
          style={{ padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Создать таблицу
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {docs.map((doc) => (
          <div 
            key={doc.id} 
            onClick={() => navigate(`/documents/${doc.id}`)}
            style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '15px', cursor: 'pointer', backgroundColor: '#f9f9f9', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '200px', transition: 'transform 0.2s, box-shadow 0.2s' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#1a1a1a' }}>{doc.title}</h3>
              
              {doc.preview && doc.preview.length > 0 && (
                <div 
                  style={{ 
                    display: 'grid', 
                    gridTemplateColumns: `repeat(${doc.preview[0]?.length || 3}, 1fr)`, 
                    gap: '2px', 
                    backgroundColor: '#e0e0e0', 
                    padding: '4px', 
                    borderRadius: '4px', 
                    marginBottom: '10px',
                    pointerEvents: 'none'
                  }}
                >
                  {doc.preview.map((row, rIdx) => 
                    row.map((cellValue, cIdx) => (
                      <div 
                        key={`${rIdx}-${cIdx}`} 
                        style={{ backgroundColor: 'white', padding: '4px', fontSize: '10px', height: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center', color: '#333' }}
                      >
                        {cellValue}
                      </div>
                    ))
                  )}
                </div>
              )}

              <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#666' }}>Строк: {doc.rowsCount}, Столбцов: {doc.colsCount}</p>
              <p style={{ margin: '0 0 15px 0', fontSize: '11px', color: '#999' }}>Изменено: {new Date(doc.updatedAt).toLocaleString()}</p>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button 
                onClick={(e) => handleDuplicate(doc.id, e)}
                style={{ padding: '5px 10px', fontSize: '12px', cursor: 'pointer', background: '#fff', border: '1px solid #ccc', borderRadius: '4px' }}
              >
                Дублировать
              </button>
              <button 
                onClick={(e) => handleDelete(doc.id, doc.title, e)}
                style={{ padding: '5px 10px', fontSize: '12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <form onSubmit={handleCreate} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '300px' }}>
            <h3 style={{ margin: '0 0 15px 0' }}>Создать новую таблицу</h3>
            <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px' }}>
              Название:
              <input 
                type="text" 
                value={newTitle} 
                onChange={e => setNewTitle(e.target.value)} 
                required
                style={{ width: '100%', padding: '8px', marginTop: '4px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px' }} 
              />
            </label>
            
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
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
              <button type="submit" style={{ padding: '8px 12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Создать</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}