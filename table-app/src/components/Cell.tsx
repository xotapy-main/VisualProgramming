import React, { useState, useEffect, useRef } from 'react';
import type { CellId, CellData } from '../types/type';

export interface CellProps {
  id: CellId;
  data: CellData | undefined;
  isSelected: boolean;
  onSelect: (id: CellId, event: React.MouseEvent<HTMLDivElement>) => void;
  onChange: (id: CellId, newValue: string) => void;
  width: number;
  height: number;
}

function Cell({ id, data, isSelected, onSelect, onChange, width, height }: CellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(data?.value || '');
  const inputRef = useRef<HTMLInputElement>(null);
  const cellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    if (isSelected && !isEditing && document.activeElement !== cellRef.current) {
      cellRef.current?.focus();
    }
  }, [isSelected, isEditing]);

  useEffect(() => {
    setTempValue(data?.value || '');
  }, [data?.value]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    onChange(id, tempValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (isEditing) {
        handleBlur();
      } else {
        setIsEditing(true);
      }
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      setTempValue(data?.value || '');
      setIsEditing(false);
      cellRef.current?.focus();
    }
  };

  const cellStyle: React.CSSProperties = {
    border: '1px solid #ccc',
    width: `${width}px`,
    height: `${height}px`,
    backgroundColor: isSelected ? '#e7f1ff' : 'white',
    cursor: 'cell',
    padding: '0 5px',
    lineHeight: `${height}px`,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    outline: isSelected && !isEditing ? '2px solid #0070f3' : 'none',
    boxSizing: 'border-box'
  };

  return (
    <div
      ref={cellRef}
      className={`cell ${isSelected ? 'selected' : ''}`}
      onClick={(e) => onSelect(id, e)}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      style={cellStyle}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          style={{ width: '100%', border: 'none', outline: 'none', height: '100%', padding: 0, background: 'transparent' }}
        />
      ) : (
        data?.display || ''
      )}
    </div>
  );
}

export default Cell;