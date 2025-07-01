# 牌操作麻雀

リアルタイム牌操作で楽しむ本格4人対戦麻雀ゲーム

![バージョン](https://img.shields.io/badge/version-1.1.0-blue)
![Vue](https://img.shields.io/badge/Vue.js-3.x-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)

## 概要

牌操作麻雀は、Vue 3とTypeScriptで構築されたWebベースの本格麻雀ゲームです。独自の牌操作機能により手牌の品質を調整でき、初心者から上級者まで楽しめる麻雀体験を提供します。

## 主な機能

### ゲーム機能
- **4人対戦麻雀** - 本格的な四人麻雀対戦
- **CPU AI対戦** - 4段階の強さレベル（Easy/Normal/Hard/Super）
- **牌操作システム** - 手牌品質の調整機能（0%〜80%）
- **配牌最適化** - 2〜5候補から最良配牌を選択
- **音声システム** - リーチ、ツモ、打牌音の再生

### 麻雀機能
- **完全な役判定** - 全37役 + 役満対応
- **ドラ・裏ドラ** - 自動表示と計算
- **フリテン判定** - 正確なフリテンチェック
- **受け入れ計算** - リアルタイム有効牌表示
- **シャンテン数計算** - 向聴数の自動計算

### UI/UX
- **レスポンシブデザイン** - PC・タブレット・スマートフォン対応
- **モーダル最適化** - 勝利・流局表示のスマホ対応
- **パネルシステム** - 情報表示の整理とスクロール対応
- **受け入れハイライト** - 有効牌の視覚的表示

### ゲーム設定
- **局数選択** - 東風戦・東南戦
- **ルール設定** - 上がり連荘・トビ終了
- **CPU個別設定** - 各CPU強さの詳細カスタマイズ
- **デバッグモード** - テスト配牌・手牌設定

## 技術スタック

### フロントエンド
- **Vue 3** - Composition API活用
- **TypeScript** - 型安全な開発
- **Vuetify 3** - マテリアルデザインUI
- **Pinia** - 状態管理
- **Vue Router** - ルーティング

### ビルド・開発
- **Vite** - 高速ビルドシステム
- **ESLint** - コード品質管理
- **Prettier** - コードフォーマット

### 麻雀エンジン
- **riichi-rs-bundlers** - Rust製麻雀ロジック
- **独自AI実装** - 4段階の思考アルゴリズム
- **受け入れ計算エンジン** - 最適化された有効牌計算

### テスト
- **Playwright** - E2Eテスト
- **Python** - テスト自動化スクリプト

## プロジェクトセットアップ

### 必要環境
- Node.js 18+
- pnpm 8+

### インストール
```bash
pnpm install
```

### 開発サーバー起動
```bash
pnpm dev
```
開発サーバーは http://localhost:5173 で起動します。

### 本番用ビルド
```bash
pnpm build
```

### 型チェック
```bash
pnpm type-check
```

### リント
```bash
pnpm lint
```

## テスト

### E2Eテスト実行
```bash
cd test
source .venv/bin/activate
python3 kan_test.py http://localhost:5173 --headless
```

テストの詳細は `test/README.md` を参照してください。

## プロジェクト構造

```
src/
├── components/          # Vue コンポーネント
│   ├── ActionPanel.vue     # アクションボタンパネル
│   ├── DoraPanel.vue       # ドラ表示パネル
│   ├── GameInfoPanel.vue   # ゲーム情報パネル
│   ├── MahjongTile.vue     # 麻雀牌コンポーネント
│   ├── PlayerArea.vue      # プレイヤーエリア
│   ├── PlayerDiscardArea.vue # 捨て牌エリア
│   ├── WinModal.vue        # 勝利モーダル
│   └── DrawModal.vue       # 流局モーダル
├── views/               # ページコンポーネント
│   ├── HomeView.vue        # ホーム画面
│   └── FourPlayerGameView.vue # ゲーム画面
├── utils/               # ユーティリティ
│   ├── game-manager.ts     # ゲーム進行管理
│   ├── mahjong-logic.ts    # 麻雀ロジック
│   ├── cpu-ai.ts          # CPU AI実装
│   ├── scoring.ts         # 点数計算
│   └── sound-manager.ts   # 音声管理
├── stores/              # 状態管理
└── styles/              # スタイル
```

## ゲームの遊び方

1. **ホーム画面**でゲーム設定を調整
   - CPU強さの選択（Easy/Normal/Hard/Super/カスタム）
   - 局数設定（東風戦/東南戦）
   - ルール設定（上がり連荘/トビ終了）
   - 牌操作率と手牌品質の調整

2. **4人対戦を開始**ボタンでゲーム開始

3. **ゲーム画面**で麻雀をプレイ
   - 手牌をクリックして打牌
   - リーチ・ポン・カン・チーボタンで鳴き
   - 受け入れ表示で有効牌を確認

## バージョン履歴

### v1.1.0 (2025-07-01)
- スマホ横画面レスポンシブ対応
- モーダル表示のスマホ最適化
- フリテンチェック処理の最適化
- パネルコンポーネント分離とスクロール機能

### v1.0.0 (2025-06-30)
- 4人対戦麻雀の実装
- 牌操作機能による手牌品質調整
- 受け入れ計算・ドラ表示機能

## 開発設定

### 推奨IDE
- [VSCode](https://code.visualstudio.com/)
- [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) 拡張機能

### 推奨VSCode拡張機能
- Vue Language Features (Volar)
- TypeScript Vue Plugin (Volar)
- ESLint
- Prettier

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 貢献

プルリクエストや課題報告を歓迎します。大きな変更を行う前に、まずissueを開いて変更内容について議論してください。