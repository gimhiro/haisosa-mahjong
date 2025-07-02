# Vue コンポーネントリファクタリング

## 作業計画:
1. HomeView.vue と FourPlayerGameView.vue の現在の構造を確認
2. 各コンポーネント用のフォルダ構造を作成
   - src/views/HomeView/ フォルダ作成
   - src/views/FourPlayerGameView/ フォルダ作成
3. HomeView.vue をリファクタリング
   - HomeView.vue → HomeView/index.vue に移動
   - スタイル部分を HomeView/styles.css に切り出し
   - スクリプト部分を HomeView/script.ts に切り出し
4. FourPlayerGameView.vue をリファクタリング
   - FourPlayerGameView.vue → FourPlayerGameView/index.vue に移動
   - スタイル部分を FourPlayerGameView/styles.css に切り出し
   - スクリプト部分を FourPlayerGameView/script.ts に切り出し
5. 作業記録を docs/plan に追記

## 設計思想:
- コンポーネントの責任を明確に分離し、保守性を向上させる
- 大きなVueファイルを機能別に分割して可読性を向上
- CSS とロジック部分を分離することで、それぞれの専門性を高める
- フォルダベースの構造により、関連ファイルをまとめて管理
- 将来的な機能拡張や修正時の影響範囲を局所化

## 作業対象ファイル:

### HomeView 関連:
- ファイル名: src/views/HomeView/index.vue
- 改修内容: 
  - 元の HomeView.vue からテンプレート部分を抽出し、新しいフォルダ構造で管理
  - styles.css をインポートしてスタイル分離
  - script 部分はシンプルな構造に保持（元々それほど複雑ではないため）

- ファイル名: src/views/HomeView/styles.css
- 改修内容: 
  - 元の HomeView.vue から CSS スタイル部分（953行）を抽出
  - レスポンシブデザイン、ゲーム設定パネル、アニメーション効果等を含む

- ファイル名: src/views/HomeView/script.ts
- 改修内容: 
  - 元の script setup 部分を TypeScript ファイルとして抽出
  - 将来的なモジュール化に対応する構造で保存

### FourPlayerGameView 関連:
- ファイル名: src/views/FourPlayerGameView/index.vue
- 改修内容: 
  - 元の FourPlayerGameView.vue からテンプレート部分（254行）を抽出
  - Composition API を使用してロジック分離
  - useFourPlayerGameView composable をインポートして使用
  - styles.css をインポートしてスタイル分離

- ファイル名: src/views/FourPlayerGameView/styles.css
- 改修内容: 
  - 元の FourPlayerGameView.vue から CSS スタイル部分（800行以上）を抽出
  - ゲーム画面レイアウト、レスポンシブ対応、スマホ横画面調整等を含む

- ファイル名: src/views/FourPlayerGameView/script.ts
- 改修内容: 
  - 元の script setup 部分（1800行以上）を TypeScript ファイルとして抽出
  - useFourPlayerGameView composable として構造化
  - すべてのリアクティブ変数、computed、メソッドを適切にエクスポート
  - import パスを新しいフォルダ構造に対応して調整

### 追加作業:
- 元の .vue ファイルを .vue.backup にリネーム
- 新しい index.vue へのシンボリックリンクを作成
- 既存のルーティングとの互換性を保持