# 画像読み込み修正（Google Cloudデプロイ対応）

## 作業計画:
1. TileImage.vueの`import.meta.glob()`使用方法を修正
2. 画像URLの取得方法を`module.default`から直接URL文字列に変更
3. `as: 'url'`オプションを使用してハッシュ付きURLを正しく取得
4. ファイル名ベースの画像マッピングに変更

## 設計思想:
- Google Cloud Storageでの画像配信時の正しいURL生成
- `import.meta.glob()`の正しい使用方法でハッシュ付きURLを取得
- 開発環境と本番環境での一貫した画像読み込み
- キャッシュ効率を考慮したハッシュ付きファイル名の活用

## 作業対象ファイル:
- ファイル名: src/components/TileImage.vue
- 改修内容:
  - `import.meta.glob()`に`as: 'url'`オプションを追加
  - ファイル名ベースの画像URLマップに変換
  - 画像URL取得ロジックを`module.default`から直接URL文字列に変更
  - フォールバック処理もファイル名ベースに修正