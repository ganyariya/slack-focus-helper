# CLAUDE.md

このファイルは、このリポジトリでコードを扱う際のClaude Code (claude.ai/code) へのガイダンスを提供します。

## プロジェクト概要

WXT（Web Extension Tool）とReactで構築されたWebサイトブロック用のChrome拡張機能です。ユーザーはURLと時間ブロックを含む「Section Group」を作成でき、現在時刻が設定された時間ブロック内にある場合、指定されたURLへのアクセスがブロックされます。

**重要**: 詳細な仕様については必ず `Spec.md` を参照してください。このファイルにはSection Group機能、URL管理、時間制御、UI要件などの完全な仕様が日本語で記載されています。

## 主要アーキテクチャ

- **WXTフレームワーク**: TypeScriptサポート付きの現代的なWeb拡張機能開発フレームワーク
- **React UI**: React 19とTypeScriptを使用したポップアップインターフェース
- **Manifest V3**: Service Workerバックグラウンドスクリプトを使用するChrome拡張機能
- **エントリーポイント構造**:
  - `background.ts`: 拡張機能ロジック用のService Worker
  - `content.ts`: ページ監視とブロック用のコンテンツスクリプト
  - `popup/`: React基盤の設定UI

## 開発コマンド

```bash
# 開発モード（Chrome）
npm run dev

# 開発モード（Firefox）
npm run dev:firefox

# 本番ビルド
npm run build
npm run build:firefox

# zipパッケージ作成
npm run zip
npm run zip:firefox

# 型チェック
npm run compile

# インストール後のセットアップ
npm run postinstall
```

## 主要機能（Spec.mdから）

- **Section Group**: ブロック用のURLと時間ブロックの組み合わせコレクション
- **時間ベースブロック**: 指定された時間範囲（HH:MM形式）でのアクセスブロック
- **SPAサポート**: 複数の検知方法を使用したSingle Page Applicationナビゲーション対応:
  - History API監視（popstateイベント）
  - ハッシュ変更検知（hashchangeイベント）
  - DOM変更監視
  - 定期的なURLポーリング（1秒間隔）
- **コンテンツスクリプト**: ページ読み込み前のブロックを確保するため`document_start`で実行
- **ストレージ**: 設定の永続化に`chrome.storage.local`を使用

## データ構造

Section Groupは以下の形式で保存されます:
```javascript
{
  "sectionGroups": {
    "グループ名": {
      "name": "グループ名",
      "urls": ["https://example.com"],
      "timeBlocks": [{"start": "09:00", "end": "12:00"}],
      "enabled": true
    }
  }
}
```

## 必要な拡張機能権限

- `storage`: 設定の保存用
- `activeTab`: 現在のタブURL取得用
- `tabs`: タブ情報取得用
- `<all_urls>`: サイトブロック機能用