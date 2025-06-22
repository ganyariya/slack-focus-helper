import React from 'react';
import { WorkspaceConfig } from '../../../types/config';

interface DetailedSettingsProps {
  workspaceName: string;
  config: WorkspaceConfig;
  onConfigUpdate: (config: WorkspaceConfig) => void;
  onNavigateBack: () => void;
}

export const DetailedSettings: React.FC<DetailedSettingsProps> = ({
  workspaceName,
  config,
  onConfigUpdate,
  onNavigateBack,
}) => {
  const unblockChannel = (channelId: string) => {
    const updatedChannels = config.blockedChannels.filter(id => id !== channelId);
    onConfigUpdate({
      ...config,
      blockedChannels: updatedChannels,
    });
  };

  const unblockSection = (sectionId: string) => {
    const updatedSections = config.blockedSections.filter(id => id !== sectionId);
    onConfigUpdate({
      ...config,
      blockedSections: updatedSections,
    });
  };

  const unblockAll = () => {
    onConfigUpdate({
      ...config,
      blockedChannels: [],
      blockedSections: [],
    });
  };

  return (
    <div className="detailed-settings">
      <header className="settings-header">
        <button 
          className="back-button"
          onClick={onNavigateBack}
        >
          ← 戻る
        </button>
        <h1>ブロック設定詳細</h1>
      </header>

      <section className="blocked-items">
        <div className="blocked-channels">
          <h2>ブロック中のチャンネル</h2>
          {config.blockedChannels.length === 0 ? (
            <div className="empty-state">ブロック中のチャンネルはありません</div>
          ) : (
            <div className="blocked-list">
              {config.blockedChannels.map((channelId) => (
                <div key={channelId} className="blocked-item">
                  <span className="item-name">
                    {channelId.startsWith('#') ? channelId : `#${channelId}`}
                  </span>
                  <button
                    className="unblock-button"
                    onClick={() => unblockChannel(channelId)}
                  >
                    解除
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="blocked-sections">
          <h2>ブロック中のセクション</h2>
          {config.blockedSections.length === 0 ? (
            <div className="empty-state">ブロック中のセクションはありません</div>
          ) : (
            <div className="blocked-list">
              {config.blockedSections.map((sectionId) => (
                <div key={sectionId} className="blocked-item">
                  <span className="item-name">{sectionId}</span>
                  <button
                    className="unblock-button"
                    onClick={() => unblockSection(sectionId)}
                  >
                    解除
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {(config.blockedChannels.length > 0 || config.blockedSections.length > 0) && (
        <section className="bulk-actions">
          <button
            className="unblock-all-button"
            onClick={unblockAll}
          >
            すべて解除
          </button>
        </section>
      )}

      <section className="usage-instructions">
        <h2>操作方法</h2>
        <div className="instruction-list">
          <div className="instruction-item">
            <strong>Ctrl+クリック:</strong> ブロック切り替え
          </div>
          <div className="instruction-item">
            <strong>右クリック:</strong> 通常のSlackメニュー
          </div>
        </div>
      </section>
    </div>
  );
};