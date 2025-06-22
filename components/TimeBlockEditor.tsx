import { useState } from 'react';
import { TimeBlock } from '../types';
import { BlockLogic } from '../utils/blockLogic';
import { isTimeOverlapping, isValidTimeRange, sortTimeBlocksByStart } from '../utils/timeUtils';
import { DEFAULT_TIME_BLOCKS } from '../utils/constants';

interface TimeBlockEditorProps {
  timeBlocks: TimeBlock[];
  onTimeBlocksChange: (timeBlocks: TimeBlock[]) => void;
}

export function TimeBlockEditor({ timeBlocks, onTimeBlocksChange }: TimeBlockEditorProps) {
  const [newStart, setNewStart] = useState<string>(DEFAULT_TIME_BLOCKS.START);
  const [newEnd, setNewEnd] = useState<string>(DEFAULT_TIME_BLOCKS.END);
  const [error, setError] = useState('');

  const addTimeBlock = () => {
    setError('');

    // Validate time format
    if (!BlockLogic.isValidTimeFormat(newStart) || !BlockLogic.isValidTimeFormat(newEnd)) {
      setError('無効な時間形式です');
      return;
    }

    if (!isValidTimeRange(newStart, newEnd)) {
      setError('終了時刻は開始時刻より後にしてください');
      return;
    }

    const hasOverlap = timeBlocks.some(block => 
      isTimeOverlapping(newStart, newEnd, block.start, block.end)
    );

    if (hasOverlap) {
      setError('時間が重複しています');
      return;
    }

    const newBlock = { start: newStart, end: newEnd };
    const updatedBlocks = sortTimeBlocksByStart([...timeBlocks, newBlock]);

    onTimeBlocksChange(updatedBlocks);
    setNewStart(DEFAULT_TIME_BLOCKS.START);
    setNewEnd(DEFAULT_TIME_BLOCKS.END);
  };

  const removeTimeBlock = (index: number) => {
    console.log('removeTimeBlock called:', { index, timeBlocksLength: timeBlocks.length });
    
    if (timeBlocks.length <= 1) {
      setError('最低1つの時間ブロックが必要です');
      console.log('Cannot remove: minimum 1 time block required');
      return;
    }
    
    const updatedBlocks = timeBlocks.filter((_, i) => i !== index);
    console.log('Updated blocks:', updatedBlocks);
    onTimeBlocksChange(updatedBlocks);
    setError('');
  };

  const updateTimeBlock = (index: number, field: 'start' | 'end', value: string) => {
    if (!BlockLogic.isValidTimeFormat(value)) {
      return;
    }

    const updatedBlocks = [...timeBlocks];
    updatedBlocks[index] = { ...updatedBlocks[index], [field]: value };

    const block = updatedBlocks[index];
    if (!isValidTimeRange(block.start, block.end)) {
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