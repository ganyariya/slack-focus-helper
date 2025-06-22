# Slack Channel Blocker 機能仕様書

## 1. 概要

### 1.1 目的
集中時間中にSlackで気が散るチャンネルやセクションを一時的に非表示にし、生産性を向上させるChrome拡張機能

### 1.2 対象
- Slack Webアプリケーション（*.slack.com）
- Chrome ブラウザ

### 1.3 技術スタック
- フレームワーク: WXT
- 言語: JavaScript/TypeScript
- ストレージ: Chrome Storage API
- Manifest: V3

---

## 2. 機能要件

### 2.1 基本機能

#### 2.1.1 時間ベースブロック
- **機能**: 指定した時間帯のみブロック機能を有効化
- **設定項目**:
  - 開始時刻（HH:MM形式）
  - 終了時刻（HH:MM形式）
  - 有効/無効フラグ
- **制約**: 複数の時間帯を設定可能（例: 10:00-12:00, 14:00-18:00）
- **動作**: 設定時間外はブロック対象でも表示される

#### 2.1.2 チャンネルブロック
- **機能**: 個別チャンネルの非表示
- **対象**: 
  - パブリックチャンネル（#general など）
  - プライベートチャンネル（🔒 マーク付き）
  - ダイレクトメッセージ
  - アプリ連携チャンネル
- **操作方法**: Ctrl+クリックでブロック/解除を切り替え
- **視覚フィードバック**: ブロック時に一時的に暗転エフェクト
- **視覚効果**: ブロック中はサイドバーから完全に非表示

#### 2.1.3 セクションブロック
- **機能**: セクション全体の非表示
- **対象セクション**:
  - スター付き
  - チャンネル
  - ダイレクトメッセージ
  - App
  - その他カスタムセクション
- **連動効果**: セクション内の全チャンネルも自動的に非表示
- **操作方法**: セクションヘッダーをCtrl+クリックでブロック/解除を切り替え
- **視覚フィードバック**: ブロック時に一時的に暗転エフェクト

#### 2.1.4 ワークスペース別設定
- **機能**: ワークスペースごとに独立した設定
- **自動検出**: ワークスペース名を自動取得して設定を分離
- **設定項目**:
  - 時間ブロック設定
  - ブロック対象チャンネルリスト
  - ブロック対象セクションリスト
  - ワークスペース別有効/無効

### 2.2 高度な機能

#### 2.2.1 強制モード
- **機能**: 直接URL指定でのアクセスもブロック
- **対象**: ブロック対象チャンネルへの直接アクセス
- **動作**: 
  - 通常モード: サイドバー非表示のみ、直接URLは開ける
  - 強制モード: 直接URLアクセス時に専用ブロック画面を表示
- **ブロック画面**: "No!!!" メッセージと設定へのリンク

#### 2.2.2 ブロック管理UI
- **設定画面でのブロック管理**:
  - 現在ブロック中のチャンネル一覧表示
  - 現在ブロック中のセクション一覧表示
  - 個別解除ボタン
  - 一括解除ボタン
- **ブロック操作の視覚フィードバック**:
  - Ctrl+クリック時に暗転エフェクト（0.3秒）
  - トースト通知「チャンネルをブロックしました」「ブロックを解除しました」
- **ステータス表示**: 現在のブロック状況をポップアップで確認可能

---

## 3. ユーザーインターフェース

### 3.1 拡張機能ポップアップ

#### 3.1.1 メイン画面
```
┌─────────────────────────────────┐
│ Slack Channel Blocker           │
├─────────────────────────────────┤
│ ワークスペース: ganariya        │
│ ■ 拡張機能を有効にする          │
│ ■ 強制モード                    │
├─────────────────────────────────┤
│ 時間設定                        │
│ ┌─────┐ ～ ┌─────┐ [削除]      │
│ │10:00│   │12:00│             │
│ └─────┘   └─────┘             │
│ ┌─────┐ ～ ┌─────┐ [削除]      │
│ │14:00│   │18:00│             │
│ └─────┘   └─────┘             │
│ [+ 時間帯を追加]                │
├─────────────────────────────────┤
│ ブロック状況                    │
│ チャンネル: 2個                 │
│ セクション: 1個                 │
│ [詳細設定]                      │
└─────────────────────────────────┘
```

