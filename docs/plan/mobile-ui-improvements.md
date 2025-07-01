# スマホ対応UI改善

## 作業計画:
1. 中央河エリアのサイズを半分に縮小
2. 点数表示から「点」の文字を削除し、数字のみ表示
3. 左右プレイヤーの手牌のはみ出し修正
4. 手牌にスクロール機能を追加

## 設計思想:
- スマホの限られた画面スペースを有効活用
- 中央エリアを小さくして手牌表示スペースを確保
- 点数表示を簡潔にして視認性向上
- 手牌スクロール機能で全ての牌を確認可能にする
- PC表示への影響を最小限に抑制

## 作業対象ファイル:
- ファイル名: src/views/FourPlayerGameView.vue
- 改修内容:
  - 中央河エリア（central-square）のサイズを半分に縮小（180px→90px、150px→75px）
  - 点数表示HTMLを`<span class="score-number">`と`<span class="score-unit">`に分離
  - スマホ表示時に`.score-unit`を非表示にして「点」文字を削除
  - 左右プレイヤーエリアにoverflow:hiddenを設定してはみ出し防止

- ファイル名: src/components/PlayerArea.vue
- 改修内容:
  - 左右プレイヤーの手牌エリア（.hand-tiles-left、.hand-tiles-right）にスクロール機能追加
  - スマホ横画面時のoverflow-y:auto設定
  - カスタムスクロールバーの実装（幅4px/3px、半透明）
  - 2段階のメディアクエリ対応（600px以下、480px以下）

- ファイル名: src/views/FourPlayerGameView.vue
- 改修内容:
  - スマホ表示時の捨牌サイズを70%に縮小（.player-discardsにtransform: scale(0.7)適用）
  - 河の行間を詰める調整（.discard-row:not(:first-child)にmargin-top: -5px適用）

- ファイル名: src/components/PlayerDiscardArea.vue
- 改修内容:
  - スマホ時の捨牌行間調整（margin-top: -5px）で河表示をコンパクト化

- ファイル名: src/components/WinModal.vue
- 改修内容:
  - スマホ時「ツモ・ロン」タイトルと勝利プレイヤー情報を非表示
  - ドラ表示と裏ドラ表示を横並びレイアウトに変更
  - 役一覧の上側に「次の局へ」ボタンを追加（スマホ時のみ表示）

- ファイル名: src/components/DrawModal.vue
- 改修内容:
  - スマホ時のプレイヤーボックスを4人横並び配置（cols="3"）
  - 流局情報の統計ラベル（テンパイ:等）を削除し値のみ表示
  - フォントサイズとマージンをコンパクト化
  - 480px以下では流局タイトルも非表示