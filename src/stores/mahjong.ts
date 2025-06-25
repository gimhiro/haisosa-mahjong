import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type Tile = {
  id: string
  suit: 'man' | 'pin' | 'sou' | 'honor'
  rank: number
  isRed?: boolean
}

export type HandState = {
  tiles: Tile[]
  discards: Tile[]
  melds: Tile[][]
  riichi: boolean
  tsumo: boolean
}

export const useMahjongStore = defineStore('mahjong', () => {
  const hand = ref<HandState>({
    tiles: [],
    discards: [],
    melds: [],
    riichi: false,
    tsumo: false
  })

  const gameState = ref<'waiting' | 'playing' | 'finished'>('waiting')
  const currentTile = ref<Tile | null>(null)
  const wall = ref<Tile[]>([])
  const score = ref(0)

  const handSize = computed(() => hand.value.tiles.length)
  const isComplete = computed(() => handSize.value === 14)

  function startNewGame() {
    gameState.value = 'playing'
    generateWall()
    dealInitialHand()
  }

  function generateWall() {
    const tiles: Tile[] = []
    let id = 0

    // 数牌 (1-9 各4枚)
    for (const suit of ['man', 'pin', 'sou'] as const) {
      for (let rank = 1; rank <= 9; rank++) {
        for (let i = 0; i < 4; i++) {
          tiles.push({
            id: `${id++}`,
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
          id: `${id++}`,
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

  function dealInitialHand() {
    hand.value.tiles = wall.value.splice(0, 13)
    hand.value.discards = []
    hand.value.melds = []
    hand.value.riichi = false
    hand.value.tsumo = false
  }

  function drawTile(): Tile | null {
    if (wall.value.length === 0) return null
    const tile = wall.value.shift()!
    currentTile.value = tile
    return tile
  }

  function addTileToHand(tile: Tile) {
    hand.value.tiles.push(tile)
    hand.value.tiles.sort((a, b) => {
      if (a.suit !== b.suit) {
        const suitOrder = { man: 0, pin: 1, sou: 2, honor: 3 }
        return suitOrder[a.suit] - suitOrder[b.suit]
      }
      return a.rank - b.rank
    })
  }

  function discardTile(tileId: string) {
    const index = hand.value.tiles.findIndex(t => t.id === tileId)
    if (index === -1) return

    const tile = hand.value.tiles.splice(index, 1)[0]
    hand.value.discards.push(tile)
    currentTile.value = null
  }

  function resetGame() {
    gameState.value = 'waiting'
    hand.value = {
      tiles: [],
      discards: [],
      melds: [],
      riichi: false,
      tsumo: false
    }
    currentTile.value = null
    wall.value = []
    score.value = 0
  }

  return {
    hand,
    gameState,
    currentTile,
    wall,
    score,
    handSize,
    isComplete,
    startNewGame,
    drawTile,
    addTileToHand,
    discardTile,
    resetGame
  }
})