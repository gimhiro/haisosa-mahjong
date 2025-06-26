import { describe, it, expect } from 'vitest'
import { calculateShanten, canRiichi } from '../mahjong-logic'
import type { Tile } from '../../stores/fourPlayerMahjong'

describe('テンパイ判定ロジック', () => {
  function createTile(suit: 'man' | 'pin' | 'sou' | 'honor', rank: number, id: string): Tile {
    return { id, suit, rank }
  }

  describe('calculateShanten', () => {
    it('13枚でテンパイ（シャンテン0）を正しく判定する', () => {
      // 13枚のテンパイ手牌: 111222333456m7m
      const tiles: Tile[] = [
        createTile('man', 1, 'm1-1'), createTile('man', 1, 'm1-2'), createTile('man', 1, 'm1-3'),
        createTile('man', 2, 'm2-1'), createTile('man', 2, 'm2-2'), createTile('man', 2, 'm2-3'),
        createTile('man', 3, 'm3-1'), createTile('man', 3, 'm3-2'), createTile('man', 3, 'm3-3'),
        createTile('man', 4, 'm4-1'), createTile('man', 5, 'm5-1'), createTile('man', 6, 'm6-1'),
        createTile('man', 7, 'm7-1')
      ]

      expect(calculateShanten(tiles)).toBe(0)
    })

    it('14枚でアガリ（シャンテン-1）を正しく判定する', () => {
      // 14枚のアガリ手牌: 111222333456m78m
      const tiles: Tile[] = [
        createTile('man', 1, 'm1-1'), createTile('man', 1, 'm1-2'), createTile('man', 1, 'm1-3'),
        createTile('man', 2, 'm2-1'), createTile('man', 2, 'm2-2'), createTile('man', 2, 'm2-3'),
        createTile('man', 3, 'm3-1'), createTile('man', 3, 'm3-2'), createTile('man', 3, 'm3-3'),
        createTile('man', 4, 'm4-1'), createTile('man', 5, 'm5-1'), createTile('man', 6, 'm6-1'),
        createTile('man', 7, 'm7-1'), createTile('man', 8, 'm8-1')
      ]

      expect(calculateShanten(tiles)).toBe(-1)
    })

    it('1シャンテンを正しく判定する', () => {
      // 1シャンテン手牌: 111222333m145p9m
      const tiles: Tile[] = [
        createTile('man', 1, 'm1-1'), createTile('man', 1, 'm1-2'), createTile('man', 1, 'm1-3'),
        createTile('man', 2, 'm2-1'), createTile('man', 2, 'm2-2'), createTile('man', 2, 'm2-3'),
        createTile('man', 3, 'm3-1'), createTile('man', 3, 'm3-2'), createTile('man', 3, 'm3-3'),
        createTile('pin', 1, 'p1-1'), createTile('pin', 4, 'p4-1'), createTile('pin', 5, 'p5-1'),
        createTile('man', 9, 'm9-1')
      ]

      expect(calculateShanten(tiles)).toBe(1)
    })

    it('不正な枚数の場合は最大シャンテン数を返す', () => {
      const tiles: Tile[] = [
        createTile('man', 1, 'm1-1'), createTile('man', 2, 'm2-1')
      ]

      expect(calculateShanten(tiles)).toBe(8)
    })
  })

  describe('canRiichi', () => {
    it('テンパイ時にリーチ可能と判定する', () => {
      // リーチ判定用14枚: 111222333456m7m + 9m (14枚)
      const tiles: Tile[] = [
        createTile('man', 1, 'm1-1'), createTile('man', 1, 'm1-2'), createTile('man', 1, 'm1-3'),
        createTile('man', 2, 'm2-1'), createTile('man', 2, 'm2-2'), createTile('man', 2, 'm2-3'),
        createTile('man', 3, 'm3-1'), createTile('man', 3, 'm3-2'), createTile('man', 3, 'm3-3'),
        createTile('man', 4, 'm4-1'), createTile('man', 5, 'm5-1'), createTile('man', 6, 'm6-1'),
        createTile('man', 7, 'm7-1'), createTile('man', 9, 'm9-1')
      ]

      expect(canRiichi(tiles)).toBe(true)
    })

    it('1シャンテン時にリーチ不可と判定する', () => {
      // 1シャンテン手牌14枚: 111222333m145p9m + 8m
      const tiles: Tile[] = [
        createTile('man', 1, 'm1-1'), createTile('man', 1, 'm1-2'), createTile('man', 1, 'm1-3'),
        createTile('man', 2, 'm2-1'), createTile('man', 2, 'm2-2'), createTile('man', 2, 'm2-3'),
        createTile('man', 3, 'm3-1'), createTile('man', 3, 'm3-2'), createTile('man', 3, 'm3-3'),
        createTile('pin', 1, 'p1-1'), createTile('pin', 4, 'p4-1'), createTile('pin', 5, 'p5-1'),
        createTile('man', 9, 'm9-1'), createTile('man', 8, 'm8-1')
      ]

      expect(canRiichi(tiles)).toBe(false)
    })

    it('アガリ手牌でもリーチ可能と判定する', () => {
      // アガリ手牌: 111222333456m78m (14枚)
      // このような手牌でも、1枚捨ててテンパイにすることでリーチ宣言可能
      const tiles: Tile[] = [
        createTile('man', 1, 'm1-1'), createTile('man', 1, 'm1-2'), createTile('man', 1, 'm1-3'),
        createTile('man', 2, 'm2-1'), createTile('man', 2, 'm2-2'), createTile('man', 2, 'm2-3'),
        createTile('man', 3, 'm3-1'), createTile('man', 3, 'm3-2'), createTile('man', 3, 'm3-3'),
        createTile('man', 4, 'm4-1'), createTile('man', 5, 'm5-1'), createTile('man', 6, 'm6-1'),
        createTile('man', 7, 'm7-1'), createTile('man', 8, 'm8-1')
      ]

      expect(canRiichi(tiles)).toBe(true)
    })
  })
})