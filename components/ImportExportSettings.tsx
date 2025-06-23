import { useState } from 'react';
import type { SectionGroups } from '../types';

interface ImportExportSettingsProps {
  sectionGroups: SectionGroups;
  onImport: (data: SectionGroups) => Promise<void>;
}

export function ImportExportSettings({ sectionGroups, onImport }: ImportExportSettingsProps) {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const exportSettings = () => {
    try {
      const dataStr = JSON.stringify(sectionGroups, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `slack-focus-helper-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setSuccess('設定をエクスポートしました');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('エクスポートに失敗しました');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content) as SectionGroups;
        
        if (!isValidSectionGroups(data)) {
          throw new Error('無効な設定ファイル形式です');
        }
        
        await onImport(data);
        setSuccess('設定をインポートしました');
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'インポートに失敗しました');
        setTimeout(() => setError(''), 3000);
      }
    };
    reader.readAsText(file);
    
    event.target.value = '';
  };

  const isValidSectionGroups = (data: unknown): data is SectionGroups => {
    if (typeof data !== 'object' || data === null) return false;
    
    const groups = data as Record<string, unknown>;
    return Object.values(groups).every(group => 
      typeof group === 'object' && 
      group !== null &&
      'name' in group &&
      'urls' in group &&
      'timeBlocks' in group &&
      'enabled' in group &&
      typeof (group as any).name === 'string' &&
      Array.isArray((group as any).urls) &&
      Array.isArray((group as any).timeBlocks) &&
      typeof (group as any).enabled === 'boolean'
    );
  };

  return (
    <div className="import-export-settings">
      <h3>設定のインポート・エクスポート</h3>
      
      <div className="import-export-buttons">
        <button
          onClick={exportSettings}
          className="export-btn"
          title="現在の設定をJSONファイルとしてダウンロード"
        >
          設定をエクスポート
        </button>
        
        <div className="import-section">
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="import-input"
            id="import-file"
            style={{ display: 'none' }}
          />
          <label 
            htmlFor="import-file"
            className="import-btn"
            title="JSONファイルから設定をインポート"
          >
            設定をインポート
          </label>
        </div>
      </div>
      
      {error && <div className="import-export-error">{error}</div>}
      {success && <div className="import-export-success">{success}</div>}
    </div>
  );
}