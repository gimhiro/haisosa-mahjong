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