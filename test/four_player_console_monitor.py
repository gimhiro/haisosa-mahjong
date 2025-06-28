#!/usr/bin/env python3
"""
4人麻雀ページ専用console.log監視ツール
game_settings_test.pyとconsole_monitor.pyを参考に作成
"""

from playwright.sync_api import sync_playwright
import sys
import time
import os
from datetime import datetime

def monitor_four_player_console(url=None, monitor_time=30, headless=False, output_file=None):
    """
    4人麻雀ページでconsole.logを監視
    
    Args:
        url: ベースURL
        monitor_time: 監視時間（秒）
        headless: ヘッドレスモードで実行するか
        output_file: 出力ファイル
    """
    if url is None:
        url = "http://localhost:5173"
    
    if output_file is None:
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        os.makedirs("test/logs", exist_ok=True)
        output_file = f"test/logs/four_player_console_{timestamp}.log"
    
    console_logs = []
    log_counts = {"debug": 0, "log": 0, "warn": 0, "error": 0}
    
    def console_handler(msg):
        """console.logメッセージをキャッチして記録"""
        timestamp = datetime.now().strftime('%H:%M:%S.%f')[:-3]
        log_type = msg.type.lower()
        log_text = msg.text
        
        # ログをカウント
        if log_type in log_counts:
            log_counts[log_type] += 1
        else:
            log_counts["log"] += 1
        
        # 色付きで出力
        colors = {
            "debug": "\033[95m",  # マゼンタ
            "log": "",            # デフォルト
            "warn": "\033[93m",   # 黄色
            "error": "\033[91m"   # 赤
        }
        color = colors.get(log_type, "")
        reset = "\033[0m" if color else ""
        
        formatted_log = f"{color}[{timestamp}] {log_type.upper()}: {log_text}{reset}"
        console_logs.append(f"[{timestamp}] {log_type.upper()}: {log_text}")
        print(formatted_log)
    
    with sync_playwright() as p:
        print(f"=== 4人麻雀ページ Console.log監視開始 ===")
        print(f"ベースURL: {url}")
        print(f"監視時間: {monitor_time}秒")
        print(f"出力ファイル: {output_file}")
        print(f"ヘッドレス: {headless}")
        print()
        
        browser = p.chromium.launch(headless=headless, slow_mo=500)
        
        try:
            page = browser.new_page()
            page.on("console", console_handler)
            page.on("pageerror", lambda error: print(f"\033[91m[PAGE ERROR] {error}\033[0m"))
            
            # 4人麻雀ページに直接移動
            print("4人麻雀ページにアクセス中...")
            four_player_url = f"{url}/#/four-player"
            page.goto(four_player_url, wait_until="networkidle", timeout=15000)
            time.sleep(2)
            print("ページ読み込み完了")
            print()
            
            print(f"{monitor_time}秒間console.logを監視中...")
            
            # 指定時間監視
            start_time = time.time()
            while time.time() - start_time < monitor_time:
                time.sleep(0.1)  # 短い間隔で待機
            
        finally:
            browser.close()
    
    # ログをファイルに保存
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(f"=== 4人麻雀ページ Console.log監視結果 ===\n")
        f.write(f"URL: {four_player_url}\n")
        f.write(f"監視時間: {monitor_time}秒\n")
        f.write(f"開始時刻: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"\n=== ログ一覧 ===\n")
        for log in console_logs:
            f.write(f"{log}\n")
    
    # 結果出力
    print()
    print("=== 監視結果 ===")
    total_logs = sum(log_counts.values())
    print(f"総ログ数: {total_logs}")
    for log_type, count in log_counts.items():
        if count > 0:
            print(f"  {log_type}: {count}件")
    print()
    print(f"詳細ログ: {output_file}")
    print()
    print("✓ 監視完了")
    
    return console_logs

def main():
    """メイン関数"""
    url = None
    monitor_time = 30
    headless = False
    output_file = None
    
    i = 1
    while i < len(sys.argv):
        arg = sys.argv[i]
        if arg == "--time" and i + 1 < len(sys.argv):
            monitor_time = int(sys.argv[i + 1])
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
        monitor_four_player_console(url, monitor_time, headless, output_file)
    except KeyboardInterrupt:
        print("\n⚠ ユーザーによって中断されました")
    except Exception as e:
        print(f"\nエラー: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()