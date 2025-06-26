import { describe, it, expect } from 'vitest'
import { GameManager } from '../game-manager'

describe('ドラ判定デバッグ', () => {
  it('実際のゲーム状況でドラ判定をテスト', () => {
    const gameManager = new GameManager()
    
    // ゲームを開始してドラ表示牌を確認
    gameManager.startNewGame()
    
    const doraIndicators = gameManager.doraIndicators
    console.log('ドラ表示牌:', doraIndicators)
    
    if (doraIndicators.length > 0) {
      const indicator = doraIndicators[0]
      console.log(`ドラ表示牌: ${indicator.suit}${indicator.rank}`)
      
      // 手牌の中でドラになるべき牌をチェック
      const humanPlayer = gameManager.humanPlayer
      console.log('人間プレイヤーの手牌:')
      humanPlayer.tiles.forEach(tile => {
        const isDora = gameManager.isDoraTile(tile)
        console.log(`  ${tile.suit}${tile.rank} -> ドラ: ${isDora}`)
      })
      
      // 期待されるドラ牌を手動で作成してテスト
      let expectedDoraRank: number
      let expectedDoraSuit = indicator.suit
      
      if (indicator.suit === 'honor') {
        if (indicator.rank <= 4) {
          // 風牌: 東(1)→南(2)→西(3)→北(4)→東(1)
          expectedDoraRank = indicator.rank === 4 ? 1 : indicator.rank + 1
        } else {
          // 三元牌: 白(5)→發(6)→中(7)→白(5)
          expectedDoraRank = indicator.rank === 7 ? 5 : indicator.rank + 1
        }
      } else {
        // 数牌: 1→2→...→9→1
        expectedDoraRank = indicator.rank === 9 ? 1 : indicator.rank + 1
      }
      
      const expectedDoraTile = {
        id: 'test-dora',
        suit: expectedDoraSuit,
        rank: expectedDoraRank,
        isRed: false
      }
      
      console.log(`期待されるドラ牌: ${expectedDoraTile.suit}${expectedDoraTile.rank}`)
      console.log(`期待されるドラ牌の判定結果: ${gameManager.isDoraTile(expectedDoraTile)}`)
      
      expect(gameManager.isDoraTile(expectedDoraTile)).toBe(true)
    }
  })
})