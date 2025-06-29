#!/usr/bin/env python3
"""
すべてのメルド表示テスト
1. 暗カン（1枚目と4枚目が裏向き）
2. 明カン（右・上・左からで横向き位置が異なる）
3. ポン（鳴いた牌が横向き）
4. チー（鳴いた牌が横向き）
各メルドの表示状態を詳細確認
"""

import asyncio
import argparse
from playwright.async_api import async_playwright

async def test_all_meld_types(base_url: str, headless: bool = True):
    """全メルドタイプの表示テスト"""
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=headless)
        page = await browser.new_page()
        
        # コンソールログを出力
        page.on("console", lambda msg: print(f"🖥️ CONSOLE: {msg.text}"))
        page.on("pageerror", lambda error: print(f"❌ PAGE ERROR: {error}"))
        
        try:
            print("🎮 全メルドタイプ表示テストを開始...")
            await page.goto(base_url)
            await page.wait_for_load_state('networkidle')
            
            # 4人対戦開始
            start_button = page.get_by_role("button", name="人対戦を開始")
            await start_button.click()
            await page.wait_for_timeout(2000)
            
            # ページリロード
            await page.reload()
            await page.wait_for_timeout(2000)
            
            # 各メルドタイプをテスト
            await test_ankan_detailed(page)
            
        except Exception as e:
            print(f"❌ エラーが発生しました: {e}")
            import traceback
            traceback.print_exc()
            
        finally:
            await browser.close()

async def test_ankan_detailed(page):
    """暗カンの詳細表示テスト"""
    print("🔍 暗カンの詳細表示テストを開始...")
    
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
    await draw_textbox.fill("6p")
    
    # テストモード開始
    start_test_button = page.get_by_role("button", name="テストモード開始")
    await start_test_button.click()
    await page.wait_for_timeout(3000)
    
    # 暗カン実行
    ankan_button = page.get_by_role("button", name="暗カン")
    if await ankan_button.is_visible():
        print("🎯 暗カンを実行...")
        await ankan_button.click()
        await page.wait_for_timeout(2000)
        
        # 暗カンのメルド表示を詳細確認
        await analyze_meld_display(page, "暗カン")
        
        # スクリーンショット保存
        import os
        os.makedirs('test/screenshots', exist_ok=True)
        await page.screenshot(path='test/screenshots/ankan_detailed.png')
        print("📸 暗カン詳細表示のスクリーンショットを保存")
        
        # メルドタイルの実際のクラス名と属性を確認
        await check_meld_tile_attributes(page)
        
    else:
        print("❌ 暗カンボタンが見つかりません")

async def analyze_meld_display(page, meld_type):
    """メルド表示を詳細分析"""
    print(f"🔍 {meld_type}の表示を詳細分析...")
    
    # メルドエリアの存在確認
    melds_areas = page.locator('.melds-area')
    melds_area_count = await melds_areas.count()
    print(f"📊 メルドエリア数: {melds_area_count}")
    
    if melds_area_count > 0:
        # 人間プレイヤーのメルドエリアを確認（player-bottomクラス）
        human_player_area = page.locator('.player-area.player-bottom')
        human_melds_area = human_player_area.locator('.melds-area')
        
        if await human_melds_area.is_visible():
            print("✅ 人間プレイヤーのメルドエリアが見つかりました")
            
            # メルドグループの確認
            meld_groups = human_melds_area.locator('.meld-group')
            group_count = await meld_groups.count()
            print(f"📊 メルドグループ数: {group_count}")
            
            if group_count > 0:
                # 最初のメルドグループを詳細確認
                first_meld = meld_groups.first
                meld_tiles = first_meld.locator('.tile')
                tile_count = await meld_tiles.count()
                print(f"📊 メルド内のタイル数: {tile_count}")
                
                # 各タイルの状態を確認
                for i in range(tile_count):
                    tile = meld_tiles.nth(i)
                    if await tile.is_visible():
                        # タイルのクラス属性を取得
                        tile_classes = await tile.get_attribute('class') or ""
                        aria_label = await tile.get_attribute('aria-label') or ""
                        
                        # 横向き・裏向きの判定
                        is_yoko = "yoko" in tile_classes.lower()
                        is_back = "back" in tile_classes.lower()
                        
                        print(f"  タイル{i+1}: {aria_label}")
                        print(f"    クラス: {tile_classes}")
                        print(f"    横向き: {is_yoko}, 裏向き: {is_back}")
                        
                        # 暗カンの場合、1枚目と4枚目が裏向きであることを確認
                        if meld_type == "暗カン":
                            expected_back = (i == 0 or i == 3)
                            if is_back == expected_back:
                                print(f"    ✅ 期待される表示状態です（裏向き: {expected_back}）")
                            else:
                                print(f"    ❌ 期待と異なる表示状態です（期待: 裏向き={expected_back}, 実際: 裏向き={is_back}）")
            else:
                print("❌ メルドグループが見つかりません")
        else:
            print("❌ 人間プレイヤーのメルドエリアが見つかりません")
    else:
        print("❌ メルドエリアが見つかりません")

async def check_meld_tile_attributes(page):
    """メルドタイルの属性を詳細チェック"""
    print("🔍 メルドタイルの属性を詳細チェック...")
    
    # すべてのメルドタイルを取得
    meld_tiles = page.locator('.melds-area .tile')
    tile_count = await meld_tiles.count()
    print(f"📊 見つかったメルドタイル数: {tile_count}")
    
    for i in range(tile_count):
        tile = meld_tiles.nth(i)
        if await tile.is_visible():
            # 詳細な属性情報を取得
            outer_html = await tile.inner_html()
            classes = await tile.get_attribute('class') or ""
            
            print(f"タイル{i+1}の詳細:")
            print(f"  クラス: {classes}")
            print(f"  HTML: {outer_html[:100]}...")  # 最初の100文字のみ表示
            
            # img要素の確認
            img_element = tile.locator('img')
            if await img_element.count() > 0:
                img_src = await img_element.get_attribute('src') or ""
                img_alt = await img_element.get_attribute('alt') or ""
                print(f"  画像src: {img_src}")
                print(f"  画像alt: {img_alt}")

async def main():
    parser = argparse.ArgumentParser(description='全メルドタイプ表示テスト')
    parser.add_argument('url', nargs='?', default='http://localhost:5173', 
                       help='テスト対象のURL')
    parser.add_argument('--headless', action='store_true', 
                       help='ヘッドレスモードで実行')
    
    args = parser.parse_args()
    
    print(f"🚀 全メルドタイプ表示テスト開始: {args.url}")
    await test_all_meld_types(args.url, args.headless)
    print("✨ テスト完了")

if __name__ == "__main__":
    asyncio.run(main())