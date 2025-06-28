# ゲーム設定パネル実装

## 作業計画:
- ゲーム view の下列左ブロックにトグルボタンを持つパネルを実装
- 設定項目: 鳴きなし、自動アガリ
- localStorage を使用した設定の永続化
- Vue3 Composition API とVuetify を使用
- テスト駆動開発による実装

## 設計思想:
- Vue3 Composables パターンを使用してロジックとUIを分離
- 設定状態は useGameSettings composable で一元管理
- 設定変更時にlocalStorage に自動保存
- 他のゲームパネルと統一したデザイン（紫色のボーダー）
- ゲーム中でも設定変更可能な仕様

## 作業対象ファイル:
- ファイル名: src/utils/useGameSettings.ts
  - 改修内容: ゲーム設定状態管理のVue composable を新規作成
- ファイル名: src/components/GameSettingsPanel.vue  
  - 改修内容: 設定パネルUIコンポーネントを新規作成
- ファイル名: src/views/FourPlayerGameView.vue
  - 改修内容: 設定パネルの統合とゲームロジックへの設定適用
- ファイル名: test/game_settings_test.py
  - 改修内容: Playwright を使用した統合テストを新規作成
- ファイル名: test/element_clicker.py
  - 改修内容: 要素クリックテストツールを新規作成  
- ファイル名: test/screenshot_tool.py
  - 改修内容: スクリーンショット撮影ツールを新規作成
- ファイル名: test/browser_automation.py
  - 改修内容: ブラウザ自動化基盤ツールを新規作成