# フリテンチェック最適化

## 作業計画:
1. 現在のフリテンチェック処理の実装箇所を特定
2. あがり判定の流れを分析し、フリテンチェックのタイミングを最適化
3. 先にあがり判定を行い、ロン可能確定後にフリテンチェックを実行するよう変更
4. パフォーマンステストでチェック処理の改善を確認

## 設計思想:
- フリテンチェックは計算コストが高いため、実際にロンが成立する場合のみ実行
- あがり判定（役の成立、シャンテン数確認）を先に行い、早期リターンでパフォーマンス向上
- ゲーム進行が遅くなる問題を解決し、特に河の牌が多い局面での処理速度改善
- ロジックの正確性は保持しつつ、処理順序の最適化を図る

## 作業対象ファイル:
- ファイル名: src/utils/game-manager.ts
- 改修内容:
  - checkWinConditionForPlayer関数: ロン時のフリテンチェックを早期実行から後期実行に変更（764-766行目を794行目に移動）
  - canHumanRon関数: フリテンチェックをあがり判定後に実行するよう変更（922-924行目を952-956行目に移動）
  - 処理順序: シャンテン数チェック → あがり判定 → フリテンチェックの順に最適化