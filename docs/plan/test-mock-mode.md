# テストモック機能の実装

## 作業計画:
1. useGameSettingsにテストモード設定を追加
2. GameSettingsPanelにテストモック起動ボタンを追加
3. 手牌・ツモ牌設定ポップアップコンポーネントの作成
4. FourPlayerGameViewにテストモード統合
5. テストモードでのツモ牌制御実装
6. テストモードの手牌即座適用機能実装
7. デバッグログのクリーンアップ

## 設計思想:
- テストモードでは各プレイヤーの手牌とツモ牌を手動で指定可能
- 牌の指定には文字列記法（1m-9m, 1p-9p, 1s-9s, 東南西北白發中）を使用
- テストモードが有効の場合、指定した手牌とツモ順序に従ってゲームが進行
- 既存のゲームロジックへの影響を最小限に抑え、テストモード時のみ動作を変更
- 設定はローカルストレージに保存し、テストモード状態を維持

## 作業対象ファイル:
- ファイル名: src/utils/useGameSettings.ts
- 改修内容: TestModeDataとPlayerTestDataインターフェースを追加。testMode設定をlocalStorageに永続化。toggleTestMode()とupdateTestModeData()メソッドを実装

- ファイル名: src/components/GameSettingsPanel.vue
- 改修内容: テストモック起動ボタンを追加。テストモード状態に応じてボタンテキストと色を変更。openTestDialog イベントを発行

- ファイル名: src/components/TestModeDialog.vue
- 改修内容: 新規作成。タブ形式で各プレイヤーの手牌・ツモ牌を設定可能なダイアログコンポーネント。牌文字列の解析とバリデーション機能。testModeAppliedイベントを発行

- ファイル名: src/utils/game-manager.ts
- 改修内容: テストモード関連フィールドとメソッドを追加。parseTileString()で牌文字列をTileオブジェクトに変換。setTestMode()とsetTestHands()でテスト牌を設定。drawTileAndKeepSeparate()でテストツモ牌を使用

- ファイル名: src/views/FourPlayerGameView.vue
- 改修内容: TestModeDialogコンポーネントを統合。onTestModeApplied()ハンドラーで即座にテスト牌を適用。startGame()でテストモード時の手牌設定を実装

## 実装仕様:
- テストモードボタンはGameSettingsPanelに配置
- テストモード起動時にポップアップダイアログが表示
- 4プレイヤー分の手牌（13-14枚）とツモ牌（5枚）を設定可能
- 牌の記法: 1m-9m（萬子）、1p-9p（筒子）、1s-9s（索子）、ton/nan/sha/pei/haku/hatsu/chun（字牌）
- テストモード有効時は指定した牌でゲームが進行
- デフォルトテストデータを提供してユーザビリティを向上