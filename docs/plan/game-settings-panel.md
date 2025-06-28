# ゲーム設定パネルの実装

## 作業計画:
1. ゲーム設定の状態管理（Context）の作成
2. トグルボタンコンポーネントの作成
3. 設定パネルUIコンポーネントの作成
4. GameViewへの組み込み
5. 鳴きなし機能の実装
6. 自動アガリ機能の実装
7. テストの作成

## 設計思想:
- ゲーム中の設定はVue Composableで管理し、ゲーム全体からアクセス可能にする
- VuetifyのVSwitchコンポーネントを使用してトグルボタンを実装
- 設定の変更は即座にゲームプレイに反映される
- 既存のゲームロジックへの影響を最小限に抑える
- 設定の状態はローカルストレージに保存し、次回プレイ時も維持される

## 作業対象ファイル:
- ファイル名: src/utils/useGameSettings.ts
- 改修内容: ゲーム設定の状態管理用Composableを作成。鳴きなし・自動アガリの設定をlocalStorageに永続化。テスト環境での状態リセット機能を追加

- ファイル名: src/components/GameSettingsPanel.vue
- 改修内容: 設定パネルUIコンポーネントを作成。VuetifyのVSwitchを使用したトグルボタンでゲーム設定を変更可能。トグル左側・ラベル右側の配置でコンパクトなデザインを実現

- ファイル名: src/views/FourPlayerGameView.vue
- 改修内容: 
  - グリッドレイアウトを変更して左下ブロック（settings）を追加
  - GameSettingsPanelコンポーネントを左下の設定エリアに配置
  - 他のパネルと統一したデザインのCSSスタイルを追加（.settings-panel）
  - checkHumanMeldActions関数に鳴きなし設定チェックを追加
  - canTsumo/canRonのwatcherを追加して自動アガリ機能を実装

- ファイル名: vitest.config.ts
- 改修内容: Vueコンポーネントのテストが実行できるよう@vitejs/plugin-vueを追加

- ファイル名: src/utils/__tests__/useGameSettings.test.ts
- 改修内容: useGameSettings Composableのユニットテストを作成。localStorage連携とリセット機能をテスト

- ファイル名: src/components/__tests__/GameSettingsPanel.test.ts
- 改修内容: GameSettingsPanelコンポーネントのユニットテストを作成。Vuetifyコンポーネントのモックを使用してUI動作をテスト

## 最終仕様:
- ゲーム設定パネルが左下ブロックに配置
- 鳴きなし設定: 有効時はポン・チー・カンボタンを非表示
- 自動アガリ設定: 有効時はツモ・ロン可能な際に自動実行
- 設定はlocalStorageに永続化され次回起動時も維持
- 他のパネルと統一された紫色ボーダーのデザイン