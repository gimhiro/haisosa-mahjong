import { describe, it, expect, vi } from 'vitest'
import type { Tile } from '../../stores/fourPlayerMahjong'

// Mock riichi-rs-bundlers since WebAssembly has issues in Vitest
vi.mock('riichi-rs-bundlers', () => ({
  calc: vi.fn((input) => {
    // Mock calculation that considers different scenarios
    if (!input.closed_part || input.closed_part.length !== 14) {
      return { is_agari: false }
    }

    // Simple winning hand detection (just check if it's a valid 14-tile hand)
    const isValidHand = input.closed_part.length === 14
    
    if (!isValidHand) {
      return { is_agari: false }
    }

    let han = 1 // Base han
    let points = 1000 // Base points
    const yaku: Record<number, number> = { 32: 1 } // Tanyao = 1 han

    // Add riichi han if present
    if (input.options?.riichi) {
      han += 1
      yaku[36] = 1 // Riichi
    }

    // Add dora han if present
    if (input.options?.dora && input.options.dora.length > 0) {
      han += 1
      yaku[53] = 1 // Dora
    }

    // Dealer gets 1.5x points
    if (input.options?.jikaze === 28) { // East wind = dealer
      points = Math.floor(points * 1.5)
    }

    return {
      is_agari: true,
      han,
      fu: 30,
      ten: points,
      yaku
    }
  }),
  Tile: {
    M1: 1, M2: 2, M3: 3, M4: 4, M5: 5, M6: 6, M7: 7, M8: 8, M9: 9,
    P1: 10, P2: 11, P3: 12, P4: 13, P5: 14, P6: 15, P7: 16, P8: 17, P9: 18,
    S1: 19, S2: 20, S3: 21, S4: 22, S5: 23, S6: 24, S7: 25, S8: 26, S9: 27,
    East: 28, South: 29, West: 30, North: 31,
    Haku: 32, Hatsu: 33, Chun: 34
  },
  Yaku: {
    Tanyao: 32,
    Riichi: 36,
    Menzentsumo: 35,
    Pinfu: 33
  }
}))

import { calculateScore } from '../scoring'

