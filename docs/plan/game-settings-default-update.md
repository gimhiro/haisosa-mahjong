# ゲーム設定デフォルト値更新

## 作業計画:
- ゲーム設定パネルの初期受け入れ表示と受け入れハイライトのデフォルト値をtrueに変更

## 設計思想:
- 新規ユーザーがゲームを開始した際に、受け入れ表示機能を最初から体験できるようにする
- 受け入れ表示は麻雀の学習に役立つ機能であるため、デフォルトで有効にすることでユーザー体験を向上させる

## 作業対象ファイル:
- ファイル名: src/utils/useGameSettings.ts
- 改修内容: 
  - defaultSettingsのshowAcceptanceをfalseからtrueに変更
  - defaultSettingsのshowAcceptanceHighlightをfalseからtrueに変更
  - 既存のlocalStorageからの読み込み時のデフォルト値もtrueに変更