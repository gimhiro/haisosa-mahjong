# FourPlayerGameView コンポーネントのリファクタリング

## 作業計画

1. `/home/szkhi/dev/haisosa-mahjong/src/views/FourPlayerGameView.vue` の全内容を読み取る
2. template部分（`<template>`から`</template>`まで）を抽出
3. 新しいディレクトリ `/home/szkhi/dev/haisosa-mahjong/src/views/FourPlayerGameView/` を作成
4. 新しいVueファイル `/home/szkhi/dev/haisosa-mahjong/src/views/FourPlayerGameView/index.vue` を作成
5. 抽出したtemplate部分を新しいファイルに配置
6. script部分をscript.tsファイルからimportするよう設定
7. style部分をstyles.cssファイルをimportするよう設定

## 設計思想

### 目的
- 大きくなりすぎたFourPlayerGameView.vueファイルを分割して保守性を向上させる
- template、script、styleを分離することで、各部分の責務を明確にする
- 他の開発者が理解しやすいコード構造にする

### 構造設計
- `index.vue`: メインのVueコンポーネントファイル（template部分のみ）
- `script.ts`: TypeScriptロジック（将来的に作成予定）
- `styles.css`: CSSスタイル（将来的に作成予定）

### メリット
- ファイルサイズの適正化
- コードの可読性向上
- 保守性の向上
- 各部分の責務分離

## 作業対象ファイル

### ファイル名: src/views/FourPlayerGameView/index.vue
- 改修内容: 
  - FourPlayerGameView.vueからtemplate部分（1行目〜254行目）を抽出して新規作成
  - 254行のtemplate要素をすべて含むVueコンポーネントファイルとして作成
  - script setup構文を使用した基本構造を設定
  - 将来的なscript.tsとstyles.cssのimportに対応するコメントを追加
  - ゲームテーブル、プレイヤーエリア、アクションエリア、各種モーダルなどの完全なUI構造を保持