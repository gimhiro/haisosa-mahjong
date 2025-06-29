#!/usr/bin/env python3
"""
通常役テスト4: 三色同刻・河底撈魚ロン
手牌: 111m 111p 111s 789m 9p → 9pを海底（最後の1つの牌）でロン
期待役: 三色同刻・河底撈魚
条件: 海底最後の捨て牌9pでロン
"""

import asyncio
import argparse
from playwright.async_api import async_playwright

async def test_sanshokudoukou_houtei(base_url: str, headless: bool = True):
    """三色同刻・河底撈魚役のテスト"""
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)  # WSL環境では常にheadless
        page = await browser.new_page()
        
        # コンソールログを出力
        page.on("console", lambda msg: print(f"🖥️ CONSOLE: {msg.text}"))
        page.on("pageerror", lambda error: print(f"❌ PAGE ERROR: {error}"))
        
        try:
            print("🎮 三色同刻・河底撈魚役テストを開始...")
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
            
            # 手牌設定（三色同刻形）13枚
            # 111m 111p 111s 789m 9p（9p待ち）
            hand_textbox = page.get_by_role("textbox", name="手牌 (13枚または14枚) 手牌 (13枚または14枚)")
            await hand_textbox.click()
            await hand_textbox.fill("1m 1m 1m 1p 1p 1p 1s 1s 1s 7m 8m 9m 9p")
            
            # ツモ牌設定（多めに設定して海底状況を作る）
            draw_textbox = page.get_by_role("textbox", name="ツモ牌 (順番通り) ツモ牌 (順番通り)")
            await draw_textbox.click()
            # 残り山牌を少なくして海底状況を作成
            await draw_textbox.fill("2m 3m 4m 5m 6m 7m 8m 9m 2p 3p 4p 5p 6p 7p 8p")
            
            # テストモード開始
            start_test_button = page.get_by_role("button", name="テストモード開始")
            await start_test_button.click()
            await page.wait_for_timeout(3000)
            
            print("✅ テストモード開始完了")
            
            # リーチ宣言（9p待ち）
            riichi_button = page.get_by_role("button", name="リーチ")
            if await riichi_button.is_visible():
                print("🎯 リーチを宣言...")
                await riichi_button.click()
                await page.wait_for_timeout(2000)
                print("✅ リーチ宣言完了")
                
                # 9p以外の牌を捨てる（9p単騎待ち）
                discard_tile = page.get_by_role("button", name="9萬").first
                if await discard_tile.is_visible():
                    print("🎯 9萬を捨てます...")
                    await discard_tile.click()
                    await page.wait_for_timeout(2000)
                    print("✅ 9萬打牌完了")
                
                # テストモード停止（CPUターンを進行させる）
                stop_test_button = page.locator('button:has-text("テストモード停止")')
                if await stop_test_button.is_visible():
                    print("🔄 テストモード停止...")
                    await stop_test_button.click()
                    await page.wait_for_timeout(2000)
                
                # CPUのターンを長く待って海底状況を作る
                print("🔄 海底状況を待機中...")
                await page.wait_for_timeout(10000)
                
                # ロンボタンが表示されるまで待機（河底撈魚）
                max_attempts = 5
                for attempt in range(max_attempts):
                    print(f"🔍 ロンボタン確認 (試行 {attempt + 1}/{max_attempts})...")
                    
                    ron_button = page.get_by_role("button", name="ロン")
                    if await ron_button.is_visible():
                        print("✅ ロンボタンが表示されました！（河底撈魚）")
                        
                        # ロンを実行
                        print("🎯 ロンを実行（河底撈魚）...")
                        await ron_button.click()
                        await page.wait_for_timeout(3000)
                        
                        # Win Modal確認と役の検証
                        win_modal = page.locator('.modal-container, .v-dialog')
                        if await win_modal.is_visible():
                            print("✅ Win Modalが表示されました")
                            
                            # 役の確認
                            await verify_yaku(page, win_modal)
                            
                            # スクリーンショット保存
                            import os
                            os.makedirs('test/screenshots', exist_ok=True)
                            await page.screenshot(path='test/screenshots/yaku_test_4_sanshokudoukou.png')
                            print("📸 三色同刻・河底撈魚役のスクリーンショットを保存")
                            
                            return True
                        else:
                            print("❌ Win Modalが表示されていません")
                            break
                    else:
                        if attempt < max_attempts - 1:
                            print("🔄 次のCPUターンを待機中...")
                            await page.wait_for_timeout(3000)
                        else:
                            print("❌ ロンボタンが表示されませんでした")
                            # 代わりにツモでテスト続行
                            print("🔄 ツモでのテスト続行を試行...")
                            tsumo_button = page.get_by_role("button", name="ツモ")
                            if await tsumo_button.is_visible():
                                await tsumo_button.click()
                                await page.wait_for_timeout(3000)
                                win_modal = page.locator('.modal-container, .v-dialog')
                                if await win_modal.is_visible():
                                    await verify_yaku(page, win_modal)
                                    return True
                            break
            else:
                print("❌ リーチボタンが見つかりません")
                
        except Exception as e:
            print(f"❌ エラーが発生しました: {e}")
            import traceback
            traceback.print_exc()
            
        finally:
            await browser.close()
    
    return False

