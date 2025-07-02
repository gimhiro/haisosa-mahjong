# Web Worker受け入れ計算非同期化およびキャンセル機能実装

## 作業計画:

1. **Web Worker作成**
   - src/workers/acceptance-worker.js を作成
   - 受け入れ計算ロジックをワーカーに移行
   - メッセージベースの通信インターフェース実装

2. **キャンセル機能追加**
   - 計算リクエストにユニークIDを付与
   - 進行中の計算をキャンセルする仕組み
   - AbortControllerパターンの活用

3. **メインスレッド側の改修**
   - FourPlayerGameView/script.tsでWorker統合
   - 非同期計算の状態管理
   - エラーハンドリング強化

4. **UI応答性の向上**
   - 計算中でも牌操作可能に
   - 即座にローディング表示
   - バックグラウンド計算完了時の結果反映

## 設計思想:

- **UIブロッキング完全回避**: メインスレッドでの重い計算を排除
- **ユーザー体験優先**: 操作に対する即座の応答
- **計算リソース効率化**: 不要な計算のキャンセルで負荷軽減
- **堅牢性**: Worker通信エラーや計算失敗への対応
- **既存機能との互換性**: 現在のキャッシュ機能との統合

## 作業対象ファイル:

### src/workers/acceptance-worker.js
- 改修内容: Web Worker作成。受け入れ計算をバックグラウンドで実行、キャンセル機能付き

### src/utils/mahjong-logic-worker.js  
- 改修内容: Worker用麻雀ロジック関数の移植。syantenライブラリ統合とフォールバック実装

### src/views/FourPlayerGameView/script.ts
- 改修内容: 
  - Worker関連処理を削除（syantenライブラリ読み込み問題により）
  - 計算キャンセル用フラグ追加（isCalculationCancelled）
  - updateAcceptanceInfo関数にキャンセルチェック機能追加
  - calculateAcceptanceOptimizedWithCancel関数作成（キャンセル対応版）
  - calculateUsefulTilesInfoOptimizedWithCancel関数作成（キャンセル対応版）
  - 牌クリック時に進行中計算を自動キャンセル
  - 計算の各段階でキャンセルチェックを実行し、UIブロッキングを最小化

## 最終的な実装内容:

Web Workerの代わりに、シンプルな計算キャンセル機能を実装：
- 牌を切った時に`isCalculationCancelled`フラグをtrueに設定
- 受け入れ計算の各段階でキャンセルフラグをチェック
- キャンセルされた場合は即座に計算を中断
- ローディング状態を適切にクリア