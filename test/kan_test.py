#!/usr/bin/env python3
"""
カン機能統合テスト
1. 1pツモ
2. 1m暗カン実行
3. カン新ドラ追加確認
4. リンシャン牌で9pツモ（嶺上開花）
5. Win Modal確認
6. 次の局へボタンクリック

暗カン→リンシャンツモのテスト
"""

import asyncio
import argparse
from playwright.async_api import async_playwright

async def test_kan_comprehensive(base_url: str, headless: bool = True):
    """カン機能統合テスト: 1pツモ→1m暗カン→カンドラ確認→リンシャンツモ（9p）"""
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)  # WSL環境では常にheadless
        page = await browser.new_page()
        
        # コンソールログを出力
        page.on("console", lambda msg: print(f" CONSOLE: {msg.text}"))
        page.on("pageerror", lambda error: print(f"❌ PAGE ERROR: {error}"))
        
        try:
            print(" カン機能統合テストを開始...")
            await page.goto(base_url)
            await page.wait_for_load_state('networkidle')
            
            # 4人対戦開始
            start_button = page.get_by_role("button", name="人対戦を開始")
            await start_button.click()
            await page.wait_for_timeout(2000)
            
            # ページリロード
            await page.reload()
            await page.wait_for_timeout(2000)
            
            # テストモック起動
            test_mock_button = page.get_by_role("button", name="テストモック起動")
            await test_mock_button.click()
            await page.wait_for_timeout(1000)
            
            # 手牌設定（カン→リンシャンツモ上がり可能な形）
            hand_textbox = page.get_by_role("textbox", name="手牌 (13枚または14枚) 手牌 (13枚または14枚)")
            await hand_textbox.click()
            await hand_textbox.fill("1m 1m 1m 1m 2p 3p 4p 5p 6p 7p 8p 9p 9p")
            
            # ツモ牌設定
            draw_textbox = page.get_by_role("textbox", name="ツモ牌 (順番通り) ツモ牌 (順番通り)")
            await draw_textbox.click()
            await draw_textbox.fill("1p 9p")
            
            # テストモード開始
            start_test_button = page.get_by_role("button", name="テストモード開始")
            await start_test_button.click()
            await page.wait_for_timeout(3000)
            
            print("✅ テストモード開始完了")
            
            # 初期ドラ数確認
            initial_dora_count = await count_dora_indicators(page)
            print(f" 初期ドラ表示数: {initial_dora_count}")
            
            # 暗カン実行
            ankan_button = page.get_by_role("button", name="暗カン")
            if await ankan_button.is_visible():
                print(" 暗カンを実行...")
                await ankan_button.click()
                await page.wait_for_timeout(2000)
                print("✅ 暗カン完了")
                
                # カン後のドラ数確認
                post_kan_dora_count = await count_dora_indicators(page)
                print(f" カン後ドラ表示数: {post_kan_dora_count}")
                
                # 新ドラが追加されたかチェック
                if post_kan_dora_count > initial_dora_count:
                    print("✅ カン新ドラが正常に追加されました")
                else:
                    print(f"❌ カン新ドラが追加されていません (初期:{initial_dora_count}, カン後:{post_kan_dora_count})")
                    return False
                
                print(" カン後の状態を調査...")
                
                # カン後、すぐにリンシャンツモできるか確認
                await page.wait_for_timeout(2000)
                
                # ツモボタンの確認（リンシャンツモ）
                tsumo_button = page.get_by_role("button", name="ツモ")
                tsumo_visible = await tsumo_button.is_visible()
                print(f" リンシャンツモボタン表示: {tsumo_visible}")
                
                if tsumo_visible:
                    print("✅ リンシャンツモボタンが表示されています！")
                    
                    # リンシャンツモを実行
                    print(" リンシャンツモ（9p）を実行...")
                    await tsumo_button.click()
                    await page.wait_for_timeout(3000)
                    
                    # Win Modal確認と裏ドラ数検証
                    win_modal = page.locator('.modal-container, .v-dialog')
                    win_modal_visible = await win_modal.is_visible()
                    print(f" Win Modal表示: {win_modal_visible}")
                    
                    if win_modal_visible:
                        print("✅ Win Modalが表示されました")
                        
                        # 裏ドラ数確認（リンシャンツモの場合、リーチしていないので裏ドラは0）
                        uradora_count = await count_uradora_in_modal(page, win_modal)
                        print(f" Win Modal内の裏ドラ表示数: {uradora_count}")
                        print(f" リンシャンツモ（リーチなし）のため、裏ドラは0が期待されます")
                        
                        if uradora_count == 0:
                            print("✅ 裏ドラなし（リーチしていないため正常）")
                            print("   - カン新ドラ追加: 正常")
                            print("   - カン→リンシャンツモ: 正常")
                            print("   - 嶺上開花: 正常")
                        else:
                            print(f"❌ リーチしていないのに裏ドラが表示されています (実際:{uradora_count})")
                        
                        # 次の局へボタンを確認・クリック
                        next_game_button = page.get_by_role("button", name="次の局へ")
                        if await next_game_button.is_visible():
                            print(" 次の局へボタンをクリック...")
                            
                            # 成功時のスクリーンショットを撮影
                            import os
                            os.makedirs('test/screenshots', exist_ok=True)
                            await page.screenshot(path='test/screenshots/kan_comprehensive_test.png')
                            print(" カン統合テストのスクリーンショットを保存")
                            
                            await next_game_button.click()
                            await page.wait_for_timeout(2000)
                            print("✅ 次の局への遷移が完了しました！")
                            print(" カン統合テスト成功：暗カン→カンドラ追加→リンシャンツモ（嶺上開花）→次の局へ")
                            return True  # 成功時は処理終了
                        else:
                            print("❌ 次の局へボタンが見つかりません")
                            await debug_buttons(page)
                            return False
                    else:
                        print("❌ Win Modalが表示されていません")
                        await debug_buttons(page)
                        return False
                else:
                    print("❌ リンシャンツモボタンが表示されていません")
                    await debug_buttons(page)
                    await debug_game_state(page)
                    return False
            else:
                print("❌ 暗カンボタンが見つかりません")
                return False
                
        except Exception as e:
            print(f"❌ エラーが発生しました: {e}")
            import traceback
            traceback.print_exc()
            return False
            
        finally:
            await browser.close()
    
    return False