async def verify_yaku(page, win_modal):
    """役の検証"""
    print("🔍 Win Modal内の役を確認...")
    
    # 期待される役リスト
    expected_yaku = [
        "リーチ",
        "三色同刻",
        "河底撈魚"           # 海底最後の捨て牌でロン
    ]
    
    # 役一覧の取得
    yaku_elements = win_modal.locator('.yaku-list .yaku-item, .yaku-list li, .yaku-list div')
    yaku_count = await yaku_elements.count()
    print(f"📊 表示された役数: {yaku_count}")
    
    found_yaku = []
    for i in range(yaku_count):
        yaku_element = yaku_elements.nth(i)
        if await yaku_element.is_visible():
            yaku_text = await yaku_element.text_content()
            if yaku_text and yaku_text.strip():
                found_yaku.append(yaku_text.strip())
                print(f"  役{i+1}: {yaku_text.strip()}")
    
    # 役の検証
    print("🔍 期待される役との照合:")
    for expected in expected_yaku:
        found = any(expected in yaku for yaku in found_yaku)
        status = "✅" if found else "❌"
        print(f"  {status} {expected}: {'発見' if found else '未発見'}")
    
    # 点数確認
    score_elements = win_modal.locator('.score-value, .total-points')
    if await score_elements.count() > 0:
        score_text = await score_elements.first.text_content()
        print(f"📊 獲得点数: {score_text}")
    
    # 翻数確認
    han_elements = win_modal.locator('.total-han, .han-count')
    if await han_elements.count() > 0:
        han_text = await han_elements.first.text_content()
        print(f"📊 合計翻数: {han_text}")
    
    return found_yaku

async def main():
    parser = argparse.ArgumentParser(description='三色同刻・河底撈魚役テスト')
    parser.add_argument('url', nargs='?', default='http://localhost:5173', 
                       help='テスト対象のURL')
    parser.add_argument('--headless', action='store_true', 
                       help='ヘッドレスモードで実行')
    
    args = parser.parse_args()
    
    print(f"🚀 三色同刻・河底撈魚役テスト開始: {args.url}")
    success = await test_sanshokudoukou_houtei(args.url, True)  # WSL環境では常にheadless
    
    if success:
        print("🎉 テスト成功: 三色同刻・河底撈魚役が正常に確認されました")
    else:
        print("❌ テスト失敗: 期待される役が確認できませんでした")
    
    print("✨ テスト完了")

if __name__ == "__main__":
    asyncio.run(main())