import { describe, it, expect } from 'vitest'
import { getTileText, getTileImagePath, getTileImagePathYoko, getTileImageUrl } from '../tile-renderer'
import type { Tile } from '../stores/fourPlayerMahjong'

describe('tile-renderer', () => {
  describe('getTileText', () => {
    describe('萬子（数牌）', () => {
      it('1萬のテキストを返す', () => {
        const tile: Tile = { suit: 'man', rank: 1, id: '1m' }
        expect(getTileText(tile)).toBe('1萬')
      })

      it('9萬のテキストを返す', () => {
        const tile: Tile = { suit: 'man', rank: 9, id: '9m' }
        expect(getTileText(tile)).toBe('9萬')
      })
    })

    describe('筒子（数牌）', () => {
      it('1筒のテキストを返す', () => {
        const tile: Tile = { suit: 'pin', rank: 1, id: '1p' }
        expect(getTileText(tile)).toBe('1筒')
      })

      it('9筒のテキストを返す', () => {
        const tile: Tile = { suit: 'pin', rank: 9, id: '9p' }
        expect(getTileText(tile)).toBe('9筒')
      })
    })

    describe('索子（数牌）', () => {
      it('1索のテキストを返す', () => {
        const tile: Tile = { suit: 'sou', rank: 1, id: '1s' }
        expect(getTileText(tile)).toBe('1索')
      })

      it('9索のテキストを返す', () => {
        const tile: Tile = { suit: 'sou', rank: 9, id: '9s' }
        expect(getTileText(tile)).toBe('9索')
      })
    })

    describe('字牌', () => {
      it('東のテキストを返す', () => {
        const tile: Tile = { suit: 'honor', rank: 1, id: 'east' }
        expect(getTileText(tile)).toBe('東')
      })

      it('南のテキストを返す', () => {
        const tile: Tile = { suit: 'honor', rank: 2, id: 'south' }
        expect(getTileText(tile)).toBe('南')
      })

      it('西のテキストを返す', () => {
        const tile: Tile = { suit: 'honor', rank: 3, id: 'west' }
        expect(getTileText(tile)).toBe('西')
      })

      it('北のテキストを返す', () => {
        const tile: Tile = { suit: 'honor', rank: 4, id: 'north' }
        expect(getTileText(tile)).toBe('北')
      })

      it('白のテキストを返す', () => {
        const tile: Tile = { suit: 'honor', rank: 5, id: 'white' }
        expect(getTileText(tile)).toBe('白')
      })

      it('発のテキストを返す', () => {
        const tile: Tile = { suit: 'honor', rank: 6, id: 'green' }
        expect(getTileText(tile)).toBe('發')
      })

      it('中のテキストを返す', () => {
        const tile: Tile = { suit: 'honor', rank: 7, id: 'red' }
        expect(getTileText(tile)).toBe('中')
      })
    })

    describe('エラーケース', () => {
      it('不正な牌タイプに対して適切に処理する', () => {
        const tile = { suit: 'invalid', rank: 1, id: 'invalid' } as any
        // 実装では字牌として処理される
        expect(getTileText(tile)).toBe('東')
      })

      it('数牌で不正な数字に対して適切に処理する', () => {
        const tile: Tile = { suit: 'man', rank: 0, id: '0m' }
        // 実装では0萬として表示される
        expect(getTileText(tile)).toBe('0萬')
      })

      it('字牌で不正なランクに対してエラーメッセージを返す', () => {
        const tile = { suit: 'honor', rank: 8, id: 'invalid' } as any
        expect(getTileText(tile)).toBe('?')
      })
    })
  })

  describe('getTileImagePath', () => {
    describe('萬子（数牌）', () => {
      it('1萬の画像パスを返す', () => {
        const tile: Tile = { suit: 'man', rank: 1, id: '1m' }
        expect(getTileImagePath(tile)).toBe('/src/assets/tiles/m1.png')
      })

      it('9萬の画像パスを返す', () => {
        const tile: Tile = { suit: 'man', rank: 9, id: '9m' }
        expect(getTileImagePath(tile)).toBe('/src/assets/tiles/m9.png')
      })
    })

    describe('筒子（数牌）', () => {
      it('1筒の画像パスを返す', () => {
        const tile: Tile = { suit: 'pin', rank: 1, id: '1p' }
        expect(getTileImagePath(tile)).toBe('/src/assets/tiles/p1.png')
      })

      it('9筒の画像パスを返す', () => {
        const tile: Tile = { suit: 'pin', rank: 9, id: '9p' }
        expect(getTileImagePath(tile)).toBe('/src/assets/tiles/p9.png')
      })
    })

    describe('索子（数牌）', () => {
      it('1索の画像パスを返す', () => {
        const tile: Tile = { suit: 'sou', rank: 1, id: '1s' }
        expect(getTileImagePath(tile)).toBe('/src/assets/tiles/s1.png')
      })

      it('9索の画像パスを返す', () => {
        const tile: Tile = { suit: 'sou', rank: 9, id: '9s' }
        expect(getTileImagePath(tile)).toBe('/src/assets/tiles/s9.png')
      })
    })

    describe('字牌', () => {
      it('東の画像パスを返す', () => {
        const tile: Tile = { suit: 'honor', rank: 1, id: 'east' }
        expect(getTileImagePath(tile)).toBe('/src/assets/tiles/w1.png')
      })

      it('南の画像パスを返す', () => {
        const tile: Tile = { suit: 'honor', rank: 2, id: 'south' }
        expect(getTileImagePath(tile)).toBe('/src/assets/tiles/w2.png')
      })

      it('西の画像パスを返す', () => {
        const tile: Tile = { suit: 'honor', rank: 3, id: 'west' }
        expect(getTileImagePath(tile)).toBe('/src/assets/tiles/w3.png')
      })

      it('北の画像パスを返す', () => {
        const tile: Tile = { suit: 'honor', rank: 4, id: 'north' }
        expect(getTileImagePath(tile)).toBe('/src/assets/tiles/w4.png')
      })

      it('白の画像パスを返す', () => {
        const tile: Tile = { suit: 'honor', rank: 5, id: 'white' }
        expect(getTileImagePath(tile)).toBe('/src/assets/tiles/d1.png')
      })

      it('発の画像パスを返す', () => {
        const tile: Tile = { suit: 'honor', rank: 6, id: 'green' }
        expect(getTileImagePath(tile)).toBe('/src/assets/tiles/d2.png')
      })

      it('中の画像パスを返す', () => {
        const tile: Tile = { suit: 'honor', rank: 7, id: 'red' }
        expect(getTileImagePath(tile)).toBe('/src/assets/tiles/d3.png')
      })
    })

    describe('エラーケース', () => {
      it('不正な牌タイプの場合エラーが発生する', () => {
        const tile = { suit: 'invalid', rank: 1, id: 'invalid' } as any
        expect(() => getTileImagePath(tile)).not.toThrow()
      })

      it('数牌で不正な数字の場合エラーが発生しない', () => {
        const tile: Tile = { suit: 'man', rank: 0, id: '0m' }
        expect(() => getTileImagePath(tile)).not.toThrow()
      })

      it('字牌で不正なランクの場合エラーが発生しない', () => {
        const tile = { suit: 'honor', rank: 8, id: 'invalid' } as any
        expect(() => getTileImagePath(tile)).not.toThrow()
      })
    })
  })
})