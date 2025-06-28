#!/usr/bin/env python3
"""
ゲーム設定パネルの統合テスト
実際のブラウザでゲーム設定の動作を検証
"""

from playwright.sync_api import sync_playwright
import sys
import time
import json

def console_handler(msg):
    """console.logメッセージをキャッチして出力"""
    print(f"[CONSOLE {msg.type.upper()}] {msg.text}")

def test_game_settings_panel(url=None, headless=False):
    """
    ゲーム設定パネルのテストを実行
    
    Args:
        url: 訪問するURL
        headless: ヘッドレスモードで実行するか
    """
    if url is None:
        url = "http://localhost:5173"
    
    test_results = {
        "passed": 0,
        "failed": 0,
        "errors": []
    }
    
    with sync_playwright() as p:
        print(f"=== ゲーム設定パネル統合テスト開始 ===")
        print(f"URL: {url}")
        print(f"ヘッドレス: {headless}")
        
        browser = p.chromium.launch(headless=headless, slow_mo=500)
        
        try:
            page = browser.new_page()
            page.on("console", console_handler)
            page.on("pageerror", lambda error: print(f"[PAGE ERROR] {error}"))
            
            # ページにアクセス
            print("1. ページアクセス中...")
            page.goto(url, wait_until="networkidle", timeout=15000)
            time.sleep(2)
            
            # 4人麻雀ゲームページに移動
            print("2. 4人麻雀ページに移動...")
            try:
                # ページを下にスクロールして、4人麻雀リンクを探す
                page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                time.sleep(1)
                
                # 複数の可能なセレクタを試す
                selectors = [
                    'text=算数 × 3',
                    'text=4人麻雀',
                    'text=四人麻雀',
                    '[href="#/four-player"]',
                    '[href="/four-player"]',
                    'text=Four Player',
                    '.router-link[href*="four"]',
                    '.v-card:has-text("算数")'
                ]
                
                clicked = False
                for selector in selectors:
                    try:
                        link = page.locator(selector).first
                        if link.is_visible():
                            link.click()
                            time.sleep(3)
                            print(f"   ✓ {selector} をクリックして4人麻雀ページに移動成功")
                            clicked = True
                            break
                    except:
                        continue
                
                if clicked:
                    test_results["passed"] += 1
                else:
                    # 直接URLに移動
                    page.goto(f"{url}/#/four-player", wait_until="networkidle")
                    time.sleep(2)
                    print("   ✓ 直接URLで4人麻雀ページに移動")
                    test_results["passed"] += 1
                    
            except Exception as e:
                print(f"   ✗ 4人麻雀ページ移動失敗: {e}")
                test_results["failed"] += 1
                test_results["errors"].append(str(e))
            
            # ゲーム設定パネルの存在確認
            print("3. ゲーム設定パネルの確認...")
            try:
                settings_panel = page.locator('.settings-panel').first
                if settings_panel.is_visible():
                    print("   ✓ ゲーム設定パネルが表示されています")
                    test_results["passed"] += 1
                else:
                    raise Exception("ゲーム設定パネルが見つかりません")
            except Exception as e:
                print(f"   ✗ ゲーム設定パネル確認失敗: {e}")
                test_results["failed"] += 1
                test_results["errors"].append(str(e))
            
            # 鳴きなしスイッチのテスト
            print("4. 鳴きなしスイッチのテスト...")
            try:
                # 鳴きなしラベルを含むスイッチを探す
                # VSwitchのチェックボックスを探す（Vuetifyの構造に合わせる）
                disable_meld_switch = page.locator('.v-switch').filter(has_text='鳴きなし').locator('input[type="checkbox"]').first
                
                # 要素の存在を待つ
                page.wait_for_selector('.settings-panel', timeout=5000)
                if disable_meld_switch.is_visible():
                    # 初期状態を確認
                    initial_checked = disable_meld_switch.is_checked()
                    print(f"   初期状態: {initial_checked}")
                    
                    # クリックして状態を変更
                    disable_meld_switch.click()
                    time.sleep(1)
                    
                    # 状態が変更されたことを確認
                    new_checked = disable_meld_switch.is_checked()
                    if new_checked != initial_checked:
                        print("   ✓ 鳴きなしスイッチの動作確認成功")
                        test_results["passed"] += 1
                    else:
                        raise Exception("スイッチの状態が変更されませんでした")
                else:
                    raise Exception("鳴きなしスイッチが見つかりません")
            except Exception as e:
                print(f"   ✗ 鳴きなしスイッチテスト失敗: {e}")
                test_results["failed"] += 1
                test_results["errors"].append(str(e))
            
            # 自動アガリスイッチのテスト
            print("5. 自動アガリスイッチのテスト...")
            try:
                # 自動アガリラベルを含むスイッチを探す
                auto_win_switch = page.locator('.v-switch').filter(has_text='自動アガリ').locator('input[type="checkbox"]').first
                
                if auto_win_switch.is_visible():
                    # 初期状態を確認
                    initial_checked = auto_win_switch.is_checked()
                    print(f"   初期状態: {initial_checked}")
                    
                    # クリックして状態を変更
                    auto_win_switch.click()
                    time.sleep(1)
                    
                    # 状態が変更されたことを確認
                    new_checked = auto_win_switch.is_checked()
                    if new_checked != initial_checked:
                        print("   ✓ 自動アガリスイッチの動作確認成功")
                        test_results["passed"] += 1
                    else:
                        raise Exception("スイッチの状態が変更されませんでした")
                else:
                    raise Exception("自動アガリスイッチが見つかりません")
            except Exception as e:
                print(f"   ✗ 自動アガリスイッチテスト失敗: {e}")
                test_results["failed"] += 1
                test_results["errors"].append(str(e))
            
            # localStorageの確認
            print("6. localStorage設定の確認...")
            try:
                # 設定を変更した後、localStorageに保存されているか確認
                storage_data = page.evaluate("() => localStorage.getItem('mahjong-game-settings')")
                if storage_data:
                    settings_obj = json.loads(storage_data)
                    print(f"   localStorage設定: {settings_obj}")
                    print("   ✓ 設定がlocalStorageに保存されています")
                    test_results["passed"] += 1
                else:
                    raise Exception("localStorageに設定が保存されていません")
            except Exception as e:
                print(f"   ✗ localStorage確認失敗: {e}")
                test_results["failed"] += 1
                test_results["errors"].append(str(e))
            
            # スクリーンショット撮影
            screenshot_path = "test/screenshots/game_settings_test.png"
            page.screenshot(path=screenshot_path)
            print(f"7. スクリーンショット保存: {screenshot_path}")
            
        finally:
            browser.close()
    
    # テスト結果の出力
    print("\n=== テスト結果 ===")
    print(f"成功: {test_results['passed']}")
    print(f"失敗: {test_results['failed']}")
    if test_results['errors']:
        print("エラー詳細:")
        for i, error in enumerate(test_results['errors'], 1):
            print(f"  {i}. {error}")
    
    return test_results['failed'] == 0

def main():
    """メイン関数"""
    url = None
    headless = False
    
    if len(sys.argv) > 1:
        url = sys.argv[1]
    
    if "--headless" in sys.argv:
        headless = True
    
    try:
        success = test_game_settings_panel(url, headless)
        if success:
            print("\n🎉 すべてのテストが成功しました！")
            sys.exit(0)
        else:
            print("\n❌ テストが失敗しました")
            sys.exit(1)
    except Exception as e:
        print(f"テスト実行エラー: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()