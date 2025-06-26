import { describe, it, expect, beforeEach } from 'vitest'
import { GameManager } from '../../utils/game-manager'
import type { Tile } from '../../stores/fourPlayerMahjong'

function createTile(suit: 'man' | 'pin' | 'sou' | 'honor', rank: number, id: string): Tile {
  return { id, suit, rank, isRed: false }
}

describe('GameManager - リーチ機能テスト', () => {
  let gameManager: GameManager

  beforeEach(() => {
    gameManager = new GameManager()
    gameManager.startNewGame()
  })

  it('リーチ可能な条件を満たす場合にcanPlayerRiichiがtrueを返す', () => {
    // 13枚のテンパイ手牌を設定: 111222333456m1p（7m待ち）
    const tenpaiTiles: Tile[] = [
      createTile('man', 1, 'm1-1'), createTile('man', 1, 'm1-2'), createTile('man', 1, 'm1-3'),
      createTile('man', 2, 'm2-1'), createTile('man', 2, 'm2-2'), createTile('man', 2, 'm2-3'),
      createTile('man', 3, 'm3-1'), createTile('man', 3, 'm3-2'), createTile('man', 3, 'm3-3'),
      createTile('man', 4, 'm4-1'), createTile('man', 5, 'm5-1'), createTile('man', 6, 'm6-1'),
      createTile('pin', 1, 'p1-1')
    ]

    // ツモ牌を設定（リーチ判定には14枚必要）
    const drawnTile = createTile('sou', 5, 's5-1')

    // プレイヤー0（人間）の手牌とツモ牌を設定
    gameManager.players[0].tiles = tenpaiTiles
    gameManager.currentDrawnTile = drawnTile
    gameManager.currentPlayerIndex = 0
    gameManager.gamePhase = 'playing'

    // リーチ可能かチェック
    const canRiichi = gameManager.canPlayerRiichi(0)
    expect(canRiichi).toBe(true)
  })

  it('ツモ牌がない場合はリーチ不可', () => {
    const tenpaiTiles: Tile[] = [
      createTile('man', 1, 'm1-1'), createTile('man', 1, 'm1-2'), createTile('man', 1, 'm1-3'),
      createTile('man', 2, 'm2-1'), createTile('man', 2, 'm2-2'), createTile('man', 2, 'm2-3'),
      createTile('man', 3, 'm3-1'), createTile('man', 3, 'm3-2'), createTile('man', 3, 'm3-3'),
      createTile('man', 4, 'm4-1'), createTile('man', 5, 'm5-1'), createTile('man', 6, 'm6-1'),
      createTile('pin', 1, 'p1-1')
    ]

    gameManager.players[0].tiles = tenpaiTiles
    gameManager.currentDrawnTile = null // ツモ牌なし
    gameManager.currentPlayerIndex = 0
    gameManager.gamePhase = 'playing'

    const canRiichi = gameManager.canPlayerRiichi(0)
    expect(canRiichi).toBe(false)
  })

  it('リーチ宣言が成功する', () => {
    const tenpaiTiles: Tile[] = [
      createTile('man', 1, 'm1-1'), createTile('man', 1, 'm1-2'), createTile('man', 1, 'm1-3'),
      createTile('man', 2, 'm2-1'), createTile('man', 2, 'm2-2'), createTile('man', 2, 'm2-3'),
      createTile('man', 3, 'm3-1'), createTile('man', 3, 'm3-2'), createTile('man', 3, 'm3-3'),
      createTile('man', 4, 'm4-1'), createTile('man', 5, 'm5-1'), createTile('man', 6, 'm6-1'),
      createTile('pin', 1, 'p1-1')
    ]

    const drawnTile = createTile('sou', 5, 's5-1')

    gameManager.players[0].tiles = tenpaiTiles
    gameManager.currentDrawnTile = drawnTile
    gameManager.currentPlayerIndex = 0
    gameManager.gamePhase = 'playing'

    const initialScore = gameManager.players[0].score
    const result = gameManager.declareRiichi(0)

    expect(result).toBe(true)
    expect(gameManager.players[0].riichi).toBe(true)
    expect(gameManager.players[0].score).toBe(initialScore - 1000)
  })

  it('すでにリーチ済みの場合は再度リーチ不可', () => {
    const tenpaiTiles: Tile[] = [
      createTile('man', 1, 'm1-1'), createTile('man', 1, 'm1-2'), createTile('man', 1, 'm1-3'),
      createTile('man', 2, 'm2-1'), createTile('man', 2, 'm2-2'), createTile('man', 2, 'm2-3'),
      createTile('man', 3, 'm3-1'), createTile('man', 3, 'm3-2'), createTile('man', 3, 'm3-3'),
      createTile('man', 4, 'm4-1'), createTile('man', 5, 'm5-1'), createTile('man', 6, 'm6-1'),
      createTile('pin', 1, 'p1-1')
    ]

    const drawnTile = createTile('sou', 5, 's5-1')

    gameManager.players[0].tiles = tenpaiTiles
    gameManager.currentDrawnTile = drawnTile
    gameManager.players[0].riichi = true // すでにリーチ済み
    gameManager.currentPlayerIndex = 0
    gameManager.gamePhase = 'playing'

    const canRiichi = gameManager.canPlayerRiichi(0)
    expect(canRiichi).toBe(false)
  })
})