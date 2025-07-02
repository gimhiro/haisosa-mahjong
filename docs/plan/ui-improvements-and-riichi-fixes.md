# UI改善とリーチ機能修正

## 作業計画:
- Home View の設定アコーディオン間の余白調整
- リーチ機能の動作不具合修正（プレビューモード、ハイライト、河での横向き表示）
- ミュートボタンや結果表示ボタンの動作修正
- バージョン履歴の更新

## 設計思想:
- ユーザビリティ向上のため、設定項目間の視覚的距離感を最適化
- リーチ機能の完全な動作実現により、本格的な麻雀体験を提供
- イベントハンドリングの統一により、すべてのUI要素が期待通りに動作
- バージョン履歴の適切な管理

## 作業対象ファイル:

### ファイル名: src/views/HomeView/styles.css
- 改修内容: .setting-sectionのmargin-bottomを1.5remから0.375remに変更し、設定アコーディオン間の余白を縮小

### ファイル名: src/views/FourPlayerGameView/script.ts
- 改修内容: 
  - declareRiichi()関数の実装を修正（プレビューモードに入るロジックを追加）
  - confirmRiichiAndDiscard()関数にデバッグログを追加
  - 受け入れ情報更新watcherにriichiPreviewModeを追加
  - settingsをreturnステートメントに追加

### ファイル名: src/components/ActionPanel.vue
- 改修内容:
  - リーチボタンの動作ロジックを修正（プレビューモード時とそうでない時でイベント分岐）
  - defineEmitsにdeclareRiichiイベントを追加

### ファイル名: src/components/PlayerArea.vue
- 改修内容:
  - Props interfaceにriichiValidTilesプロパティを追加
  - デフォルト値にriichiValidTiles: () => []を設定

### ファイル名: src/components/PlayerDiscardArea.vue
- 改修内容: リーチ宣言牌のデバッグログを追加

### ファイル名: src/views/FourPlayerGameView/index.vue
- 改修内容:
  - PlayerAreaコンポーネントの受け入れ関連プロパティを追加
  - リーチプレビューモードのプロパティ名を修正（:riichi-preview-mode → :is-riichi-preview-mode）
  - ActionPanelに結果表示・次の局へボタンのイベントハンドラを追加
  - GameInfoPanelにミュートボタンのイベントハンドラを追加
  - script.tsから必要な変数（settings, acceptanceInfos, bestAcceptanceTiles）を受け取るよう修正

### ファイル名: src/views/HomeView/index.vue
- 改修内容: v1.1.0のバージョン履歴にv1.1.6のリファクタリング項目を追加