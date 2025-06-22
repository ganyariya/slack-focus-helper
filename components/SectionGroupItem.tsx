import { useState } from 'react';
import { SectionGroup, TimeBlock } from '../types';
import { BlockLogic } from '../utils/blockLogic';
import { TimeBlockEditor } from './TimeBlockEditor';

interface SectionGroupItemProps {
  groupName: string;
  group: SectionGroup;
  currentUrl: string;
  onToggle: (groupName: string) => void;
  onDelete: (groupName: string) => void;
  onRename: (oldName: string, newName: string) => void;
  onAddCurrentUrl: (groupName: string) => void;
  onRemoveUrl: (groupName: string, url: string) => void;
  onUpdateTimeBlocks: (groupName: string, timeBlocks: TimeBlock[]) => void;
}

export function SectionGroupItem({
  groupName,
  group,
  currentUrl,
  onToggle,
  onDelete,
  onRename,
  onAddCurrentUrl,
  onRemoveUrl,
  onUpdateTimeBlocks
}: SectionGroupItemProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingName, setEditingName] = useState(groupName);

  const getGroupStatus = () => {
    if (!group.enabled) return { text: '無効', className: 'status-disabled' };
    
    const isBlocked = BlockLogic.isCurrentTimeBlocked(group.timeBlocks);
    return isBlocked 
      ? { text: 'ブロック中', className: 'status-blocking' }
      : { text: '非ブロック', className: 'status-not-blocking' };
  };

  const handleSaveName = () => {
    if (editingName.trim() && editingName !== groupName) {
      onRename(groupName, editingName.trim());
    }
    setIsEditingName(false);
  };

  const handleCancelEdit = () => {
    setEditingName(groupName);
    setIsEditingName(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSaveName();
    if (e.key === 'Escape') handleCancelEdit();
  };

  const status = getGroupStatus();

  return (
    <div className="section-group">
      <div className="group-header">
        {isEditingName ? (
          <div className="group-name-editor">
            <input
              type="text"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onKeyPress={handleKeyPress}
              className="group-name-input"
              autoFocus
            />
            <button 
              className="save-btn"
              onClick={handleSaveName}
              title="保存"
            >
              ✓
            </button>
            <button 
              className="cancel-btn"
              onClick={handleCancelEdit}
              title="キャンセル"
            >
              ×
            </button>
          </div>
        ) : (
          <>
            <h3 
              onClick={() => setIsEditingName(true)}
              className="group-name-clickable"
              title="クリックして編集"
            >
              {groupName}
            </h3>
            <button 
              className="delete-btn"
              onClick={() => onDelete(groupName)}
              title="グループを削除"
            >
              🗑️
            </button>
          </>
        )}
      </div>
      
      <div className={`status ${status.className}`}>
        状態: {status.text}
      </div>
      
      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={group.enabled}
          onChange={() => onToggle(groupName)}
        />
        有効
      </label>

      <TimeBlockEditor
        timeBlocks={group.timeBlocks}
        onTimeBlocksChange={(timeBlocks) => onUpdateTimeBlocks(groupName, timeBlocks)}
      />

      <div className="urls-section">
        <div className="urls-header">
          <span>URL: ({group.urls.length}個)</span>
          <button 
            className="add-url-btn"
            onClick={() => onAddCurrentUrl(groupName)}
            disabled={!currentUrl}
            title="現在のURLを追加"
          >
            現在のURLを追加
          </button>
        </div>
        
        <div className="urls-list">
          {group.urls.map((url, index) => (
            <div key={index} className="url-item">
              <span className="url-text" title={url}>
                {url.length > 40 ? url.substring(0, 40) + '...' : url}
              </span>
              <button 
                className="remove-url-btn"
                onClick={() => onRemoveUrl(groupName, url)}
                title="URLを削除"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}