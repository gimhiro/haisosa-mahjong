# GitHub Pages デプロイ設定

## 作業計画:
1. vite.config.tsのbase設定をGitHub Pages用に変更
2. GitHub Actionsワークフローを作成/更新
3. package.jsonにhomepageフィールドを追加
4. GitHub リポジトリでPages設定を有効化

## 設計思想:
- GitHub ActionsでCI/CDパイプラインを構築
- mainブランチにpush時に自動デプロイ
- 静的ファイルをGitHub Pagesで配信
- baseパスを適切に設定してアセットのリンク切れを防止

## 作業対象ファイル:
- ファイル名: vite.config.ts
- 改修内容:
  - production環境でのbase設定を '/haisosa-mahjong/' に変更
  - GitHub Pagesのサブパス形式に対応

- ファイル名: .github/workflows/deploy.yml
- 改修内容:
  - GitHub Pages用のCI/CDワークフローを作成
  - npm ciでの依存関係インストール
  - production環境でのビルド
  - アーティファクトアップロードとデプロイ

- ファイル名: package.json
- 改修内容:
  - homepage フィールドを追加（GitHub PagesのURL）

- ファイル名: src/views/HomeView.vue
- 改修内容:
  - 動的バージョン取得機能を追加
  - current-versionクラスの要素から値を取得してconsole.warnで出力

- ファイル名: src/components/TileImage.vue
- 改修内容:
  - すべてのタイル画像（34種類）を静的importに変更
  - タイルマップオブジェクトでファイル名と画像パスをマッピング
  - GitHub Pagesでのパス問題を解決

- ファイル名: src/views/FourPlayerGameView.vue
- 改修内容:
  - TypeScriptビルドエラーを修正
  - GameManagerプロパティの型エラーを回避
  - テンプレート内の型推論の問題を解決

- ファイル名: src/components/WinModal.vue
- 改修内容:
  - Tile | null型のnullチェック追加
  - v-ifディレクティブでnull安全性を確保

- ファイル名: src/components/PlayerArea.vue
- 改修内容:
  - イベントハンドラーの型をany型に変更
  - MouseEvent型の問題を解決

- ファイル名: src/components/GameSettingsPanel.vue
- 改修内容:
  - boolean | null型のnullish coalescing演算子（??）使用
  - 型安全性を確保しながら論理演算を修正

- ファイル名: src/utils/useGameSettings.ts
- 改修内容:
  - nullish coalescing演算子を使用した型安全な処理に変更