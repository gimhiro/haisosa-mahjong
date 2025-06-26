import { describe, it, expect, beforeEach } from 'vitest'
import { GameManager } from '../game-manager'
import type { Tile } from '../../stores/fourPlayerMahjong'

describe('リーチボタン表示とリーチ状態管理', () => {
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
  
  describe('canPlayerRiichi', () => {
    it('テンパイ状態でリーチ可能と判定する', () => {
      // テンパイ手牌: 111222333456m7m (13枚)
      const tiles: Tile[] = [
        createTile('man', 1, 'm1-1'), createTile('man', 1, 'm1-2'), createTile('man', 1, 'm1-3'),
        createTile('man', 2, 'm2-1'), createTile('man', 2, 'm2-2'), createTile('man', 2, 'm2-3'),
        createTile('man', 3, 'm3-1'), createTile('man', 3, 'm3-2'), createTile('man', 3, 'm3-3'),
        createTile('man', 4, 'm4-1'), createTile('man', 5, 'm5-1'), createTile('man', 6, 'm6-1'),
        createTile('man', 7, 'm7-1')
      ]
      
      setPlayerTiles(0, tiles)
      // リーチ判定には14枚必要（手牌13枚+ツモ牌1枚）
      gameManager.currentDrawnTile = createTile('sou', 1, 's1-1')
      expect(gameManager.canPlayerRiichi(0)).toBe(true)
    })
    
    it('1シャンテン状態でリーチ不可と判定する', () => {
      // 1シャンテン手牌: 111222333m145p9m
      const tiles: Tile[] = [
        createTile('man', 1, 'm1-1'), createTile('man', 1, 'm1-2'), createTile('man', 1, 'm1-3'),
        createTile('man', 2, 'm2-1'), createTile('man', 2, 'm2-2'), createTile('man', 2, 'm2-3'),
        createTile('man', 3, 'm3-1'), createTile('man', 3, 'm3-2'), createTile('man', 3, 'm3-3'),
        createTile('pin', 1, 'p1-1'), createTile('pin', 4, 'p4-1'), createTile('pin', 5, 'p5-1'),
        createTile('man', 9, 'm9-1')
      ]
      
      setPlayerTiles(0, tiles)
      expect(gameManager.canPlayerRiichi(0)).toBe(false)
    })
    
    it('14枚の手牌でリーチ不可と判定する', () => {
      // テンパイ手牌だが14枚なのでリーチ不可
      const tiles: Tile[] = [
        createTile('man', 1, 'm1-1'), createTile('man', 1, 'm1-2'), createTile('man', 1, 'm1-3'),
        createTile('man', 2, 'm2-1'), createTile('man', 2, 'm2-2'), createTile('man', 2, 'm2-3'),
        createTile('man', 3, 'm3-1'), createTile('man', 3, 'm3-2'), createTile('man', 3, 'm3-3'),
        createTile('man', 4, 'm4-1'), createTile('man', 5, 'm5-1'), createTile('man', 6, 'm6-1'),
        createTile('man', 7, 'm7-1'), createTile('man', 8, 'm8-1')
      ]
      
      setPlayerTiles(0, tiles)
      expect(gameManager.canPlayerRiichi(0)).toBe(false)
    })
    
    it('すでにリーチしている場合はリーチ不可と判定する', () => {
      // テンパイ手牌: 111222333456m7m (13枚)
      const tiles: Tile[] = [
        createTile('man', 1, 'm1-1'), createTile('man', 1, 'm1-2'), createTile('man', 1, 'm1-3'),
        createTile('man', 2, 'm2-1'), createTile('man', 2, 'm2-2'), createTile('man', 2, 'm2-3'),
        createTile('man', 3, 'm3-1'), createTile('man', 3, 'm3-2'), createTile('man', 3, 'm3-3'),
        createTile('man', 4, 'm4-1'), createTile('man', 5, 'm5-1'), createTile('man', 6, 'm6-1'),
        createTile('man', 7, 'm7-1')
      ]
      
      setPlayerTiles(0, tiles)
      gameManager.players[0].riichi = true
      expect(gameManager.canPlayerRiichi(0)).toBe(false)
    })
    
    it('点数不足の場合はリーチ不可と判定する', () => {
      // テンパイ手牌: 111222333456m7m (13枚)
      const tiles: Tile[] = [
        createTile('man', 1, 'm1-1'), createTile('man', 1, 'm1-2'), createTile('man', 1, 'm1-3'),
        createTile('man', 2, 'm2-1'), createTile('man', 2, 'm2-2'), createTile('man', 2, 'm2-3'),
        createTile('man', 3, 'm3-1'), createTile('man', 3, 'm3-2'), createTile('man', 3, 'm3-3'),
        createTile('man', 4, 'm4-1'), createTile('man', 5, 'm5-1'), createTile('man', 6, 'm6-1'),
        createTile('man', 7, 'm7-1')
      ]
      
      setPlayerTiles(0, tiles)
      gameManager.players[0].score = 500 // 1000点未満
      expect(gameManager.canPlayerRiichi(0)).toBe(false)
    })
  })
  
  describe('declareRiichi', () => {
    it('リーチ宣言が成功し、リーチ状態になる', () => {
      // テンパイ手牌: 111222333456m7m (13枚)
      const tiles: Tile[] = [
        createTile('man', 1, 'm1-1'), createTile('man', 1, 'm1-2'), createTile('man', 1, 'm1-3'),
        createTile('man', 2, 'm2-1'), createTile('man', 2, 'm2-2'), createTile('man', 2, 'm2-3'),
        createTile('man', 3, 'm3-1'), createTile('man', 3, 'm3-2'), createTile('man', 3, 'm3-3'),
        createTile('man', 4, 'm4-1'), createTile('man', 5, 'm5-1'), createTile('man', 6, 'm6-1'),
        createTile('man', 7, 'm7-1')
      ]
      
      setPlayerTiles(0, tiles)
      // リーチ判定には14枚必要（手牌13枚+ツモ牌1枚）
      gameManager.currentDrawnTile = createTile('sou', 1, 's1-1')
      const initialScore = gameManager.players[0].score
      
      const result = gameManager.declareRiichi(0)
      
      expect(result).toBe(true)
      expect(gameManager.players[0].riichi).toBe(true)
      expect(gameManager.players[0].score).toBe(initialScore - 1000)
    })
    
    it('リーチ不可の場合はリーチ宣言が失敗する', () => {
      // 1シャンテン手牌: 111222333m145p9m
      const tiles: Tile[] = [
        createTile('man', 1, 'm1-1'), createTile('man', 1, 'm1-2'), createTile('man', 1, 'm1-3'),
        createTile('man', 2, 'm2-1'), createTile('man', 2, 'm2-2'), createTile('man', 2, 'm2-3'),
        createTile('man', 3, 'm3-1'), createTile('man', 3, 'm3-2'), createTile('man', 3, 'm3-3'),
        createTile('pin', 1, 'p1-1'), createTile('pin', 4, 'p4-1'), createTile('pin', 5, 'p5-1'),
        createTile('man', 9, 'm9-1')
      ]
      
      setPlayerTiles(0, tiles)
      const initialScore = gameManager.players[0].score
      
      const result = gameManager.declareRiichi(0)
      
      expect(result).toBe(false)
      expect(gameManager.players[0].riichi).toBe(false)
      expect(gameManager.players[0].score).toBe(initialScore)
    })
  })
  
  describe('リーチ後の制限', () => {
    it('リーチ後は再度リーチできない', () => {
      // テンパイ手牌: 111222333456m7m (13枚)
      const tiles: Tile[] = [
        createTile('man', 1, 'm1-1'), createTile('man', 1, 'm1-2'), createTile('man', 1, 'm1-3'),
        createTile('man', 2, 'm2-1'), createTile('man', 2, 'm2-2'), createTile('man', 2, 'm2-3'),
        createTile('man', 3, 'm3-1'), createTile('man', 3, 'm3-2'), createTile('man', 3, 'm3-3'),
        createTile('man', 4, 'm4-1'), createTile('man', 5, 'm5-1'), createTile('man', 6, 'm6-1'),
        createTile('man', 7, 'm7-1')
      ]
      
      setPlayerTiles(0, tiles)
      // リーチ判定には14枚必要（手牌13枚+ツモ牌1枚）
      gameManager.currentDrawnTile = createTile('sou', 1, 's1-1')
      
      // 最初のリーチは成功
      expect(gameManager.declareRiichi(0)).toBe(true)
      expect(gameManager.players[0].riichi).toBe(true)
      
      // 2回目のリーチは失敗
      expect(gameManager.canPlayerRiichi(0)).toBe(false)
      expect(gameManager.declareRiichi(0)).toBe(false)
    })
  })
})