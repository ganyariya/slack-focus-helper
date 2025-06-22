# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

このプロジェクトは、WXTフレームワークで構築された「Slack Focus Helper」ブラウザ拡張機能です。集中時間中にSlackで気が散るチャンネルやセクションを一時的に非表示にし、生産性を向上させることを目的としています。

## 開発コマンド

- `npm run dev` - Chrome用開発サーバーをホットリロードで起動
- `npm run dev:firefox` - Firefox用開発サーバーを起動
- `npm run build` - Chrome用本番ビルド
- `npm run build:firefox` - Firefox用本番ビルド
- `npm run zip` - Chrome Web Store用ZIPファイル作成
- `npm run zip:firefox` - Firefox Add-ons用ZIPファイル作成
- `npm run compile` - TypeScriptの型チェック（出力なし）
- `npm install` - 依存関係のインストール（自動的に `wxt prepare` も実行）

## アーキテクチャ

WXTベースのブラウザ拡張機能：

- **フレームワーク**: WXT（Web Extension Tools）+ React
- **言語**: TypeScript with React JSX
- **エントリーポイント**:
  - `entrypoints/background.ts` - Chrome拡張機能のサービスワーカー
  - `entrypoints/content.ts` - Webページ上で実行されるコンテンツスクリプト
  - `entrypoints/popup/` - 拡張機能ポップアップUI（React製）
- **対象**: Slack Webアプリケーション（*.slack.com）

## 主要機能（SPEC.mdより）

### 基本機能

1. **時間ベースブロック**
   - 指定した時間帯のみブロック機能を有効化
   - 複数の時間帯設定可能（例: 10:00-12:00, 14:00-18:00）
   - 設定時間外はブロック対象でも表示

2. **チャンネルブロック**
   - パブリックチャンネル、プライベートチャンネル、DM、アプリ連携チャンネルの個別非表示
   - Ctrl+クリックでブロック/解除を切り替え
   - ブロック時に一時的な暗転エフェクトで視覚フィードバック

3. **セクションブロック**
   - セクション全体の非表示（スター付き、チャンネル、DM、App等）
   - セクションヘッダーをCtrl+クリックでブロック切り替え
   - セクション内の全チャンネルも自動的に非表示

4. **ワークスペース別設定**
   - ワークスペースごとに独立した設定
   - ワークスペース名を自動取得して設定を分離

### 高度な機能

1. **強制モード**
   - 直接URL指定でのアクセスもブロック
   - ブロック対象チャンネルへの直接アクセス時に専用ブロック画面を表示

2. **ブロック管理UI**
   - 設定画面でのブロック中チャンネル・セクション一覧表示
   - 個別解除・一括解除ボタン
   - トースト通知による操作フィードバック

## 技術仕様

### データ構造
```typescript
interface Config {
  workspaces: Record<string, WorkspaceConfig>;
  globalSettings: GlobalSettings;
}

interface WorkspaceConfig {
  timeBlocks: TimeBlock[];
  blockedChannels: string[];
  blockedSections: string[];
  enabled: boolean;
}

interface TimeBlock {
  start: string;    // "HH:MM"
  end: string;      // "HH:MM"
  enabled: boolean;
}
```

### 主要セレクタ
```typescript
const SELECTORS = {
  workspaceName: '.p-ia4_sidebar_header__title--inner .p-ia4_home_header_menu__team_name',
  channelItem: '.p-channel_sidebar__channel',
  channelName: '.p-channel_sidebar__name',
  sectionHeading: '.p-channel_sidebar__section_heading',
  sidebar: '.p-channel_sidebar'
};
```

### 主要クラス設計
- `SlackChannelBlocker` - メイン制御クラス
- `ConfigManager` - 設定管理
- `UIManager` - UI管理

## 技術的特徴

- Chrome Storage APIによる設定の永続化
- DOM操作によるSlackサイドバー要素の表示/非表示制御
- MutationObserverによる動的コンテンツ更新の監視
- カスタムCSS注入による視覚エフェクト
- Ctrl+クリックイベントハンドリング

## ファイル構成

- `wxt.config.ts` - WXTフレームワーク設定
- `entrypoints/` - 拡張機能エントリーポイント
- `SPEC.md` - 詳細な日本語仕様書
- `tsconfig.json` - TypeScript設定（WXTデフォルトを拡張）

## 開発時の注意事項

- プロジェクトは `.wxt/tsconfig.json` を拡張してTypeScript設定
- ポップアップUIコンポーネント用にReact JSXが設定済み
- 現在のコンテンツスクリプトはスターターテンプレートでGoogle.comを対象にしているが、Slackドメインを対象にする必要がある
- 拡張機能はManifest V3形式を使用
- SlackのDOM構造変更により動作に影響する可能性があるため、セレクタの保守に注意