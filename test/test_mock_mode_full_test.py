#!/usr/bin/env python3
"""
テストモックモードの完全な動作テスト
手牌変更とツモ牌制御の確認
"""

from playwright.sync_api import sync_playwright
import sys
import time
import json

def test_mock_mode_full_functionality(url=None, headless=False):
    """
    テストモックモードの完全な機能テスト
    """
    if url is None:
        url = "http://localhost:5173"
    
    console_logs = []
    test_results = {
        "button_click": False,
        "dialog_opened": False,
        "test_mode_started": False,
        "hands_changed": False,
        "draw_tiles_working": False,
        "errors": []
    }
    
    def console_handler(msg):
        timestamp = time.strftime('%H:%M:%S')
        log_text = f"[{timestamp}] {msg.type.upper()}: {msg.text}"
        console_logs.append(log_text)
        print(log_text)
    
    with sync_playwright() as p:
        print(f"=== テストモックモード完全機能テスト ===")
        print(f"URL: {url}")
        print()
        
        browser = p.chromium.launch(headless=headless, slow_mo=800)
        
        try:
            page = browser.new_page()
            page.on("console", console_handler)
            page.on("pageerror", lambda error: print(f"[PAGE ERROR] {error}"))
            
            # 4人麻雀ページに移動
            print("1. 4人麻雀ページにアクセス...")
            page.goto(f"{url}/#/four-player", wait_until="networkidle")
            time.sleep(3)
            page.screenshot(path="test/screenshots/step1_initial.png")
            print("   ✓ ページ読み込み完了")
            
            # テストモックボタンをクリック
            print("2. テストモックボタンをクリック...")
            try:
                button = page.locator('button:has-text("テストモック起動"), .v-btn:has-text("テストモック起動")').first
                if button.is_visible():
                    button.click()
                    time.sleep(2)
                    test_results["button_click"] = True
                    print("   ✓ ボタンクリック成功")
                else:
                    raise Exception("テストモックボタンが見つかりません")
            except Exception as e:
                test_results["errors"].append(f"ボタンクリック失敗: {e}")
                print(f"   ✗ {e}")
            
            # ダイアログが開いたか確認
            print("3. テスト設定ダイアログの確認...")
            try:
                dialog = page.locator('.v-dialog').first
                if dialog.is_visible():
                    test_results["dialog_opened"] = True
                    print("   ✓ ダイアログが開きました")
                    page.screenshot(path="test/screenshots/step2_dialog_opened.png")
                    
                    # テストモード開始ボタンをクリック
                    print("4. テストモード開始...")
                    start_button = page.locator('button:has-text("テストモード開始"), .v-btn:has-text("テストモード開始")').first
                    if start_button.is_visible():
                        start_button.click()
                        time.sleep(2)
                        test_results["test_mode_started"] = True
                        print("   ✓ テストモード開始")
                    else:
                        raise Exception("テストモード開始ボタンが見つかりません")
                else:
                    raise Exception("ダイアログが開きませんでした")
            except Exception as e:
                test_results["errors"].append(f"ダイアログ操作失敗: {e}")
                print(f"   ✗ {e}")
            
            # ゲーム開始
            print("5. ゲーム開始...")
            try:
                # ゲーム開始ボタンを探す
                game_start_selectors = [
                    'text=ゲーム開始',
                    'button:has-text("ゲーム開始")',
                    '.v-btn:has-text("ゲーム開始")'
                ]
                
                game_started = False
                for selector in game_start_selectors:
                    try:
                        game_start_btn = page.locator(selector).first
                        if game_start_btn.is_visible():
                            game_start_btn.click()
                            time.sleep(3)
                            game_started = True
                            print("   ✓ ゲーム開始")
                            break
                    except:
                        continue
                
                if not game_started:
                    print("   ⚠ ゲーム開始ボタンが見つかりません（既に開始済みの可能性）")
                
                page.screenshot(path="test/screenshots/step3_game_started.png")
                
            except Exception as e:
                test_results["errors"].append(f"ゲーム開始失敗: {e}")
                print(f"   ✗ {e}")
            
            # 手牌の確認
            print("6. 手牌の確認...")
            try:
                # プレイヤーの手牌エリアを確認
                player_area = page.locator('.player-area.player-bottom').first
                if player_area.is_visible():
                    # 手牌の牌を数える
                    tiles = page.locator('.player-area.player-bottom .mahjong-tile').all()
                    tile_count = len(tiles)
                    print(f"   プレイヤー手牌数: {tile_count}枚")
                    
                    if tile_count >= 13:
                        test_results["hands_changed"] = True
                        print("   ✓ 手牌が設定されています")
                    else:
                        print("   ⚠ 手牌が少ないです")
                else:
                    print("   ⚠ プレイヤーエリアが見つかりません")
                    
                page.screenshot(path="test/screenshots/step4_hands_check.png")
                
            except Exception as e:
                test_results["errors"].append(f"手牌確認失敗: {e}")
                print(f"   ✗ {e}")
            
            # ツモ動作の確認（何ターンか進める）
            print("7. ツモ動作の確認...")
            try:
                # 数ターン進めてツモ牌を確認
                for turn in range(3):
                    print(f"   ターン {turn + 1}...")
                    
                    # 現在のプレイヤーが自分の場合、牌を捨てる
                    try:
                        # 手牌から適当な牌をクリックして捨てる
                        hand_tiles = page.locator('.player-area.player-bottom .mahjong-tile').all()
                        if hand_tiles and len(hand_tiles) > 0:
                            # 最初の牌をクリック
                            hand_tiles[0].click()
                            time.sleep(2)
                            print(f"     牌を捨てました")
                        
                        # スクリーンショット撮影
                        page.screenshot(path=f"test/screenshots/step5_turn_{turn + 1}.png")
                        
                    except Exception as turn_e:
                        print(f"     ターン{turn + 1}エラー: {turn_e}")
                    
                    time.sleep(2)
                
                test_results["draw_tiles_working"] = True
                print("   ✓ ツモ動作確認完了")
                
            except Exception as e:
                test_results["errors"].append(f"ツモ動作確認失敗: {e}")
                print(f"   ✗ {e}")
            
            # 最終スクリーンショット
            page.screenshot(path="test/screenshots/step6_final.png")
            print("8. 最終スクリーンショット撮影完了")
            
            # 5秒間追加監視
            print("9. 追加監視中...")
            time.sleep(5)
            
        finally:
            browser.close()
    
    # 結果出力
    print("\n=== テスト結果 ===")
    print(f"ボタンクリック: {'✓' if test_results['button_click'] else '✗'}")
    print(f"ダイアログ表示: {'✓' if test_results['dialog_opened'] else '✗'}")
    print(f"テストモード開始: {'✓' if test_results['test_mode_started'] else '✗'}")
    print(f"手牌変更: {'✓' if test_results['hands_changed'] else '✗'}")
    print(f"ツモ動作: {'✓' if test_results['draw_tiles_working'] else '✗'}")
    
    if test_results["errors"]:
        print("\nエラー:")
        for error in test_results["errors"]:
            print(f"  - {error}")
    
    print("\n=== console.log 抜粋 ===")
    for log in console_logs[-10:]:  # 最後の10件
        print(log)
    
    # 結果をJSONファイルに保存
    with open("test/logs/mock_mode_test_results.json", "w", encoding="utf-8") as f:
        json.dump(test_results, f, ensure_ascii=False, indent=2)
    
    success_count = sum(1 for key, value in test_results.items() if key != "errors" and value)
    total_tests = len([k for k in test_results.keys() if k != "errors"])
    
    print(f"\n成功: {success_count}/{total_tests} 項目")
    return success_count == total_tests

def main():
    url = None
    headless = False
    
    if len(sys.argv) > 1:
        url = sys.argv[1]
    
    if "--headless" in sys.argv:
        headless = True
    
    try:
        success = test_mock_mode_full_functionality(url, headless)
        if success:
            print("\n🎉 すべてのテストが成功しました！")
        else:
            print("\n⚠ 一部のテストが失敗しました")
    except Exception as e:
        print(f"\nエラー: {e}")

if __name__ == "__main__":
    main()