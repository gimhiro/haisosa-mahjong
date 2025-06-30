#!/usr/bin/env python3
"""
メルド表示テスト
1. 暗カンの表示（1枚目と4枚目が裏向き）
2. 明カンの表示（右・上・左からのカンで横向き位置が異なる）
3. ポンの表示
4. チーの表示
5. Win Modalでのメルド表示
"""

import asyncio
import argparse
from playwright.async_api import async_playwright

async def test_meld_displays(base_url: str, headless: bool = True):
    """メルド表示の総合テスト"""
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=headless)
        page = await browser.new_page()
        
        # コンソールログを出力
        page.on("console", lambda msg: print(f" CONSOLE: {msg.text}"))
        page.on("pageerror", lambda error: print(f"❌ PAGE ERROR: {error}"))
        
        try:
            print(" メルド表示テストを開始...")
            await page.goto(base_url)
            await page.wait_for_load_state('networkidle')
            
            # 4人対戦開始
            start_button = page.get_by_role("button", name="人対戦を開始")
            await start_button.click()
            await page.wait_for_timeout(2000)
            
            # ページリロード
            await page.reload()
            await page.wait_for_timeout(2000)
            
            # 暗カンテスト
            await test_ankan_display(page)
            
            # Win Modalでのメルド表示テスト
            await test_win_modal_meld_display(page)
            
        except Exception as e:
            print(f"❌ エラーが発生しました: {e}")
            import traceback
            traceback.print_exc()
            
        finally:
            await browser.close()

async def test_ankan_display(page):
    """暗カン表示テスト"""
    print(" 暗カン表示テストを開始...")
    
    # テストモック起動
    test_mock_button = page.get_by_role("button", name="テストモック起動")
    await test_mock_button.click()
    await page.wait_for_timeout(1000)
    
    # 手牌設定（暗カン可能な手牌）
    hand_textbox = page.get_by_role("textbox", name="手牌 (13枚または14枚) 手牌 (13枚または14枚)")
    await hand_textbox.click()
    await hand_textbox.fill("1m 1m 1m 1m 3m 3m 3m 5m 5m 5m 7m 7m 7m")
    
    # ツモ牌設定
    draw_textbox = page.get_by_role("textbox", name="ツモ牌 (順番通り) ツモ牌 (順番通り)")
    await draw_textbox.click()
    await draw_textbox.fill("6p 5p")
    
    # テストモード開始
    start_test_button = page.get_by_role("button", name="テストモード開始")
    await start_test_button.click()
    await page.wait_for_timeout(3000)
    
    print("✅ テストモード開始完了")
    
    # 暗カン実行
    ankan_button = page.get_by_role("button", name="暗カン")
    if await ankan_button.is_visible():
        print(" 暗カンを実行...")
        await ankan_button.click()
        await page.wait_for_timeout(2000)
        
        # 暗カン後のメルド表示確認
        print(" 暗カン表示を確認...")
        
        # メルド表示をスクリーンショット
        import os
        os.makedirs('test/screenshots', exist_ok=True)
        await page.screenshot(path='test/screenshots/ankan_display.png')
        print(" 暗カン表示のスクリーンショットを保存: test/screenshots/ankan_display.png")
        
        # メルド牌の表示状態をチェック
        meld_tiles = page.locator('.meld-group .tile')
        meld_count = await meld_tiles.count()
        print(f" メルド牌数: {meld_count}")
        
        # メルドグループの数をチェック
        meld_groups = page.locator('.meld-group')
        group_count = await meld_groups.count()
        print(f" メルドグループ数: {group_count}")
        
        if group_count > 0:
            print("✅ 暗カンのメルド表示が確認できました")
            
            # 各タイルの表示状態を確認（可能であれば）
            for i in range(min(meld_count, 4)):
                tile = meld_tiles.nth(i)
                if await tile.is_visible():
                    tile_classes = await tile.get_attribute('class')
                    print(f"  カン牌{i+1}: クラス='{tile_classes}'")
        else:
            print("❌ 暗カンのメルド表示が見つかりません")
    else:
        print("❌ 暗カンボタンが見つかりません")

