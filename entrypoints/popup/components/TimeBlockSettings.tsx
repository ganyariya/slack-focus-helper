import React, { useState } from 'react';
import { TimeBlock } from '../../../types/config';

interface TimeBlockSettingsProps {
  timeBlocks: TimeBlock[];
  onTimeBlocksUpdate: (timeBlocks: TimeBlock[]) => void;
}

export const TimeBlockSettings: React.FC<TimeBlockSettingsProps> = ({
  timeBlocks,
  onTimeBlocksUpdate,
}) => {
  const [newStart, setNewStart] = useState('09:00');
  const [newEnd, setNewEnd] = useState('17:00');

  const addTimeBlock = () => {
    const newTimeBlock: TimeBlock = {
      start: newStart,
      end: newEnd,
      enabled: true,
    };

    onTimeBlocksUpdate([...timeBlocks, newTimeBlock]);
  };

  const removeTimeBlock = (index: number) => {
    const updatedBlocks = timeBlocks.filter((_, i) => i !== index);
    onTimeBlocksUpdate(updatedBlocks);
  };

  const toggleTimeBlock = (index: number) => {
    const updatedBlocks = timeBlocks.map((block, i) =>
      i === index ? { ...block, enabled: !block.enabled } : block
    );
    onTimeBlocksUpdate(updatedBlocks);
  };

  const updateTimeBlock = (index: number, field: 'start' | 'end', value: string) => {
    const updatedBlocks = timeBlocks.map((block, i) =>
      i === index ? { ...block, [field]: value } : block
    );
    onTimeBlocksUpdate(updatedBlocks);
  };

  return (
    <div className="time-block-settings">
      {timeBlocks.map((block, index) => (
        <div key={index} className="time-block-item">
          <div className="time-inputs">
            <input
              type="time"
              value={block.start}
              onChange={(e) => updateTimeBlock(index, 'start', e.target.value)}
              className="time-input"
            />
            <span className="time-separator">～</span>
            <input
              type="time"
              value={block.end}
              onChange={(e) => updateTimeBlock(index, 'end', e.target.value)}
              className="time-input"
            />
          </div>
          <div className="time-block-controls">
            <label className="toggle-container">
              <input
                type="checkbox"
                checked={block.enabled}
                onChange={() => toggleTimeBlock(index)}
              />
              <span className="toggle-slider"></span>
            </label>
            <button
              className="remove-button"
              onClick={() => removeTimeBlock(index)}
              title="削除"
            >
              削除
            </button>
          </div>
        </div>
      ))}

      <div className="add-time-block">
        <div className="new-time-inputs">
          <input
            type="time"
            value={newStart}
            onChange={(e) => setNewStart(e.target.value)}
            className="time-input"
          />
          <span className="time-separator">～</span>
          <input
            type="time"
            value={newEnd}
            onChange={(e) => setNewEnd(e.target.value)}
            className="time-input"
          />
        </div>
        <button
          className="add-button"
          onClick={addTimeBlock}
        >
          + 時間帯を追加
        </button>
      </div>
    </div>
  );
};