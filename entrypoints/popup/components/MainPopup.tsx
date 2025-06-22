import React from 'react';
import { WorkspaceConfig, TimeBlock } from '../../../types/config';
import { TimeBlockSettings } from './TimeBlockSettings';

interface MainPopupProps {
  workspaceName: string;
  config: WorkspaceConfig;
  blockedChannelCount: number;
  blockedSectionCount: number;
  onConfigUpdate: (config: WorkspaceConfig) => void;
  onNavigateToDetails: () => void;
}

export const MainPopup: React.FC<MainPopupProps> = ({
  workspaceName,
  config,
  blockedChannelCount,
  blockedSectionCount,
  onConfigUpdate,
  onNavigateToDetails,
}) => {
  const handleEnabledToggle = () => {
    onConfigUpdate({
      ...config,
      enabled: !config.enabled,
    });
  };

  const handleForceMode = () => {
    // Note: Force mode will be implemented in Phase 6
    console.log('Force mode toggle - to be implemented in Phase 6');
  };

  const handleTimeBlocksUpdate = (timeBlocks: TimeBlock[]) => {
    onConfigUpdate({
      ...config,
      timeBlocks,
    });
  };

  return (
    <div className="main-popup">
      <header className="popup-header">
        <h1>Slack Focus Helper</h1>
      </header>

      <section className="workspace-info">
        <div className="workspace-name">
          <strong>ワークスペース:</strong> {workspaceName}
        </div>
        <label className="checkbox-container">
          <input
            type="checkbox"
            checked={config.enabled}
            onChange={handleEnabledToggle}
          />
          <span className="checkmark"></span>
          拡張機能を有効にする
        </label>
        <label className="checkbox-container disabled">
          <input
            type="checkbox"
            disabled
            onChange={handleForceMode}
          />
          <span className="checkmark"></span>
          強制モード (Phase 6で実装予定)
        </label>
      </section>

      <section className="time-settings">
        <h2>時間設定</h2>
        <TimeBlockSettings
          timeBlocks={config.timeBlocks}
          onTimeBlocksUpdate={handleTimeBlocksUpdate}
        />
      </section>

      <section className="block-status">
        <h2>ブロック状況</h2>
        <div className="status-grid">
          <div className="status-item">
            <span className="status-label">チャンネル:</span>
            <span className="status-count">{blockedChannelCount}個</span>
          </div>
          <div className="status-item">
            <span className="status-label">セクション:</span>
            <span className="status-count">{blockedSectionCount}個</span>
          </div>
        </div>
        <button 
          className="details-button"
          onClick={onNavigateToDetails}
        >
          詳細設定
        </button>
      </section>
    </div>
  );
};