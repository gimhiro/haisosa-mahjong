#!/usr/bin/env python3
"""
画面スクリーンショット取得ツール
特定の操作後やタイマーベースでスクリーンショットを取得
"""

from playwright.sync_api import sync_playwright
import sys
import time
import os
from datetime import datetime

def take_screenshots(url=None, interval=5, total_time=30, headless=False, output_dir=None):
    """
    定期的にスクリーンショットを撮影
    
    Args:
        url: 撮影するURL
        interval: スクリーンショット間隔（秒）
        total_time: 総撮影時間（秒）
        headless: ヘッドレスモードで実行するか
        output_dir: 出力ディレクトリ
    """
    if url is None:
        url = "http://localhost:5173"
    
    if output_dir is None:
        output_dir = f"test/screenshots/{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    
    # 出力ディレクトリを作成
    os.makedirs(output_dir, exist_ok=True)
    
    screenshots = []
    
    with sync_playwright() as p:
        print(f"=== スクリーンショット撮影開始 ===")
        print(f"URL: {url}")
        print(f"撮影間隔: {interval}秒")
        print(f"総撮影時間: {total_time}秒")
        print(f"出力ディレクトリ: {output_dir}")
        print(f"ヘッドレス: {headless}")
        print()
        
        browser = p.chromium.launch(headless=headless)
        
        try:
            page = browser.new_page()
            
            # ページにアクセス
            print("ページにアクセス中...")
            page.goto(url, wait_until="networkidle", timeout=15000)
            print("ページ読み込み完了")
            
            # 初回スクリーンショット
            timestamp = datetime.now().strftime('%H%M%S')
            screenshot_path = f"{output_dir}/screenshot_{timestamp}_initial.png"
            page.screenshot(path=screenshot_path, full_page=True)
            screenshots.append(screenshot_path)
            print(f"✓ 初回スクリーンショット: {screenshot_path}")
            
            # 定期撮影
            start_time = time.time()
            shot_count = 1
            
            while time.time() - start_time < total_time:
                time.sleep(interval)
                
                timestamp = datetime.now().strftime('%H%M%S')
                screenshot_path = f"{output_dir}/screenshot_{timestamp}_{shot_count:03d}.png"
                page.screenshot(path=screenshot_path, full_page=True)
                screenshots.append(screenshot_path)
                
                elapsed = int(time.time() - start_time)
                print(f"✓ スクリーンショット {shot_count}: {screenshot_path} (経過: {elapsed}s)")
                shot_count += 1
            
        finally:
            browser.close()
    
    print(f"\n=== 撮影完了 ===")
    print(f"総撮影枚数: {len(screenshots)}")
    print(f"保存先: {output_dir}")
    
    return screenshots

def take_action_screenshots(url=None, actions=None, headless=False, output_dir=None):
    """
    特定のアクション後にスクリーンショットを撮影
    
    Args:
        url: 撮影するURL
        actions: 実行するアクションのリスト
        headless: ヘッドレスモードで実行するか
        output_dir: 出力ディレクトリ
    """
    if url is None:
        url = "http://localhost:5173"
    
    if output_dir is None:
        output_dir = f"test/screenshots/actions_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    
    if actions is None:
        # デフォルトのアクション
        actions = [
            {"name": "ホーム画面", "selector": None, "wait": 2},
            {"name": "4人麻雀クリック", "selector": "text=4人麻雀", "wait": 3},
            {"name": "ゲーム開始ボタン", "selector": "text=ゲーム開始", "wait": 2},
            {"name": "設定パネル確認", "selector": ".settings-panel", "wait": 1}
        ]
    
    # 出力ディレクトリを作成
    os.makedirs(output_dir, exist_ok=True)
    
    screenshots = []
    
    with sync_playwright() as p:
        print(f"=== アクション別スクリーンショット撮影開始 ===")
        print(f"URL: {url}")
        print(f"アクション数: {len(actions)}")
        print(f"出力ディレクトリ: {output_dir}")
        print()
        
        browser = p.chromium.launch(headless=headless, slow_mo=1000)
        
        try:
            page = browser.new_page()
            
            # ページにアクセス
            print("ページにアクセス中...")
            page.goto(url, wait_until="networkidle", timeout=15000)
            print("ページ読み込み完了\n")
            
            for i, action in enumerate(actions):
                action_name = action["name"]
                selector = action.get("selector")
                wait_time = action.get("wait", 1)
                
                print(f"{i+1}. {action_name}")
                
                try:
                    if selector:
                        # 要素を探してクリック
                        element = page.locator(selector).first
                        try:
                            page.wait_for_selector(selector, timeout=5000)
                            if element.is_visible():
                                element.click()
                                print(f"   ✓ {selector} をクリック")
                            else:
                                print(f"   ⚠ {selector} が見つかりません")
                        except:
                            print(f"   ⚠ {selector} が見つかりません（タイムアウト）")
                    
                    # 待機
                    time.sleep(wait_time)
                    
                    # スクリーンショット撮影
                    safe_name = action_name.replace(" ", "_").replace("：", "_")
                    screenshot_path = f"{output_dir}/{i+1:02d}_{safe_name}.png"
                    page.screenshot(path=screenshot_path, full_page=True)
                    screenshots.append(screenshot_path)
                    print(f"   📸 スクリーンショット: {screenshot_path}")
                    
                except Exception as e:
                    print(f"   ✗ エラー: {e}")
                
                print()
            
        finally:
            browser.close()
    
    print(f"=== 撮影完了 ===")
    print(f"総撮影枚数: {len(screenshots)}")
    print(f"保存先: {output_dir}")
    
    return screenshots

def main():
    """メイン関数"""
    url = None
    mode = "timer"  # timer または action
    interval = 5
    total_time = 30
    headless = False
    output_dir = None
    
    i = 1
    while i < len(sys.argv):
        arg = sys.argv[i]
        if arg == "--mode" and i + 1 < len(sys.argv):
            mode = sys.argv[i + 1]
            i += 2
        elif arg == "--interval" and i + 1 < len(sys.argv):
            interval = int(sys.argv[i + 1])
            i += 2
        elif arg == "--time" and i + 1 < len(sys.argv):
            total_time = int(sys.argv[i + 1])
            i += 2
        elif arg == "--output" and i + 1 < len(sys.argv):
            output_dir = sys.argv[i + 1]
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
        if mode == "timer":
            screenshots = take_screenshots(url, interval, total_time, headless, output_dir)
        elif mode == "action":
            screenshots = take_action_screenshots(url, None, headless, output_dir)
        else:
            print(f"不正なモード: {mode}")
            print("使用可能なモード: timer, action")
            sys.exit(1)
        
        print(f"\n✓ 撮影完了: {len(screenshots)}枚")
        
    except KeyboardInterrupt:
        print("\n⚠ ユーザーによって中断されました")
    except Exception as e:
        print(f"\nエラー: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()