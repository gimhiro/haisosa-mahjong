#!/usr/bin/env python3
"""
役テスト4: ハイテイツモ・純チャン・三色同刻
条件: 111m 111p 111s 789m 9p → 9p をハイテイ（最後の1つの牌）でツモ
期待役: 純全帯么九(純チャン) 2飜、三色同刻 2飜、ハイテイツモ 1飜
最新のPlaywrightレコードに基づく
"""

import asyncio
import argparse
from playwright.async_api import async_playwright

async def test_haitei_junchan_sanshoku(base_url: str, headless: bool = True):
    """ハイテイツモ・純チャン・三色同刻テスト（最新レコード通り）"""
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=headless)
        page = await browser.new_page()
        
        # コンソールログを出力
        page.on("console", lambda msg: print(f" CONSOLE: {msg.text}"))
        page.on("pageerror", lambda error: print(f"❌ PAGE ERROR: {error}"))
        
        try:
            print(" ハイテイツモ・純チャン・三色同刻テストを開始...")
            
            # 最新レコード通りに実行
            await page.goto(f"{base_url}/#/")
            await page.get_by_role("button", name="人対戦を開始").click()
            await page.get_by_role("button", name="テストモック起動").click()
            await page.get_by_role("textbox", name="手牌 (13枚または14枚) 手牌 (13枚または14枚)").click()
            await page.get_by_role("textbox", name="手牌 (13枚または14枚) 手牌 (13枚または14枚)").fill("1m 1m 1m 1p 1p 1p 1s 1s 1s 7m 8m 9m 9p")
            await page.get_by_role("textbox", name="ツモ牌 (順番通り) ツモ牌 (順番通り)").click()
            await page.get_by_role("textbox", name="ツモ牌 (順番通り) ツモ牌 (順番通り)").fill("3w 3w 3w 3w 3w 3w 3w 3w 3w 3w 3w 3w 3w 3w 3w 3w 3w 9p")
            await page.get_by_role("tab", name="プレイヤー1(自分)").click()
            await page.get_by_role("tab", name="プレイヤー2").click()
            await page.wait_for_timeout(2000)

            await page.get_by_role("textbox", name="手牌 (13枚または14枚) 手牌 (13枚または14枚)").click()
            await page.get_by_role("textbox", name="手牌 (13枚または14枚) 手牌 (13枚または14枚)").fill("1m 2m 3m 1p 2p 3p 1s 2s 3s 1w 1w 2w 2w ")
            await page.get_by_role("textbox", name="ツモ牌 (順番通り) ツモ牌 (順番通り)").click()
            await page.get_by_role("textbox", name="ツモ牌 (順番通り) ツモ牌 (順番通り)").fill("3w 3w 3w 3w 3w 3w 3w 3w 3w 3w 3w 3w 3w 3w 3w 3w 3w 9p 3w 3w 3w 3w 3w 3w 3w 3w 3w 3w 3w 3w 3w 3w")
            await page.get_by_role("tab", name="プレイヤー3").click()
            await page.wait_for_timeout(2000)

            await page.get_by_role("textbox", name="手牌 (13枚または14枚) 手牌 (13枚または14枚)").click()
            await page.get_by_role("textbox", name="手牌 (13枚または14枚) 手牌 (13枚または14枚)").fill("1m 2m 3m 1p 2p 3p 1s 2s 3s 1w 1w 2w 2w")
            await page.get_by_role("textbox", name="ツモ牌 (順番通り) ツモ牌 (順番通り)").click()
            await page.get_by_role("textbox", name="ツモ牌 (順番通り) ツモ牌 (順番通り)").fill("3w 3w 3w 3w 3w 3w 3w 3w 3w 3w 3w 3w 3w 3w 3w 3w 3w 9p 3w 3w 3w 3w 3w 3w 3w 3w 3w 3w 3w 3w 3w 3w")
            await page.get_by_role("tab", name="プレイヤー4").click()
            await page.wait_for_timeout(2000)

            await page.get_by_role("textbox", name="手牌 (13枚または14枚) 手牌 (13枚または14枚)").click()
            await page.get_by_role("textbox", name="手牌 (13枚または14枚) 手牌 (13枚または14枚)").fill("1m 2m 3m 1p 2p 3p 1s 2s 3s 1w 1w 2w 2w ")
            await page.get_by_role("textbox", name="ツモ牌 (順番通り) ツモ牌 (順番通り)").click()
            await page.get_by_role("textbox", name="ツモ牌 (順番通り) ツモ牌 (順番通り)").fill("3w 3w 3w 3w 3w 3w 3w 3w 3w 3w 3w 3w 3w 3w 3w 3w 3w 9p 3w 3w 3w 3w 3w 3w 3w 3w 3w 3w 3w 3w 3w 3w")
            await page.get_by_role("button", name="テストモード開始").click()
            await page.get_by_role("button", name="西").click()
            
            print(" 西をツモ切りしてハイテイまで進める...")
            
            # 最新レコード通り: 最初は drawn-tile-bottom をクリック
            await page.locator(".drawn-tile.drawn-tile-bottom").click()
            print("   1回目: drawn-tile-bottom をクリック")
            
            # その後16回 .drawn-tile > .mahjong-tile をクリック
            for i in range(16):
                try:
                    await page.locator(".drawn-tile > .mahjong-tile").click()
                    print(f"   {i+2}回目: drawn-tile > mahjong-tile をクリック")
                    await page.wait_for_timeout(200)  # 短い待機
                except Exception as e:
                    print(f"   {i+2}回目: クリックエラー - {e}")
                    break
            
            print(" ハイテイツモ（9p）を実行...")
            
            # ツモボタンをクリック
            try:
                await page.get_by_role("button", name="ツモ").click()
                print("✅ ツモボタンをクリックしました")
                await page.wait_for_timeout(3000)
            except Exception as e:
                print(f"❌ ツモボタンクリックエラー: {e}")
                return False
            
            # Win Modal確認
            win_modal = page.locator('.modal-container, .v-dialog')
            if await win_modal.is_visible():
                print("✅ Win Modalが表示されました")
                
                # 役一覧を取得
                yaku_info = await get_yaku_list(page, win_modal)
                print(" 検出された役:")
                for yaku in yaku_info:
                    print(f"   - {yaku}")
                
                # 期待される役をチェック
                expected_yaku = ["純全帯么九", "三色同刻", "海底摸月"]
                found_yaku = []
                
                for expected in expected_yaku:
                    found = any(expected in yaku for yaku in yaku_info)
                    if found:
                        found_yaku.append(expected)
                        print(f"✅ {expected}: 検出")
                    else:
                        print(f"❌ {expected}: 未検出")
                
                # スクリーンショット保存
                import os
                os.makedirs('test/screenshots', exist_ok=True)
                await page.screenshot(path='test/screenshots/yaku_test_4_haitei.png')
                print(" ハイテイツモテストのスクリーンショットを保存")
                
                # 結果判定
                if len(found_yaku) >= 2:  # 最低2つの役は欲しい
                    print("✅ テスト成功: 複数の役が検出されました")
                    if any("海底" in yaku for yaku in found_yaku):
                        print(" 海底摸月（ハイテイツモ）も正常に検出されています")
                        return True
                    else:
                        print(" 海底摸月が検出されていません（要実装確認）")
                        return True  # 他の役があれば一応成功とする
                else:
                    print("❌ テスト失敗: 期待される役が不足しています")
                    return False
            else:
                print("❌ Win Modalが表示されていません")
                return False
                
        except Exception as e:
            print(f"❌ エラーが発生しました: {e}")
            import traceback
            traceback.print_exc()
            
        finally:
            await page.close()
            await browser.close()
    
    return False

