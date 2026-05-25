import React, { useState, useRef, useEffect } from 'react';
import Cell from './Cell';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  initSpreadsheet, 
  selectCell, 
  updateCell, 
  addRow, 
  deleteRow, 
  importParsedCSV,
  undo,
  redo
} from '../store/slices/spreadSheetSlice';
import { updateCurrentTitleState } from '../store/slices/documentSlice';
import { exportToCSV, exportToJSON, parseCSV } from '../utils/io';
import { documentService } from '../service/documentService';
import type { CellId } from '../types/type';

interface SpreadsheetProps {
  documentId: string;
  onBackToDashboard: () => void;
}

function Spreadsheet({ documentId, onBackToDashboard }: SpreadsheetProps) {
  const dispatch = useAppDispatch();
  
  // Состояние из Redux
  const cells = useAppSelector((state) => state.spreadsheet.cells);
  const selectedCell = useAppSelector((state) => state.spreadsheet.selectedCell);
  const selectedRange = useAppSelector((state) => state.spreadsheet.selectedRange);
  const rowsCount = useAppSelector((state) => state.spreadsheet.rowsCount);
  const colsCount = useAppSelector((state) => state.spreadsheet.colsCount);
  const hasUnsavedChanges = useAppSelector((state) => state.spreadsheet.hasUnsavedChanges);
  
  const currentDoc = useAppSelector((state) => state.documents.currentDocument);
  const saveStatus = useAppSelector((state) => state.ui.saveStatus);

  const [title, setTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  
  const [columnWidths, setColumnWidths] = useState<{ [key: number]: number }>({});
  const [rowHeights, setRowHeights] = useState<{ [key: number]: number }>({});
  const [, setResizing] = useState<{ type: 'col' | 'row', index: number } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, rowIndex: number } | null>(null);
  
  const startPos = useRef<number>(0);
  const startSize = useRef<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const defaultColWidth = 110;
  const defaultRowHeight = 30;

  useEffect(() => {
    if (currentDoc) {
      setTitle(currentDoc.title);
      dispatch(initSpreadsheet({
        cells: currentDoc.cells,
        rowsCount: currentDoc.rowsCount,
        colsCount: currentDoc.colsCount
      }));
    }
  }, [currentDoc, dispatch]);

  // Глобальные горячие клавиши: Ctrl+Z, Ctrl+Y, Ctrl+S
  useEffect(() => {
    const handleKeyDownGlobal = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key.toLowerCase() === 'z') {
          e.preventDefault();
          dispatch(undo());
        } else if (e.key.toLowerCase() === 'y') {
          e.preventDefault();
          dispatch(redo());
        } else if (e.key.toLowerCase() === 's') {
          e.preventDefault();
          if (currentDoc) {
            documentService.patch(currentDoc.id, { cells, title });
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDownGlobal);
    return () => window.removeEventListener('keydown', handleKeyDownGlobal);
  }, [cells, title, currentDoc, dispatch]);

  // Предупреждение о закрытии вкладки
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'У вас есть несохраненные изменения.';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleCellChange = (id: CellId, newValue: string) => {
    dispatch(updateCell({ id, value: newValue }));
  };

  const handleCellSelect = (id: CellId, event: React.MouseEvent) => {
    dispatch(selectCell({ id, expandRange: event.shiftKey }));
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (title.trim()) {
      dispatch(updateCurrentTitleState(title));
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
        dispatch(importParsedCSV({ parsedCells, maxRows, maxCols }));
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

  const handleAddRowClick = () => {
    if (contextMenu) {
      dispatch(addRow(contextMenu.rowIndex));
      setContextMenu(null);
    }
  };

  const handleDeleteRowClick = () => {
    if (contextMenu && rowsCount > 1) {
      dispatch(deleteRow(contextMenu.rowIndex + 1));
      setContextMenu(null);
    }
  };

  useEffect(() => {
    const handleCloseContextMenu = () => setContextMenu(null);
    if (contextMenu) {
      document.addEventListener('click', handleCloseContextMenu);
      return () => document.removeEventListener('click', handleCloseContextMenu);
    }
  }, [contextMenu]);

  // Логика проверки: находится ли ячейка внутри выделенного диапазона
  const isCellSelected = (id: CellId): boolean => {
    if (!selectedCell) return false;
    if (!selectedRange) return selectedCell === id;

    const getCoords = (cellId: string) => {
      const col = cellId.charCodeAt(0) - 65;
      const row = parseInt(cellId.substring(1)) - 1;
      return { col, row };
    };

    const start = getCoords(selectedRange.start);
    const end = getCoords(selectedRange.end);

    const minCol = Math.min(start.col, end.col);
    const maxCol = Math.max(start.col, end.col);
    const minRow = Math.min(start.row, end.row);
    const maxRow = Math.max(start.row, end.row);

    const current = getCoords(id);
    return current.col >= minCol && current.col <= maxCol && current.row >= minRow && current.row <= maxRow;
  };

  const gridCols = Array.from({ length: colsCount }, (_, i) => `${getColumnWidth(i)}px`).join(' ');

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
            {saveStatus === 'saving' && <span style={{ color: '#e6a23c' }}>● Сохранение...</span>}
            {saveStatus === 'error' && <span style={{ color: '#f56c6c' }}>✖ Ошибка сохранения</span>}
            {saveStatus === 'saved' && <span style={{ color: '#67c23a' }}>✓ Сохранено</span>}
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

      <div style={{ marginBottom: '10px', padding: '8px', border: '1px solid #ccc', backgroundColor: '#f9f9f9', fontSize: '14px' }}>
        <strong>Панель формул:</strong> {selectedCell ? `${selectedCell}: ${cells[selectedCell]?.value || ''}` : 'Выберите ячейку'}
      </div>

      <div style={{ display: 'inline-grid', gridTemplateColumns: `40px ${gridCols}`, gap: '0', border: '1px solid #ccc', overflow: 'auto', maxHeight: '600px', maxWidth: '100%' }}>
        <div style={{ border: '1px solid #ccc', backgroundColor: '#e0e0e0', fontWeight: 'bold', textAlign: 'center', lineHeight: `${defaultRowHeight}px`, height: `${defaultRowHeight}px`, position: 'sticky', top: 0, left: 0, zIndex: 3 }}></div>

        {Array.from({ length: colsCount }, (_, colIndex) => {
          const colLetter = String.fromCharCode(65 + colIndex);
          return (
            <div key={`header-${colIndex}`} style={{ border: '1px solid #ccc', backgroundColor: '#e0e0e0', fontWeight: 'bold', textAlign: 'center', lineHeight: `${defaultRowHeight}px`, height: `${defaultRowHeight}px`, width: `${getColumnWidth(colIndex)}px`, position: 'sticky', top: 0, zIndex: 2 }}>
              {colLetter}
              <div onMouseDown={(e) => handleResizeStart(e, 'col', colIndex)} style={{ position: 'absolute', right: 0, top: 0, width: '5px', height: '100%', cursor: 'col-resize', backgroundColor: 'transparent' }} />
            </div>
          );
        })}

        {Array.from({ length: rowsCount }, (_, rowIndex) => {
          const rowNum = rowIndex + 1;
          return (
            <React.Fragment key={`row-${rowIndex}`}>
              <div onContextMenu={(e) => handleContextMenu(e, rowIndex)} style={{ border: '1px solid #ccc', backgroundColor: '#e0e0e0', fontWeight: 'bold', textAlign: 'center', lineHeight: `${getRowHeight(rowIndex)}px`, height: `${getRowHeight(rowIndex)}px`, position: 'sticky', left: 0, zIndex: 1 }}>
                {rowNum}
                <div onMouseDown={(e) => handleResizeStart(e, 'row', rowIndex)} style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '5px', cursor: 'row-resize', backgroundColor: 'transparent' }} />
              </div>

              {Array.from({ length: colsCount }, (_, colIndex) => {
                const colLetter = String.fromCharCode(65 + colIndex);
                const id = `${colLetter}${rowNum}`;

                return (
                  <Cell
                    key={id}
                    id={id}
                    data={cells[id]}
                    isSelected={isCellSelected(id)}
                    onSelect={(cellId, event) => handleCellSelect(cellId, event)}
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
        <div onClick={(e) => e.stopPropagation()} style={{ position: 'fixed', top: contextMenu.y, left: contextMenu.x, backgroundColor: 'white', border: '1px solid #ccc', boxShadow: '0 2px 10px rgba(0,0,0,0.2)', zIndex: 1000, minWidth: '150px' }}>
          <div onClick={handleAddRowClick} style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #eee' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}>Добавить строку</div>
          <div onClick={handleDeleteRowClick} style={{ padding: '8px 12px', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}>Удалить строку</div>
        </div>
      )}
    </div>
  );
}

export default Spreadsheet;