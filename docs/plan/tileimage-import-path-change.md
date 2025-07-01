# TileImage.vueの画像インポートパス変更

## 作業計画:
1. 現在の画像パス指定方法を確認（new URL形式）
2. Viteの@エイリアスを使用した相対インポート形式に変更
3. 動作確認

## 設計思想:
- 現在は`new URL('../assets/tiles/${fileName}', import.meta.url).href`という形式で画像パスを指定している
- これをViteが推奨する`@`エイリアスを使用した形式に変更する
- `@`は通常`src`ディレクトリを指すエイリアスとして設定されている
- より簡潔で保守しやすいコードになる

## 作業対象ファイル:
- ファイル名: src/components/TileImage.vue
- 改修内容: 
  - 全ての画像ファイルを`@`エイリアスを使用してインポート
  - `new URL`形式から直接インポートした画像URLを使用する形式に変更
  - `getTileFileName`関数を`getTileImageUrl`関数に変更し、インポートした画像URLを直接返すように修正