# 画像パス修正とUI強化

## 作業計画:
1. GitHub Pages での画像404エラーの修正
2. リポジトリ名の修正（/mahjong_vue/ → /haisosa-mahjong/）
3. ホーム画面へのバグ報告・機能要望リンク追加
4. UI要素の横幅統一

## 設計思想:
- Viteのpublicディレクトリを使用した静的アセットの適切な配信
- 環境に応じたパスベースの動的切り替え
- 一貫性のあるUI設計とアクセシビリティの確保

## 作業対象ファイル:

### ファイル名: public/tiles/
- 改修内容: src/assets/tiles/ から public/tiles/ へ画像ファイルを移動

### ファイル名: src/components/TileImage.vue
- 改修内容: 画像パスをpublicディレクトリベースに変更、basePath設定を /haisosa-mahjong/ に修正

### ファイル名: src/utils/tile-renderer.ts
- 改修内容: 画像パス生成関数でbasePath設定を /haisosa-mahjong/ に修正

### ファイル名: src/utils/sound-manager.ts
- 改修内容: 音声ファイルパスのbasePath設定を /haisosa-mahjong/ に修正

### ファイル名: vite.config.ts
- 改修内容: 本番環境でのbase設定を /haisosa-mahjong/ に修正

### ファイル名: package.json
- 改修内容: homepage URLを https://gimhiro.github.io/haisosa-mahjong/ に修正

### ファイル名: src/views/HomeView.vue
- 改修内容: バグ報告・機能要望セクションを追加、バージョン履歴セクションの横幅を他のセクションと統一