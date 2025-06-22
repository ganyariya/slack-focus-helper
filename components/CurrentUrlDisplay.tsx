interface CurrentUrlDisplayProps {
  url: string;
}

export function CurrentUrlDisplay({ url }: CurrentUrlDisplayProps) {
  const displayUrl = url 
    ? (url.length > 50 ? url.substring(0, 50) + '...' : url)
    : '取得中...';

  return (
    <div className="current-url">
      <strong>現在のURL:</strong>
      <div className="url-display" title={url}>
        {displayUrl}
      </div>
    </div>
  );
}