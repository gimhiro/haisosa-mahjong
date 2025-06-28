#!/usr/bin/env python3
"""
console.log監視ツール
ブラウザのconsole.logを詳細に監視し、ファイルに記録
"""

from playwright.sync_api import sync_playwright
import sys
import time
import json
from datetime import datetime
import os

class ConsoleMonitor:
    def __init__(self, output_file=None):
        self.logs = []
        self.output_file = output_file or f"test/logs/console_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"
        
        # ログディレクトリを作成
        os.makedirs(os.path.dirname(self.output_file), exist_ok=True)
        
    def console_handler(self, msg):
        """console.logメッセージをキャッチして記録"""
        timestamp = datetime.now().strftime('%H:%M:%S.%f')[:-3]
        log_entry = {
            "timestamp": timestamp,
            "type": msg.type,
            "text": msg.text,
            "location": msg.location if hasattr(msg, 'location') else None
        }
        
        self.logs.append(log_entry)
        
        # リアルタイム出力
        color_code = {
            "log": "",
            "info": "\033[94m",  # 青
            "warn": "\033[93m",  # 黄
            "error": "\033[91m", # 赤
            "debug": "\033[95m"  # マゼンタ
        }.get(msg.type, "")
        reset_code = "\033[0m" if color_code else ""
        
        print(f"{color_code}[{timestamp}] {msg.type.upper()}: {msg.text}{reset_code}")
        
        # ファイルに即座に書き込み
        self.save_to_file()
    
    def save_to_file(self):
        """ログをファイルに保存"""
        try:
            with open(self.output_file, 'w', encoding='utf-8') as f:
                json.dump(self.logs, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"ログファイル保存エラー: {e}")

def monitor_console(url=None, duration=30, headless=False, output_file=None):
    """
    console.logを監視
    
    Args:
        url: 監視するURL
        duration: 監視時間（秒）
        headless: ヘッドレスモードで実行するか
        output_file: 出力ファイルパス
    """
    if url is None:
        url = "http://localhost:5173"
    
    monitor = ConsoleMonitor(output_file)
    
    with sync_playwright() as p:
        print(f"=== Console.log監視開始 ===")
        print(f"URL: {url}")
        print(f"監視時間: {duration}秒")
        print(f"出力ファイル: {monitor.output_file}")
        print(f"ヘッドレス: {headless}")
        print()
        
        browser = p.chromium.launch(headless=headless)
        
        try:
            page = browser.new_page()
            
            # console.logとエラーを監視
            page.on("console", monitor.console_handler)
            page.on("pageerror", lambda error: print(f"[PAGE ERROR] {error}"))
            
            # ページにアクセス
            print("ページにアクセス中...")
            page.goto(url, wait_until="networkidle", timeout=15000)
            print("ページ読み込み完了\n")
            
            # 指定時間待機
            print(f"{duration}秒間console.logを監視中...")
            time.sleep(duration)
            
        finally:
            browser.close()
    
    # 監視結果のサマリー
    print(f"\n=== 監視結果 ===")
    print(f"総ログ数: {len(monitor.logs)}")
    
    # ログタイプ別の集計
    type_counts = {}
    for log in monitor.logs:
        log_type = log['type']
        type_counts[log_type] = type_counts.get(log_type, 0) + 1
    
    for log_type, count in type_counts.items():
        print(f"  {log_type}: {count}件")
    
    print(f"\n詳細ログ: {monitor.output_file}")
    
    return monitor.logs

def main():
    """メイン関数"""
    url = None
    duration = 30
    headless = False
    output_file = None
    
    i = 1
    while i < len(sys.argv):
        arg = sys.argv[i]
        if arg == "--duration" and i + 1 < len(sys.argv):
            duration = int(sys.argv[i + 1])
            i += 2
        elif arg == "--output" and i + 1 < len(sys.argv):
            output_file = sys.argv[i + 1]
            i += 2
        elif arg == "--headless":
            headless = True
            i += 1
        elif not url:
            url = arg
            i += 1
        else:
            i += 1
    
    try:
        monitor_console(url, duration, headless, output_file)
        print("\n✓ 監視完了")
    except KeyboardInterrupt:
        print("\n⚠ ユーザーによって中断されました")
    except Exception as e:
        print(f"\nエラー: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()