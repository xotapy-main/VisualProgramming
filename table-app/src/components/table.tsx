import React, { useState, useRef, useEffect } from 'react';
import Cell from './Cell';
import { evaluateFormula, determineCellType } from '../utils/formuls';
import { exportToCSV, exportToJSON, parseCSV } from '../utils/io';
import { documentService } from '../service/documentService';
import type { GridData, CellId, SaveStatus } from '../types/type';

interface SpreadsheetProps {
  documentId: string;
  onBackToDashboard: () => void;
}

function Spreadsheet({ documentId, onBackToDashboard }: SpreadsheetProps) {
  const [title, setTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  
  const [cells, setCells] = useState<GridData>({});
  const [selectedCell, setSelectedCell] = useState<CellId | null>(null);
  const [columnWidths, setColumnWidths] = useState<{ [key: number]: number }>({});
  const [rowHeights, setRowHeights] = useState<{ [key: number]: number }>({});
  const [resizing, setResizing] = useState<{ type: 'col' | 'row', index: number } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, rowIndex: number } | null>(null);
  
  const [rowsCount, setRowsCount] = useState(50);
  const [colsCount, setColsCount] = useState(26);

  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const startPos = useRef<number>(0);
  const startSize = useRef<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const defaultColWidth = 110;
  const defaultRowHeight = 30;

  useEffect(() => {
    const loadDoc = async () => {
      const doc = await documentService.getById(documentId);
      if (doc) {
        setTitle(doc.title);
        setCells(doc.cells);
        setRowsCount(doc.rowsCount);
        setColsCount(doc.colsCount);
        setHasUnsavedChanges(false);
        setSaveStatus('saved');
      }
    };
    loadDoc();
  }, [documentId]);

  const saveDocumentData = async (currentCells: GridData, currentTitle: string) => {
    setSaveStatus('saving');
    try {
      await documentService.patch(documentId, { cells: currentCells, title: currentTitle });
      setSaveStatus('saved');
      setHasUnsavedChanges(false);
    } catch {
      setSaveStatus('error');
    }
  };

  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const delayDebounceFn = setTimeout(() => {
      saveDocumentData(cells, title);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [cells, title, hasUnsavedChanges]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'У вас есть несохраненные изменения. Уверены, что хотите уйти?';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    const handleKeyDownGlobal = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveDocumentData(cells, title);
      }
    };
    window.addEventListener('keydown', handleKeyDownGlobal);
    return () => window.removeEventListener('keydown', handleKeyDownGlobal);
  }, [cells, title]);

  const handleCellChange = (id: CellId, newValue: string) => {
    setHasUnsavedChanges(true);
    setSaveStatus('saving');
    setCells(prev => {
      const displayValue = evaluateFormula(newValue, prev);
      const cellType = determineCellType(newValue);
      return {
        ...prev,
        [id]: { value: newValue, display: displayValue, type: cellType }
      };
    });
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (title.trim()) {setHasUnsavedChanges(true);
    }
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        const { parsedCells, maxRows, maxCols } = parseCSV(text);
        setCells(parsedCells);
        setRowsCount(maxRows);
        setColsCount(maxCols);
        setHasUnsavedChanges(true);
      }
    };
    reader.readAsText(file);
  };

  const getColumnWidth = (colIndex: number) => columnWidths[colIndex] || defaultColWidth;
  const getRowHeight = (rowIndex: number) => rowHeights[rowIndex] || defaultRowHeight;

  const handleResizeStart = (e: React.MouseEvent, type: 'col' | 'row', index: number) => {
    e.preventDefault();
    setResizing({ type, index });
    startPos.current = type === 'col' ? e.clientX : e.clientY;
    startSize.current = type === 'col' ? getColumnWidth(index) : getRowHeight(index);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const delta = (type === 'col' ? moveEvent.clientX : moveEvent.clientY) - startPos.current;
      const newSize = Math.max(50, startSize.current + delta);

      if (type === 'col') {
        setColumnWidths(prev => ({ ...prev, [index]: newSize }));
      } else {
        setRowHeights(prev => ({ ...prev, [index]: newSize }));
      }
    };

    const handleMouseUp = () => {
      setResizing(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleContextMenu = (e: React.MouseEvent, rowIndex: number) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, rowIndex });
  };

  const handleAddRow = () => {
    if (contextMenu) {
      setRowsCount(prev => prev + 1);
      setContextMenu(null);
      setHasUnsavedChanges(true);
    }
  };

  const handleDeleteRow = () => {
    if (contextMenu && rowsCount > 1) {
      const rowToDelete = contextMenu.rowIndex + 1;
      setCells(prev => {
        const newCells = { ...prev };
        for (let col = 0; col < colsCount; col++) {
          const colLetter = String.fromCharCode(65 + col);
          delete newCells[`${colLetter}${rowToDelete}`];
        }
        return newCells;
      });
      setRowsCount(prev => prev - 1);
      setContextMenu(null);
      setHasUnsavedChanges(true);
    }
  };

  useEffect(() => {
    const handleCloseContextMenu = () => setContextMenu(null);
    if (contextMenu) {
      document.addEventListener('click', handleCloseContextMenu);
      return () => document.removeEventListener('click', handleCloseContextMenu);
    }
  }, [contextMenu]);

  const gridCols = Array.from({ length: colsCount }, (_, i) => `${getColumnWidth(i)}px`).join(' ');

  const renderStatusText = () => {
    switch (saveStatus) {
      case 'saving': return <span style={{ color: '#e6a23c' }}>● Сохранение...</span>;
      case 'error': return <span style={{ color: '#f56c6c' }}>✖ Ошибка сохранения</span>;
      case 'saved': return <span style={{ color: '#67c23a' }}>✓ Сохранено</span>;
    }
  };

  return (
    <div style={{ padding: '16px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={onBackToDashboard}
            style={{ padding: '6px 12px', cursor: 'pointer', background: '#fff', border: '1px solid #ccc', borderRadius: '4px' }}
          >
            ← В панель
          </button>
          
          {isEditingTitle ? (
            <input value={title}
              onChange={e => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={e => e.key === 'Enter' && handleTitleBlur()}
              autoFocus
              style={{ fontSize: '20px', fontWeight: 'bold', border: '1px solid #0070f3', padding: '2px 6px', borderRadius: '4px' }}
            />
          ) : (
            <h2 
              onClick={() => setIsEditingTitle(true)} 
              style={{ margin: 0, cursor: 'pointer', fontSize: '24px' }}
              title="Нажмите, чтобы переименовать"
            >
              {title || 'Без названия'} ✎
            </h2>
          )}

          <div style={{ fontSize: '14px', fontWeight: '500' }}>
            {renderStatusText()}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="file" 
            accept=".csv" 
            ref={fileInputRef} 
            onChange={handleImportCSV} 
            style={{ display: 'none' }} 
          />
          <button 
            onClick={() => fileInputRef.current?.click()} 
            style={{ padding: '6px 12px', background: '#fff', border: '1px solid #0070f3', color: '#0070f3', borderRadius: '4px', cursor: 'pointer' }}
          >
            Импорт CSV
          </button>
          <button 
            onClick={() => exportToCSV(cells, rowsCount, colsCount, title || 'table')} 
            style={{ padding: '6px 12px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Экспорт CSV
          </button>
          <button 
            onClick={() => exportToJSON(cells, title || 'table')} 
            style={{ padding: '6px 12px', background: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Экспорт JSON
          </button>
        </div>
      </div>

      <div style={{
        marginBottom: '10px',
        padding: '8px',
        border: '1px solid #ccc',
        backgroundColor: '#f9f9f9',
        fontSize: '14px'
      }}>
        <strong>Панель формул:</strong> {selectedCell ? `${selectedCell}: ${cells[selectedCell]?.value || ''}` : 'Выберите ячейку'}
      </div>

      <div style={{
        display: 'inline-grid',
        gridTemplateColumns: `40px ${gridCols}`,
        gap: '0',
        border: '1px solid #ccc',
        overflow: 'auto',
        maxHeight: '600px',
        maxWidth: '100%'
      }}>
        <div style={{
          border: '1px solid #ccc',
          backgroundColor: '#e0e0e0',
          fontWeight: 'bold',
          textAlign: 'center',
          lineHeight: `${defaultRowHeight}px`,
          height: `${defaultRowHeight}px`,
          position: 'sticky',
          top: 0,
          left: 0,
          zIndex: 3
        }}></div>

        {Array.from({ length: colsCount }, (_, colIndex) => {
          const colLetter = String.fromCharCode(65 + colIndex);
          return (
            <div
              key={`header-${colIndex}`}
              style={{
                border: '1px solid #ccc',
                backgroundColor: '#e0e0e0',
                fontWeight: 'bold',
                textAlign: 'center',
                lineHeight: `${defaultRowHeight}px`,
                height: `${defaultRowHeight}px`,
                width: `${getColumnWidth(colIndex)}px`,
                position: 'sticky',
                top: 0,
                zIndex: 2
              }}
            >
              {colLetter}
              <div
                onMouseDown={(e) => handleResizeStart(e, 'col', colIndex)}
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  width: '5px',
                  height: '100%',
                  cursor: 'col-resize',
                  backgroundColor: 'transparent'
                }}
              />
            </div>
          );
        })}

        {Array.from({ length: rowsCount }, (_, rowIndex) => {
          const rowNum = rowIndex + 1;
          return (
            <React.Fragment key={`row-${rowIndex}`}>
              <div
                onContextMenu={(e) => handleContextMenu(e, rowIndex)}
                style={{
                  border: '1px solid #ccc',
                  backgroundColor: '#e0e0e0',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  lineHeight: `${getRowHeight(rowIndex)}px`,
                  height: `${getRowHeight(rowIndex)}px`,
                  position: 'sticky',
                  left: 0,
                  zIndex: 1
                }}
              >
                {rowNum}
                <div
                  onMouseDown={(e) => handleResizeStart(e, 'row', rowIndex)}
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    height: '5px',
                    cursor: 'row-resize',
                    backgroundColor: 'transparent'
                  }}
                />
              </div>

              {Array.from({ length: colsCount }, (_, colIndex) => {
                const colLetter = String.fromCharCode(65 + colIndex);
                const id = `${colLetter}${rowNum}`;

                return (
                  <Cell
                    key={id}
                    id={id}
                    data={cells[id]}
                    isSelected={selectedCell === id}
                    onSelect={(cellId) => setSelectedCell(cellId)}
                    onChange={handleCellChange}
                    width={getColumnWidth(colIndex)}
                    height={getRowHeight(rowIndex)}
                  />
                );
              })}
            </React.Fragment>
          );
        })}
      </div>
      {contextMenu && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'fixed',
            top: contextMenu.y,
            left: contextMenu.x,
            backgroundColor: 'white',
            border: '1px solid #ccc',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            zIndex: 1000,
            minWidth: '150px'
          }}
        >
          <div
            onClick={handleAddRow}
            style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #eee' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
          >
            Добавить строку
          </div>
          <div
            onClick={handleDeleteRow}
            style={{ padding: '8px 12px', cursor: 'pointer' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
          >
            Удалить строку
          </div>
        </div>
      )}
    </div>
  );
}

export default Spreadsheet;