#!/usr/bin/env python3
"""
テストモックボタンの動作テスト
"""

from playwright.sync_api import sync_playwright
import sys
import time

def test_test_mode_button(url=None, headless=False):
    """
    テストモックボタンの動作をテスト
    """
    if url is None:
        url = "http://localhost:5173"
    
    console_logs = []
    
    def console_handler(msg):
        timestamp = time.strftime('%H:%M:%S')
        log_text = f"[{timestamp}] {msg.type.upper()}: {msg.text}"
        console_logs.append(log_text)
        print(log_text)
    
    with sync_playwright() as p:
        print(f"=== テストモックボタン動作テスト ===")
        print(f"URL: {url}")
        print()
        
        browser = p.chromium.launch(headless=headless, slow_mo=1000)
        
        try:
            page = browser.new_page()
            page.on("console", console_handler)
            page.on("pageerror", lambda error: print(f"[PAGE ERROR] {error}"))
            
            # 4人麻雀ページに移動
            print("4人麻雀ページにアクセス中...")
            page.goto(f"{url}/#/four-player", wait_until="networkidle")
            time.sleep(3)
            print("ページ読み込み完了")
            
            # スクリーンショット撮影
            page.screenshot(path="test/screenshots/before_button_click.png")
            print("初期状態スクリーンショット撮影")
            
            # テストモックボタンを探してクリック
            print("テストモックボタンを探しています...")
            
            try:
                # オレンジのボタンを探す
                button = page.locator('button:has-text("テストモック起動")').first
                if button.is_visible():
                    print("テストモックボタンが見つかりました")
                    button.click()
                    print("ボタンをクリックしました")
                    time.sleep(2)
                    
                    # クリック後のスクリーンショット
                    page.screenshot(path="test/screenshots/after_button_click.png")
                    print("クリック後スクリーンショット撮影")
                    
                else:
                    print("テストモックボタンが見つかりません")
                    
            except Exception as e:
                print(f"ボタンクリックエラー: {e}")
            
            # 5秒間追加で監視
            print("5秒間追加監視中...")
            time.sleep(5)
            
        finally:
            browser.close()
    
    print("\n=== console.log 結果 ===")
    for log in console_logs:
        print(log)
    
    return len(console_logs) > 0

def main():
    url = None
    headless = False
    
    if len(sys.argv) > 1:
        url = sys.argv[1]
    
    if "--headless" in sys.argv:
        headless = True
    
    try:
        success = test_test_mode_button(url, headless)
        if success:
            print("\n✓ テスト完了")
        else:
            print("\n⚠ ログが記録されませんでした")
    except Exception as e:
        print(f"\nエラー: {e}")

if __name__ == "__main__":
    main()