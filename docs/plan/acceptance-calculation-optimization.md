# 受け入れ計算最適化とリーチ機能改善

## 作業計画:
- 配牌時の受け入れ計算問題の修正
- リーチボタンホバー時のパフォーマンス改善
- リーチ後の受け入れ計算停止
- 清一色モードでの有効牌確率設定の修正
- ローディングマスクの表示条件調整

## 設計思想:
- 受け入れ計算は14枚時（第一ツモ後）のみ実行し、13枚時（配牌直後）はスキップ
- リーチプレビューモード時の計算結果をキャッシュ化してパフォーマンス向上
- リーチ後は手牌変更不可のため受け入れ計算を停止
- 清一色モードでもEnhancedDrawの有効牌確率設定を適用
- ローディングマスクは清一色モードでのみ表示

## 作業対象ファイル:

### ファイル名: src/utils/game-manager.ts
- 改修内容: 
  - startNewGame()で親プレイヤーの第一ツモを明示的に実行
  - 清一色モード専用のツモ処理を削除し、EnhancedDraw統合
  - 未使用のdrawChinitsuTile()関数を削除
  - デバッグログ削除

### ファイル名: src/views/FourPlayerGameView/script.ts
- 改修内容:
  - updateAcceptanceInfo()で13枚時の受け入れ計算をスキップ
  - onMounted()で14枚時のみ受け入れ計算実行
  - getRiichiValidTiles()とgetRiichiDisabledTiles()にキャッシュ機能追加
  - calculateSingleTileAcceptance()関数削除（不要な重い計算除去）
  - リーチ後の受け入れ計算停止処理追加
  - 全デバッグログ削除

### ファイル名: src/utils/enhanced-draw.ts
- 改修内容:
  - drawEnhancedTile()にchinitsusuitFilterパラメータ追加
  - 清一色モード対応で指定色の牌をフィルタリング機能追加

### ファイル名: src/components/PlayerArea.vue
- 改修内容:
  - ローディングマスク表示条件を清一色モードのみに限定
  - デバッグ表示削除

### ファイル名: src/components/LoadingMask.vue
- 改修内容:
  - 全デバッグログと不要な処理削除
  - コード整理

### ファイル名: src/views/HomeView/index.vue
- 改修内容:
  - 現在のバージョンをv1.3.0に更新
  - v1.3.0のバージョン履歴項目を追加（受け入れ計算をRust化して高速化、リーチプレビューモードのパフォーマンス改善、清一色モードの有効牌確率設定修正）