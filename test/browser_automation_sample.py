#!/usr/bin/env python3
"""
ブラウザ操作スクリプト
Playwrightを使用してブラウザを自動操作し、ボタンクリックやconsole.logを監視
"""

from playwright.sync_api import sync_playwright
import sys
import time

def console_handler(msg):
    """console.logメッセージをキャッチして出力"""
    print(f"[CONSOLE {msg.type.upper()}] {msg.text}")

def run_browser_automation(url=None, headless=False):
    """
    ブラウザ自動操作を実行
    
    Args:
        url: 訪問するURL（デフォルトはローカルサーバー）
        headless: ヘッドレスモードで実行するか
    """
    if url is None:
        url = "http://localhost:5173"  # Viteデフォルトポート
    
    with sync_playwright() as p:
        print(f"ブラウザを起動中... (headless={headless})")
        
        # ブラウザを起動
        browser = p.chromium.launch(
            headless=headless,
            slow_mo=300  # 動作を見やすくするために300ms遅延
        )
        
        try:
            # 新しいページを作成
            page = browser.new_page()
            
            # console.logを監視
            page.on("console", console_handler)
            
            # エラーも監視
            page.on("pageerror", lambda error: print(f"[PAGE ERROR] {error}"))
            
            print(f"URLにアクセス中: {url}")
            
            # ページにアクセス
            try:
                page.goto(url, wait_until="networkidle", timeout=10000)
                print("ページの読み込み完了")
            except Exception as e:
                print(f"ページアクセスエラー: {e}")
                return
            
            # ページタイトルを表示
            title = page.title()
            print(f"ページタイトル: {title}")
            
            # 3秒待機（console.logの確認）
            print("3秒間待機してconsole.logを監視...")
            time.sleep(3)
            
            # 主要なボタン要素を探してクリック
            button_selectors = [
                'button',
                '[role="button"]',
                'input[type="button"]',
                'input[type="submit"]',
                '.btn',
                '.button'
            ]
            
            print("ボタン要素を検索中...")
            for selector in button_selectors:
                buttons = page.query_selector_all(selector)
                if buttons:
                    print(f"{len(buttons)}個のボタンが見つかりました ({selector})")
                    
                    # 最初のボタンをクリック
                    if len(buttons) > 0:
                        button = buttons[0]
                        try:
                            # ボタンのテキストを取得
                            button_text = button.inner_text() or button.get_attribute('value') or "テキストなし"
                            print(f"ボタンをクリック中: '{button_text}'")
                            
                            button.click()
                            print("ボタンクリック完了")
                            
                            # クリック後の変化を待機
                            time.sleep(2)
                            break
                            
                        except Exception as e:
                            print(f"ボタンクリックエラー: {e}")
                            continue
            
            # 最終的にさらに3秒待機
            print("追加で3秒間待機...")
            time.sleep(3)
            
            # ページのスクリーンショットを撮影
            screenshot_path = "screenshot.png"
            page.screenshot(path=screenshot_path)
            print(f"スクリーンショットを保存: {screenshot_path}")
            
        finally:
            browser.close()
            print("ブラウザを終了")

def main():
    """メイン関数"""
    print("=== ブラウザ自動操作スクリプト ===")
    
    # コマンドライン引数の処理
    url = None
    headless = False
    
    if len(sys.argv) > 1:
        url = sys.argv[1]
    
    if "--headless" in sys.argv:
        headless = True
    
    print(f"設定:")
    print(f"  URL: {url or 'http://localhost:5173 (デフォルト)'}")
    print(f"  ヘッドレス: {headless}")
    print()
    
    try:
        run_browser_automation(url, headless)
        print("スクリプト実行完了")
    except Exception as e:
        print(f"エラーが発生しました: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()