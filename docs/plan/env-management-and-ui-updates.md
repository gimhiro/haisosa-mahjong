# 環境管理とUI更新の実装

## 作業計画:
1. dev/prod環境構成の分離実装
2. プロダクション環境でのデバッグ機能非表示
3. ホームページのその他のモードパネル削除
4. バージョン履歴パネルの追加
5. 環境設定ファイルの管理方法改善

## 設計思想:
- 環境に応じた機能の適切な表示/非表示制御
- 開発環境と本番環境の明確な分離
- プロダクション環境での不要な開発ツール非表示
- ユーザーに対する適切な製品情報提供

## 作業対象ファイル:

### ファイル名: package.json
- 改修内容: dev/prodモード用のnpmスクリプト追加、ビルドスクリプトの環境対応

### ファイル名: .env.development
- 改修内容: 開発環境設定ファイルの作成（VITE_APP_MODE=development, VITE_ENABLE_DEBUG=true）

### ファイル名: .env.production  
- 改修内容: 本番環境設定ファイルの作成（VITE_APP_MODE=production, VITE_ENABLE_DEBUG=false）

### ファイル名: src/utils/env.ts
- 改修内容: 環境変数管理ユーティリティの作成、isDebugMode判定ロジック実装

### ファイル名: src/components/GameSettingsPanel.vue
- 改修内容: テストモック起動ボタンのデバッグモード時のみ表示制御

### ファイル名: src/views/FourPlayerGameView.vue  
- 改修内容: アクションパネルのデバッグ情報をデバッグモード時のみ表示制御

### ファイル名: src/views/HomeView.vue
- 改修内容: その他のモードパネル削除、バージョン履歴パネル追加（v1.0.0リリース情報含む）

### ファイル名: .gitignore
- 改修内容: .env*ファイルを除外し、.env.sampleのみ許可するよう更新

### ファイル名: .env.sample
- 改修内容: 環境変数設定サンプルファイルの作成、設定例とコメント記載