#### 3.1.2 詳細設定画面
```
┌─────────────────────────────────┐
│ ← 戻る  ブロック設定詳細        │
├─────────────────────────────────┤
│ ブロック中のチャンネル          │
│ • #general              [解除] │
│ • #random               [解除] │
│ • DM: john              [解除] │
│                                 │
│ ブロック中のセクション          │
│ • スター付き            [解除] │
│ • App                   [解除] │
│                                 │
│ [すべて解除]                    │
├─────────────────────────────────┤
│ 操作方法                        │
│ Ctrl+クリック: ブロック切り替え │
│ 右クリック: 通常のSlackメニュー │
└─────────────────────────────────┘
```

### 3.2 Slackサイドバー内UI

#### 3.2.1 Ctrl+クリック操作
- **動作**: チャンネル/セクションをCtrl+クリックでブロック切り替え
- **視覚フィードバック**: 
  - ブロック時: 要素が0.3秒間暗転→フェードアウト
  - 解除時: 要素が0.3秒間点滅→通常表示
- **トースト通知**: 画面右上に2秒間表示
  - 「#general をブロックしました」
  - 「スター付きセクションのブロックを解除しました」

#### 3.2.2 ブロック画面（強制モード）
```
┌─────────────────────────────────┐
│                                 │
│             🚫                  │
│                                 │
│           No!!!                 │
│                                 │
│ このチャンネルは集中時間中は    │
│     ブロックされています        │
│                                 │
│   ブロック解除は拡張機能の      │
│      設定から行えます           │
│                                 │
└─────────────────────────────────┘
```

---

## 4. 技術仕様

### 4.1 ファイル構成
```
slack-channel-blocker/
├── wxt.config.ts              # WXT設定
├── manifest.json              # 拡張機能マニフェスト
├── entrypoints/
│   ├── content.ts            # メインコンテンツスクリプト
│   ├── content.css           # スタイルシート
│   ├── popup.html            # ポップアップHTML
│   ├── popup.ts              # ポップアップロジック
│   └── popup.css             # ポップアップスタイル
├── components/
│   ├── SlackChannelBlocker.ts # メインクラス
│   ├── ConfigManager.ts       # 設定管理
│   └── UIManager.ts           # UI管理
└── types/
    └── config.ts              # 型定義
```

### 4.2 データ構造

#### 4.2.1 設定データ
```typescript
interface Config {
  workspaces: Record<string, WorkspaceConfig>;
  globalSettings: GlobalSettings;
}

interface WorkspaceConfig {
  timeBlocks: TimeBlock[];
  blockedChannels: string[];      // チャンネルID配列
  blockedSections: string[];      // セクションID配列
  enabled: boolean;
}

interface TimeBlock {
  start: string;    // "HH:MM"
  end: string;      // "HH:MM"
  enabled: boolean;
}

interface GlobalSettings {
  forceMode: boolean;
  enabled: boolean;
}
```

#### 4.2.2 DOM セレクタ仕様

**基本コンテナ**
```typescript
const SELECTOR_CHANNEL_LIST = '.p-channel_sidebar__static_list';
const SELECTOR_WORKSPACE = '.p-client_workspace';
const SELECTOR_CHANNEL_LIST_CONTAINER = `${SELECTOR_CHANNEL_LIST} .c-virtual_list__scroll_container`;
```

**情報取得用セレクタ**
```typescript
const SELECTORS = {
  // ワークスペース名
  workspaceName: '.p-ia4_sidebar_header__title--inner .p-ia4_home_header_menu__team_name',
  
  // チャンネル関連
  channelItem: '.p-channel_sidebar__channel',
  channelName: '.p-channel_sidebar__name',
  channelListItems: `${SELECTOR_CHANNEL_LIST} [role=listitem], ${SELECTOR_CHANNEL_LIST} [role=treeitem]`,
  
  // セクション関連
  sectionHeading: '.p-channel_sidebar__section_heading',
  sectionName: '.p-channel_sidebar__section_heading_label .overflow_ellipsis',
  
  // サイドバー全体
  sidebar: '.p-channel_sidebar'
};
```

