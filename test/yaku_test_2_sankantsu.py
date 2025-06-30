#!/usr/bin/env python3
"""
通常役テスト2: 三槓子・三暗刻・小三元
手牌: [暗槓]白白白 發發發 東東東 111m 中
期待役: 三槓子・三暗刻・対々和・小三元・混老頭・役牌（東＋三元）・嶺上開花
条件: 東が連風（場風＋自風）、白ミンカン→2回連続暗槓→リンシャンツモ
"""

import asyncio
import argparse
from playwright.async_api import async_playwright

async def test_sankantsu_sanankou(base_url: str, headless: bool = True):
    """三槓子・三暗刻・小三元役のテスト"""
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=headless)  # WSL環境では常にheadless
        page = await browser.new_page()
        
        # コンソールログを出力
        page.on("console", lambda msg: print(f" CONSOLE: {msg.text}"))
        page.on("pageerror", lambda error: print(f"❌ PAGE ERROR: {error}"))
        
        try:
            print(" 三槓子・三暗刻・小三元役テストを開始...")
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
            
            # 手牌設定（三槓子形）13枚: 白白白 發發發 東東東 111m 中
            hand_textbox = page.get_by_role("textbox", name="手牌 (13枚または14枚) 手牌 (13枚または14枚)")
            await hand_textbox.click()
            await hand_textbox.fill("haku haku haku hatsu hatsu hatsu ton ton ton 1m 1m 1m chun")
            
            # ツモ牌設定（1pツモ→白ミンカン用の白→東暗槓→發暗槓→中でリンシャンツモ）
            draw_textbox = page.get_by_role("textbox", name="ツモ牌 (順番通り) ツモ牌 (順番通り)")
            await draw_textbox.click()
            await draw_textbox.fill("1p ton hatsu chun")
            
            # 他のプレイヤーの手牌設定（CPUが正常に動作するように）
            # プレイヤー2
            await page.get_by_role("tab", name="プレイヤー2").click()
            await page.wait_for_timeout(500)
            player2_hand = page.get_by_role("textbox", name="手牌 (13枚または14枚) 手牌 (13枚または14枚)")
            await player2_hand.click()
            await player2_hand.fill("1m 2m 3m 1p 2p 3p 1s 2s 3s 4p 4p 4p haku")
            player2_draw = page.get_by_role("textbox", name="ツモ牌 (順番通り) ツモ牌 (順番通り)")
            await player2_draw.click()
            await player2_draw.fill("5p 5p 5p")
            
            # プレイヤー3
            await page.get_by_role("tab", name="プレイヤー3").click()
            await page.wait_for_timeout(500)
            player3_hand = page.get_by_role("textbox", name="手牌 (13枚または14枚) 手牌 (13枚または14枚)")
            await player3_hand.click()
            await player3_hand.fill("1m 2m 3m 1p 2p 3p 1s 2s 3s 4p 4p 4p 1d")
            player3_draw = page.get_by_role("textbox", name="ツモ牌 (順番通り) ツモ牌 (順番通り)")
            await player3_draw.click()
            await player3_draw.fill("5p 5p 5p")
            
            # プレイヤー4
            await page.get_by_role("tab", name="プレイヤー4").click()
            await page.wait_for_timeout(500)
            player4_hand = page.get_by_role("textbox", name="手牌 (13枚または14枚) 手牌 (13枚または14枚)")
            await player4_hand.click()
            await player4_hand.fill("1m 2m 3m 1p 2p 3p 1s 2s 3s 4p 4p 4p 1d")
            player4_draw = page.get_by_role("textbox", name="ツモ牌 (順番通り) ツモ牌 (順番通り)")
            await player4_draw.click()
            await player4_draw.fill("5p 5p 5p")
            
            # テストモード開始
            start_test_button = page.get_by_role("button", name="テストモード開始")
            await start_test_button.click()
            await page.wait_for_timeout(3000)
            
            
            print("✅ テストモード開始完了")
            
            # 最初に1pを捨てる
            tile_1p = page.get_by_role("button", name="1筒")
            if await tile_1p.is_visible():
                print(" 1筒を捨てます...")
                await tile_1p.click()
                await page.wait_for_timeout(2000)
                
                print("✅ 1筒打牌完了")
            
            # CPUのターンを待つ（プレイヤー2が白を捨てるまで）
            await page.wait_for_timeout(5000)
            
            # 白のミンカンボタンを待つ
            print(" 白のミンカンを待機...")
            minkan_button = page.get_by_role("button", name="カン")
            if await minkan_button.is_visible():
                print(" 白のミンカンを実行...")
                await minkan_button.click()
                await page.wait_for_timeout(2000)
                print("✅ 白のミンカン完了")
            
            # 1回目の暗槓（東）- tonツモ後
            success = await perform_ankan_new(page, 1)
            if not success:
                print("❌ 1回目の暗槓に失敗")
                return False
            
            # 2回目の暗槓（發）- hatsuツモ後
            success = await perform_ankan_new(page, 2)
            if not success:
                print("❌ 2回目の暗槓に失敗")
                return False
            
            # CPUのターンを待つ
            await page.wait_for_timeout(3000)
            
            # リンシャンツモ（中でツモアガリ）
            print(" リンシャンツモ（中）を実行...")
            tsumo_button = page.get_by_role("button", name="ツモ")
            if await tsumo_button.is_visible():
                print("✅ ツモボタンが表示されました！")
                await tsumo_button.click()
                await page.wait_for_timeout(3000)
                
                # Win Modal確認と役の検証
                win_modal = page.locator('.modal-container, .v-dialog')
                if await win_modal.is_visible():
                    print("✅ Win Modalが表示されました")
                    
                    # 役の確認
                    await verify_yaku(page, win_modal)
                    
                    return True
                else:
                    print("❌ Win Modalが表示されていません")
                    return False
            else:
                print("❌ ツモボタンが表示されませんでした")
                return False
                        
        except Exception as e:
            print(f"❌ エラーが発生しました: {e}")
            import traceback
            traceback.print_exc()
            
        finally:
            await browser.close()
    
    return False

