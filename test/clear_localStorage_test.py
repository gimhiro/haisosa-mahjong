#!/usr/bin/env python3
"""
localStorageをクリアして新しい設定で動作テスト
"""

from playwright.sync_api import sync_playwright
import sys
import time

def clear_localStorage_and_test(url=None, headless=False):
    """
    localStorageをクリアして新しい設定で動作テスト
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
        print(f"=== localStorage クリア & 動作テスト ===")
        print(f"URL: {url}")
        print()
        
        browser = p.chromium.launch(headless=headless, slow_mo=1000)
        
        try:
            page = browser.new_page()
            page.on("console", console_handler)
            page.on("pageerror", lambda error: print(f"[PAGE ERROR] {error}"))
            
            # まずページにアクセス
            print("ページにアクセス中...")
            page.goto(f"{url}/#/four-player", wait_until="networkidle")
            time.sleep(2)
            print("ページ読み込み完了")
            
            # localStorageをクリア
            print("localStorageをクリア中...")
            page.evaluate("localStorage.clear()")
            print("localStorageクリア完了")
            
            # ページをリロード
            print("ページをリロード中...")
            page.reload(wait_until="networkidle")
            time.sleep(3)
            print("リロード完了")
            
            # スクリーンショット撮影
            page.screenshot(path="test/screenshots/after_localStorage_clear.png")
            print("スクリーンショット撮影完了")
            
            # テストモックボタンをテスト
            print("テストモックボタンをテスト中...")
            try:
                button = page.locator('v-btn:has-text("テストモック起動"), button:has-text("テストモック起動")').first
                if button.is_visible():
                    print("✓ テストモックボタンが表示されています")
                    button.click()
                    print("✓ ボタンをクリックしました")
                    time.sleep(2)
                else:
                    print("⚠ テストモックボタンが見つかりません")
            except Exception as e:
                print(f"⚠ ボタンテストエラー: {e}")
            
            # 5秒間追加監視
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
        success = clear_localStorage_and_test(url, headless)
        if success:
            print("\n✓ テスト完了")
        else:
            print("\n⚠ ログが記録されませんでした")
    except Exception as e:
        print(f"\nエラー: {e}")

if __name__ == "__main__":
    main()