# テストツール集

CLAUDE.mdの指示に従って作成したブラウザ自動化テストツール群です。
Playwrightを使用してブラウザを自動操作し、ゲーム機能のテストを行います。

## 📁 ファイル構成

### 基本スクリプト
- `browser_automation_sample.py` - 基本的なブラウザ自動化サンプル
- `game_settings_test.py` - ゲーム設定パネルの統合テスト
- `console_monitor.py` - console.log監視ツール
- `screenshot_tool.py` - 画面スクリーンショット取得ツール
- `element_clicker.py` - 特定要素のクリックテストツール

### 出力ディレクトリ
- `logs/` - console.log監視結果
- `screenshots/` - スクリーンショット保存先

## セットアップ

```bash
cd test
source .venv/bin/activate
pip install playwright
playwright install chromium
```

## 🚀 使用方法

### 1. 開発サーバー起動
```bash
npm run dev
```

### 2. 各ツールの実行

#### ゲーム設定パネルの統合テスト
```bash
python3 game_settings_test.py http://localhost:5173 --headless
```

#### console.log監視（30秒間）
```bash
python3 console_monitor.py http://localhost:5173 --duration 30 --headless
```

#### スクリーンショット撮影（タイマー方式）
```bash
python3 screenshot_tool.py http://localhost:5173 --mode timer --interval 5 --time 30 --headless
```

#### スクリーンショット撮影（アクション方式）
```bash
python3 screenshot_tool.py http://localhost:5173 --mode action --headless
```

#### 要素クリックテスト
```bash
python3 element_clicker.py http://localhost:5173 --headless
```

#### 基本ブラウザ自動化（従来版）
```bash
python3 browser_automation_sample.py http://localhost:5173 --headless
```

## 🛠 各ツールの詳細

### game_settings_test.py
ゲーム設定パネルの機能を包括的にテストします。
- 4人麻雀ページへの遷移
- ゲーム設定パネルの表示確認
- 鳴きなし/自動アガリスイッチの動作確認
- localStorageへの設定保存確認

### console_monitor.py
ブラウザのconsole.logを詳細に監視し、ログファイルに記録します。
- リアルタイムでconsole.logを表示
- ログタイプ別（log, info, warn, error）の色分け表示
- JSON形式での詳細ログ保存

### screenshot_tool.py
画面のスクリーンショットを取得します。
- **timer模式**: 指定間隔での定期撮影
- **action模式**: 特定アクション後の撮影

### element_clicker.py
指定した要素のクリックテストを自動実行します。
- 要素の存在確認
- クリック前後の状態変化検証
- 各ステップのスクリーンショット撮影

## 📊 出力例

### テスト成功時
```
=== ゲーム設定パネル統合テスト開始 ===
1. ページアクセス中...
   ✓ 4人麻雀ページに移動成功
2. ゲーム設定パネルの確認...
   ✓ ゲーム設定パネルが表示されています
3. 鳴きなしスイッチのテスト...
   ✓ 鳴きなしスイッチの動作確認成功
4. 自動アガリスイッチのテスト...
   ✓ 自動アガリスイッチの動作確認成功
5. localStorage設定の確認...
   ✓ 設定がlocalStorageに保存されています

=== テスト結果 ===
成功: 5
失敗: 0

🎉 すべてのテストが成功しました！
```

### console.log監視結果
```
=== Console.log監視開始 ===
[10:30:15.123] LOG: Application started
[10:30:15.456] INFO: Vue app mounted
[10:30:16.789] WARN: Development mode enabled

=== 監視結果 ===
総ログ数: 15
  log: 8件
  info: 4件
  warn: 2件
  error: 1件
```

## 🎯 カスタマイズ

各ツールは設定可能です：

### 独自テストケースの追加
`element_clicker.py`の`test_cases`を編集して、独自のクリックテストを追加できます。

### 監視時間の調整
```bash
python3 console_monitor.py --duration 60  # 60秒間監視
```

### 出力先の指定
```bash
python3 screenshot_tool.py --output custom_screenshots/
```

## 🔧 トラブルシューティング

### Playwrightのインストール問題
```bash
playwright install --force chromium
```

### ポート番号の変更
URLパラメータで指定：
```bash
python3 game_settings_test.py http://localhost:3000
```

### ヘッドレスモードでの実行
`--headless`フラグを追加：
```bash
python3 game_settings_test.py --headless
```

### ブラウザ依存関係の問題
```bash
sudo playwright install-deps
# または
sudo apt-get install libnspr4 libnss3 libasound2t64
```