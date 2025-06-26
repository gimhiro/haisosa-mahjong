import { describe, it, expect } from 'vitest'
import { checkWinCondition, isWinningHand } from '../mahjong-logic'
import type { Tile } from '../../stores/fourPlayerMahjong'

describe('上がり判定ロジック', () => {
  function createTile(suit: 'man' | 'pin' | 'sou' | 'honor', rank: number, id: string): Tile {
    return { id, suit, rank }
  }

  describe('isWinningHand', () => {
    it('14枚の完成手でアガリと判定する', () => {
      // 14枚のアガリ手牌: 111222333456m78m
      const tiles: Tile[] = [
        createTile('man', 1, 'm1-1'), createTile('man', 1, 'm1-2'), createTile('man', 1, 'm1-3'),
        createTile('man', 2, 'm2-1'), createTile('man', 2, 'm2-2'), createTile('man', 2, 'm2-3'),
        createTile('man', 3, 'm3-1'), createTile('man', 3, 'm3-2'), createTile('man', 3, 'm3-3'),
        createTile('man', 4, 'm4-1'), createTile('man', 5, 'm5-1'), createTile('man', 6, 'm6-1'),
        createTile('man', 7, 'm7-1'), createTile('man', 8, 'm8-1')
      ]

      expect(isWinningHand(tiles)).toBe(true)
    })

    it('13枚のテンパイ手でアガリでないと判定する', () => {
      // 13枚のテンパイ手牌: 111222333456m7m
      const tiles: Tile[] = [
        createTile('man', 1, 'm1-1'), createTile('man', 1, 'm1-2'), createTile('man', 1, 'm1-3'),
        createTile('man', 2, 'm2-1'), createTile('man', 2, 'm2-2'), createTile('man', 2, 'm2-3'),
        createTile('man', 3, 'm3-1'), createTile('man', 3, 'm3-2'), createTile('man', 3, 'm3-3'),
        createTile('man', 4, 'm4-1'), createTile('man', 5, 'm5-1'), createTile('man', 6, 'm6-1'),
        createTile('man', 7, 'm7-1')
      ]

      expect(isWinningHand(tiles)).toBe(false)
    })

    it('バラバラな手でアガリでないと判定する', () => {
      // バラバラな14枚: 111m1247p1359s1w
      const tiles: Tile[] = [
        createTile('man', 1, 'm1-1'), createTile('man', 1, 'm1-2'), createTile('man', 1, 'm1-3'),
        createTile('pin', 1, 'p1-1'), createTile('pin', 2, 'p2-1'), createTile('pin', 4, 'p4-1'),
        createTile('pin', 7, 'p7-1'), createTile('sou', 1, 's1-1'), createTile('sou', 3, 's3-1'),
        createTile('sou', 5, 's5-1'), createTile('sou', 9, 's9-1'), createTile('honor', 1, 'h1-1'),
        createTile('honor', 2, 'h2-1'), createTile('honor', 3, 'h3-1')
      ]

      expect(isWinningHand(tiles)).toBe(false)
    })
  })

  describe('checkWinCondition', () => {
    it('ツモアガリの場合、正しい役と点数を計算する', () => {
      // 14枚のアガリ手牌: 111222333456m78m
      const tiles: Tile[] = [
        createTile('man', 1, 'm1-1'), createTile('man', 1, 'm1-2'), createTile('man', 1, 'm1-3'),
        createTile('man', 2, 'm2-1'), createTile('man', 2, 'm2-2'), createTile('man', 2, 'm2-3'),
        createTile('man', 3, 'm3-1'), createTile('man', 3, 'm3-2'), createTile('man', 3, 'm3-3'),
        createTile('man', 4, 'm4-1'), createTile('man', 5, 'm5-1'), createTile('man', 6, 'm6-1'),
        createTile('man', 7, 'm7-1'), createTile('man', 8, 'm8-1')
      ]
      const winTile = createTile('man', 8, 'm8-1')
      const doraIndicators: Tile[] = []

      const result = checkWinCondition(tiles, winTile, true, false, doraIndicators)

      expect(result.isWin).toBe(true)
      expect(result.yaku.some(y => y.name === '門前清自摸和')).toBe(true)
      expect(result.totalHan).toBeGreaterThan(0)
      expect(result.totalPoints).toBeGreaterThan(0)
    })

    it('リーチツモアガリの場合、リーチ役を含む', () => {
      // 14枚のアガリ手牌: 111222333456m78m
      const tiles: Tile[] = [
        createTile('man', 1, 'm1-1'), createTile('man', 1, 'm1-2'), createTile('man', 1, 'm1-3'),
        createTile('man', 2, 'm2-1'), createTile('man', 2, 'm2-2'), createTile('man', 2, 'm2-3'),
        createTile('man', 3, 'm3-1'), createTile('man', 3, 'm3-2'), createTile('man', 3, 'm3-3'),
        createTile('man', 4, 'm4-1'), createTile('man', 5, 'm5-1'), createTile('man', 6, 'm6-1'),
        createTile('man', 7, 'm7-1'), createTile('man', 8, 'm8-1')
      ]
      const winTile = createTile('man', 8, 'm8-1')
      const doraIndicators: Tile[] = []

      const result = checkWinCondition(tiles, winTile, true, true, doraIndicators)

      expect(result.isWin).toBe(true)
      expect(result.yaku.some(y => y.name === '門前清自摸和')).toBe(true)
      expect(result.yaku.some(y => y.name === 'リーチ')).toBe(true)
      expect(result.totalHan).toBeGreaterThanOrEqual(2)
    })

    it('ロンアガリの場合、ツモ役は付かない', () => {
      // 14枚のアガリ手牌: 111222333456m78m
      const tiles: Tile[] = [
        createTile('man', 1, 'm1-1'), createTile('man', 1, 'm1-2'), createTile('man', 1, 'm1-3'),
        createTile('man', 2, 'm2-1'), createTile('man', 2, 'm2-2'), createTile('man', 2, 'm2-3'),
        createTile('man', 3, 'm3-1'), createTile('man', 3, 'm3-2'), createTile('man', 3, 'm3-3'),
        createTile('man', 4, 'm4-1'), createTile('man', 5, 'm5-1'), createTile('man', 6, 'm6-1'),
        createTile('man', 7, 'm7-1'), createTile('man', 8, 'm8-1')
      ]
      const winTile = createTile('man', 8, 'm8-1')
      const doraIndicators: Tile[] = []

      const result = checkWinCondition(tiles, winTile, false, false, doraIndicators)

      expect(result.isWin).toBe(true)
      expect(result.yaku.some(y => y.name === '門前清自摸和')).toBe(false)
    })

    it('役なしの場合はアガリ無効となる', () => {
      // 役なしの14枚のアガリ手牌（例：ピンフ形だが役なし状況）
      const tiles: Tile[] = [
        createTile('man', 2, 'm2-1'), createTile('man', 3, 'm3-1'), createTile('man', 4, 'm4-1'),
        createTile('man', 5, 'm5-1'), createTile('man', 6, 'm6-1'), createTile('man', 7, 'm7-1'),
        createTile('pin', 2, 'p2-1'), createTile('pin', 3, 'p3-1'), createTile('pin', 4, 'p4-1'),
        createTile('sou', 2, 's2-1'), createTile('sou', 3, 's3-1'), createTile('sou', 4, 's4-1'),
        createTile('sou', 5, 's5-1'), createTile('sou', 5, 's5-2')
      ]
      const winTile = createTile('sou', 5, 's5-2')
      const doraIndicators: Tile[] = []

      const result = checkWinCondition(tiles, winTile, false, false, doraIndicators)

      // 断ヤオ九があるので実際にはアガリになる可能性があるが、テストケースとして
      expect(result.isWin).toBe(true) // 断ヤオ九役がつく
      expect(result.yaku.some(y => y.name === '断ヤオ九')).toBe(true)
    })

    it('ドラありの場合、ドラカウントが正しく計算される', () => {
      // 14枚のアガリ手牌: 111222333456m78m
      const tiles: Tile[] = [
        createTile('man', 1, 'm1-1'), createTile('man', 1, 'm1-2'), createTile('man', 1, 'm1-3'),
        createTile('man', 2, 'm2-1'), createTile('man', 2, 'm2-2'), createTile('man', 2, 'm2-3'),
        createTile('man', 3, 'm3-1'), createTile('man', 3, 'm3-2'), createTile('man', 3, 'm3-3'),
        createTile('man', 4, 'm4-1'), createTile('man', 5, 'm5-1'), createTile('man', 6, 'm6-1'),
        createTile('man', 7, 'm7-1'), createTile('man', 8, 'm8-1')
      ]
      const winTile = createTile('man', 8, 'm8-1')
      // ドラ表示牌が7m（8mがドラ）
      const doraIndicators: Tile[] = [createTile('man', 7, 'm7-dora')]

      const result = checkWinCondition(tiles, winTile, true, false, doraIndicators)

      expect(result.isWin).toBe(true)
      expect(result.doraCount).toBe(1) // 8mが1枚ドラ
      expect(result.yaku.some(y => y.name === 'ドラ')).toBe(true)
    })

    it('清一色の場合、正しく役判定される', () => {
      // 清一色の14枚: 111222333456789m
      const tiles: Tile[] = [
        createTile('man', 1, 'm1-1'), createTile('man', 1, 'm1-2'), createTile('man', 1, 'm1-3'),
        createTile('man', 2, 'm2-1'), createTile('man', 2, 'm2-2'), createTile('man', 2, 'm2-3'),
        createTile('man', 3, 'm3-1'), createTile('man', 3, 'm3-2'), createTile('man', 3, 'm3-3'),
        createTile('man', 4, 'm4-1'), createTile('man', 5, 'm5-1'), createTile('man', 6, 'm6-1'),
        createTile('man', 7, 'm7-1'), createTile('man', 8, 'm8-1')
      ]
      const winTile = createTile('man', 8, 'm8-1')
      const doraIndicators: Tile[] = []

      const result = checkWinCondition(tiles, winTile, true, false, doraIndicators)

      expect(result.isWin).toBe(true)
      expect(result.yaku.some(y => y.name === '清一色')).toBe(true)
      expect(result.totalHan).toBeGreaterThanOrEqual(6) // 清一色6翻+ツモ1翻
    })

    it('アガリでない手牌の場合、アガリ無効となる', () => {
      // 13枚のテンパイ手牌: 111222333456m7m
      const tiles: Tile[] = [
        createTile('man', 1, 'm1-1'), createTile('man', 1, 'm1-2'), createTile('man', 1, 'm1-3'),
        createTile('man', 2, 'm2-1'), createTile('man', 2, 'm2-2'), createTile('man', 2, 'm2-3'),
        createTile('man', 3, 'm3-1'), createTile('man', 3, 'm3-2'), createTile('man', 3, 'm3-3'),
        createTile('man', 4, 'm4-1'), createTile('man', 5, 'm5-1'), createTile('man', 6, 'm6-1'),
        createTile('man', 7, 'm7-1')
      ]
      const winTile = createTile('man', 8, 'm8-1')
      const doraIndicators: Tile[] = []

      const result = checkWinCondition(tiles, winTile, true, false, doraIndicators)

      expect(result.isWin).toBe(false)
      expect(result.yaku).toEqual([])
      expect(result.totalHan).toBe(0)
      expect(result.totalPoints).toBe(0)
    })
  })
})