describe('Scoring Calculation', () => {
  // Helper function to create tiles
  const createTile = (suit: 'man' | 'pin' | 'sou' | 'honor', rank: number, id?: string): Tile => ({
    id: id || `${suit}${rank}-0`,
    suit,
    rank,
    isRed: false
  })

  describe('Basic Hand Scoring', () => {
    it('should calculate score for a simple hand with yakuman', () => {
      // Test a simple winning hand - Tanyao (All Simples)
      const hand = [
        createTile('man', 2, 'man2-0'),
        createTile('man', 3, 'man3-0'),
        createTile('man', 4, 'man4-0'),
        createTile('pin', 5, 'pin5-0'),
        createTile('pin', 6, 'pin6-0'),
        createTile('pin', 7, 'pin7-0'),
        createTile('sou', 2, 'sou2-0'),
        createTile('sou', 2, 'sou2-1'),
        createTile('sou', 2, 'sou2-2'),
        createTile('man', 8, 'man8-0'),
        createTile('man', 8, 'man8-1'),
        createTile('man', 8, 'man8-2'),
        createTile('pin', 3, 'pin3-0'),
        createTile('pin', 3, 'pin3-1')
      ]

      const winningTile = createTile('pin', 3, 'pin3-1')
      const doraIndicators = [createTile('man', 1, 'man1-dora')]
      
      const result = calculateScore({
        hand,
        winningTile,
        isTsumo: true,
        isRiichi: false,
        doraIndicators,
        uradoraIndicators: [],
        isDealer: false
      })

      expect(result).toBeDefined()
      expect(result.han).toBeGreaterThan(0)
      expect(result.fu).toBeGreaterThan(0)
      expect(result.points).toBeGreaterThan(0)
      expect(result.yaku).toEqual(expect.arrayContaining([
        expect.objectContaining({
          name: expect.any(String),
          han: expect.any(Number)
        })
      ]))
    })

    it('should return no win for invalid hand', () => {
      // Test an invalid hand with only 13 tiles (incomplete)
      const hand = [
        createTile('man', 1, 'man1-0'),
        createTile('man', 3, 'man3-0'),
        createTile('man', 5, 'man5-0'),
        createTile('pin', 2, 'pin2-0'),
        createTile('pin', 4, 'pin4-0'),
        createTile('pin', 6, 'pin6-0'),
        createTile('sou', 1, 'sou1-0'),
        createTile('sou', 3, 'sou3-0'),
        createTile('sou', 5, 'sou5-0'),
        createTile('honor', 1, 'honor1-0'),
        createTile('honor', 2, 'honor2-0'),
        createTile('honor', 3, 'honor3-0'),
        createTile('honor', 4, 'honor4-0')
        // Missing 14th tile - incomplete hand
      ]

      const winningTile = createTile('honor', 5, 'honor5-0')
      const doraIndicators: Tile[] = []
      
      const result = calculateScore({
        hand,
        winningTile,
        isTsumo: false,
        isRiichi: false,
        doraIndicators,
        uradoraIndicators: [],
        isDealer: false
      })

      expect(result).toBeNull()
    })
  })

  describe('Riichi Scoring', () => {
    it('should add riichi han when isRiichi is true', () => {
      // Test the same winning hand but with riichi
      const hand = [
        createTile('man', 2, 'man2-0'),
        createTile('man', 3, 'man3-0'),
        createTile('man', 4, 'man4-0'),
        createTile('pin', 5, 'pin5-0'),
        createTile('pin', 6, 'pin6-0'),
        createTile('pin', 7, 'pin7-0'),
        createTile('sou', 2, 'sou2-0'),
        createTile('sou', 2, 'sou2-1'),
        createTile('sou', 2, 'sou2-2'),
        createTile('man', 8, 'man8-0'),
        createTile('man', 8, 'man8-1'),
        createTile('man', 8, 'man8-2'),
        createTile('pin', 3, 'pin3-0'),
        createTile('pin', 3, 'pin3-1')
      ]

      const winningTile = createTile('pin', 3, 'pin3-1')
      const doraIndicators: Tile[] = []
      
      const resultWithoutRiichi = calculateScore({
        hand,
        winningTile,
        isTsumo: true,
        isRiichi: false,
        doraIndicators,
        uradoraIndicators: [],
        isDealer: false
      })

      const resultWithRiichi = calculateScore({
        hand,
        winningTile,
        isTsumo: true,
        isRiichi: true,
        doraIndicators,
        uradoraIndicators: [],
        isDealer: false
      })

      expect(resultWithRiichi).toBeDefined()
      expect(resultWithoutRiichi).toBeDefined()
      
      if (resultWithRiichi && resultWithoutRiichi) {
        expect(resultWithRiichi.han).toBeGreaterThan(resultWithoutRiichi.han)
        expect(resultWithRiichi.yaku).toEqual(expect.arrayContaining([
          expect.objectContaining({
            name: expect.stringMatching(/riichi|リーチ/i),
            han: 1
          })
        ]))
      }
    })
  })

  describe('Dora Calculation', () => {
    it('should calculate dora correctly', () => {
      // Test with dora indicators
      const hand = [
        createTile('man', 2, 'man2-0'), // This will be dora if indicator is man1
        createTile('man', 3, 'man3-0'),
        createTile('man', 4, 'man4-0'),
        createTile('pin', 5, 'pin5-0'),
        createTile('pin', 6, 'pin6-0'),
        createTile('pin', 7, 'pin7-0'),
        createTile('sou', 2, 'sou2-0'),
        createTile('sou', 2, 'sou2-1'),
        createTile('sou', 2, 'sou2-2'),
        createTile('man', 8, 'man8-0'),
        createTile('man', 8, 'man8-1'),
        createTile('man', 8, 'man8-2'),
        createTile('pin', 3, 'pin3-0'),
        createTile('pin', 3, 'pin3-1')
      ]

      const winningTile = createTile('pin', 3, 'pin3-1')
      const doraIndicators = [createTile('man', 1, 'man1-dora')] // man2 will be dora
      
      const resultWithoutDora = calculateScore({
        hand,
        winningTile,
        isTsumo: true,
        isRiichi: false,
        doraIndicators: [],
        uradoraIndicators: [],
        isDealer: false
      })

      const resultWithDora = calculateScore({
        hand,
        winningTile,
        isTsumo: true,
        isRiichi: false,
        doraIndicators,
        uradoraIndicators: [],
        isDealer: false
      })

      expect(resultWithDora).toBeDefined()
      expect(resultWithoutDora).toBeDefined()
      
      if (resultWithDora && resultWithoutDora) {
        expect(resultWithDora.han).toBeGreaterThan(resultWithoutDora.han)
      }
    })
  })

  describe('Dealer vs Non-Dealer Scoring', () => {
    it('should give higher points to dealer', () => {
      const hand = [
        createTile('man', 2, 'man2-0'),
        createTile('man', 3, 'man3-0'),
        createTile('man', 4, 'man4-0'),
        createTile('pin', 5, 'pin5-0'),
        createTile('pin', 6, 'pin6-0'),
        createTile('pin', 7, 'pin7-0'),
        createTile('sou', 2, 'sou2-0'),
        createTile('sou', 2, 'sou2-1'),
        createTile('sou', 2, 'sou2-2'),
        createTile('man', 8, 'man8-0'),
        createTile('man', 8, 'man8-1'),
        createTile('man', 8, 'man8-2'),
        createTile('pin', 3, 'pin3-0'),
        createTile('pin', 3, 'pin3-1')
      ]

      const winningTile = createTile('pin', 3, 'pin3-1')
      const doraIndicators: Tile[] = []
      
      const nonDealerResult = calculateScore({
        hand,
        winningTile,
        isTsumo: true,
        isRiichi: false,
        doraIndicators,
        uradoraIndicators: [],
        isDealer: false
      })

      const dealerResult = calculateScore({
        hand,
        winningTile,
        isTsumo: true,
        isRiichi: false,
        doraIndicators,
        uradoraIndicators: [],
        isDealer: true
      })

      expect(dealerResult).toBeDefined()
      expect(nonDealerResult).toBeDefined()
      
      if (dealerResult && nonDealerResult) {
        expect(dealerResult.points).toBeGreaterThan(nonDealerResult.points)
      }
    })
  })
})