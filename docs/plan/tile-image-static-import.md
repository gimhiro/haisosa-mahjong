# 画像読み込み静的インポート修正

## 作業計画:
1. 全ての牌画像（34種類）を静的にimportする
2. ファイル名と画像URLのマッピングオブジェクトを作成
3. computed内で静的マッピングから画像URLを取得
4. 動的URL生成を削除してビルド時に確実に画像が含まれるようにする

## 設計思想:
- Viteのビルド時に全ての画像が静的解析される
- import文により確実にdist/assetsに画像がコピーされる
- Google Cloud Storage上でも正しいハッシュ付きURLでアクセス可能
- 画像点数が34枚と限定的なので、静的import方式が適している

## 作業対象ファイル:
- ファイル名: src/components/TileImage.vue
- 改修内容:
  - 全34種類の牌画像を個別に静的import
  - tileImageMapオブジェクトでファイル名とimportした画像URLをマッピング
  - computedで動的URL生成を削除し、静的マッピングから取得するように変更
  - フォールバック処理も静的マッピングを使用
  
- ファイル名: vite.config.ts
- 改修内容:
  - production環境でのbase設定を相対パス（'./'）に変更
  - これによりビルド後の画像URLが相対パスになり、Google Cloud Storage上でもバケット名が保持される