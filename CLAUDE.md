# CLAUDE.md

このファイルは、Claude Code (claude.ai/code) がこのリポジトリでコードを扱う際のガイダンスを提供します。

## 必読ドキュメント

- **Spec.md**: プロジェクトの詳細仕様を記載。コード作業前に必ず読み込むこと
- **TASK.md**: 現在のタスクと作業内容について記載。タスクに関する質問がある場合は必ず参照すること

## プロジェクト概要

WXTフレームワークで構築されたChrome拡張機能で、指定した時間帯にSlackの気が散るチャンネルやセクションを非表示にすることで、ユーザーの集中力向上を支援します。ワークスペース固有の設定と時間ベースのコンテンツフィルタリング機能を提供します。

## 開発コマンド

```bash
# 開発環境（Chrome）
npm run dev

# 開発環境（Firefox）
npm run dev:firefox

# プロダクションビルド
npm run build
npm run build:firefox

# 拡張機能パッケージ化
npm run zip
npm run zip:firefox

# 型チェック
npm run compile

# WXT環境セットアップ
npm run postinstall
```

## アーキテクチャ

### 技術スタック
- **フレームワーク**: WXT (Web Extension Tools)
- **言語**: TypeScript
- **UI**: React（設定ページのみ）
- **対象**: Slack Webアプリ（*://*.slack.com/*）

### プロジェクト構造
```
entrypoints/
├── background.ts          # サービスワーカー/バックグラウンドスクリプト
├── content.ts            # Slack操作用メインコンテンツスクリプト
└── popup/               # ReactベースのポップアップUI
    ├── App.tsx
    ├── main.tsx
    └── index.html
```

### 主要概念

**ワークスペース固有設定**: 各Slackワークスペース（例：company.slack.com）は完全に独立した設定を持ちます。設定はワークスペース別に保存され、ユーザーがワークスペース間を移動する際に自動的に切り替わります。

**時間ベースブロッキング**: ユーザーは1日に複数の時間帯を設定でき、曜日ごとに異なるスケジュールを構成できます。アクティブな時間帯中は、指定されたチャンネルとセクションがSlackサイドバーから非表示になります。

**DOM操作**: 拡張機能はコンテンツスクリプトを使用してSlackのDOM構造を操作し、現在時刻とワークスペース固有の設定に基づいて要素を非表示/表示します。

## 設定管理

設定はワークスペース分離でChromeの同期ストレージに保存されます：
- ストレージキーパターン: `slack_focus_workspace_{workspaceId}`
- 各ワークスペースはURLパターンで検出: `https://{workspaceId}.slack.com`
- 異なるSlackワークスペース間の移動時に自動的にワークスペースを切り替え

## コンテンツスクリプト要件

コンテンツスクリプトの作業時は以下に注意：
- Slack固有のDOMセレクタを対象とする（これらは頻繁に変更される）
- 動的コンテンツの読み込みとSPAナビゲーションに対応
- URLとDOM要素からのワークスペース検出を実装
- DOM変更にはMutationObserverを使用
- 最小限のCPU使用量でパフォーマンスを維持

## ビルド検証

変更後は必ず以下のコマンドを実行：
- `npm run compile` - TypeScript型チェック
- `npm run build` - プロダクションビルド検証

## 開発上の注意点

- SlackはDOM構造とCSSクラスを頻繁に変更する
- 拡張機能はワークスペース切り替えをシームレスに処理する必要がある
- コンテンツスクリプトではDOM操作にバニラJavaScriptを使用
- Reactは設定UI（popup/optionsページ）でのみ使用
- すべての時間ベースロジックはユーザーのローカルタイムゾーンを考慮する必要がある