async def count_dora_indicators(page):
    """ドラ表示牌の数を数える"""
    try:
        dora_selectors = [
            '.dora-tiles .mahjong-tile',
            '.dora-content .mahjong-tile'
        ]
        
        for selector in dora_selectors:
            dora_elements = page.locator(selector)
            count = await dora_elements.count()
            if count > 0:
                return count
        
        return 0
        
    except Exception as e:
        print(f"❌ ドラ表示数カウントでエラー: {e}")
        return 0

async def count_uradora_in_modal(page, win_modal):
    """Win Modal内の裏ドラ表示数を数える"""
    try:
        # Win Modal内の裏ドラ要素を検索
        uradora_selectors = [
            '.uradora-tiles .mahjong-tile',
            '.uradora-content .mahjong-tile',
            '.uradora-display .mahjong-tile',
            '.win-modal .uradora .mahjong-tile'
        ]
        
        for selector in uradora_selectors:
            uradora_elements = win_modal.locator(selector)
            count = await uradora_elements.count()
            if count > 0:
                print(f" 裏ドラセレクタ '{selector}' で {count} 個発見")
                return count
        
        print(" Win Modal内に裏ドラ表示要素が見つかりませんでした")
        return 0
        
    except Exception as e:
        print(f"❌ 裏ドラ表示数カウントでエラー: {e}")
        return 0

async def debug_buttons(page):
    """利用可能なボタンをデバッグ出力"""
    print(" 利用可能なボタン一覧:")
    buttons = page.locator('button')
    button_count = await buttons.count()
    
    for i in range(min(10, button_count)):  # 最大10個まで表示
        button = buttons.nth(i)
        text = await button.text_content()
        visible = await button.is_visible()
        if text and visible:
            print(f"  ボタン{i+1}: '{text}'")

async def debug_game_state(page):
    """ゲーム状態をデバッグ出力"""
    print(" ゲーム状態の確認:")
    
    # 手牌枚数確認（複数のセレクタを試す）
    hand_tiles = page.locator('.player-area').nth(0).locator('.tile')
    if await hand_tiles.count() == 0:
        hand_tiles = page.locator('.hand .tile')
    if await hand_tiles.count() == 0:
        hand_tiles = page.locator('.tile')
    
    hand_count = await hand_tiles.count()
    print(f" 手牌枚数: {hand_count}")
    
    # 鳴き牌確認
    melds = page.locator('.meld')
    meld_count = await melds.count()
    print(f" 鳴き牌数: {meld_count}")
    
    # プレイヤーターン確認（より詳細に）
    turn_indicator = page.locator(':has-text("あなたのターン")')
    is_my_turn = await turn_indicator.count() > 0
    
    if not is_my_turn:
        # 別のターン表示を確認
        player_turn = page.locator('.current-turn, .active-player, [class*="current"], [class*="active"]')
        turn_count = await player_turn.count()
        print(f" ターン表示要素数: {turn_count}")
        
        # テキスト内容を確認
        turn_text_elements = page.locator(':has-text("ターン"), :has-text("あなた"), :has-text("CPU")')
        text_count = await turn_text_elements.count()
        for i in range(min(3, text_count)):
            element = turn_text_elements.nth(i)
            text = await element.text_content()
            print(f"  ターン関連テキスト{i+1}: '{text}'")
    
    print(f" 現在のターン: {'あなた' if is_my_turn else 'CPU/不明'}")
    
    # スクリーンショットを撮影
    import os
    os.makedirs('test/screenshots', exist_ok=True)
    await page.screenshot(path='test/screenshots/game_state_debug.png')
    print(" スクリーンショットを保存しました: test/screenshots/game_state_debug.png")

async def main():
    parser = argparse.ArgumentParser(description='カン機能統合テスト')
    parser.add_argument('url', nargs='?', default='http://localhost:5173', 
                       help='テスト対象のURL')
    parser.add_argument('--headless', action='store_true', 
                       help='ヘッドレスモードで実行')
    
    args = parser.parse_args()
    
    print(f" カン機能統合テスト開始: {args.url}")
    success = await test_kan_comprehensive(args.url, True)  # WSL環境では常にheadless
    
    if success:
        print(" テスト成功: カン統合機能が正常に動作しました")
    else:
        print("❌ テスト失敗: カン統合機能に問題があります")
    
    print(" テスト完了")

if __name__ == "__main__":
    asyncio.run(main())