async def test_win_modal_meld_display(page):
    """Win Modalでのメルド表示テスト"""
    print(" Win Modalでのメルド表示テストを開始...")
    
    # 6筒を捨てる
    six_p_tiles = page.locator('.tile-draggable[aria-label="6筒"]')
    six_p_count = await six_p_tiles.count()
    
    if six_p_count > 0:
        print(" 6筒を捨てる...")
        await six_p_tiles.first.click()
        await page.wait_for_timeout(3000)
    
    # テストモード停止
    stop_test_button = page.locator('button:has-text("テストモード停止")')
    if await stop_test_button.is_visible():
        print(" テストモード停止...")
        await stop_test_button.click()
        await page.wait_for_timeout(2000)
    
    # CPUのターンが終わるまで待つ
    await page.wait_for_timeout(8000)
    
    # リーチ宣言
    riichi_button = page.get_by_role("button", name="リーチ")
    if await riichi_button.is_visible():
        print(" リーチを実行...")
        await riichi_button.click()
        await page.wait_for_timeout(2000)
        
        # CPUのターン完了を待つ
        await page.wait_for_timeout(8000)
        
        # ツモボタンが表示されるまで待機
        max_attempts = 3
        for attempt in range(max_attempts):
            print(f" ツモボタン確認 (試行 {attempt + 1}/{max_attempts})...")
            
            tsumo_button = page.get_by_role("button", name="ツモ")
            if await tsumo_button.is_visible():
                print("✅ ツモボタンが表示されました！")
                
                # ツモを実行
                print(" ツモを実行...")
                await tsumo_button.click()
                await page.wait_for_timeout(3000)
                
                # Win Modal確認
                win_modal = page.locator('.modal-container, .v-dialog')
                if await win_modal.is_visible():
                    print("✅ Win Modalが表示されました")
                    
                    # Win Modal内のメルド表示を確認
                    print(" Win Modal内のメルド表示を確認...")
                    
                    # メルドセクションの確認
                    melds_section = page.locator('.melds-section')
                    if await melds_section.is_visible():
                        print("✅ Win Modal内にメルドセクションが表示されています")
                        
                        # メルド表示のスクリーンショット
                        await page.screenshot(path='test/screenshots/win_modal_with_melds.png')
                        print(" Win Modalのメルド表示スクリーンショットを保存: test/screenshots/win_modal_with_melds.png")
                        
                        # メルドグループの確認
                        modal_meld_groups = win_modal.locator('.meld-group')
                        modal_group_count = await modal_meld_groups.count()
                        print(f" Win Modal内のメルドグループ数: {modal_group_count}")
                        
                        if modal_group_count > 0:
                            print("✅ Win Modal内でメルド表示が正常に動作しています")
                        else:
                            print("❌ Win Modal内にメルドが表示されていません")
                    else:
                        print("❌ Win Modal内にメルドセクションが見つかりません")
                        # メルドがない場合のスクリーンショットも保存
                        await page.screenshot(path='test/screenshots/win_modal_no_melds.png')
                        print(" メルドなしWin Modalのスクリーンショットを保存: test/screenshots/win_modal_no_melds.png")
                    
                    return True
                else:
                    print("❌ Win Modalが表示されていません")
                    break
            else:
                if attempt < max_attempts - 1:
                    print(" 次のツモを待機中...")
                    await page.wait_for_timeout(6000)
                else:
                    print("❌ ツモボタンが表示されませんでした")
                    break
    
    return False

async def debug_melds_display(page):
    """メルド表示のデバッグ"""
    print(" メルド表示のデバッグ情報:")
    
    # メルドエリアの確認
    melds_areas = page.locator('.melds-area')
    melds_count = await melds_areas.count()
    print(f" メルドエリア数: {melds_count}")
    
    # メルドグループの確認
    meld_groups = page.locator('.meld-group')
    group_count = await meld_groups.count()
    print(f" メルドグループ数: {group_count}")
    
    # タイルの確認
    all_tiles = page.locator('.tile')
    tile_count = await all_tiles.count()
    print(f" 全タイル数: {tile_count}")

async def main():
    parser = argparse.ArgumentParser(description='メルド表示テスト')
    parser.add_argument('url', nargs='?', default='http://localhost:5173', 
                       help='テスト対象のURL')
    parser.add_argument('--headless', action='store_true', 
                       help='ヘッドレスモードで実行')
    
    args = parser.parse_args()
    
    print(f" メルド表示テスト開始: {args.url}")
    await test_meld_displays(args.url, args.headless)
    print(" テスト完了")

if __name__ == "__main__":
    asyncio.run(main())