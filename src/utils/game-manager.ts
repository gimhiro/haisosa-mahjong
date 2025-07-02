import type { Tile, Player, GamePhase } from '../stores/fourPlayerMahjong'
import { canRiichi, canRiichiWithMelds, checkWinCondition, calculateShanten, isFuriten } from './mahjong-logic'
import { EnhancedDraw } from './enhanced-draw'
import { RecordsManager } from './records-manager'
import { type PlayerTestData } from './useGameSettings'

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
  private _ippatsuFlags: boolean[] = [false, false, false, false] // 各プレイヤーの一発フラグ
  private _riichiTurnNumbers: (number | null)[] = [null, null, null, null] // 各プレイヤーがリーチした巡数
  private _lastKanPlayerIndex: number | null = null // 直前にカンしたプレイヤー
  private _afterKan: boolean = false // 直前にカンが行われたかどうか
  private _enhancedDraw: EnhancedDraw
  private _gameSettings: { cpuStrengths: string[], gameType: string, agariRenchan: boolean, hakoshita: boolean }
  private _currentTurn: number = 0 // 現在の巡目
  private _gameStartTime: Date | null = null // ゲーム開始時刻
  private _testMode: { isActive: boolean, testData: PlayerTestData[] } = {
    isActive: false,
    testData: []
  }
  private _testDrawIndices: number[] = [0, 0, 0, 0] // 各プレイヤーのツモ牌インデックス
  private _firstTakeFlags: boolean[] = [true, true, true, true] // 各プレイヤーの第一ツモフラグ

  constructor() {
    // ローカルストレージから設定を読み込み
    const savedSettings = this.loadGameSettings()
    this._gameSettings = savedSettings

    // 牌操作率設定を適用してEnhancedDrawを初期化
    const manipulationRate = this.getManipulationRate()
    this._enhancedDraw = new EnhancedDraw({ boostProbability: manipulationRate / 100 })

    this._players = [
      { id: 0, name: 'あなた', type: 'human', tiles: [], discards: [], melds: [], riichi: false, score: 25000, wind: 'east' },
      { id: 1, name: this.getCpuName(savedSettings.cpuStrengths[0], 1), type: 'cpu', difficulty: this.mapDifficulty(savedSettings.cpuStrengths[0]), tiles: [], discards: [], melds: [], riichi: false, score: 25000, wind: 'south' },
      { id: 2, name: this.getCpuName(savedSettings.cpuStrengths[1], 2), type: 'cpu', difficulty: this.mapDifficulty(savedSettings.cpuStrengths[1]), tiles: [], discards: [], melds: [], riichi: false, score: 25000, wind: 'west' },
      { id: 3, name: this.getCpuName(savedSettings.cpuStrengths[2], 3), type: 'cpu', difficulty: this.mapDifficulty(savedSettings.cpuStrengths[2]), tiles: [], discards: [], melds: [], riichi: false, score: 25000, wind: 'north' }
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

  /**
   * カン時に新しいドラ表示牌を追加する
   */
  addKanDoraIndicator(): void {
    if (this._wall.length > 0 && this._doraIndicators.length < 5) {
      // 王牌（リンシャン牌）からドラ表示牌を取得
      const newDoraIndicator = this._wall.pop()!
      this._doraIndicators.push(newDoraIndicator)
    }
  }

  /**
   * リーチ時の裏ドラ表示牌を表ドラ数と同数取得する
   */
  getUradoraIndicators(): Tile[] {
    if (this._wall.length < this._doraIndicators.length) {
      return []
    }

    const uradoraIndicators: Tile[] = []
    const doraCount = this._doraIndicators.length

    // 表ドラと同数の裏ドラを山の後方から取得
    for (let i = 0; i < doraCount; i++) {
      const uradoraIndex = this._wall.length - 2 - i
      if (uradoraIndex >= 0) {
        uradoraIndicators.push(this._wall[uradoraIndex])
      }
    }

    return uradoraIndicators
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
    return Math.max(0, this._wall.length - 14)
  }

  /**
   * ハイテイ（最後の1枚）かどうかを判定
   */
  isHaitei(): boolean {
    return this.wallRemaining === 0
  }

  /**
   * ダブルリーチかどうかを判定
   * @param playerIndex プレイヤーのインデックス
   */
  isDoubleRiichi(playerIndex: number): boolean {
    const riichiTurn = this._riichiTurnNumbers[playerIndex]
    // 1巡目（_currentTurnが0または1）のリーチをダブルリーチとする
    return riichiTurn === 0 || riichiTurn === 1
  }

  /**
   * 嶺上開花（カン後のツモ和了）かどうかを判定
   * @param playerIndex プレイヤーのインデックス
   */
  isRinshanKaihou(playerIndex: number): boolean {
    return this._afterKan && this._lastKanPlayerIndex === playerIndex
  }

  /**
   * カン後の状態を設定（嶺上開花判定用）
   * @param kanPlayerIndex カンを行ったプレイヤーのインデックス
   */
  setAfterKan(kanPlayerIndex: number): void {
    this._afterKan = true
    this._lastKanPlayerIndex = kanPlayerIndex
  }

  /**
   * カン後の状態をリセット（打牌やロンなどで呼び出し）
   */
  resetAfterKan(): void {
    this._afterKan = false
    this._lastKanPlayerIndex = null
  }

  get kyotaku(): number {
    return this._kyotaku
  }

  get currentTurn(): number {
    return this._currentTurn
  }

  isIppatsu(playerIndex: number): boolean {
    const result = this._ippatsuFlags[playerIndex]
    return result
  }

  private updateIppatsuFlags(currentPlayerIndex: number, isRiichiDeclaration: boolean): void {
    // リーチ宣言の場合は一発フラグの更新はスキップ
    if (isRiichiDeclaration) {
      return
    }

    // リーチ宣言後の通常の捨て牌の場合、そのプレイヤーの一発フラグを無効化
    if (this._ippatsuFlags[currentPlayerIndex]) {
      this._ippatsuFlags[currentPlayerIndex] = false
    }

    // 鳴きがあった場合は全プレイヤーの一発を無効化
    // TODO: 鳴きの検出ロジックが必要
  }

  generateWall(): void {
    const tiles: Tile[] = []

    for (const suit of ['man', 'pin', 'sou'] as const) {
      for (let rank = 1; rank <= 9; rank++) {
        for (let i = 0; i < 4; i++) {
          // 5の牌の最初の1枚は赤ドラにする
          const isRedTile = rank === 5 && i === 0
          tiles.push({
            id: `${suit}${rank}-${i}`,
            suit,
            rank,
            isRed: isRedTile
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
    // 手牌の良さ設定を取得
    const handQualitySetting = this.getHandQualitySetting()

    // 人間プレイヤーの手牌を配牌
    this.dealPlayerHand(0, handQualitySetting)

    // CPUプレイヤーの手牌を通常配牌
    for (let playerIndex = 1; playerIndex < 4; playerIndex++) {
      this.dealPlayerHand(playerIndex, 'normal')
    }

    if (this._wall.length > 0) {
      this._doraIndicators = [this._wall.pop()!]
    }

    this._players.forEach(player => {
      this.sortPlayerHand(player)
    })
  }

  private getHandQualitySetting(): string {
    try {
      const gameSettings = localStorage.getItem('mahjong-game-settings')
      if (gameSettings) {
        const settings = JSON.parse(gameSettings)
        return settings.handQuality || 'good'
      }
    } catch (error) {
      console.error('Failed to load hand quality setting:', error)
    }
    return 'good'
  }

  private dealPlayerHand(playerIndex: number, handQuality: string): void {
    const player = this._players[playerIndex]

    if (handQuality === 'normal') {
      // 通常配牌（現在と同じ）
      for (let i = 0; i < 13; i++) {
        if (this._wall.length > 0) {
          const tile = this._wall.shift()!
          player.tiles.push(tile)
        }
      }
    } else {
      // 複数候補から最適な手牌を選択
      const candidates = handQuality === 'good' ? 2 : 5
      const bestHand = this.selectBestHand(candidates)

      // 選択された手牌を配牌
      bestHand.forEach(tile => {
        const wallIndex = this._wall.findIndex(t => t.id === tile.id)
        if (wallIndex !== -1) {
          this._wall.splice(wallIndex, 1)
          player.tiles.push(tile)
        }
      })
    }
  }

  private selectBestHand(candidates: number): Tile[] {
    let bestHand: Tile[] = []
    let bestScore = -1

    for (let i = 0; i < candidates; i++) {
      const candidateHand: Tile[] = []
      const wallCopy = [...this._wall]

      // 13枚の候補手牌を生成
      for (let j = 0; j < 13; j++) {
        if (wallCopy.length > 0) {
          const randomIndex = Math.floor(Math.random() * wallCopy.length)
          candidateHand.push(wallCopy.splice(randomIndex, 1)[0])
        }
      }

      // 手牌を評価
      const score = this.evaluateHand(candidateHand)

      if (score > bestScore) {
        bestScore = score
        bestHand = candidateHand
      }
    }

    return bestHand
  }

  private evaluateHand(hand: Tile[]): number {
    let score = 0

    // シャンテン数による評価
    const shanten = calculateShanten(hand)
    score += (8 - shanten) * 100 // シャンテン数が少ないほど高スコア

    // ドラ牌による評価
    if (this._doraIndicators.length > 0) {
      const doraCount = this.countDoraTiles(hand)
      score += doraCount * 20
    }

    return score
  }

  private countDoraTiles(hand: Tile[]): number {
    if (this._doraIndicators.length === 0) return 0

    let count = 0
    const doraIndicator = this._doraIndicators[0]
    const doranumber = this.getNextTileNumber(doraIndicator)

    hand.forEach(tile => {
      const tileNumber = this.convertTileToNumber(tile)
      if (tileNumber === doranumber) {
        count++
      }
    })

    return count
  }

  private getNextTileNumber(tile: Tile): number {
    if (tile.suit === 'man' || tile.suit === 'pin' || tile.suit === 'sou') {
      const nextRank = tile.rank === 9 ? 1 : tile.rank + 1
      const offset = tile.suit === 'man' ? 0 : tile.suit === 'pin' ? 9 : 18
      return offset + nextRank - 1
    } else if (tile.suit === 'honor') {
      const honorOrder = [1, 2, 3, 4, 5, 6, 7]
      const currentIndex = honorOrder.indexOf(tile.rank)
      const nextRank = honorOrder[(currentIndex + 1) % honorOrder.length]
      return 27 + nextRank - 1
    }
    return 0
  }

  private convertTileToNumber(tile: Tile): number {
    if (tile.suit === 'man') return tile.rank - 1
    if (tile.suit === 'pin') return tile.rank + 8
    if (tile.suit === 'sou') return tile.rank + 17
    if (tile.suit === 'honor') return tile.rank + 26
    return 0
  }

  private getManipulationRate(): number {
    try {
      const gameSettings = localStorage.getItem('mahjong-game-settings')
      if (gameSettings) {
        const settings = JSON.parse(gameSettings)
        return settings.manipulationRate !== undefined ? settings.manipulationRate : 80
      }
    } catch (error) {
      console.error('Failed to load manipulation rate setting:', error)
    }
    return 80
  }

  /**
   * 牌操作率設定を更新（ゲーム中の設定変更対応）
   */
  updateManipulationRate(): void {
    const newRate = this.getManipulationRate()
    this._enhancedDraw.setBoostProbability(newRate / 100)
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
    // テストモードの場合は専用の処理
    if (this._testMode.isActive) {
      const testTile = this.getTestDrawTile(playerIndex)
      if (testTile) {
        // テストモード時でも牌山から1枚除去して数値を正しく表示
        if (this._wall.length > 14) {
          this._wall.shift() // 実際の山から1枚除去
        }
        this._currentDrawnTile = testTile
        return testTile
      }
      // テストデータが尽きた場合は通常のドローに戻る
    }

    return this.drawTileInternal(playerIndex)
  }

  // カン後のリンシャン牌を引く（テストモードではツモインデックスをインクリメントしない）
  drawKanTile(playerIndex: number): Tile | null {
    // テストモードの場合は専用の処理
    if (this._testMode.isActive) {
      const testTile = this.getTestKanTile(playerIndex)
      if (testTile) {
        // テストモード時でも牌山から1枚除去して数値を正しく表示
        if (this._wall.length > 14) {
          this._wall.shift() // 実際の山から1枚除去
        }
        this._currentDrawnTile = testTile
        return testTile
      }
      // テストデータが尽きた場合は通常のドローに戻る
    }

    return this.drawTileInternal(playerIndex)
  }

  private drawTileInternal(playerIndex: number): Tile | null {

    // 14枚残しで終了
    if (this._wall.length <= 14) return null

    const player = this._players[playerIndex]

    // 鳴き牌を考慮した枚数チェック（カンは3枚として数える）
    const meldTileCount = player.melds.reduce((count, meld) => {
      if (meld.type === 'kan') {
        return count + 3 // カンは3枚として数える
      } else {
        return count + meld.tiles.length // ポン・チーは実際の枚数
      }
    }, 0)
    const expectedHandTiles = 13 - meldTileCount

    if (player.tiles.length !== expectedHandTiles) return null

    let tile: Tile | null = null

    // hardAI（30%の確率で有効牌）、superAI（80%）、または人間プレイヤーの場合、EnhancedDrawを使用
    if (player.difficulty === 'hard' || player.difficulty === 'super' || playerIndex === 0) {
      // 確率を設定
      let boostProbability = 0.8 // デフォルト（super/人間）
      if (player.difficulty === 'hard') {
        boostProbability = 0.3 // hardAIは30%
      }

      // 人間プレイヤーの場合は設定済みの牌操作率をそのまま使用
      if (playerIndex === 0) {
        // 人間プレイヤーの場合は初期化時に設定した牌操作率を使用
        const drawnTile = this._enhancedDraw.drawEnhancedTile(player.tiles, this._wall)
        
        if (drawnTile) {
          // 山から引いた牌を除去
          const index = this._wall.findIndex(t => t.id === drawnTile.id)
          if (index !== -1) {
            this._wall.splice(index, 1)
          }
          tile = drawnTile
        }
      } else {
        // CPUプレイヤーの場合は一時的にブースト確率を変更
        const originalProbability = this._enhancedDraw['options'].boostProbability
        this._enhancedDraw.setBoostProbability(boostProbability)

        const drawnTile = this._enhancedDraw.drawEnhancedTile(player.tiles, this._wall)

        // 元の確率に戻す
        this._enhancedDraw.setBoostProbability(originalProbability)
        
        if (drawnTile) {
          // 山から引いた牌を除去
          const index = this._wall.findIndex(t => t.id === drawnTile.id)
          if (index !== -1) {
            this._wall.splice(index, 1)
          }
          tile = drawnTile
        }
      }
    }

    // 通常の引き方（該当しない難易度の場合、または有効牌が引けなかった場合）
    if (!tile && this._wall.length > 14) {
      tile = this._wall.shift()!
    }

    if (tile) {
      this._currentDrawnTile = tile
      // 第一ツモフラグをクリア（天和・地和判定のため）
      this.clearFirstTakeFlag(playerIndex)
      return tile
    }

    return null
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

      // 一発フラグの管理
      this.updateIppatsuFlags(playerIndex, isRiichiDeclaration)

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

    // 一発フラグの管理
    this.updateIppatsuFlags(playerIndex, isRiichiDeclaration)

    return true
  }

  addTileToHand(playerIndex: number, tile: Tile): void {
    const player = this._players[playerIndex]
    player.tiles.push(tile)
    this.sortPlayerHand(player)
  }

  nextTurn(): void {
    this._currentPlayerIndex = (this._currentPlayerIndex + 1) % 4
    // 親（0番）のターンが回ってきたら巡目を増やす
    if (this._currentPlayerIndex === 0) {
      this._currentTurn++
    }
  }

  advanceToNextRound(): void {
    // 親を次のプレイヤーに移動
    this._dealer = (this._dealer + 1) % 4
    this._round++

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
    this._ippatsuFlags = [false, false, false, false]
    this._currentTurn = 1 // 巡目をリセット
    this.resetFirstTakeFlags() // 天和・地和判定のため第一ツモフラグをリセット

    this.generateWall()
    this.dealInitialHands()

    this._gamePhase = 'playing'
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
    this._currentTurn = 1 // 巡目をリセット
    this.resetFirstTakeFlags() // 天和・地和判定のため第一ツモフラグをリセット

    this.generateWall()
    this.dealInitialHands()

    // ゲーム開始時刻を記録
    this._gameStartTime = new Date()
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
    this._ippatsuFlags = [false, false, false, false]
    this._currentTurn = 1
    this._gameStartTime = null

    this._players.forEach(player => {
      player.tiles = []
      player.discards = []
      player.melds = []
      player.riichi = false
      player.score = 25000
      // 難易度は維持する（リセットしない）
    })
  }

  canPlayerRiichi(playerIndex: number): boolean {
    const player = this._players[playerIndex]


    // リーチ条件：
    // 1. まだリーチしていない
    // 2. 1000点以上持っている
    // 3. メンゼン（暗カンはOK、明カン・ポン・チーはNG）
    // 4. 14枚でリーチ可能（手牌13枚+ツモ牌1枚）
    if (player.riichi || player.score < 1000) {
      return false
    }

    // メンゼン判定：暗カン以外の鳴きがある場合はNG
    const hasOpenMelds = player.melds.some(meld =>
      meld.type !== 'kan' || meld.fromPlayer !== playerIndex
    )
    if (hasOpenMelds) {
      return false
    }

    // 鳴き牌を考慮した実効手牌枚数を計算
    const meldTiles = player.melds.reduce((total, meld) => {
      return total + (meld.type === 'kan' ? 3 : 3) // カンもポン・チーも3枚として数える
    }, 0)
    const effectiveHandSize = player.tiles.length + meldTiles

    // ツモ牌を考慮した実効手牌14枚の時のみリーチ判定
    if (this._currentDrawnTile) {
      const effectiveHandSizeWithTsumo = effectiveHandSize + 1 // ツモ牌を追加
      if (effectiveHandSizeWithTsumo === 14) {
        const allTiles = [...player.tiles, this._currentDrawnTile]

        // 鳴き牌がある場合は専用の関数を使用
        if (player.melds.length > 0) {
          return canRiichiWithMelds(allTiles, player.melds)
        } else {
          return canRiichi(allTiles)
        }
      }
    }

    return false
  }

  declareRiichi(playerIndex: number): boolean {
    const player = this._players[playerIndex]
    if (this.canPlayerRiichi(playerIndex)) {
      player.riichi = true
      player.score -= 1000
      this._kyotaku++
      this._ippatsuFlags[playerIndex] = true // 一発フラグを設定
      this._riichiTurnNumbers[playerIndex] = this._currentTurn // リーチした巡数を記録
      return true
    }
    return false
  }

  checkWinConditionForPlayer(playerIndex: number, winTile: Tile, isTsumo: boolean, shouldResetFlags: boolean = false): {
    isWin: boolean
    result?: ReturnType<typeof checkWinCondition>
  } {
    const player = this._players[playerIndex]

    // ツモの場合は手牌+勝利牌で判定、ロンの場合は手牌+勝利牌で判定
    // 注意：ツモの場合はwinTileが既にplayer.tilesに含まれている可能性がある
    let allTiles: Tile[]
    if (isTsumo) {
      // ツモの場合：winTileが既に手牌に含まれているかチェック
      const winTileInHand = player.tiles.some(tile =>
        tile.id === winTile.id ||
        (tile.suit === winTile.suit && tile.rank === winTile.rank)
      )
      if (winTileInHand) {
        // 既に含まれている場合はそのまま使用
        allTiles = [...player.tiles]
      } else {
        // 含まれていない場合は追加
        allTiles = [...player.tiles, winTile]
      }
    } else {
      // ロンの場合：勝利牌を追加
      allTiles = [...player.tiles, winTile]
    }



    // 裏ドラ指示牌を表ドラと同数取得
    const uradoraIndicators = player.riichi ? this.getUradoraIndicators() : []

    try {
      const isDealer = playerIndex === this._dealer

      const winResult = checkWinCondition(
        allTiles,                  // 14枚の完全な手牌
        winTile,                   // 勝利牌の情報
        isTsumo,
        player.riichi,
        this._doraIndicators,
        uradoraIndicators,
        isDealer,                  // Pass dealer status for accurate scoring
        this._ippatsuFlags[playerIndex], // 一発フラグ
        player.melds,              // プレイヤーのメルド情報
        this.isHaitei(),           // ハイテイフラグ
        this.isDoubleRiichi(playerIndex), // ダブルリーチフラグ
        this.isRinshanKaihou(playerIndex), // 嶺上開花フラグ
        this.isTenho(playerIndex, isTsumo), // 天和フラグ
        this.isChiho(playerIndex, isTsumo)  // 地和フラグ
      )

      if (winResult.isWin) {
        // ロンの場合のみフリテンチェックを実行（あがり確定後）
        if (!isTsumo && isFuriten(player.tiles, player.discards)) {
          return { isWin: false } // フリテンの場合はロン不可
        }

        if (shouldResetFlags) {
          // 実際の上がり確定時のみ一発フラグをリセット
          this._ippatsuFlags.fill(false)

          // 人間プレイヤーの場合はゲーム状態を変更せず、ボタン選択を可能にする
          if (player.type !== 'human') {
            this._gamePhase = 'finished'
          }
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
      this._kyotaku = 0
    }
    return kyotakuPoints
  }

  // 点数移動を実行する
  executeScoreTransfer(winnerIndex: number, paymentInfo: string, totalPoints: number, isTsumo: boolean, ronTargetIndex?: number): void {
    const winner = this._players[winnerIndex]
    const isWinnerDealer = winnerIndex === this._dealer

    if (isTsumo) {
      // ツモの場合の点数移動
      if (isWinnerDealer) {
        // 親のツモ: 全員から同額支払い
        const match = paymentInfo.match(/(\d+) all/)
        if (match) {
          const eachPayment = parseInt(match[1])
          for (let i = 0; i < 4; i++) {
            if (i !== winnerIndex) {
              this._players[i].score -= eachPayment
            }
          }
          winner.score += totalPoints
        }
      } else {
        // 子のツモ: 親は2倍、子は1倍
        const match = paymentInfo.match(/(\d+)-(\d+)/)
        if (match) {
          const koPayment = parseInt(match[1])
          const oyaPayment = parseInt(match[2])

          for (let i = 0; i < 4; i++) {
            if (i !== winnerIndex) {
              const isDealer = i === this._dealer
              const payment = isDealer ? oyaPayment : koPayment
              this._players[i].score -= payment
            }
          }
          winner.score += totalPoints
        }
      }
    } else {
      // ロンの場合の点数移動
      if (ronTargetIndex !== undefined) {
        const ronTarget = this._players[ronTargetIndex]
        ronTarget.score -= totalPoints
        winner.score += totalPoints
      }
    }
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
        isDealer,                  // Pass dealer status for accurate scoring
        this._ippatsuFlags[0],     // 人間プレイヤーの一発フラグ
        this.humanPlayer.melds,    // 人間プレイヤーのメルド情報
        this.isHaitei(),           // ハイテイフラグ
        this.isDoubleRiichi(0),    // ダブルリーチフラグ
        this.isRinshanKaihou(0),   // 嶺上開花フラグ
        false,                     // 天和フラグ（ロンでは不可）
        false                      // 地和フラグ（ロンでは不可）
      )
      
      // あがり形かつ点数が0より大きい場合、最後にフリテンチェック
      if (winResult.isWin && winResult.totalPoints > 0) {
        // フリテンチェック（あがり確定後に実行）
        if (isFuriten(this.humanPlayer.tiles, this.humanPlayer.discards)) {
          return false // フリテンの場合はロン不可
        }
        return true
      }
      return false
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
    // 赤ドラ判定
    if (tile.isRed && tile.rank === 5) {
      return true
    }

    // 通常ドラ判定
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

  // ローカルストレージからゲーム設定を読み込み
  private loadGameSettings(): { cpuStrengths: string[], gameType: string, agariRenchan: boolean, hakoshita: boolean } {
    try {
      const settingsJson = localStorage.getItem('mahjongGameSettings')
      if (settingsJson) {
        const settings = JSON.parse(settingsJson)
        return {
          cpuStrengths: settings.cpuStrengths || ['normal', 'normal', 'normal'],
          gameType: settings.gameType || 'tonpuusen',
          agariRenchan: settings.agariRenchan || false,
          hakoshita: settings.hakoshita !== undefined ? settings.hakoshita : true
        }
      }
    } catch (error) {
      console.error('Failed to load game settings:', error)
    }

    // デフォルト設定
    return {
      cpuStrengths: ['normal', 'normal', 'normal'],
      gameType: 'tonpuusen',
      agariRenchan: false,
      hakoshita: true
    }
  }

  // CPU名を生成
  private getCpuName(difficulty: string, cpuIndex: number): string {
    const difficultyNames = {
      easy: '簡単',
      normal: '普通',
      hard: '難しい',
      super: '超難しい'
    }

    const difficultyName = difficultyNames[difficulty as keyof typeof difficultyNames] || '普通'
    return `CPU${cpuIndex} (${difficultyName})`
  }

  // 文字列をタイプセーフな難易度に変換
  private mapDifficulty(difficulty: string): 'easy' | 'medium' | 'hard' | 'super' {
    const difficultyMap: Record<string, 'easy' | 'medium' | 'hard' | 'super'> = {
      easy: 'easy',
      normal: 'medium',
      hard: 'hard',
      super: 'super'
    }

    return difficultyMap[difficulty] || 'medium'
  }

  // 流局処理
  checkDraw(): { isDraw: boolean, drawData?: any } {
    // 山が14枚以下になった場合の流局（14枚残し）
    if (this._wall.length <= 14) {
      return this.processDraw('荒牌平局')
    }

    return { isDraw: false }
  }

  private processDraw(reason: string): { isDraw: true, drawData: any } {
    // テンパイ判定
    const playersDrawData = this._players.map(player => {
      const isTenpai = this.isPlayerTenpai(player)
      return {
        id: player.id,
        name: player.name,
        isTenpai,
        scoreChange: 0,
        totalScore: player.score
      }
    })

    // テンパイ数を計算
    const tenpaiPlayers = playersDrawData.filter(p => p.isTenpai)
    const tenpaiCount = tenpaiPlayers.length
    const notenCount = 4 - tenpaiCount

    // 点数移動計算
    if (tenpaiCount > 0 && notenCount > 0) {
      const pointsPerNoten = Math.floor(3000 / notenCount)
      const pointsPerTenpai = Math.floor(3000 / tenpaiCount)

      playersDrawData.forEach(playerData => {
        if (playerData.isTenpai) {
          playerData.scoreChange = pointsPerTenpai
          this._players[playerData.id].score += pointsPerTenpai
        } else {
          playerData.scoreChange = -pointsPerNoten
          this._players[playerData.id].score -= pointsPerNoten
        }
        playerData.totalScore = this._players[playerData.id].score
      })
    }

    return {
      isDraw: true,
      drawData: {
        players: playersDrawData,
        reason,
        tenpaiCount,
        notenCount,
        remainingTiles: this._wall.length
      }
    }
  }

  private isPlayerTenpai(player: Player): boolean {
    if (player.tiles.length !== 13) return false

    // 簡易的なテンパイ判定：シャンテン数が0かどうか
    const shanten = calculateShanten(player.tiles)
    return shanten === 0
  }

  // ゲーム終了判定
  checkGameEnd(): { isGameEnd: boolean, gameEndData?: any } {
    const settings = this._gameSettings

    // トビ終了チェック（トビ終了がありの場合）
    if (settings.hakoshita) {
      const hasNegativeScore = this._players.some(player => player.score < 0)
      if (hasNegativeScore) {
        return this.createGameEndData('トビ終了')
      }
    }

    // 規定局数チェック
    const isEastGame = settings.gameType === 'tonpuusen'
    const maxRound = isEastGame ? 4 : 8

    if (this._round > maxRound) {
      const endReason = isEastGame ? '東風戦終了' : '東南戦終了'
      return this.createGameEndData(endReason)
    }

    // 上がり連荘なしの場合の親流れチェック
    if (!settings.agariRenchan) {
      const isLastRound = (isEastGame && this._round === 4) || (!isEastGame && this._round === 8)
      if (isLastRound && !this._renchan) {
        const endReason = isEastGame ? '東4局終了' : '南4局終了'
        return this.createGameEndData(endReason)
      }
    }

    return { isGameEnd: false }
  }

  private createGameEndData(endReason: string): { isGameEnd: true, gameEndData: any } {
    const players = this._players.map(player => ({
      id: player.id,
      name: player.name,
      score: player.score,
      scoreDiff: player.score - 25000, // 初期点数との差
      originalPosition: player.id
    }))

    // 規定局数完了による自然終了かどうかを判定
    const isNaturalEnd = endReason.includes('終了') && !endReason.includes('トビ')

    // 自然終了の場合は記録に追加
    if (isNaturalEnd) {
      this.recordGameEnd(true) // 完了したゲームとして記録
    }

    return {
      isGameEnd: true,
      gameEndData: {
        players,
        gameType: this._gameSettings.gameType,
        finalRound: this.getDealerText(),
        endReason,
        gameTime: this.getGameTimeString()
      }
    }
  }

  // ゲーム時間を計算
  private getGameTimeString(): string {
    if (!this._gameStartTime) {
      return '00:00'
    }

    const now = new Date()
    const diffMs = now.getTime() - this._gameStartTime.getTime()
    const minutes = Math.floor(diffMs / 60000)
    const seconds = Math.floor((diffMs % 60000) / 1000)

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  // 連荘設定
  setRenchan(renchan: boolean): void {
    this._renchan = renchan
  }

  get gameSettings(): { cpuStrengths: string[], gameType: string, agariRenchan: boolean, hakoshita: boolean } {
    return this._gameSettings
  }

  // 人間プレイヤーの上がりを記録
  recordHumanWin(yakuList: string[], totalPoints: number, isGameEnding: boolean = false): void {
    // 役の記録
    RecordsManager.recordYaku(yakuList)

    if (isGameEnding) {
      // ゲーム終了を伴う上がりの場合
      RecordsManager.recordGameEnd(
        this._gameSettings.gameType as 'tonpuusen' | 'tonnanssen',
        this._gameSettings.agariRenchan,
        this._players[0].score,
        true,
        totalPoints,
        this._currentTurn,
        true // ゲーム完了
      )
    } else {
      // ゲーム継続中の上がりの場合
      RecordsManager.recordWin(
        this._gameSettings.gameType as 'tonpuusen' | 'tonnanssen',
        this._gameSettings.agariRenchan,
        this._players[0].score,
        totalPoints,
        this._currentTurn
      )
    }
  }

  // ゲーム終了時の記録（上がりなし）
  recordGameEnd(isGameCompleted: boolean = false): void {
    RecordsManager.recordGameEnd(
      this._gameSettings.gameType as 'tonpuusen' | 'tonnanssen',
      this._gameSettings.agariRenchan,
      this._players[0].score,
      false,
      undefined,
      undefined,
      isGameCompleted
    )
  }

  // テストモード用メソッド
  setTestMode(isActive: boolean, testData?: PlayerTestData[]) {
    this._testMode.isActive = isActive
    if (testData) {
      this._testMode.testData = testData
      this._testDrawIndices = [0, 0, 0, 0] // インデックスをリセット
    }
  }

  get isTestMode(): boolean {
    return this._testMode.isActive
  }

  // テストモードでの手牌設定
  setTestHands() {

    if (!this._testMode.isActive || this._testMode.testData.length === 0) {
      return
    }

    for (let i = 0; i < 4; i++) {
      const testData = this._testMode.testData[i]

      if (testData && testData.tiles.length > 0) {

        // テスト用の牌データを実際のTileオブジェクトに変換
        const newTiles = testData.tiles.map((tileStr, index) => {
          return this.parseTileString(tileStr, `test_${i}_${index}`)
        }).filter(tile => tile !== null) as Tile[]

        this._players[i].tiles = newTiles
      }

      // ツモ牌リストの最初の牌を自動的にツモる（人間プレイヤーのみ）
      if (i === 0 && testData && testData.drawTiles.length > 0) {
        const firstDrawTile = this.parseTileString(testData.drawTiles[0], `test_draw_${i}_0`)
        if (firstDrawTile) {
          this._currentDrawnTile = firstDrawTile
          this._testDrawIndices[i] = 1 // 次回のツモは2番目から
        } else {
        }
      }
    }
  }

  // 牌文字列をTileオブジェクトに変換
  private parseTileString(tileStr: string, id: string): Tile | null {

    // 牌の文字列をパース（例: "1m", "2p", "3s", "ton", "nan", "sha", "pei", "haku", "hatsu", "chun"）
    if (!tileStr || tileStr.length === 0) {
      return null
    }

    let suit: 'man' | 'pin' | 'sou' | 'honor'
    let rank: number

    if (tileStr.endsWith('m')) {
      suit = 'man'
      rank = parseInt(tileStr.slice(0, -1))
    } else if (tileStr.endsWith('p')) {
      suit = 'pin'
      rank = parseInt(tileStr.slice(0, -1))
    } else if (tileStr.endsWith('s')) {
      suit = 'sou'
      rank = parseInt(tileStr.slice(0, -1))
    } else if (tileStr.endsWith('w')) {
      // 風牌：1-4w
      suit = 'honor'
      rank = parseInt(tileStr.slice(0, -1))
      if (rank < 1 || rank > 4) return null
    } else if (tileStr.endsWith('d')) {
      // 三元牌：1-3d
      suit = 'honor'
      const originalRank = parseInt(tileStr.slice(0, -1))
      rank = originalRank + 4 // 5-7に変換
      if (rank < 5 || rank > 7) {
        return null
      }
    } else {
      suit = 'honor'
      switch (tileStr) {
        case 'ton': rank = 1; break  // 東
        case 'nan': rank = 2; break  // 南
        case 'sha': rank = 3; break  // 西
        case 'pei': rank = 4; break  // 北
        case 'haku': rank = 5; break // 白
        case 'hatsu': rank = 7; break // 發
        case 'chun': rank = 6; break // 中
        default: return null
      }
    }

    if (suit !== 'honor' && (rank < 1 || rank > 9)) {
      return null
    }
    if (suit === 'honor' && (rank < 1 || rank > 7)) {
      return null
    }

    const result = { id, suit, rank, isRed: false }
    return result
  }

  // テストモードでのツモ牌制御
  private getTestDrawTile(playerIndex: number): Tile | null {
    if (!this._testMode.isActive || !this._testMode.testData[playerIndex]) return null

    const testData = this._testMode.testData[playerIndex]
    const drawIndex = this._testDrawIndices[playerIndex]

    if (drawIndex >= testData.drawTiles.length) return null

    const tileStr = testData.drawTiles[drawIndex]
    this._testDrawIndices[playerIndex]++

    return this.parseTileString(tileStr, `test_draw_${playerIndex}_${drawIndex}`)
  }

  // テストモードでのリンシャン牌制御
  private getTestKanTile(playerIndex: number): Tile | null {
    if (!this._testMode.isActive || !this._testMode.testData[playerIndex]) return null

    const testData = this._testMode.testData[playerIndex]
    const drawIndex = this._testDrawIndices[playerIndex]

    if (drawIndex >= testData.drawTiles.length) return null

    const tileStr = testData.drawTiles[drawIndex]
    // カン時もインデックスをインクリメントして、連続カン時の正しい順序を保つ
    this._testDrawIndices[playerIndex]++

    return this.parseTileString(tileStr, `test_kan_${playerIndex}_${drawIndex}`)
  }

  // 天和判定（親が配牌で上がり）
  private isTenho(playerIndex: number, isTsumo: boolean): boolean {
    const isDealer = playerIndex === this._dealer
    // 天和は配牌時点での上がりなので、誰も牌を捨てていない状態で判定
    const noDiscards = this._players.every(player => player.discards.length === 0)

    // 親 && ツモ && 誰も捨て牌がない
    return isDealer && isTsumo && noDiscards
  }

  // 地和判定（子が第一ツモで上がり）
  private isChiho(playerIndex: number, isTsumo: boolean): boolean {
    const isDealer = playerIndex === this._dealer
    // 地和は子の第一ツモでの上がりなので、自分が一枚も牌を捨てていない状態で判定
    const playerDiscardCount = this._players[playerIndex].discards.length

    // 子 && ツモ && 自分が捨て牌なし
    return !isDealer && isTsumo && playerDiscardCount === 0
  }

  // 第一ツモフラグをクリアする（ツモ時に呼ぶ）
  clearFirstTakeFlag(playerIndex: number): void {
    this._firstTakeFlags[playerIndex] = false
  }

  // ゲーム開始時に第一ツモフラグをリセット
  resetFirstTakeFlags(): void {
    this._firstTakeFlags = [true, true, true, true]
  }
}