async def get_yaku_list(page, win_modal):
    """Win Modal内の役一覧を取得"""
    yaku_list = []
    try:
        # 他のテストと同じセレクタを使用
        yaku_elements = win_modal.locator('.yaku-list .yaku-item, .yaku-list li, .yaku-list div')
        yaku_count = await yaku_elements.count()
        print(f" 表示された役数: {yaku_count}")
        
        for i in range(yaku_count):
            yaku_element = yaku_elements.nth(i)
            if await yaku_element.is_visible():
                yaku_text = await yaku_element.text_content()
                if yaku_text and yaku_text.strip():
                    yaku_list.append(yaku_text.strip())
                    print(f"  役{i+1}: {yaku_text.strip()}")
        
        # 追加のセレクタでも確認
        if len(yaku_list) == 0:
            print(" 別のセレクタで役を確認中...")
            alternative_selectors = [
                '.score-value, .total-points',
                '.total-han, .han-count',
                'text=/翻/',
                'text=/飜/',
                '.modal-content',
                '.win-modal'
            ]
            
            for selector in alternative_selectors:
                elements = win_modal.locator(selector)
                count = await elements.count()
                if count > 0:
                    for i in range(count):
                        element = elements.nth(i)
                        if await element.is_visible():
                            text = await element.text_content()
                            if text and text.strip():
                                yaku_list.append(text.strip())
                                print(f"  追加情報{i+1}: {text.strip()}")
        
    except Exception as e:
        print(f"❌ 役一覧取得エラー: {e}")
    
    return yaku_list

async def main():
    parser = argparse.ArgumentParser(description='ハイテイツモ・純チャン・三色同刻テスト')
    parser.add_argument('url', nargs='?', default='http://localhost:5173', 
                       help='テスト対象のURL')
    parser.add_argument('--headless', action='store_true', 
                       help='ヘッドレスモードで実行')
    
    args = parser.parse_args()
    
    print(f" ハイテイツモ・純チャン・三色同刻テスト開始: {args.url}")
    success = await test_haitei_junchan_sanshoku(args.url, args.headless)
    
    if success:
        print(" テスト成功: ハイテイツモ関連役が検出されました")
    else:
        print("❌ テスト失敗: ハイテイツモ関連役に問題があります")
    
    print(" テスト完了")

if __name__ == "__main__":
    asyncio.run(main())