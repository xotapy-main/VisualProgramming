import React, { useState, useEffect, useRef } from 'react';
import type { CellId, CellData } from '../types/type';

export interface CellProps {
  id: CellId;
  data: CellData | undefined;
  isSelected: boolean;
  onSelect: (id: CellId) => void;
  onChange: (id: CellId, newValue: string) => void;
  width: number;
  height: number;
}

function Cell({ id, data, isSelected, onSelect, onChange, width, height }: CellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(data?.value || '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (isEditing) {
        handleBlur();
      } else {
        setIsEditing(true);
      }
    }
    if (e.key === 'Escape') {
      setTempValue(data?.value || '');
      setIsEditing(false);
    }
  };

  const cellStyle = {
    border: '1px solid #ccc',
    width: `${width}px`,
    height: `${height}px`,
    backgroundColor: isSelected ? '#e7f1ff' : 'white',
    cursor: 'cell',
    padding: '0 5px',
    lineHeight: `${height}px`,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const
  };

  return (
    <div
      className={`cell ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(id)}
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
          style={{ width: '100%', border: 'none', outline: 'none', height: '100%' }}
        />
      ) : (
        data?.display || ''
      )}
    </div>
  );
}

export default Cell;