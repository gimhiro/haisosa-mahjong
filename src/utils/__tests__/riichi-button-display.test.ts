import { describe, it, expect, beforeEach } from 'vitest'
import { GameManager } from '../game-manager'
import type { Tile } from '../../stores/fourPlayerMahjong'

describe('リーチボタン表示テスト', () => {
  let gameManager: GameManager
  
  beforeEach(() => {
    gameManager = new GameManager()
    gameManager.startNewGame()
  })
  
  function createTile(suit: 'man' | 'pin' | 'sou' | 'honor', rank: number, id: string): Tile {
    return { id, suit, rank }
  }
  
  function setPlayerTiles(playerIndex: number, tiles: Tile[]) {
    gameManager.players[playerIndex].tiles = tiles
  }
  
  describe('リーチボタン表示条件', () => {
    it('13枚でテンパイ状態の場合、リーチボタンが表示される条件を満たす', () => {
      // 13枚のテンパイ手牌: 111222333456m7m（8mまたは7m待ち）
      const tiles: Tile[] = [
        createTile('man', 1, 'm1-1'), createTile('man', 1, 'm1-2'), createTile('man', 1, 'm1-3'),
        createTile('man', 2, 'm2-1'), createTile('man', 2, 'm2-2'), createTile('man', 2, 'm2-3'),
        createTile('man', 3, 'm3-1'), createTile('man', 3, 'm3-2'), createTile('man', 3, 'm3-3'),
        createTile('man', 4, 'm4-1'), createTile('man', 5, 'm5-1'), createTile('man', 6, 'm6-1'),
        createTile('man', 7, 'm7-1')
      ]
      
      setPlayerTiles(0, tiles) // 人間プレイヤー
      
      // リーチボタン表示条件をチェック
      expect(gameManager.players[0].tiles.length).toBe(13)
      expect(gameManager.players[0].riichi).toBe(false)
      expect(gameManager.players[0].score).toBeGreaterThanOrEqual(1000)
      expect(gameManager.gamePhase).toBe('playing')
      
      // リーチ判定には14枚必要（手牌13枚+ツモ牌1枚）
      gameManager.currentDrawnTile = createTile('sou', 1, 's1-1')
      
      const canRiichi = gameManager.canPlayerRiichi(0)
      
      expect(canRiichi).toBe(true)
    })
    
    it('14枚の場合、リーチボタンは表示されない', () => {
      // 14枚のアガリ手牌: 111222333456m78m
      const tiles: Tile[] = [
        createTile('man', 1, 'm1-1'), createTile('man', 1, 'm1-2'), createTile('man', 1, 'm1-3'),
        createTile('man', 2, 'm2-1'), createTile('man', 2, 'm2-2'), createTile('man', 2, 'm2-3'),
        createTile('man', 3, 'm3-1'), createTile('man', 3, 'm3-2'), createTile('man', 3, 'm3-3'),
        createTile('man', 4, 'm4-1'), createTile('man', 5, 'm5-1'), createTile('man', 6, 'm6-1'),
        createTile('man', 7, 'm7-1'), createTile('man', 8, 'm8-1')
      ]
      
      setPlayerTiles(0, tiles)
      
      const canRiichi = gameManager.canPlayerRiichi(0)
      expect(canRiichi).toBe(false) // 14枚ではリーチできない
    })
    
    it('1シャンテン状態の場合、リーチボタンは表示されない', () => {
      // 13枚の1シャンテン手牌: 111222333m145p9m
      const tiles: Tile[] = [
        createTile('man', 1, 'm1-1'), createTile('man', 1, 'm1-2'), createTile('man', 1, 'm1-3'),
        createTile('man', 2, 'm2-1'), createTile('man', 2, 'm2-2'), createTile('man', 2, 'm2-3'),
        createTile('man', 3, 'm3-1'), createTile('man', 3, 'm3-2'), createTile('man', 3, 'm3-3'),
        createTile('pin', 1, 'p1-1'), createTile('pin', 4, 'p4-1'), createTile('pin', 5, 'p5-1'),
        createTile('man', 9, 'm9-1')
      ]
      
      setPlayerTiles(0, tiles)
      
      const canRiichi = gameManager.canPlayerRiichi(0)
      expect(canRiichi).toBe(false) // 1シャンテンではリーチできない
    })
    
    it('すでにリーチしている場合、リーチボタンは表示されない', () => {
      // 13枚のテンパイ手牌: 111222333456m7m
      const tiles: Tile[] = [
        createTile('man', 1, 'm1-1'), createTile('man', 1, 'm1-2'), createTile('man', 1, 'm1-3'),
        createTile('man', 2, 'm2-1'), createTile('man', 2, 'm2-2'), createTile('man', 2, 'm2-3'),
        createTile('man', 3, 'm3-1'), createTile('man', 3, 'm3-2'), createTile('man', 3, 'm3-3'),
        createTile('man', 4, 'm4-1'), createTile('man', 5, 'm5-1'), createTile('man', 6, 'm6-1'),
        createTile('man', 7, 'm7-1')
      ]
      
      setPlayerTiles(0, tiles)
      // すでにリーチしている状態に設定
      gameManager.players[0].riichi = true
      
      const canRiichi = gameManager.canPlayerRiichi(0)
      expect(canRiichi).toBe(false) // すでにリーチしているのでリーチできない
    })
    
    it('点数が1000点未満の場合、リーチボタンは表示されない', () => {
      // 13枚のテンパイ手牌: 111222333456m7m
      const tiles: Tile[] = [
        createTile('man', 1, 'm1-1'), createTile('man', 1, 'm1-2'), createTile('man', 1, 'm1-3'),
        createTile('man', 2, 'm2-1'), createTile('man', 2, 'm2-2'), createTile('man', 2, 'm2-3'),
        createTile('man', 3, 'm3-1'), createTile('man', 3, 'm3-2'), createTile('man', 3, 'm3-3'),
        createTile('man', 4, 'm4-1'), createTile('man', 5, 'm5-1'), createTile('man', 6, 'm6-1'),
        createTile('man', 7, 'm7-1')
      ]
      
      setPlayerTiles(0, tiles)
      // 点数を1000点未満に設定
      gameManager.players[0].score = 500
      
      const canRiichi = gameManager.canPlayerRiichi(0)
      expect(canRiichi).toBe(false) // 点数不足でリーチできない
    })
    
    it('簡単なテンパイパターン: 22334455667788p', () => {
      // 13枚のテンパイ手牌（平和形）: 22334455667788p
      const tiles: Tile[] = [
        createTile('pin', 2, 'p2-1'), createTile('pin', 2, 'p2-2'),
        createTile('pin', 3, 'p3-1'), createTile('pin', 3, 'p3-2'),
        createTile('pin', 4, 'p4-1'), createTile('pin', 4, 'p4-2'),
        createTile('pin', 5, 'p5-1'), createTile('pin', 5, 'p5-2'),
        createTile('pin', 6, 'p6-1'), createTile('pin', 6, 'p6-2'),
        createTile('pin', 7, 'p7-1'), createTile('pin', 7, 'p7-2'),
        createTile('pin', 8, 'p8-1')
      ]
      
      setPlayerTiles(0, tiles)
      // リーチ判定には14枚必要（手牌13枚+ツモ牌1枚）
      gameManager.currentDrawnTile = createTile('sou', 1, 's1-1')
      
      
      const canRiichi = gameManager.canPlayerRiichi(0)
      expect(canRiichi).toBe(true)
    })
  })
})