# 特殊モード（清一色モード）の追加

## 作業計画:
1. GameSettingsインターフェースに特殊モード設定を追加
2. HomeViewのゲーム設定セクションに特殊モードのアコーディオンを追加
3. GameManagerに清一色モード用のロジックを実装
4. 配牌とツモ処理で清一色モードを考慮した処理を追加

## 設計思想:
- 特殊モードは通常のゲームプレイに変化を加える機能として実装
- 清一色モードでは、配牌とツモで特定の一色（萬子、筒子、索子）のみが出現
- 字牌は含まれない
- どの色になるかはゲーム開始時にランダムに決定
- 既存のゲームロジックへの影響を最小限に抑える設計

## 作業対象ファイル:
- ファイル名: src/utils/useGameSettings.ts
- 改修内容: 
  - GameSettingsインターフェースにspecialMode: { chinitsuMode: boolean }を追加
  - defaultSettingsに清一色モードのデフォルト値（false）を追加
  - マイグレーション処理に清一色モード設定を追加

- ファイル名: src/views/HomeView/index.vue
- 改修内容:
  - 特殊モード設定のアコーディオンセクションを追加
  - 清一色モードのON/OFFスイッチを実装
  - sectionExpanded.specialを追加

- ファイル名: src/views/HomeView/script.ts
- 改修内容:
  - gameSettingsにspecialMode設定を追加
  - sectionExpandedにspecialフラグを追加
  - startFourPlayerGame関数で清一色モード設定をlocalStorageに保存

- ファイル名: src/views/HomeView/styles.css
- 改修内容:
  - 特殊モード用のCSSスタイルを追加（.special-mode-grid, .special-mode-card等）

- ファイル名: src/utils/game-manager.ts
- 改修内容:
  - _gameSettingsに specialMode を追加
  - _chinitsuSuit プロパティを追加
  - generateWall()メソッドで清一色モード対応
  - loadGameSettings()メソッドで特殊モード設定を読み込み
  - startNewGame()で清一色モードの色をリセット
  - updateManipulationRate()で設定を再読み込み

- ファイル名: docs/plan/special-mode-chinitsu.md
- 改修内容:
  - 特殊モード実装の作業計画・設計思想・作業記録を作成

- ファイル名: src/utils/game-manager.ts
- 改修内容:
  - dealPlayerHand()メソッドで清一色モードの適用を人間プレイヤー（playerIndex === 0）のみに制限
  - selectBestHand()メソッドにisHumanPlayerパラメータを追加し、人間プレイヤーのみに清一色モードを適用
  - drawTileInternal()メソッドで清一色モードのツモ牌も人間プレイヤーのみに制限
  - デバッグ用のconsole.logを削除
  - generateWall()メソッドで清一色モードでも全色の牌を生成するように修正（CPUプレイヤーが一色になる問題を解決）
  - 人間プレイヤーの配牌確率を100%に修正（通常配牌・候補選択配牌ともに）
  - drawTileInternal()メソッドで清一色モードのツモ牌が確実に配布されるように修正