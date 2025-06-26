import type { Tile, Player, GamePhase } from '../stores/fourPlayerMahjong'
import { calculateShanten, canRiichi, checkWinCondition } from './mahjong-logic'

export class GameManager {
  private _players: Player[]
  private _gamePhase: GamePhase
  private _currentPlayerIndex: number
  private _wall: Tile[]
  private _doraIndicators: Tile[]
  private _currentDrawnTile: Tile | null
  private _round: number
  private _dealer: number
  private _discardOrder: number
  private _lastDiscardedTile: Tile | null
  private _lastDiscardPlayerIndex: number | null

  constructor() {
    this._players = [
      { id: 0, name: 'あなた', type: 'human', tiles: [], discards: [], melds: [], riichi: false, score: 25000, wind: 'east' },
      { id: 1, name: 'CPU1 (簡単)', type: 'cpu', tiles: [], discards: [], melds: [], riichi: false, score: 25000, wind: 'south' },
      { id: 2, name: 'CPU2 (普通)', type: 'cpu', tiles: [], discards: [], melds: [], riichi: false, score: 25000, wind: 'west' },
      { id: 3, name: 'CPU3 (難しい)', type: 'cpu', tiles: [], discards: [], melds: [], riichi: false, score: 25000, wind: 'north' }
    ]
    this._gamePhase = 'waiting'
    this._currentPlayerIndex = 0
    this._wall = []
    this._doraIndicators = []
    this._currentDrawnTile = null
    this._round = 1
    this._dealer = 0
    this._discardOrder = 0
    this._lastDiscardedTile = null
    this._lastDiscardPlayerIndex = null
  }

  get players(): Player[] {
    return this._players
  }

  get gamePhase(): GamePhase {
    return this._gamePhase
  }

  set gamePhase(phase: GamePhase) {
    this._gamePhase = phase
  }

  get currentPlayerIndex(): number {
    return this._currentPlayerIndex
  }

  set currentPlayerIndex(index: number) {
    this._currentPlayerIndex = index
  }

  get wall(): Tile[] {
    return this._wall
  }

  get doraIndicators(): Tile[] {
    return this._doraIndicators
  }

  get currentDrawnTile(): Tile | null {
    return this._currentDrawnTile
  }

  set currentDrawnTile(tile: Tile | null) {
    this._currentDrawnTile = tile
  }

  get round(): number {
    return this._round
  }

  get dealer(): number {
    return this._dealer
  }

  get currentPlayer(): Player {
    return this._players[this._currentPlayerIndex]
  }

  get humanPlayer(): Player {
    return this._players[0]
  }

  get wallRemaining(): number {
    return this._wall.length
  }

  generateWall(): void {
    const tiles: Tile[] = []

    for (const suit of ['man', 'pin', 'sou'] as const) {
      for (let rank = 1; rank <= 9; rank++) {
        for (let i = 0; i < 4; i++) {
          tiles.push({
            id: `${suit}${rank}-${i}`,
            suit,
            rank,
            isRed: false
          })
        }
      }
    }

    for (let rank = 1; rank <= 7; rank++) {
      for (let i = 0; i < 4; i++) {
        tiles.push({
          id: `honor${rank}-${i}`,
          suit: 'honor',
          rank,
          isRed: false
        })
      }
    }

    for (let i = tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[tiles[i], tiles[j]] = [tiles[j], tiles[i]]
    }

    this._wall = tiles
  }

  dealInitialHands(): void {
    for (let playerIndex = 0; playerIndex < 4; playerIndex++) {
      const player = this._players[playerIndex]
      
      for (let i = 0; i < 13; i++) {
        if (this._wall.length > 0) {
          const tile = this._wall.shift()!
          player.tiles.push(tile)
        }
      }
    }

    if (this._wall.length > 0) {
      this._doraIndicators = [this._wall.pop()!]
    }

    this._players.forEach(player => {
      this.sortPlayerHand(player)
    })
  }

