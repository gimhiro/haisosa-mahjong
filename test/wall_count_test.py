#!/usr/bin/env python3
"""
牌山数値減少テスト - テストモード時の牌山数値が正しく減少するかを確認
"""

import asyncio
import argparse
from playwright.async_api import async_playwright

async def test_wall_count_reduction(base_url: str, headless: bool = True):
    """牌山数値減少テスト"""
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        # コンソールログを出力
        page.on("console", lambda msg: print(f" CONSOLE: {msg.text}"))
        page.on("pageerror", lambda error: print(f"❌ PAGE ERROR: {error}"))
        
        try:
            print(" 牌山数値減少テストを開始...")
            await page.goto(base_url)
            await page.wait_for_load_state('networkidle')
            
            # 4人対戦開始
            start_button = page.get_by_role("button", name="人対戦を開始")
            await start_button.click()
            await page.wait_for_timeout(2000)
            
            # ページリロード
            await page.reload()
            await page.wait_for_timeout(2000)
            
            # 初期牌山数値を記録
            initial_wall = await get_wall_count(page)
            print(f" 初期牌山数値: {initial_wall}")
            
            # テストモック起動
            test_mock_button = page.get_by_role("button", name="テストモック起動")
            await test_mock_button.click()
            await page.wait_for_timeout(1000)
            
            # 手牌設定
            hand_textbox = page.get_by_role("textbox", name="手牌 (13枚または14枚) 手牌 (13枚または14枚)")
            await hand_textbox.click()
            await hand_textbox.fill("1m 1m 1m 1m 2p 3p 4p 5p 6p 7p 8p 9p 9p")
            
            # ツモ牌設定
            draw_textbox = page.get_by_role("textbox", name="ツモ牌 (順番通り) ツモ牌 (順番通り)")
            await draw_textbox.click()
            await draw_textbox.fill("1p 2p 3p 4p 5p")
            
            # テストモード開始
            start_test_button = page.get_by_role("button", name="テストモード開始")
            await start_test_button.click()
            await page.wait_for_timeout(2000)
            
            print("✅ テストモード開始完了")
            
            # テストモード開始後の牌山数値を記録
            after_start_wall = await get_wall_count(page)
            print(f" テストモード開始後牌山数値: {after_start_wall}")
            
            # 複数回ツモを実行して牌山数値の変化を確認
            wall_counts = [after_start_wall]
            
            for i in range(5):
                # ツモを実行
                await page.wait_for_timeout(1000)
                
                # 手牌の何かをクリックして捨てる
                hand_tiles = page.locator('.tile-draggable')
                if await hand_tiles.count() > 0:
                    await hand_tiles.first.click()
                    await page.wait_for_timeout(2000)
                    
                    # 牌山数値を確認
                    wall_count = await get_wall_count(page)
                    wall_counts.append(wall_count)
                    print(f" {i+1}回目ツモ後牌山数値: {wall_count}")
                
                # テストモード停止・再開でCPUターンを進める
                stop_test_button = page.locator('button:has-text("テストモード停止")')
                if await stop_test_button.is_visible():
                    await stop_test_button.click()
                    await page.wait_for_timeout(3000)  # CPUターンを待つ
                    
                    # 牌山数値を確認
                    wall_count = await get_wall_count(page)
                    print(f" CPU巡回後牌山数値: {wall_count}")
                    
                    # テストモード再開
                    test_mock_button = page.get_by_role("button", name="テストモック起動")
                    if await test_mock_button.is_visible():
                        await test_mock_button.click()
                        await page.wait_for_timeout(1000)
                        
                        start_test_button = page.get_by_role("button", name="テストモード開始")
                        if await start_test_button.is_visible():
                            await start_test_button.click()
                            await page.wait_for_timeout(1000)
            
            # 結果の検証
            print("\n 牌山数値変化の検証:")
            decreasing = True
            for i in range(1, len(wall_counts)):
                if wall_counts[i] >= wall_counts[i-1]:
                    decreasing = False
                    print(f"❌ {i}回目: {wall_counts[i-1]} → {wall_counts[i]} (減少していない)")
                else:
                    print(f"✅ {i}回目: {wall_counts[i-1]} → {wall_counts[i]} (正常減少)")
            
            if decreasing and len(wall_counts) > 1:
                print("✅ 牌山数値が正常に減少しています")
                
                # スクリーンショット保存
                import os
                os.makedirs('test/screenshots', exist_ok=True)
                await page.screenshot(path='test/screenshots/wall_count_test.png')
                print(" 牌山数値テストのスクリーンショットを保存")
                
                return True
            else:
                print("❌ 牌山数値の減少に問題があります")
                return False
                
        except Exception as e:
            print(f"❌ エラーが発生しました: {e}")
            import traceback
            traceback.print_exc()
            
        finally:
            await browser.close()
    
    return False

async def get_wall_count(page):
    """牌山数値を取得"""
    try:
        # 牌山数値を表示している要素を探す
        wall_selectors = [
            '.remaining-tiles',
            '.wall-count',
            ':has-text("残り") >> visible=true'
        ]
        
        for selector in wall_selectors:
            elements = page.locator(selector)
            count = await elements.count()
            if count > 0:
                for i in range(count):
                    element = elements.nth(i)
                    if await element.is_visible():
                        text = await element.text_content()
                        if text and text.strip().isdigit():
                            return int(text.strip())
        
        # 数値のみの要素を直接探す
        number_elements = page.locator('text=/^\\d+$/')
        count = await number_elements.count()
        for i in range(count):
            element = number_elements.nth(i)
            if await element.is_visible():
                text = await element.text_content()
                if text and 50 <= int(text) <= 136:  # 牌山の妥当な範囲
                    return int(text)
        
        return -1  # 見つからない場合
        
    except Exception as e:
        print(f"❌ 牌山数値取得エラー: {e}")
        return -1

async def main():
    parser = argparse.ArgumentParser(description='牌山数値減少テスト')
    parser.add_argument('url', nargs='?', default='http://localhost:5173', 
                       help='テスト対象のURL')
    parser.add_argument('--headless', action='store_true', 
                       help='ヘッドレスモードで実行')
    
    args = parser.parse_args()
    
    print(f" 牌山数値減少テスト開始: {args.url}")
    success = await test_wall_count_reduction(args.url, True)
    
    if success:
        print(" テスト成功: 牌山数値が正常に減少しました")
    else:
        print("❌ テスト失敗: 牌山数値減少に問題があります")
    
    print(" テスト完了")

if __name__ == "__main__":
    asyncio.run(main())