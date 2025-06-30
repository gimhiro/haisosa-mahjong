# テストツール集

CLAUDE.mdの指示に従って作成したブラウザ自動化テストツール群です。
Playwrightを使用してブラウザを自動操作し、ゲーム機能のテストを行います。

## ファイル構成

### 麻雀機能テスト
- `kan_test.py` - カン機能統合テスト（1pツモ→1m暗カン→カンドラ確認→リンシャンツモ上がり）
- `yaku_test_1_chinitsu.py` - 清一色・リャンペーコー役テスト（配牌即リーチ→一発ツモ）
- `yaku_test_2_sankantsu.py` - 三槓子・三暗刻・小三元役テスト（白ミンカン→2回連続暗槓→リンシャンツモ）
- `yaku_test_4_haitei.py` - ハイテイツモ・純チャン・三色同刻テスト（牌山最後でのツモ上がり）
- `all_meld_test.py` - 全鳴き機能テスト（ポン・チー・カン等の複合テスト）
- `meld_view_test.py` - 鳴きエリア表示テスト
- `wall_count_test.py` - 牌山カウント機能テスト

### 基本ツール
- `screenshot_tool.py` - 画面スクリーンショット取得ツール

### 出力ディレクトリ
- `logs/` - テスト結果とログ
- `screenshots/` - スクリーンショット保存先

## セットアップ

```bash
cd test
source .venv/bin/activate
pip install playwright
playwright install chromium
```

## 使用方法

### 1. 開発サーバー起動
```bash
npm run dev
```

### 2. 各テストの実行

#### カン機能統合テスト
```bash
python3 kan_test.py http://localhost:5173 --headless
```

#### 清一色・リャンペーコー役テスト
```bash
python3 yaku_test_1_chinitsu.py http://localhost:5173 --headless
```

#### 三槓子・三暗刻・小三元役テスト
```bash
python3 yaku_test_2_sankantsu.py http://localhost:5173 --headless
```

#### ハイテイツモ関連役テスト
```bash
python3 yaku_test_4_haitei.py http://localhost:5173 --headless
```

#### 全鳴き機能テスト
```bash
python3 all_meld_test.py http://localhost:5173 --headless
```

#### 鳴きエリア表示テスト
```bash
python3 meld_view_test.py http://localhost:5173 --headless
```

#### 牌山カウント機能テスト
```bash
python3 wall_count_test.py http://localhost:5173 --headless
```

#### スクリーンショット撮影
```bash
python3 screenshot_tool.py http://localhost:5173 --mode timer --interval 5 --time 30 --headless
```

## 各テストの詳細

### kan_test.py
カン機能の総合テストを実行します。
- 1pツモ → 1m暗カン実行
- カン新ドラ追加確認
- リンシャン牌で9pツモ（嶺上開花）
- Win Modal確認
- 次の局へボタンクリック

### yaku_test_1_chinitsu.py
清一色・リャンペーコー役のテストを実行します。
- 手牌: 234p 234p 567p 567p 88p（ピンズのみ）
- 期待役: ダブルリーチ/リーチ/一発/ツモ/タンヤオ/清一色/リャンペーコー
- 条件: 東家で配牌即リーチ → 一発ツモ

### yaku_test_2_sankantsu.py
三槓子・三暗刻・小三元役のテストを実行します。
- 手牌: 白白白 發發發 東東東 111m 中
- 期待役: 三槓子・三暗刻・対々和・小三元・混老頭・役牌（東＋三元）・嶺上開花
- 条件: 白ミンカン→2回連続暗槓→リンシャンツモ

### yaku_test_4_haitei.py
ハイテイツモ・純チャン・三色同刻役のテストを実行します。
- 牌山最後でのツモ上がりを検証
- ハイテイツモ役の確認

### all_meld_test.py
全ての鳴き機能を包括的にテストします。
- ポン・チー・カンの動作確認
- 複数鳴きの組み合わせテスト

### meld_view_test.py
鳴きエリアの表示機能をテストします。
- 鳴き牌の正しい表示確認
- レイアウトの検証

### wall_count_test.py
牌山のカウント機能をテストします。
- 残り牌数の正確性確認
- カン時の牌山減少確認

### screenshot_tool.py
画面のスクリーンショットを取得します。
- **timer模式**: 指定間隔での定期撮影
- **action模式**: 特定アクション後の撮影

## テスト実行例

### 成功時の出力
```
カン機能統合テスト開始: http://localhost:5173
カン機能統合テストを開始...
テストモード開始完了
1筒を捨てます...
1筒打牌完了
1萬暗カンを実行...
暗カン完了
リンシャンツモ（9筒）を実行...
ツモボタンが表示されました！
Win Modalが表示されました
テスト成功: カン機能が正常に動作しました
テスト完了
```

### 役確認の出力例
```
Win Modal内の役を確認...
表示された役数: 57
  役1: 三槓子2翻対々和2翻混老頭2翻小三元2翻三暗刻2翻嶺上開花1翻場風 東1翻自風 東1翻白1翻
期待される役との照合:
  三槓子: 発見
  三暗刻: 発見
  対々和: 発見
  小三元: 発見
  東: 発見
  白: 発見
  嶺上開花: 発見
獲得点数: 16000 all
合計翻数: 17翻 120符
```

## カスタマイズ

### テスト条件の変更
各テストファイル内の手牌設定やツモ牌設定を編集することで、独自のテストケースを作成できます。

### 監視時間の調整
```bash
python3 yaku_test_1_chinitsu.py --duration 60  # 60秒間監視
```

### 出力先の指定
```bash
python3 screenshot_tool.py --output custom_screenshots/
```

## トラブルシューティング

### Playwrightのインストール問題
```bash
playwright install --force chromium
```

### ポート番号の変更
URLパラメータで指定：
```bash
python3 kan_test.py http://localhost:3000
```

### ヘッドレスモードでの実行
`--headless`フラグを追加：
```bash
python3 kan_test.py --headless
```

### ブラウザ依存関係の問題
```bash
sudo playwright install-deps
# または
sudo apt-get install libnspr4 libnss3 libasound2t64
```

## 備考

- WSL環境では自動的にヘッドレスモードで実行されます
- 各テストは独立して実行でき、並列実行も可能です
- テスト結果はコンソール出力とログファイルに記録されます
- スクリーンショットは自動的に`screenshots/`ディレクトリに保存されます