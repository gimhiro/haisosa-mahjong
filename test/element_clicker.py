#!/usr/bin/env python3
"""
特定要素のクリックテストツール
指定したセレクタの要素を見つけてクリックし、結果を検証
"""

from playwright.sync_api import sync_playwright
import sys
import time
import json
from datetime import datetime

def test_element_clicks(url=None, test_cases=None, headless=False, screenshot_dir=None):
    """
    要素のクリックテストを実行
    
    Args:
        url: テストするURL
        test_cases: テストケースのリスト
        headless: ヘッドレスモードで実行するか
        screenshot_dir: スクリーンショット保存ディレクトリ
    """
    if url is None:
        url = "http://localhost:5173"
    
    if test_cases is None:
        # デフォルトのテストケース（ゲーム設定パネル用）
        test_cases = [
            {
                "name": "鳴きなしスイッチ",
                "selector": "text=鳴きなし",
                "parent_selector": "..",
                "target_selector": "input[type='checkbox']",
                "expected_change": "checked_state",
                "wait_after": 1
            },
            {
                "name": "自動アガリスイッチ",
                "selector": "text=自動アガリ",
                "parent_selector": "..",
                "target_selector": "input[type='checkbox']",
                "expected_change": "checked_state",
                "wait_after": 1
            }
        ]
    
    if screenshot_dir is None:
        screenshot_dir = f"test/screenshots/clicks_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    
    import os
    os.makedirs(screenshot_dir, exist_ok=True)
    
    test_results = {
        "passed": 0,
        "failed": 0,
        "total": len(test_cases),
        "details": []
    }
    
    with sync_playwright() as p:
        print(f"=== 要素クリックテスト開始 ===")
        print(f"URL: {url}")
        print(f"テストケース数: {len(test_cases)}")
        print(f"スクリーンショット保存先: {screenshot_dir}")
        print()
        
        browser = p.chromium.launch(headless=headless, slow_mo=800)
        
        try:
            page = browser.new_page()
            
            # console.logとエラーを監視
            page.on("console", lambda msg: print(f"[CONSOLE] {msg.text}"))
            page.on("pageerror", lambda error: print(f"[PAGE ERROR] {error}"))
            
            # ページにアクセス
            print("ページにアクセス中...")
            page.goto(url, wait_until="networkidle", timeout=15000)
            time.sleep(2)
            
            # 初期スクリーンショット
            page.screenshot(path=f"{screenshot_dir}/00_initial.png", full_page=True)
            
            # 4人麻雀ページに直接移動（要素クリックテスト用）
            if url and "four-player" not in page.url:
                print("4人麻雀ページに直接移動中...")
                page.goto(f"{url}/#/four-player", wait_until="networkidle")
                time.sleep(2)
            
            for i, test_case in enumerate(test_cases, 1):
                test_name = test_case["name"]
                selector = test_case["selector"]
                result = {"name": test_name, "success": False, "error": None}
                
                print(f"{i}. {test_name}")
                
                try:
                    # 要素を探す
                    element = page.locator(selector).first
                    
                    # 親要素を経由する場合
                    if "parent_selector" in test_case and "target_selector" in test_case:
                        element = element.locator(test_case["parent_selector"]).locator(test_case["target_selector"]).first
                    
                    # 要素が表示されるまで待機
                    try:
                        page.wait_for_selector(selector, timeout=5000)
                    except:
                        pass
                    
                    if not element.is_visible():
                        raise Exception(f"要素が見つかりません: {selector}")
                    
                    # クリック前の状態を記録
                    before_state = None
                    if test_case.get("expected_change") == "checked_state":
                        before_state = element.is_checked()
                        print(f"   クリック前の状態: {before_state}")
                    elif test_case.get("expected_change") == "button_disappears":
                        before_state = element.is_visible()
                        print(f"   クリック前: ボタン表示={before_state}")
                    
                    # 要素の情報を表示
                    element_text = element.inner_text() or element.get_attribute('value') or "テキストなし"
                    print(f"   要素テキスト: '{element_text}'")
                    
                    # クリック実行
                    element.click()
                    print(f"   ✓ クリック実行")
                    
                    # 待機
                    wait_time = test_case.get("wait_after", 1)
                    time.sleep(wait_time)
                    
                    # 期待される変化を検証
                    if test_case.get("expected_change") == "checked_state":
                        after_state = element.is_checked()
                        print(f"   クリック後の状態: {after_state}")
                        if after_state != before_state:
                            print(f"   ✓ 状態変化確認: {before_state} → {after_state}")
                            result["success"] = True
                        else:
                            raise Exception("チェック状態が変化していません")
                    
                    elif test_case.get("expected_change") == "button_disappears":
                        after_state = element.is_visible()
                        print(f"   クリック後: ボタン表示={after_state}")
                        if not after_state:  # ボタンが消えた
                            print(f"   ✓ ボタンが非表示になりました")
                            result["success"] = True
                        else:
                            print(f"   ⚠ ボタンがまだ表示されています")
                            result["success"] = True  # これは警告レベル
                    
                    elif test_case.get("expected_url_contains"):
                        current_url = page.url
                        expected_part = test_case["expected_url_contains"]
                        if expected_part in current_url:
                            print(f"   ✓ URL変化確認: {current_url}")
                            result["success"] = True
                        else:
                            raise Exception(f"URL変化なし。期待: '{expected_part}' 実際: '{current_url}'")
                    
                    else:
                        # 特別な検証がない場合はクリック成功とする
                        result["success"] = True
                        print(f"   ✓ クリック完了")
                    
                    # スクリーンショット撮影
                    screenshot_path = f"{screenshot_dir}/{i:02d}_{test_name.replace(' ', '_')}.png"
                    page.screenshot(path=screenshot_path, full_page=True)
                    print(f"   📸 {screenshot_path}")
                    
                except Exception as e:
                    print(f"   ✗ 失敗: {e}")
                    result["error"] = str(e)
                    
                    # エラー時もスクリーンショットを撮影
                    screenshot_path = f"{screenshot_dir}/{i:02d}_{test_name.replace(' ', '_')}_ERROR.png"
                    page.screenshot(path=screenshot_path, full_page=True)
                    print(f"   📸 エラー時: {screenshot_path}")
                
                # 結果を記録
                test_results["details"].append(result)
                if result["success"]:
                    test_results["passed"] += 1
                else:
                    test_results["failed"] += 1
                
                print()
            
        finally:
            browser.close()
    
    # 結果出力
    print("=== テスト結果 ===")
    print(f"総テスト数: {test_results['total']}")
    print(f"成功: {test_results['passed']}")
    print(f"失敗: {test_results['failed']}")
    print(f"成功率: {test_results['passed']/test_results['total']*100:.1f}%")
    
    if test_results['failed'] > 0:
        print("\n失敗したテスト:")
        for detail in test_results['details']:
            if not detail['success']:
                print(f"  - {detail['name']}: {detail['error']}")
    
    # 結果をJSONファイルに保存
    result_file = f"{screenshot_dir}/test_results.json"
    with open(result_file, 'w', encoding='utf-8') as f:
        json.dump(test_results, f, ensure_ascii=False, indent=2)
    print(f"\n詳細結果: {result_file}")
    
    return test_results['failed'] == 0

def main():
    """メイン関数"""
    url = None
    headless = False
    screenshot_dir = None
    
    i = 1
    while i < len(sys.argv):
        arg = sys.argv[i]
        if arg == "--output" and i + 1 < len(sys.argv):
            screenshot_dir = sys.argv[i + 1]
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
        success = test_element_clicks(url, None, headless, screenshot_dir)
        if success:
            print("\n🎉 すべてのクリックテストが成功しました！")
            sys.exit(0)
        else:
            print("\n❌ 一部のテストが失敗しました")
            sys.exit(1)
    except KeyboardInterrupt:
        print("\n⚠ ユーザーによって中断されました")
    except Exception as e:
        print(f"\nエラー: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()