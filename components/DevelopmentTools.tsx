interface DevelopmentToolsProps {
  onCreateTestData: () => void;
  onRunTests: () => void;
}

export function DevelopmentTools({ onCreateTestData, onRunTests }: DevelopmentToolsProps) {
  const isDevelopment = import.meta.env.DEV;

  if (!isDevelopment) {
    return null;
  }

  return (
    <div className="dev-tools">
      <h3>開発ツール</h3>
      <div className="dev-buttons">
        <button onClick={onCreateTestData} className="dev-btn">
          テストデータ作成
        </button>
        <button onClick={onRunTests} className="dev-btn">
          テスト実行
        </button>
      </div>
    </div>
  );
}