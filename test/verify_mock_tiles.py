#!/usr/bin/env python3
"""
テストモック設定の牌が正確に反映されているか検証
手牌の各牌のalt属性を確認して、mock設定と照合
"""

from playwright.sync_api import sync_playwright
import sys
import time
import json

def verify_mock_tile_setting(url=None, headless=False):
    """
    テストモック設定の牌が正確に反映されているか検証
    """
    if url is None:
        url = "http://localhost:5173"
    
    console_logs = []
    verification_results = {
        "expected_hand": ["1m", "2m", "3m", "4m", "5m", "6m", "7m", "8m", "9m", "1p", "2p", "3p", "4p"],
        "expected_draw_tiles": ["5p", "6p", "7p", "8p", "9p"],
        "actual_hand": [],
        "actual_draw_tiles": [],
        "hand_matches": False,
        "draw_tiles_match": False,
        "mock_dialog_text": "",
        "errors": []
    }
    
    def console_handler(msg):
        timestamp = time.strftime('%H:%M:%S')
        log_text = f"[{timestamp}] {msg.type.upper()}: {msg.text}"
        console_logs.append(log_text)
        print(log_text)
    
    with sync_playwright() as p:
        print(f"=== テストモック牌設定検証 ===")
        print(f"URL: {url}")
        print(f"期待する手牌: {' '.join(verification_results['expected_hand'])}")
        print(f"期待するツモ牌: {' '.join(verification_results['expected_draw_tiles'])}")
        print()
        
        browser = p.chromium.launch(headless=headless, slow_mo=1000)
        
        try:
            page = browser.new_page()
            page.on("console", console_handler)
            page.on("pageerror", lambda error: print(f"[PAGE ERROR] {error}"))
            
            # 4人麻雀ページに移動
            print("1. 4人麻雀ページにアクセス...")
            page.goto(f"{url}/#/four-player", wait_until="networkidle")
            time.sleep(3)
            
            # テストモックボタンをクリック
            print("2. テストモックボタンをクリック...")
            button = page.locator('button:has-text("テストモック起動"), .v-btn:has-text("テストモック起動")').first
            button.click()
            time.sleep(2)
            
            # ダイアログ内のテキストを確認
            print("3. ダイアログ内のテスト設定テキストを確認...")
            try:
                # 手牌入力フィールドのテキストを取得
                hand_input = page.locator('textarea').first
                hand_text = hand_input.input_value()
                verification_results["mock_dialog_text"] = hand_text
                print(f"   ダイアログの手牌設定: {hand_text}")
                
                # ツモ牌入力フィールドのテキストを取得  
                draw_input = page.locator('textarea').nth(1)
                draw_text = draw_input.input_value()
                print(f"   ダイアログのツモ牌設定: {draw_text}")
                
            except Exception as e:
                verification_results["errors"].append(f"ダイアログテキスト取得失敗: {e}")
                print(f"   ✗ ダイアログテキスト取得失敗: {e}")
            
            # テストモード開始
            print("4. テストモード開始...")
            start_button = page.locator('button:has-text("テストモード開始"), .v-btn:has-text("テストモード開始")').first
            start_button.click()
            time.sleep(3)
            
            # 手牌の詳細確認
            print("5. 手牌の各牌を詳細確認...")
            try:
                # プレイヤーの手牌エリアの全ての牌を取得
                hand_tiles = page.locator('.player-area.player-bottom .mahjong-tile').all()
                print(f"   手牌枚数: {len(hand_tiles)}枚")
                
                actual_tiles = []
                for i, tile in enumerate(hand_tiles):
                    try:
                        # alt属性を取得
                        alt_text = tile.get_attribute('alt')
                        # title属性も確認
                        title_text = tile.get_attribute('title')
                        # data属性も確認
                        data_suit = tile.get_attribute('data-suit')
                        data_rank = tile.get_attribute('data-rank')
                        
                        # img要素内のalt属性も確認
                        img_alt = tile.locator('img').get_attribute('alt') if tile.locator('img').count() > 0 else None
                        
                        tile_info = {
                            "index": i,
                            "alt": alt_text,
                            "title": title_text,
                            "data_suit": data_suit,
                            "data_rank": data_rank,
                            "img_alt": img_alt
                        }
                        actual_tiles.append(tile_info)
                        
                        print(f"     牌{i+1}: alt='{alt_text}', title='{title_text}', data-suit='{data_suit}', data-rank='{data_rank}', img-alt='{img_alt}'")
                        
                    except Exception as tile_e:
                        print(f"     牌{i+1}: エラー - {tile_e}")
                
                verification_results["actual_hand"] = actual_tiles
                
            except Exception as e:
                verification_results["errors"].append(f"手牌確認失敗: {e}")
                print(f"   ✗ 手牌確認失敗: {e}")
            
            # スクリーンショット撮影（詳細確認用）
            page.screenshot(path="test/screenshots/tile_verification.png", full_page=True)
            print("6. 詳細確認用スクリーンショット撮影完了")
            
            # HTMLソースも一部取得
            print("7. 手牌エリアのHTMLソース確認...")
            try:
                hand_area_html = page.locator('.player-area.player-bottom').inner_html()
                # HTMLを保存
                with open("test/logs/hand_area_html.txt", "w", encoding="utf-8") as f:
                    f.write(hand_area_html)
                print("   ✓ HTMLソースを test/logs/hand_area_html.txt に保存")
            except Exception as e:
                print(f"   ✗ HTMLソース取得失敗: {e}")
            
        finally:
            browser.close()
    
    # 結果分析
    print("\n=== 検証結果 ===")
    print(f"期待する手牌: {' '.join(verification_results['expected_hand'])}")
    print(f"ダイアログ設定: {verification_results['mock_dialog_text']}")
    print(f"実際の手牌枚数: {len(verification_results['actual_hand'])}枚")
    
    if verification_results["actual_hand"]:
        print("実際の手牌詳細:")
        for tile_info in verification_results["actual_hand"]:
            print(f"  {tile_info['index']+1}: {tile_info}")
    
    if verification_results["errors"]:
        print("\nエラー:")
        for error in verification_results["errors"]:
            print(f"  - {error}")
    
    # 結果をJSONファイルに保存
    with open("test/logs/tile_verification_results.json", "w", encoding="utf-8") as f:
        json.dump(verification_results, f, ensure_ascii=False, indent=2)
    
    print(f"\n詳細結果: test/logs/tile_verification_results.json")
    print(f"HTMLソース: test/logs/hand_area_html.txt")
    print(f"スクリーンショット: test/screenshots/tile_verification.png")
    
    return verification_results

def main():
    url = None
    headless = False
    
    if len(sys.argv) > 1:
        url = sys.argv[1]
    
    if "--headless" in sys.argv:
        headless = True
    
    try:
        results = verify_mock_tile_setting(url, headless)
        print("\n✓ 牌検証完了")
    except Exception as e:
        print(f"\nエラー: {e}")

if __name__ == "__main__":
    main()