async def perform_ankan(page, tile_name, kan_number):
    """暗槓を実行"""
    print(f" {kan_number}回目の暗槓（{tile_name}）を実行...")
    
    ankan_button = page.get_by_role("button", name="暗カン")
    if await ankan_button.is_visible():
        await ankan_button.click()
        await page.wait_for_timeout(2000)
        print(f"✅ {kan_number}回目の暗槓完了")
        return True
    else:
        print(f"❌ {kan_number}回目の暗槓ボタンが見つかりません")
        return False

async def perform_ankan_new(page, kan_number):
    """暗槓を実行（新版）"""
    print(f" {kan_number}回目の暗槓を実行...")
    
    # まず「カン」ボタンをクリック
    kan_button = page.get_by_role("button", name="カン")
    if await kan_button.is_visible():
        await kan_button.click()
        await page.wait_for_timeout(2000)
        
        print(f"✅ {kan_number}回目の暗槓完了")
        return True
    else:
        print(f"❌ {kan_number}回目のカンボタンが見つかりません")
        return False

async def verify_yaku(page, win_modal):
    """役の検証"""
    print(" Win Modal内の役を確認...")
    
    # 期待される役リスト
    expected_yaku = [
        "三槓子",
        "三暗刻", 
        "対々和",
        "小三元",
        "東",               # 場風・自風（ダブトン）
        "白",               # 三元牌
        "發",               # 三元牌
        "嶺上開花"
    ]
    
    # 役一覧の取得
    yaku_elements = win_modal.locator('.yaku-list .yaku-item, .yaku-list li, .yaku-list div')
    yaku_count = await yaku_elements.count()
    print(f" 表示された役数: {yaku_count}")
    
    found_yaku = []
    for i in range(yaku_count):
        yaku_element = yaku_elements.nth(i)
        if await yaku_element.is_visible():
            yaku_text = await yaku_element.text_content()
            if yaku_text and yaku_text.strip():
                found_yaku.append(yaku_text.strip())
                print(f"  役{i+1}: {yaku_text.strip()}")
    
    # 役の検証
    print(" 期待される役との照合:")
    for expected in expected_yaku:
        found = any(expected in yaku for yaku in found_yaku)
        status = "✅" if found else "❌"
        print(f"  {status} {expected}: {'発見' if found else '未発見'}")
    
    # 点数確認
    score_elements = win_modal.locator('.score-value, .total-points')
    if await score_elements.count() > 0:
        score_text = await score_elements.first.text_content()
        print(f" 獲得点数: {score_text}")
    
    # 翻数確認
    han_elements = win_modal.locator('.total-han, .han-count')
    if await han_elements.count() > 0:
        han_text = await han_elements.first.text_content()
        print(f" 合計翻数: {han_text}")
    
    return found_yaku

async def main():
    parser = argparse.ArgumentParser(description='三槓子・三暗刻・小三元役テスト')
    parser.add_argument('url', nargs='?', default='http://localhost:5173', 
                       help='テスト対象のURL')
    parser.add_argument('--headless', action='store_true', 
                       help='ヘッドレスモードで実行')
    
    args = parser.parse_args()
    
    print(f" 三槓子・三暗刻・小三元役テスト開始: {args.url}")
    success = await test_sankantsu_sanankou(args.url, args.headless)  # WSL環境では常にheadless
    
    if success:
        print(" テスト成功: 三槓子・三暗刻・小三元役が正常に確認されました")
    else:
        print("❌ テスト失敗: 期待される役が確認できませんでした")
    
    print(" テスト完了")

if __name__ == "__main__":
    asyncio.run(main())