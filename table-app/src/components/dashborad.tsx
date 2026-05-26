import React, { useEffect, useState } from 'react';
<<<<<<< HEAD
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  fetchDocuments, 
  createDocument, 
  deleteDocument, 
  duplicateDocument
} from '../store/slices/documentSlice';
import { setCreateModalOpen } from '../store/slices/uiSlice';
=======
import { documentService } from '../service/documentService';
import type { DocumentMetadata } from '../types/type';
>>>>>>> parent of c7e336e (Проведен рефакторинг проекта на Redux реализованы slices и тесты для них)

interface DashboardProps {
  onSelectDocument: (id: string) => void;
}

export default function Dashboard({ onSelectDocument }: DashboardProps) {
  const [docs, setDocs] = useState<DocumentMetadata[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newRows, setNewRows] = useState(50);
  const [newCols, setNewCols] = useState(26);

  const loadDocuments = async () => {
    const list = await documentService.getAll();
    setDocs(list);
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
<<<<<<< HEAD
    
    const resultAction = await dispatch(createDocument({ title: newTitle, rowsCount: newRows, colsCount: newCols }));
    if (createDocument.fulfilled.match(resultAction)) {
      dispatch(setCreateModalOpen(false));
      setNewTitle('');
      onSelectDocument(resultAction.payload.id);
    }
=======
    const created = await documentService.create(newTitle, newRows, newCols);
    setIsModalOpen(false);
    onSelectDocument(created.id);
>>>>>>> parent of c7e336e (Проведен рефакторинг проекта на Redux реализованы slices и тесты для них)
  };

  const handleDelete = async (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Вы уверены, что хотите удалить документ "${title}"?`)) {
      await documentService.delete(id);
      loadDocuments();
    }
  };

  const handleDuplicate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
<<<<<<< HEAD
    dispatch(duplicateDocument(id));
=======
    await documentService.duplicate(id);
    loadDocuments();
>>>>>>> parent of c7e336e (Проведен рефакторинг проекта на Redux реализованы slices и тесты для них)
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Мои таблицы</h2>
        <button 
<<<<<<< HEAD
          onClick={() => dispatch(setCreateModalOpen(true))}
          style={{ padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
=======
          onClick={() => setIsModalOpen(true)}
          style={{ padding: '10px 16px', backgroundColor: '#0070f3', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
>>>>>>> parent of c7e336e (Проведен рефакторинг проекта на Redux реализованы slices и тесты для них)
        >
          Создать таблицу
        </button>
      </div>

<<<<<<< HEAD
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
        {docs.map((doc) => (
          <div 
            key={doc.id} 
            onClick={() => onSelectDocument(doc.id)}
            style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '15px', cursor: 'pointer', backgroundColor: '#f9f9f9', position: 'relative' }}
          >
            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>{doc.title}</h3>
            <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#666' }}>Строк: {doc.rowsCount}, Столбцов: {doc.colsCount}</p>
            <p style={{ margin: '0 0 15px 0', fontSize: '11px', color: '#999' }}>Изменено: {new Date(doc.updatedAt).toLocaleString()}</p>
            
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button 
                onClick={(e) => handleDuplicate(doc.id, e)}
                style={{ padding: '5px 10px', fontSize: '12px', cursor: 'pointer' }}
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

=======
      {docs.length === 0 ? (
        <p style={{ color: '#666' }}>У вас пока нет созданных документов. Нажмите кнопку выше, чтобы начать.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {docs.map((doc) => (
            <div 
              key={doc.id} 
              onClick={() => onSelectDocument(doc.id)}
              style={{ border: '1px solid #eaeaea', borderRadius: '8px', padding: '16px', cursor: 'pointer', backgroundColor: '#fff', transition: 'box-shadow 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)'}
            >
              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.title}</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px', backgroundColor: '#ddd', border: '1px solid #ddd', borderRadius: '4px', margin: '12px 0', height: '60px' }}>
                {doc.preview.map((row, rIdx) => 
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
                  onClick={(e) => handleDuplicate(doc.id, e)}style={{ padding: '4px 8px', fontSize: '12px', backgroundColor: '#f5f5f5', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}
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
>>>>>>> parent of c7e336e (Проведен рефакторинг проекта на Redux реализованы slices и тесты для них)
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
<<<<<<< HEAD
              <button type="button" onClick={() => dispatch(setCreateModalOpen(false))} style={{ padding: '8px 12px', background: 'none', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}>Отмена</button>
              <button type="submit" style={{ padding: '8px 12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Создать</button>
=======
              <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '8px 12px', background: 'none', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}>Отмена</button>
              <button type="submit" style={{ padding: '8px 12px', backgroundColor: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Создать</button>
>>>>>>> parent of c7e336e (Проведен рефакторинг проекта на Redux реализованы slices и тесты для них)
            </div>
          </form>
        </div>
      )}
    </div>
  );
}