  sortPlayerHand(player: Player): void {
    player.tiles.sort((a, b) => {
      if (a.suit !== b.suit) {
        const suitOrder = { man: 0, pin: 1, sou: 2, honor: 3 }
        return suitOrder[a.suit] - suitOrder[b.suit]
      }
      return a.rank - b.rank
    })
  }

  drawTileAndKeepSeparate(playerIndex: number): Tile | null {
    if (this._wall.length === 0) return null
    
    const player = this._players[playerIndex]
    
    if (player.tiles.length !== 13) return null
    
    const tile = this._wall.shift()!
    this._currentDrawnTile = tile
    
    return tile
  }

  discardTile(playerIndex: number, tileId: string): boolean {
    const player = this._players[playerIndex]
    
    if (this._currentDrawnTile && this._currentDrawnTile.id === tileId) {
      const tile = this._currentDrawnTile
      tile.discardOrder = this._discardOrder++
      tile.isTsumoDiscard = true // ツモ切りフラグを設定
      player.discards.push(tile)
      this._currentDrawnTile = null
      
      // 最後の捨て牌を記録
      this._lastDiscardedTile = tile
      this._lastDiscardPlayerIndex = playerIndex
      
      return true
    }
    
    const tileIndex = player.tiles.findIndex(t => t.id === tileId)
    if (tileIndex === -1) return false

    const tile = player.tiles.splice(tileIndex, 1)[0]
    tile.discardOrder = this._discardOrder++
    tile.isTsumoDiscard = false // 手切りフラグを設定
    player.discards.push(tile)
    
    if (this._currentDrawnTile) {
      player.tiles.push(this._currentDrawnTile)
      this.sortPlayerHand(player)
      this._currentDrawnTile = null
    }
    
    // 最後の捨て牌を記録
    this._lastDiscardedTile = tile
    this._lastDiscardPlayerIndex = playerIndex
    
    return true
  }

  addTileToHand(playerIndex: number, tile: Tile): void {
    const player = this._players[playerIndex]
    player.tiles.push(tile)
    this.sortPlayerHand(player)
  }

  nextTurn(): void {
    this._currentPlayerIndex = (this._currentPlayerIndex + 1) % 4
  }

  startNewGame(): void {
    this._players.forEach(player => {
      player.tiles = []
      player.discards = []
      player.melds = []
      player.riichi = false
    })

    this._gamePhase = 'dealing'
    this._currentPlayerIndex = this._dealer
    this._currentDrawnTile = null
    
    this.generateWall()
    this.dealInitialHands()
    
    this._gamePhase = 'playing'
  }

  resetGame(): void {
    this._gamePhase = 'waiting'
    this._currentPlayerIndex = 0
    this._currentDrawnTile = null
    this._wall = []
    this._doraIndicators = []
    this._round = 1
    this._dealer = 0
    this._discardOrder = 0
    this._lastDiscardedTile = null
    this._lastDiscardPlayerIndex = null
    
    this._players.forEach(player => {
      player.tiles = []
      player.discards = []
      player.melds = []
      player.riichi = false
      player.score = 25000
    })
  }

  canPlayerRiichi(playerIndex: number): boolean {
    const player = this._players[playerIndex]
    
    // リーチ条件：
    // 1. まだリーチしていない
    // 2. 1000点以上持っている
    // 3. 14枚でリーチ可能（手牌13枚+ツモ牌1枚）
    if (player.riichi || player.score < 1000) {
      return false
    }
    
    // 手牌13枚+ツモ牌1枚=14枚の時のみリーチ判定
    if (player.tiles.length === 13 && this._currentDrawnTile) {
      const allTiles = [...player.tiles, this._currentDrawnTile]
      return canRiichi(allTiles)
    }
    
    return false
  }

  declareRiichi(playerIndex: number): boolean {
    const player = this._players[playerIndex]
    if (this.canPlayerRiichi(playerIndex)) {
      player.riichi = true
      player.score -= 1000
      return true
    }
    return false
  }

