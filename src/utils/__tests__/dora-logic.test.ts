import { describe, it, expect, beforeEach } from 'vitest'
import { GameManager } from '../game-manager'
import type { Tile } from '../../stores/fourPlayerMahjong'

describe('ドラ判定ロジック', () => {
  let gameManager: GameManager

  beforeEach(() => {
    gameManager = new GameManager()
  })

  describe('数牌のドラ判定', () => {
    it('1m表示→2mがドラ', () => {
      // ドラ表示牌として1mを設定
      const doraIndicator: Tile = { id: 'test-1', suit: 'man', rank: 1, isRed: false }
      gameManager['_doraIndicators'] = [doraIndicator]

      // テスト対象の牌: 2m
      const testTile: Tile = { id: 'test-2', suit: 'man', rank: 2, isRed: false }

      expect(gameManager.isDoraTile(testTile)).toBe(true)
    })

    it('2m表示→3mがドラ', () => {
      const doraIndicator: Tile = { id: 'test-1', suit: 'man', rank: 2, isRed: false }
      gameManager['_doraIndicators'] = [doraIndicator]

      const testTile: Tile = { id: 'test-2', suit: 'man', rank: 3, isRed: false }

      expect(gameManager.isDoraTile(testTile)).toBe(true)
    })

    it('9m表示→1mがドラ（循環）', () => {
      const doraIndicator: Tile = { id: 'test-1', suit: 'man', rank: 9, isRed: false }
      gameManager['_doraIndicators'] = [doraIndicator]

      const testTile: Tile = { id: 'test-2', suit: 'man', rank: 1, isRed: false }

      expect(gameManager.isDoraTile(testTile)).toBe(true)
    })

    it('1p表示→2pがドラ', () => {
      const doraIndicator: Tile = { id: 'test-1', suit: 'pin', rank: 1, isRed: false }
      gameManager['_doraIndicators'] = [doraIndicator]

      const testTile: Tile = { id: 'test-2', suit: 'pin', rank: 2, isRed: false }

      expect(gameManager.isDoraTile(testTile)).toBe(true)
    })

    it('1s表示→2sがドラ', () => {
      const doraIndicator: Tile = { id: 'test-1', suit: 'sou', rank: 1, isRed: false }
      gameManager['_doraIndicators'] = [doraIndicator]

      const testTile: Tile = { id: 'test-2', suit: 'sou', rank: 2, isRed: false }

      expect(gameManager.isDoraTile(testTile)).toBe(true)
    })
  })

  describe('風牌のドラ判定', () => {
    it('東表示→南がドラ', () => {
      const doraIndicator: Tile = { id: 'test-1', suit: 'honor', rank: 1, isRed: false } // 東
      gameManager['_doraIndicators'] = [doraIndicator]

      const testTile: Tile = { id: 'test-2', suit: 'honor', rank: 2, isRed: false } // 南

      expect(gameManager.isDoraTile(testTile)).toBe(true)
    })

    it('南表示→西がドラ', () => {
      const doraIndicator: Tile = { id: 'test-1', suit: 'honor', rank: 2, isRed: false } // 南
      gameManager['_doraIndicators'] = [doraIndicator]

      const testTile: Tile = { id: 'test-2', suit: 'honor', rank: 3, isRed: false } // 西

      expect(gameManager.isDoraTile(testTile)).toBe(true)
    })

    it('西表示→北がドラ', () => {
      const doraIndicator: Tile = { id: 'test-1', suit: 'honor', rank: 3, isRed: false } // 西
      gameManager['_doraIndicators'] = [doraIndicator]

      const testTile: Tile = { id: 'test-2', suit: 'honor', rank: 4, isRed: false } // 北

      expect(gameManager.isDoraTile(testTile)).toBe(true)
    })

    it('北表示→東がドラ（循環）', () => {
      const doraIndicator: Tile = { id: 'test-1', suit: 'honor', rank: 4, isRed: false } // 北
      gameManager['_doraIndicators'] = [doraIndicator]

      const testTile: Tile = { id: 'test-2', suit: 'honor', rank: 1, isRed: false } // 東

      expect(gameManager.isDoraTile(testTile)).toBe(true)
    })
  })

  describe('三元牌のドラ判定', () => {
    it('白表示→發がドラ', () => {
      const doraIndicator: Tile = { id: 'test-1', suit: 'honor', rank: 5, isRed: false } // 白
      gameManager['_doraIndicators'] = [doraIndicator]

      const testTile: Tile = { id: 'test-2', suit: 'honor', rank: 6, isRed: false } // 發

      expect(gameManager.isDoraTile(testTile)).toBe(true)
    })

    it('發表示→中がドラ', () => {
      const doraIndicator: Tile = { id: 'test-1', suit: 'honor', rank: 6, isRed: false } // 發
      gameManager['_doraIndicators'] = [doraIndicator]

      const testTile: Tile = { id: 'test-2', suit: 'honor', rank: 7, isRed: false } // 中

      expect(gameManager.isDoraTile(testTile)).toBe(true)
    })

    it('中表示→白がドラ（循環）', () => {
      const doraIndicator: Tile = { id: 'test-1', suit: 'honor', rank: 7, isRed: false } // 中
      gameManager['_doraIndicators'] = [doraIndicator]

      const testTile: Tile = { id: 'test-2', suit: 'honor', rank: 5, isRed: false } // 白

      expect(gameManager.isDoraTile(testTile)).toBe(true)
    })
  })

  describe('ドラではない場合', () => {
    it('1m表示で3mはドラではない', () => {
      const doraIndicator: Tile = { id: 'test-1', suit: 'man', rank: 1, isRed: false }
      gameManager['_doraIndicators'] = [doraIndicator]

      const testTile: Tile = { id: 'test-2', suit: 'man', rank: 3, isRed: false }

      expect(gameManager.isDoraTile(testTile)).toBe(false)
    })

    it('異なる種類の牌はドラではない', () => {
      const doraIndicator: Tile = { id: 'test-1', suit: 'man', rank: 1, isRed: false }
      gameManager['_doraIndicators'] = [doraIndicator]

      const testTile: Tile = { id: 'test-2', suit: 'pin', rank: 2, isRed: false }

      expect(gameManager.isDoraTile(testTile)).toBe(false)
    })
  })

  describe('複数ドラ表示牌', () => {
    it('複数のドラ表示牌がある場合、どれかにマッチすればドラ', () => {
      const doraIndicators: Tile[] = [
        { id: 'test-1', suit: 'man', rank: 1, isRed: false }, // 1m表示 → 2mがドラ
        { id: 'test-2', suit: 'pin', rank: 5, isRed: false }  // 5p表示 → 6pがドラ
      ]
      gameManager['_doraIndicators'] = doraIndicators

      const testTile1: Tile = { id: 'test-3', suit: 'man', rank: 2, isRed: false } // 2m（ドラ）
      const testTile2: Tile = { id: 'test-4', suit: 'pin', rank: 6, isRed: false } // 6p（ドラ）
      const testTile3: Tile = { id: 'test-5', suit: 'sou', rank: 1, isRed: false } // 1s（ドラではない）

      expect(gameManager.isDoraTile(testTile1)).toBe(true)
      expect(gameManager.isDoraTile(testTile2)).toBe(true)
      expect(gameManager.isDoraTile(testTile3)).toBe(false)
    })
  })
})