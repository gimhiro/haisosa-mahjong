import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type Tile = {
  id: string
  suit: 'man' | 'pin' | 'sou' | 'honor'
  rank: number
  isRed?: boolean
  discardOrder?: number // 捨牌された順序
  isTsumoDiscard?: boolean // ツモ切りかどうか
  isRiichiDeclaration?: boolean // リーチ宣言牌かどうか
}

export type PlayerType = 'human' | 'cpu'

export type Player = {
  id: number
  name: string
  type: PlayerType
  difficulty?: 'easy' | 'medium' | 'hard' | 'super' // CPUの難易度
  tiles: Tile[]
  discards: Tile[]
  melds: Tile[][]
  riichi: boolean
  score: number
  wind: 'east' | 'south' | 'west' | 'north'
}

export type GamePhase = 'waiting' | 'dealing' | 'playing' | 'finished'

export const useFourPlayerMahjongStore = defineStore('fourPlayerMahjong', () => {
  const players = ref<Player[]>([
    { id: 0, name: 'あなた', type: 'human', tiles: [], discards: [], melds: [], riichi: false, score: 25000, wind: 'east' },
    { id: 1, name: 'CPU1', type: 'cpu', tiles: [], discards: [], melds: [], riichi: false, score: 25000, wind: 'south' },
    { id: 2, name: 'CPU2', type: 'cpu', tiles: [], discards: [], melds: [], riichi: false, score: 25000, wind: 'west' },
    { id: 3, name: 'CPU3', type: 'cpu', tiles: [], discards: [], melds: [], riichi: false, score: 25000, wind: 'north' }
  ])

  const gamePhase = ref<GamePhase>('waiting')
  const currentPlayerIndex = ref(0)
  const wall = ref<Tile[]>([])
  const doraIndicators = ref<Tile[]>([])
  const currentDrawnTile = ref<Tile | null>(null)
  const round = ref(1)
  const dealer = ref(0) // 親のプレイヤーindex
  const discardOrder = ref(0) // 捨牌の順序を管理

  const currentPlayer = computed(() => players.value[currentPlayerIndex.value])
  const humanPlayer = computed(() => players.value[0])
  const wallRemaining = computed(() => wall.value.length)

  function generateWall() {
    const tiles: Tile[] = []
    let id = 0

    // 数牌 (1-9 各4枚)
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

    // 字牌 (1-7 各4枚)
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

    // シャッフル
    for (let i = tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[tiles[i], tiles[j]] = [tiles[j], tiles[i]]
    }

    wall.value = tiles
  }

  function dealInitialHands() {
    // 各プレイヤーに13枚配る
    for (let playerIndex = 0; playerIndex < 4; playerIndex++) {
      const player = players.value[playerIndex]
      
      for (let i = 0; i < 13; i++) {
        if (wall.value.length > 0) {
          const tile = wall.value.shift()!
          player.tiles.push(tile)
        }
      }
    }

    // ドラ表示牌を設定
    if (wall.value.length > 0) {
      doraIndicators.value = [wall.value.pop()!]
    }

    // 手牌をソート
    players.value.forEach(player => {
      sortPlayerHand(player)
    })
  }

  function sortPlayerHand(player: Player) {
    player.tiles.sort((a, b) => {
      if (a.suit !== b.suit) {
        const suitOrder = { man: 0, pin: 1, sou: 2, honor: 3 }
        return suitOrder[a.suit] - suitOrder[b.suit]
      }
      return a.rank - b.rank
    })
  }

  function drawTileForPlayer(playerIndex: number): Tile | null {
    if (wall.value.length === 0) return null
    
    const player = players.value[playerIndex]
    
    // プレイヤーの手牌が13枚でない場合は引けない
    if (player.tiles.length !== 13) return null
    
    const tile = wall.value.shift()!
    player.tiles.push(tile)
    sortPlayerHand(player)
    
    return tile
  }

  // 新しい: ツモ牌を分離して管理する関数
  function drawTileAndKeepSeparate(playerIndex: number): Tile | null {
    if (wall.value.length === 0) return null
    
    const player = players.value[playerIndex]
    
    // プレイヤーの手牌が13枚でない場合は引けない
    if (player.tiles.length !== 13) return null
    
    const tile = wall.value.shift()!
    // 手牌には追加せず、currentDrawnTileに設定
    currentDrawnTile.value = tile
    
    return tile
  }

  function discardTile(playerIndex: number, tileId: string): boolean {
    const player = players.value[playerIndex]
    
    // ツモ牌から捨てる場合
    if (currentDrawnTile.value && currentDrawnTile.value.id === tileId) {
      const tile = currentDrawnTile.value
      tile.discardOrder = discardOrder.value++
      player.discards.push(tile)
      currentDrawnTile.value = null
      return true
    }
    
    // 手牌から捨てる場合（手牌は13枚のまま）
    const tileIndex = player.tiles.findIndex(t => t.id === tileId)
    if (tileIndex === -1) return false

    const tile = player.tiles.splice(tileIndex, 1)[0]
    // 捨牌順序を設定
    tile.discardOrder = discardOrder.value++
    player.discards.push(tile)
    
    // ツモ牌を手牌に追加
    if (currentDrawnTile.value) {
      player.tiles.push(currentDrawnTile.value)
      sortPlayerHand(player)
      currentDrawnTile.value = null
    }
    
    return true
  }

  // 旧API互換のため残す
  function drawTile(playerIndex: number): Tile | null {
    return drawTileForPlayer(playerIndex)
  }

  function addTileToHand(playerIndex: number, tile: Tile) {
    const player = players.value[playerIndex]
    player.tiles.push(tile)
    sortPlayerHand(player)
  }

  function nextTurn() {
    currentPlayerIndex.value = (currentPlayerIndex.value + 1) % 4
  }

  function startNewGame() {
    // プレイヤー初期化
    players.value.forEach(player => {
      player.tiles = []
      player.discards = []
      player.melds = []
      player.riichi = false
    })

    gamePhase.value = 'dealing'
    currentPlayerIndex.value = dealer.value // 親から開始
    currentDrawnTile.value = null
    
    generateWall()
    dealInitialHands()
    
    gamePhase.value = 'playing'
  }

  function resetGame() {
    gamePhase.value = 'waiting'
    currentPlayerIndex.value = 0
    currentDrawnTile.value = null
    wall.value = []
    doraIndicators.value = []
    round.value = 1
    dealer.value = 0
    discardOrder.value = 0
    
    players.value.forEach(player => {
      player.tiles = []
      player.discards = []
      player.melds = []
      player.riichi = false
      player.score = 25000
    })
  }

  function getPlayerPosition(playerIndex: number): 'bottom' | 'right' | 'top' | 'left' {
    // プレイヤー0を基準とした相対位置
    const positions = ['bottom', 'right', 'top', 'left'] as const
    return positions[playerIndex]
  }

  return {
    players,
    gamePhase,
    currentPlayerIndex,
    wall,
    doraIndicators,
    currentDrawnTile,
    round,
    dealer,
    discardOrder,
    currentPlayer,
    humanPlayer,
    wallRemaining,
    generateWall,
    dealInitialHands,
    drawTile,
    drawTileForPlayer,
    drawTileAndKeepSeparate,
    addTileToHand,
    discardTile,
    nextTurn,
    startNewGame,
    resetGame,
    getPlayerPosition,
    sortPlayerHand
  }
})