  checkWinConditionForPlayer(playerIndex: number, winTile: Tile, isTsumo: boolean): {
    isWin: boolean
    result?: ReturnType<typeof checkWinCondition>
  } {
    const player = this._players[playerIndex]
    
    const uradoraIndicators = player.riichi && this._wall.length > 0 ? [this._wall[this._wall.length - 1]] : []
    
    const winResult = checkWinCondition(
      player.tiles,
      winTile,
      isTsumo,
      player.riichi,
      this._doraIndicators,
      uradoraIndicators
    )
    
    if (winResult.isWin) {
      this._gamePhase = 'finished'
      return { isWin: true, result: winResult }
    }
    
    return { isWin: false }
  }

  getPlayerDiscardRow(playerIndex: number, rowIndex: number): Tile[] {
    const player = this._players[playerIndex]
    if (!player || !player.discards) return []
    
    const startIndex = rowIndex * 6
    const endIndex = startIndex + 6
    
    // 左上から右下へ順番に配置（特別な順序変更なし）
    return player.discards.slice(startIndex, endIndex)
  }

  getPlayerPosition(playerIndex: number): 'bottom' | 'right' | 'top' | 'left' {
    const positions = ['bottom', 'right', 'top', 'left'] as const
    return positions[playerIndex]
  }

  getDealerText(): string {
    const winds = ['東', '南', '西', '北']
    return winds[this._dealer] + '家'
  }

  isHumanTurn(): boolean {
    return this._currentPlayerIndex === 0 && this._gamePhase === 'playing'
  }

  canHumanDraw(): boolean {
    return this.wallRemaining > 0 && this.humanPlayer.tiles.length === 13
  }

  get lastDiscardedTile(): Tile | null {
    return this._lastDiscardedTile
  }

  get lastDiscardPlayerIndex(): number | null {
    return this._lastDiscardPlayerIndex
  }

  canHumanRon(): boolean {
    // 人間プレイヤーがロン可能かチェック
    if (!this._lastDiscardedTile || this._lastDiscardPlayerIndex === 0 || this._gamePhase !== 'playing') {
      return false
    }
    
    // 人間プレイヤーの手牌が13枚でない場合はロン不可（ロンは13枚+1枚の捨て牌）
    if (this.humanPlayer.tiles.length !== 13) {
      return false
    }
    
    // 最後の捨て牌でアガリ可能かチェック（13枚の手牌 + 1枚の捨て牌 = 14枚）
    const allTiles = [...this.humanPlayer.tiles, this._lastDiscardedTile]
    const winResult = checkWinCondition(
      allTiles,
      this._lastDiscardedTile,
      false,
      this.humanPlayer.riichi,
      this._doraIndicators,
      this.humanPlayer.riichi && this._wall.length > 0 ? [this._wall[this._wall.length - 1]] : []
    )
    return winResult.isWin
  }

  clearLastDiscard(): void {
    this._lastDiscardedTile = null
    this._lastDiscardPlayerIndex = null
  }

  // ドラ判定
  isDoraTile(tile: Tile): boolean {
    for (const indicator of this._doraIndicators) {
      if (this.isDoraFromIndicator(tile, indicator)) {
        return true
      }
    }
    return false
  }

  // ドラ表示牌からドラを判定
  private isDoraFromIndicator(tile: Tile, indicator: Tile): boolean {
    if (indicator.suit === 'honor') {
      // 字牌の場合
      if (tile.suit !== 'honor') return false
      
      if (indicator.rank <= 4) {
        // 風牌: 東→南→西→北→東
        const nextRank = indicator.rank === 4 ? 1 : indicator.rank + 1
        return tile.rank === nextRank
      } else {
        // 三元牌: 白→發→中→白
        const nextRank = indicator.rank === 7 ? 5 : indicator.rank + 1
        return tile.rank === nextRank
      }
    } else {
      // 数牌の場合
      if (tile.suit !== indicator.suit) return false
      
      const nextRank = indicator.rank === 9 ? 1 : indicator.rank + 1
      return tile.rank === nextRank
    }
  }

  getGameInfo() {
    return {
      round: this._round,
      wallRemaining: this.wallRemaining,
      gamePhase: this._gamePhase,
      currentPlayer: this.currentPlayer,
      doraIndicators: this._doraIndicators,
      dealer: this._dealer,
      discardOrder: this._discardOrder
    }
  }
}