import type { Tile, Player, GamePhase } from '../stores/fourPlayerMahjong'
import { canRiichi, checkWinCondition, calculateShanten } from './mahjong-logic'

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
  private _renchan: boolean = false // 上がり連荘設定
  private _kyotaku: number = 0 // 供託の本数

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

  get kyotaku(): number {
    return this._kyotaku
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

  discardTile(playerIndex: number, tileId: string, isRiichiDeclaration: boolean = false): boolean {
    const player = this._players[playerIndex]

    if (this._currentDrawnTile && this._currentDrawnTile.id === tileId) {
      const tile = this._currentDrawnTile
      tile.discardOrder = this._discardOrder++
      tile.isTsumoDiscard = true // ツモ切りフラグを設定
      tile.isRiichiDeclaration = isRiichiDeclaration // リーチ宣言牌フラグを設定
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
    tile.isRiichiDeclaration = isRiichiDeclaration // リーチ宣言牌フラグを設定
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

  advanceToNextRound(): void {
    console.log('advanceToNextRound called - current dealer:', this._dealer)
    // 親を次のプレイヤーに移動
    this._dealer = (this._dealer + 1) % 4
    this._round++
    console.log('New dealer:', this._dealer, 'round:', this._round)

    // プレイヤーの風を更新（親のローテーション）
    this.updatePlayerWinds()

    // プレイヤーの状態をリセット
    this._players.forEach(player => {
      player.tiles = []
      player.discards = []
      player.melds = []
      player.riichi = false
    })

    this._gamePhase = 'dealing'
    this._currentPlayerIndex = this._dealer
    this._currentDrawnTile = null
    this._lastDiscardedTile = null
    this._lastDiscardPlayerIndex = null
    this._discardOrder = 0
    console.log('Set currentPlayerIndex to dealer:', this._currentPlayerIndex)

    this.generateWall()
    this.dealInitialHands()

    this._gamePhase = 'playing'
    console.log('advanceToNextRound completed - gamePhase:', this._gamePhase)
  }

  private updatePlayerWinds(): void {
    const winds = ['east', 'south', 'west', 'north'] as const
    this._players.forEach((player, index) => {
      // 親（dealer）からの相対位置で風を決定
      const windIndex = (4 + index - this._dealer) % 4
      player.wind = winds[windIndex]
    })
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
    this._kyotaku = 0

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
    console.log('GameManager declareRiichi called for player:', playerIndex, 'canRiichi:', this.canPlayerRiichi(playerIndex))
    if (this.canPlayerRiichi(playerIndex)) {
      player.riichi = true
      player.score -= 1000
      this._kyotaku++
      console.log('Riichi declared successfully for player:', playerIndex, 'new riichi state:', player.riichi, 'kyotaku:', this._kyotaku)
      return true
    }
    console.log('Cannot declare riichi for player:', playerIndex)
    return false
  }

  checkWinConditionForPlayer(playerIndex: number, winTile: Tile, isTsumo: boolean): {
    isWin: boolean
    result?: ReturnType<typeof checkWinCondition>
  } {
    const player = this._players[playerIndex]

    // ツモの場合は手牌13枚+勝利牌1枚=14枚、ロンの場合も14枚で判定
    const allTiles = [...player.tiles, winTile]
    
    // まず簡単なシャンテン数チェックで和了可能性を確認
    const convertedTiles = allTiles.map(t => ({ id: t.id, suit: t.suit, rank: t.rank, isRed: t.isRed }))
    const shanten = calculateShanten(convertedTiles)
    
    // シャンテン数が-1でない場合は和了不可
    if (shanten !== -1) {
      return { isWin: false }
    }

    // 裏ドラ指示牌は山の後方から2番目の牌（ドラ指示牌の下）
    const uradoraIndicators = player.riichi && this._wall.length >= 2 ? [this._wall[this._wall.length - 2]] : []
    console.log('checkWinConditionForPlayer - player riichi:', player.riichi, 'wall length:', this._wall.length, 'uradoraIndicators:', uradoraIndicators, 'doraIndicators:', this._doraIndicators)

    try {
      const isDealer = playerIndex === this._dealer
      const winResult = checkWinCondition(
        allTiles,                  // 14枚の完全な手牌
        winTile,                   // 勝利牌の情報
        isTsumo,
        player.riichi,
        this._doraIndicators,
        uradoraIndicators,
        isDealer                   // Pass dealer status for accurate scoring
      )

      if (winResult.isWin) {
        // 人間プレイヤーの場合はゲーム状態を変更せず、ボタン選択を可能にする
        if (player.type !== 'human') {
          this._gamePhase = 'finished'
        }
        return { isWin: true, result: winResult }
      }

      return { isWin: false }
    } catch (error) {
      console.error('Error in checkWinConditionForPlayer scoring check:', error)
      return { isWin: false }
    }
  }

  // 上がり時に供託分を得点に加算し、供託をリセット
  applyKyotakuToWinner(playerIndex: number): number {
    const kyotakuPoints = this._kyotaku * 1000
    if (kyotakuPoints > 0) {
      this._players[playerIndex].score += kyotakuPoints
      console.log(`Player ${playerIndex} received kyotaku bonus: ${kyotakuPoints} points, new score: ${this._players[playerIndex].score}`)
      this._kyotaku = 0
    }
    return kyotakuPoints
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
    const roundNames = ['東', '南', '西', '北']
    const roundIndex = Math.floor((this._round - 1) / 4) % 4
    const subRound = ((this._round - 1) % 4) + 1
    return `${roundNames[roundIndex]} ${subRound}局`
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

    // まず簡単なシャンテン数チェックで和了可能性を確認
    const allTiles = [...this.humanPlayer.tiles, this._lastDiscardedTile]
    const convertedTiles = allTiles.map(t => ({ id: t.id, suit: t.suit, rank: t.rank, isRed: t.isRed }))
    const shanten = calculateShanten(convertedTiles)
    
    // シャンテン数が-1でない場合は和了不可
    if (shanten !== -1) {
      return false
    }

    // シャンテン数が-1の場合のみ詳細な役・点数チェック
    try {
      const isDealer = 0 === this._dealer // Human player is always index 0
      const winResult = checkWinCondition(
        allTiles,                  // 14枚の完全な手牌
        this._lastDiscardedTile,   // 勝利牌の情報
        false,                     // ロンなのでfalse
        this.humanPlayer.riichi,
        this._doraIndicators,
        this.humanPlayer.riichi && this._wall.length >= 2 ? [this._wall[this._wall.length - 2]] : [],
        isDealer                   // Pass dealer status for accurate scoring
      )
      return winResult.isWin
    } catch (error) {
      console.error('Error in canHumanRon scoring check:', error)
      return false
    }
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
      discardOrder: this._discardOrder,
      kyotaku: this._kyotaku
    }
  }
}