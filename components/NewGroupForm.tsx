import { useState } from 'react';

interface NewGroupFormProps {
  onCreateGroup: (name: string) => void;
}

export function NewGroupForm({ onCreateGroup }: NewGroupFormProps) {
  const [newGroupName, setNewGroupName] = useState('');

  const handleSubmit = () => {
    if (newGroupName.trim()) {
      onCreateGroup(newGroupName.trim());
      setNewGroupName('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="new-group">
      <h3>新しいSection Group</h3>
      <div className="new-group-form">
        <input
          type="text"
          placeholder="グループ名を入力"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button onClick={handleSubmit} disabled={!newGroupName.trim()}>
          作成
        </button>
      </div>
    </div>
  );
}