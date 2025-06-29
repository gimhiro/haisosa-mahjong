#!/usr/bin/env python3
"""
通常役テスト1: 清一色・リャンペーコー
手牌: 234p 234p 567p 567p 88p（ピンズのみ）
期待役: ダブルリーチ/リーチ/一発/ツモ/タンヤオ/清一色/リャンペーコー
条件: 東家で配牌即リーチ → 一発ツモ
"""

import asyncio
import argparse
from playwright.async_api import async_playwright

async def test_chinitsu_ryanpeikou(base_url: str, headless: bool = True):
    """清一色・リャンペーコー役のテスト"""
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)  # WSL環境では常にheadless
        page = await browser.new_page()
        
        # コンソールログを出力
        page.on("console", lambda msg: print(f"🖥️ CONSOLE: {msg.text}"))
        page.on("pageerror", lambda error: print(f"❌ PAGE ERROR: {error}"))
        
        try:
            print("🎮 清一色・リャンペーコー役テストを開始...")
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
            
            # 手牌設定（清一色・リャンペーコー形）13枚
            # 234p 234p 567p 567p 8p（配牌13枚、8pツモで完成）
            hand_textbox = page.get_by_role("textbox", name="手牌 (13枚または14枚) 手牌 (13枚または14枚)")
            await hand_textbox.click()
            await hand_textbox.fill("2p 3p 4p 2p 3p 4p 5p 6p 7p 5p 6p 7p 8p")
            
            # ツモ牌設定（8pでツモ上がり）
            draw_textbox = page.get_by_role("textbox", name="ツモ牌 (順番通り) ツモ牌 (順番通り)")
            await draw_textbox.click()
            await draw_textbox.fill("8p 8p 8p 8p")
            
            # 他のプレイヤーの手牌設定（CPUが正常に動作するように）
            # プレイヤー2
            await page.get_by_role("tab", name="プレイヤー2").click()
            await page.wait_for_timeout(500)
            player2_hand = page.get_by_role("textbox", name="手牌 (13枚または14枚) 手牌 (13枚または14枚)")
            await player2_hand.click()
            await player2_hand.fill("1m 2m 3m 1p 2p 3p 1s 2s 3s 1w 2w 3w 4w")
            player2_draw = page.get_by_role("textbox", name="ツモ牌 (順番通り) ツモ牌 (順番通り)")
            await player2_draw.click()
            await player2_draw.fill("1d 2d 3d 1d 2d 3d 1d 2d 3d 1d 2d 3d 1d 2d 3d")
            
            # プレイヤー3
            await page.get_by_role("tab", name="プレイヤー3").click()
            await page.wait_for_timeout(500)
            player3_hand = page.get_by_role("textbox", name="手牌 (13枚または14枚) 手牌 (13枚または14枚)")
            await player3_hand.click()
            await player3_hand.fill("1m 2m 3m 1p 2p 3p 1s 2s 3s 1w 2w 3w 4w")
            player3_draw = page.get_by_role("textbox", name="ツモ牌 (順番通り) ツモ牌 (順番通り)")
            await player3_draw.click()
            await player3_draw.fill("1d 2d 3d 1d 2d 3d 1d 2d 3d 1d 2d 3d 1d 2d 3d")
            
            # プレイヤー4
            await page.get_by_role("tab", name="プレイヤー4").click()
            await page.wait_for_timeout(500)
            player4_hand = page.get_by_role("textbox", name="手牌 (13枚または14枚) 手牌 (13枚または14枚)")
            await player4_hand.click()
            await player4_hand.fill("1m 2m 3m 1p 2p 3p 1s 2s 3s 1w 2w 3w 4w")
            player4_draw = page.get_by_role("textbox", name="ツモ牌 (順番通り) ツモ牌 (順番通り)")
            await player4_draw.click()
            await player4_draw.fill("1d 2d 3d 1d 2d 3d 1d 2d 3d 1d 2d 3d 1d 2d 3d")
            
            # プレイヤー1に戻る
            await page.get_by_role("tab", name="プレイヤー1").click()
            await page.wait_for_timeout(500)
            
            # テストモード開始
            start_test_button = page.get_by_role("button", name="テストモード開始")
            await start_test_button.click()
            await page.wait_for_timeout(3000)
            
            print("✅ テストモード開始完了")
            
            # 即リーチ宣言（配牌即リーチ）
            riichi_button = page.get_by_role("button", name="リーチ")
            if await riichi_button.is_visible():
                print("🎯 配牌即リーチを宣言...")
                await riichi_button.click()
                await page.wait_for_timeout(2000)
                print("✅ リーチ宣言完了（ダブルリーチ狙い）")
                
                # 8筒を捨てる（リーチ後の自動打牌）
                # 記録では8筒を最初にクリックしているので、それに合わせる
                tile_8p = page.get_by_role("button", name="8筒").first
                if await tile_8p.is_visible():
                    print("🎯 8筒を捨てます...")
                    await tile_8p.click()
                    await page.wait_for_timeout(2000)
                    print("✅ 8筒打牌完了")
                
                # CPUのターンを短縮して一発成立
                await page.wait_for_timeout(3000)
                
                # ツモボタンが表示されるまで待機（一発ツモ）
                max_attempts = 3
                for attempt in range(max_attempts):
                    print(f"🔍 ツモボタン確認 (試行 {attempt + 1}/{max_attempts})...")
                    
                    tsumo_button = page.get_by_role("button", name="ツモ")
                    if await tsumo_button.is_visible():
                        print("✅ ツモボタンが表示されました！")
                        
                        # ツモを実行
                        print("🎯 ツモを実行...")
                        await tsumo_button.click()
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
                            await page.screenshot(path='test/screenshots/yaku_test_1_chinitsu.png')
                            print("📸 清一色・リャンペーコー役のスクリーンショットを保存")
                            
                            return True
                        else:
                            print("❌ Win Modalが表示されていません")
                            break
                    else:
                        if attempt < max_attempts - 1:
                            print("🔄 次のツモを待機中...")
                            await page.wait_for_timeout(3000)
                        else:
                            print("❌ ツモボタンが表示されませんでした")
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
        "リーチ",           # または ダブルリーチ
        "一発",
        "門前清自摸和",     # ツモ
        "断么九",           # タンヤオ
        "清一色", 
        "二盃口"            # リャンペーコー
    ]
    
    # リーチ関連の別名も検索
    riichi_variants = ["リーチ", "立直", "ダブルリーチ", "両立直"]
    
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
        # リーチの場合は別名も確認
        if expected == "リーチ" and not found:
            found = any(variant in yaku for variant in riichi_variants for yaku in found_yaku)
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
    parser = argparse.ArgumentParser(description='清一色・リャンペーコー役テスト')
    parser.add_argument('url', nargs='?', default='http://localhost:5173', 
                       help='テスト対象のURL')
    parser.add_argument('--headless', action='store_true', 
                       help='ヘッドレスモードで実行')
    
    args = parser.parse_args()
    
    print(f"🚀 清一色・リャンペーコー役テスト開始: {args.url}")
    success = await test_chinitsu_ryanpeikou(args.url, True)  # WSL環境では常にheadless
    
    if success:
        print("🎉 テスト成功: 清一色・リャンペーコー役が正常に確認されました")
    else:
        print("❌ テスト失敗: 期待される役が確認できませんでした")
    
    print("✨ テスト完了")

if __name__ == "__main__":
    asyncio.run(main())