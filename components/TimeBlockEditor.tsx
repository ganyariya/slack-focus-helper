import { useState } from 'react';
import { TimeBlock } from '../types';
import { BlockLogic } from '../utils/blockLogic';

interface TimeBlockEditorProps {
  timeBlocks: TimeBlock[];
  onTimeBlocksChange: (timeBlocks: TimeBlock[]) => void;
}

export function TimeBlockEditor({ timeBlocks, onTimeBlocksChange }: TimeBlockEditorProps) {
  const [newStart, setNewStart] = useState('09:00');
  const [newEnd, setNewEnd] = useState('17:00');
  const [error, setError] = useState('');

  const addTimeBlock = () => {
    setError('');

    // Validate time format
    if (!BlockLogic.isValidTimeFormat(newStart) || !BlockLogic.isValidTimeFormat(newEnd)) {
      setError('無効な時間形式です');
      return;
    }

    // Validate start < end
    const [startHour, startMin] = newStart.split(':').map(Number);
    const [endHour, endMin] = newEnd.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    if (startMinutes >= endMinutes) {
      setError('終了時刻は開始時刻より後にしてください');
      return;
    }

    // Check for overlaps
    const newBlock = { start: newStart, end: newEnd };
    const hasOverlap = timeBlocks.some(block => {
      const [blockStartHour, blockStartMin] = block.start.split(':').map(Number);
      const [blockEndHour, blockEndMin] = block.end.split(':').map(Number);
      const blockStartMinutes = blockStartHour * 60 + blockStartMin;
      const blockEndMinutes = blockEndHour * 60 + blockEndMin;

      return (
        (startMinutes >= blockStartMinutes && startMinutes < blockEndMinutes) ||
        (endMinutes > blockStartMinutes && endMinutes <= blockEndMinutes) ||
        (startMinutes <= blockStartMinutes && endMinutes >= blockEndMinutes)
      );
    });

    if (hasOverlap) {
      setError('時間が重複しています');
      return;
    }

    const updatedBlocks = [...timeBlocks, newBlock].sort((a, b) => {
      const [aHour, aMin] = a.start.split(':').map(Number);
      const [bHour, bMin] = b.start.split(':').map(Number);
      return (aHour * 60 + aMin) - (bHour * 60 + bMin);
    });

    onTimeBlocksChange(updatedBlocks);
    setNewStart('09:00');
    setNewEnd('17:00');
  };

  const removeTimeBlock = (index: number) => {
    if (timeBlocks.length <= 1) {
      setError('最低1つの時間ブロックが必要です');
      return;
    }
    
    const updatedBlocks = timeBlocks.filter((_, i) => i !== index);
    onTimeBlocksChange(updatedBlocks);
    setError('');
  };

  const updateTimeBlock = (index: number, field: 'start' | 'end', value: string) => {
    if (!BlockLogic.isValidTimeFormat(value)) {
      return;
    }

    const updatedBlocks = [...timeBlocks];
    updatedBlocks[index] = { ...updatedBlocks[index], [field]: value };

    // Validate start < end for this block
    const block = updatedBlocks[index];
    const [startHour, startMin] = block.start.split(':').map(Number);
    const [endHour, endMin] = block.end.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    if (startMinutes >= endMinutes) {
      setError('終了時刻は開始時刻より後にしてください');
      return;
    }

    onTimeBlocksChange(updatedBlocks);
    setError('');
  };

  return (
    <div className="time-block-editor">
      <div className="time-blocks-list">
        <div className="time-blocks-header">
          <span>時間設定:</span>
        </div>
        
        {timeBlocks.map((block, index) => (
          <div key={index} className="time-block-item">
            <input
              type="time"
              value={block.start}
              onChange={(e) => updateTimeBlock(index, 'start', e.target.value)}
              className="time-input"
            />
            <span className="time-separator">-</span>
            <input
              type="time"
              value={block.end}
              onChange={(e) => updateTimeBlock(index, 'end', e.target.value)}
              className="time-input"
            />
            <button
              onClick={() => removeTimeBlock(index)}
              className="remove-time-btn"
              disabled={timeBlocks.length <= 1}
              title="時間ブロックを削除"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="add-time-block">
        <div className="add-time-inputs">
          <input
            type="time"
            value={newStart}
            onChange={(e) => setNewStart(e.target.value)}
            className="time-input"
          />
          <span className="time-separator">-</span>
          <input
            type="time"
            value={newEnd}
            onChange={(e) => setNewEnd(e.target.value)}
            className="time-input"
          />
          <button
            onClick={addTimeBlock}
            className="add-time-btn"
            title="時間ブロックを追加"
          >
            追加
          </button>
        </div>
        {error && <div className="time-error">{error}</div>}
      </div>
    </div>
  );
}