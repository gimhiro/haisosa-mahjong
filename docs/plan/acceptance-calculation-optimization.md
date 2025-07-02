# 受け入れ計算処理の最適化

## 作業計画:
1. 受け入れ計算結果をキャッシュするシステムを実装
2. ターンごと・手牌状態ごとに受け入れ情報を前計算して保持
3. 二度目以降の表示では計算を行わずキャッシュから取得
4. 手牌が変化した時のみ再計算を実行

## 設計思想:
- 受け入れ計算は重い処理のため、同じ手牌状態では一度だけ計算する
- 手牌の状態をキーとしてMap構造でキャッシュを管理
- メモリ効率を考慮し、過去のターンのキャッシュは適切にクリア
- プレイヤーごとに独立したキャッシュを持つ

## 作業対象ファイル:
- ファイル名: src/utils/game-manager.ts
- 改修内容:
  - 受け入れ計算キャッシュシステムを追加（_acceptanceCache, _lastHandStates）
  - generateHandStateKey()メソッドで手牌状態を一意なキーに変換
  - getVisibleTiles()メソッドで見えている牌を取得
  - getCachedAcceptanceInfo()メソッドでキャッシュされた受け入れ情報を取得
  - cleanupOldCache()メソッドで古いキャッシュをクリア
  - clearAcceptanceCache()メソッドでゲーム開始時にキャッシュをクリア
  - startNewGame()メソッドでキャッシュクリアを追加

- ファイル名: src/views/FourPlayerGameView/script.ts
- 改修内容:
  - calculateAcceptanceOptimized()でキャッシュを使用するように修正
  - calculateUsefulTilesInfoOptimized()でキャッシュを優先使用するように修正
  - 同じ牌種の重複計算を避ける最適化を追加

- ファイル名: src/utils/mahjong-logic.ts
- 改修内容:
  - calculateAcceptance()関数で同じ牌種の重複計算を避ける最適化を実装
  - 牌種をキーとしたSet構造で計算済みの牌を記録
  - 同じ牌種は既存の結果をコピーして牌情報のみ更新