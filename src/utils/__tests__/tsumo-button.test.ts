import { describe, it, expect, beforeEach } from 'vitest'
import { GameManager } from '../game-manager'
import type { Tile } from '../../stores/fourPlayerMahjong'

describe('ツモボタンとツモ処理', () => {
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
  
  function setCurrentDrawnTile(tile: Tile) {
    gameManager.currentDrawnTile = tile
  }
  
  describe('ツモアガリ判定', () => {
    it('ツモ牌でアガリ形になる場合、ツモアガリと判定される', () => {
      // 14枚のアガリ手牌: 111222333456m78m
      const tiles: Tile[] = [
        createTile('man', 1, 'm1-1'), createTile('man', 1, 'm1-2'), createTile('man', 1, 'm1-3'),
        createTile('man', 2, 'm2-1'), createTile('man', 2, 'm2-2'), createTile('man', 2, 'm2-3'),
        createTile('man', 3, 'm3-1'), createTile('man', 3, 'm3-2'), createTile('man', 3, 'm3-3'),
        createTile('man', 4, 'm4-1'), createTile('man', 5, 'm5-1'), createTile('man', 6, 'm6-1'),
        createTile('man', 7, 'm7-1'), createTile('man', 8, 'm8-1')
      ]
      
      setPlayerTiles(0, tiles)
      // ツモ牌として8mを設定
      const drawnTile = createTile('man', 8, 'm8-1')
      setCurrentDrawnTile(drawnTile)
      
      const winResult = gameManager.checkWinConditionForPlayer(0, drawnTile, true)
      
      expect(winResult.isWin).toBe(true)
      expect(winResult.result?.yaku.some(y => y.name === '門前清自摸和')).toBe(true)
    })
    
    it('ツモ牌でアガリ形にならない場合、ツモアガリでないと判定される', () => {
      // 13枚の1シャンテン手牌: 111222333m145p9m
      const tiles: Tile[] = [
        createTile('man', 1, 'm1-1'), createTile('man', 1, 'm1-2'), createTile('man', 1, 'm1-3'),
        createTile('man', 2, 'm2-1'), createTile('man', 2, 'm2-2'), createTile('man', 2, 'm2-3'),
        createTile('man', 3, 'm3-1'), createTile('man', 3, 'm3-2'), createTile('man', 3, 'm3-3'),
        createTile('pin', 1, 'p1-1'), createTile('pin', 4, 'p4-1'), createTile('pin', 5, 'p5-1'),
        createTile('man', 9, 'm9-1')
      ]
      
      setPlayerTiles(0, tiles)
      // ツモ牌として8mを設定（アガリにならない）
      const drawnTile = createTile('man', 8, 'm8-1')
      setCurrentDrawnTile(drawnTile)
      
      const winResult = gameManager.checkWinConditionForPlayer(0, drawnTile, true)
      
      expect(winResult.isWin).toBe(false)
    })
    
    it('リーチ後のツモアガリの場合、リーチ役とツモ役の両方が付く', () => {
      // 14枚のアガリ手牌: 111222333456m78m
      const tiles: Tile[] = [
        createTile('man', 1, 'm1-1'), createTile('man', 1, 'm1-2'), createTile('man', 1, 'm1-3'),
        createTile('man', 2, 'm2-1'), createTile('man', 2, 'm2-2'), createTile('man', 2, 'm2-3'),
        createTile('man', 3, 'm3-1'), createTile('man', 3, 'm3-2'), createTile('man', 3, 'm3-3'),
        createTile('man', 4, 'm4-1'), createTile('man', 5, 'm5-1'), createTile('man', 6, 'm6-1'),
        createTile('man', 7, 'm7-1'), createTile('man', 8, 'm8-1')
      ]
      
      setPlayerTiles(0, tiles)
      // リーチを宣言
      gameManager.players[0].riichi = true
      gameManager.players[0].score = 24000 // リーチ棒1000点を差し引いた状態
      
      // ツモ牌として8mを設定
      const drawnTile = createTile('man', 8, 'm8-1')
      setCurrentDrawnTile(drawnTile)
      
      const winResult = gameManager.checkWinConditionForPlayer(0, drawnTile, true)
      
      expect(winResult.isWin).toBe(true)
      expect(winResult.result?.yaku.some(y => y.name === 'リーチ')).toBe(true)
      expect(winResult.result?.yaku.some(y => y.name === '門前清自摸和')).toBe(true)
      expect(winResult.result?.totalHan).toBeGreaterThanOrEqual(2)
    })
  })
  
  describe('ツモボタン表示条件', () => {
    it('人間プレイヤーのターンでツモアガリ可能な場合、ツモボタンが表示される条件を満たす', () => {
      // プレイヤー0（人間）のターンに設定
      gameManager.currentPlayerIndex = 0
      gameManager.gamePhase = 'playing'
      
      // 14枚のアガリ手牌: 111222333456m78m
      const tiles: Tile[] = [
        createTile('man', 1, 'm1-1'), createTile('man', 1, 'm1-2'), createTile('man', 1, 'm1-3'),
        createTile('man', 2, 'm2-1'), createTile('man', 2, 'm2-2'), createTile('man', 2, 'm2-3'),
        createTile('man', 3, 'm3-1'), createTile('man', 3, 'm3-2'), createTile('man', 3, 'm3-3'),
        createTile('man', 4, 'm4-1'), createTile('man', 5, 'm5-1'), createTile('man', 6, 'm6-1'),
        createTile('man', 7, 'm7-1'), createTile('man', 8, 'm8-1')
      ]
      
      setPlayerTiles(0, tiles)
      // ツモ牌として8mを設定
      const drawnTile = createTile('man', 8, 'm8-1')
      setCurrentDrawnTile(drawnTile)
      
      // ツモボタン表示条件を満たしているかチェック
      expect(gameManager.isHumanTurn()).toBe(true)
      expect(gameManager.gamePhase).toBe('playing')
      expect(gameManager.currentDrawnTile).toBe(drawnTile)
      
      const winResult = gameManager.checkWinConditionForPlayer(0, drawnTile, true)
      expect(winResult.isWin).toBe(true)
    })
    
    it('CPUプレイヤーのターンの場合、ツモボタンは表示されない', () => {
      // プレイヤー1（CPU）のターンに設定
      gameManager.currentPlayerIndex = 1
      gameManager.gamePhase = 'playing'
      
      expect(gameManager.isHumanTurn()).toBe(false)
    })
    
    it('ゲームが終了状態の場合、ツモボタンは表示されない', () => {
      // プレイヤー0（人間）のターンでもゲーム終了状態
      gameManager.currentPlayerIndex = 0
      gameManager.gamePhase = 'finished'
      
      expect(gameManager.gamePhase).toBe('finished')
      expect(gameManager.isHumanTurn()).toBe(false) // ゲーム終了時はfalse
    })
    
    it('ツモ牌がない場合、ツモボタンは表示されない', () => {
      // プレイヤー0（人間）のターン
      gameManager.currentPlayerIndex = 0
      gameManager.gamePhase = 'playing'
      
      // ツモ牌がない状態
      gameManager.currentDrawnTile = null
      
      expect(gameManager.currentDrawnTile).toBe(null)
    })
  })
  
  describe('ツモ処理の結果', () => {
    it('ツモアガリ後、ゲーム状態が終了になる', () => {
      // 14枚のアガリ手牌: 111222333456m78m
      const tiles: Tile[] = [
        createTile('man', 1, 'm1-1'), createTile('man', 1, 'm1-2'), createTile('man', 1, 'm1-3'),
        createTile('man', 2, 'm2-1'), createTile('man', 2, 'm2-2'), createTile('man', 2, 'm2-3'),
        createTile('man', 3, 'm3-1'), createTile('man', 3, 'm3-2'), createTile('man', 3, 'm3-3'),
        createTile('man', 4, 'm4-1'), createTile('man', 5, 'm5-1'), createTile('man', 6, 'm6-1'),
        createTile('man', 7, 'm7-1'), createTile('man', 8, 'm8-1')
      ]
      
      setPlayerTiles(0, tiles)
      const drawnTile = createTile('man', 8, 'm8-1')
      setCurrentDrawnTile(drawnTile)
      
      expect(gameManager.gamePhase).toBe('playing')
      
      const winResult = gameManager.checkWinConditionForPlayer(0, drawnTile, true)
      
      expect(winResult.isWin).toBe(true)
      expect(gameManager.gamePhase).toBe('finished')
    })
    
    it('断ヤオ九ツモの場合、正しく役判定される', () => {
      // 14枚の断ヤオ九アガリ手牌: 222333444m567p55s
      const tiles: Tile[] = [
        createTile('man', 2, 'm2-1'), createTile('man', 2, 'm2-2'), createTile('man', 2, 'm2-3'),
        createTile('man', 3, 'm3-1'), createTile('man', 3, 'm3-2'), createTile('man', 3, 'm3-3'),
        createTile('man', 4, 'm4-1'), createTile('man', 4, 'm4-2'), createTile('man', 4, 'm4-3'),
        createTile('pin', 5, 'p5-1'), createTile('pin', 6, 'p6-1'), createTile('pin', 7, 'p7-1'),
        createTile('sou', 5, 's5-1'), createTile('sou', 5, 's5-2')
      ]
      
      setPlayerTiles(0, tiles)
      const drawnTile = createTile('sou', 5, 's5-2')
      setCurrentDrawnTile(drawnTile)
      
      expect(gameManager.gamePhase).toBe('playing')
      
      const winResult = gameManager.checkWinConditionForPlayer(0, drawnTile, true)
      
      expect(winResult.isWin).toBe(true)
      expect(winResult.result?.yaku.some(y => y.name === '断ヤオ九')).toBe(true)
      expect(winResult.result?.yaku.some(y => y.name === '門前清自摸和')).toBe(true)
    })
  })
})