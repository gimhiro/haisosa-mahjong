# ハイテイツモ機能実装

## 作業計画
- ハイテイ（最後の牌）判定ロジックをGameManagerに実装
- 得点計算システムでハイテイツモを認識するよう修正
- 役名マッピングに「海底摸月」を追加
- ハイテイツモのテストケースを作成

## 設計思想
- ハイテイ判定はwallRemainingが0の時とする
- riichi-rs-bundlerのlast_tileオプションを活用
- 「海底摸月」として正式な役名で表示

## 作業対象ファイル
- ファイル名: src/utils/game-manager.ts
- 改修内容: isHaitei()メソッドを追加し、牌山残り0枚でハイテイ判定

- ファイル名: src/utils/mahjong-logic.ts  
- 改修内容: checkWinCondition関数にisHaiteiパラメータを追加し、フォールバック時のハイテイツモ判定を実装

- ファイル名: src/utils/scoring.ts
- 改修内容: ScoringInputインターフェースにisHaitei?フィールドを追加し、riichi-rs-bundlerのlast_tileオプションに渡す

- ファイル名: src/types/records.ts
- 改修内容: 「海底摸月」(haiteiMoyue)を役名マッピングに追加

- ファイル名: test/yaku_test_4_haitei.py
- 改修内容: ハイテイツモのテストケースを作成。111m 111p 111s 789m 9p → 9pを最後の牌でツモして海底摸月を確認