# Console.logの削除とバージョン履歴更新

## 作業計画:

1. **Console.logの削除**
   - 全ファイルからconsole.logを削除
   - パフォーマンス測定用の不要な変数も削除
   - TypeScript警告の解消

2. **バージョン履歴の更新**
   - HomeViewのバージョン履歴にv1.2.0を追加
   - 清一色モードと受け入れ計算軽量化の機能を記載

## 設計思想:

- **コードの整理**: デバッグ用のログを完全に削除し、本番環境用のクリーンなコードにする
- **ユーザーへの情報提供**: バージョン履歴でユーザーに新機能を分かりやすく伝える
- **TypeScript準拠**: 使用されていない変数を削除してコード品質を向上

## 作業対象ファイル:

### src/views/FourPlayerGameView/script.ts
- 改修内容: 全console.logステートメント（56個）を削除。使用されないperformance.now()変数も削除

### src/utils/mahjong-logic.ts
- 改修内容: console.log/console.errorステートメント（6個）を削除。パフォーマンス測定用変数も削除

### src/utils/game-manager.ts
- 改修内容: console.log/console.errorステートメント（14個）を削除。受け入れ計算キャッシュ関連のデバッグログも削除

### src/components/AcceptancePopup.vue
- 改修内容: console.logステートメント（4個）を削除。使用されないnewValueパラメータも削除

### src/components/MahjongTile.vue
- 改修内容: handleMouseEnter関数のconsole.logを削除

### src/components/PlayerArea.vue
- 改修内容: onTileHover関数のconsole.logを削除

### src/views/HomeView/index.vue
- 改修内容: バージョン履歴にv1.2.0を追加。清一色モードの実装と受け入れ計算軽量化を記載

## 最終的な実装内容:

全ての主要ファイルからconsole.logを削除し、コードの品質を向上させました。同時にバージョン履歴を更新してユーザーに新機能を告知しました。