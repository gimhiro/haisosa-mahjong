import { describe, it, expect } from 'vitest'
import { calculateShanten, checkWinCondition } from '../mahjong-logic'
import type { Tile } from '../../stores/fourPlayerMahjong'

function createTile(suit: 'man' | 'pin' | 'sou' | 'honor', rank: number, id: string): Tile {
  return { id, suit, rank, isRed: false }
}

describe('winning hand debug', () => {
  it('should recognize a simple winning hand', () => {
    // 111222333444m11p（確実に上がりの手）
    const winningTiles: Tile[] = [
      createTile('man', 1, 'm1-1'), createTile('man', 1, 'm1-2'), createTile('man', 1, 'm1-3'),
      createTile('man', 2, 'm2-1'), createTile('man', 2, 'm2-2'), createTile('man', 2, 'm2-3'),
      createTile('man', 3, 'm3-1'), createTile('man', 3, 'm3-2'), createTile('man', 3, 'm3-3'),
      createTile('man', 4, 'm4-1'), createTile('man', 4, 'm4-2'), createTile('man', 4, 'm4-3'),
      createTile('pin', 1, 'p1-1'), createTile('pin', 1, 'p1-2')
    ]


    const shanten = calculateShanten(winningTiles)

    // Should be -1 (winning hand)
    expect(shanten).toBe(-1)

    // Test the win condition function
    const tsumoTile = winningTiles[13]
    const winResult = checkWinCondition(winningTiles, tsumoTile, true, false, [], [])

    expect(winResult.isWin).toBe(true)
  })

  it('should test an even simpler case: 11122233344455m', () => {
    const simpleTiles: Tile[] = [
      createTile('man', 1, 'm1-1'), createTile('man', 1, 'm1-2'), createTile('man', 1, 'm1-3'),
      createTile('man', 2, 'm2-1'), createTile('man', 2, 'm2-2'), createTile('man', 2, 'm2-3'),
      createTile('man', 3, 'm3-1'), createTile('man', 3, 'm3-2'), createTile('man', 3, 'm3-3'),
      createTile('man', 4, 'm4-1'), createTile('man', 4, 'm4-2'), createTile('man', 4, 'm4-3'),
      createTile('man', 5, 'm5-1'), createTile('man', 5, 'm5-2')
    ]

    const shanten = calculateShanten(simpleTiles)
    
    expect(shanten).toBe(-1)
  })
})