**データ属性キー**
```typescript
const DATA_ATTRIBUTES = {
  // チャンネル識別用
  channelId: 'data-qa-channel-sidebar-channel-id',
  channelType: 'data-qa-channel-sidebar-channel-type',
  sectionId: 'data-qa-channel-sidebar-channel-section-id',
  
  // セクション識別用
  sectionHeading: 'data-qa-channel-sidebar-section-heading'
};
```

**要素取得方法の例**
```typescript
// ワークスペース名取得
const workspaceName = document.querySelector(SELECTORS.workspaceName)?.textContent?.trim();

// 全チャンネル要素取得
const channelElements = document.querySelectorAll(SELECTORS.channelItem);

// 全セクション要素取得
const sectionElements = document.querySelectorAll(SELECTORS.sectionHeading);

// 特定チャンネルID の要素取得
const channelElement = document.querySelector(`[${DATA_ATTRIBUTES.channelId}="${channelId}"]`);

// 特定セクションID の要素取得
const sectionElement = document.getElementById(sectionId);

// セクション内のチャンネル要素取得
const channelsInSection = document.querySelectorAll(`[${DATA_ATTRIBUTES.sectionId}="${sectionId}"]`);
```

### 4.3 主要クラス

#### 4.3.1 SlackChannelBlocker
```typescript
class SlackChannelBlocker {
  // 初期化とメイン制御
  async init(): Promise<void>
  
  // ブロック制御
  applyBlocking(): void
  restoreBlocking(): void
  isInBlockTime(): boolean
  
  // Ctrl+クリック操作
  setupCtrlClickListeners(): void
  handleCtrlClick(event: MouseEvent): void
  toggleBlock(element: Element, type: 'channel' | 'section'): Promise<void>
  
  // 視覚フィードバック
  showBlockFeedback(element: Element, isBlocking: boolean): void
  showToast(message: string): void
  
  // 強制モード
  monitorPageNavigation(): void
  checkBlockedPageAccess(): void
  showBlockedPage(): void
}
```

#### 4.3.2 ConfigManager
```typescript
class ConfigManager {
  async loadConfig(): Promise<Config>
  async saveConfig(config: Config): Promise<void>
  getWorkspaceConfig(workspaceName: string): WorkspaceConfig
  setWorkspaceConfig(workspaceName: string, config: WorkspaceConfig): void
}
```

---

## 5. 動作フロー

### 5.1 初期化フロー
1. Slackページ読み込み検出
2. ワークスペース名取得
3. 設定データ読み込み
4. イベントリスナー設定
5. 現在時刻チェック→ブロック適用
6. DOM変更監視開始

### 5.2 ブロック操作フロー
1. ユーザーがチャンネル/セクションをCtrl+クリック
2. イベントを検知してSlackの通常動作を阻止
3. ブロック状態をトグル
4. 視覚フィードバック（暗転/点滅エフェクト）を表示
5. トースト通知を表示
6. 設定を保存
7. ブロック状態を即座に反映（非表示/表示）

### 5.3 時間チェックフロー
1. 1分毎に現在時刻をチェック
2. ブロック時間内/外の判定
3. 状態が変化した場合:
   - ブロック時間内→ブロック適用
   - ブロック時間外→ブロック解除

---

## 6. 制約事項・注意点

### 6.1 技術的制約
- Slackの DOM構造変更に依存するため、Slackのアップデートで動作に影響する可能性
- Chrome拡張機能の制限により、一部のSlack機能への影響を避けられない場合がある
- ストレージ容量の制限（Chrome Storage Sync: 102KB）

### 6.2 機能制約
- ブロックは視覚的な非表示のみで、通知は受信する
- 強制モードでも、Slackアプリやモバイルアプリからはアクセス可能
- リアルタイム更新：他のデバイスでの設定変更は即座に反映されない

### 6.3 ユーザビリティ
- Ctrl+クリック操作の学習コストがある
- 設定が複雑になりがちなため、UI設計に注意が必要
- ブロック状態の確認は設定画面で行う必要がある
- 誤操作防止のためCtrl+クリックの視覚フィードバックが重要