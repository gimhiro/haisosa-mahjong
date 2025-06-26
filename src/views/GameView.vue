<template>
  <div class="game-view">
    <v-container fluid>
      <!-- ゲームヘッダー -->
      <v-row class="game-header">
        <v-col cols="12">
          <v-card class="game-status-card">
            <v-card-text>
              <div class="game-status">
                <div class="status-item">
                  <span class="status-label">ゲーム状態:</span>
                  <v-chip :color="gameStatusColor" size="small">
                    {{ gameStatusText }}
                  </v-chip>
                </div>
                <div class="status-item">
                  <span class="status-label">残り牌:</span>
                  <span class="status-value">{{ remainingTiles }}枚</span>
                </div>
                <div class="status-item">
                  <span class="status-label">得点:</span>
                  <span class="status-value">{{ score }}点</span>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- ゲームコントロール -->
      <v-row class="game-controls">
        <v-col cols="12" class="text-center">
          <v-btn
            v-if="gameState === 'waiting'"
            color="primary"
            size="large"
            @click="startGame"
          >
            ゲーム開始
          </v-btn>
          
          <div v-else-if="gameState === 'playing'" class="playing-controls">
            <v-btn
              color="success"
              :disabled="!canDraw"
              @click="drawTile"
            >
              ツモ
            </v-btn>
            
            <v-btn
              color="warning"
              :disabled="!canRiichiComputed"
              @click="declareRiichi"
            >
              リーチ
            </v-btn>
            
            <v-btn
              color="error"
              @click="resetGame"
            >
              リセット
            </v-btn>
          </div>
          
          <v-btn
            v-else-if="gameState === 'finished'"
            color="primary"
            @click="startGame"
          >
            新ゲーム
          </v-btn>
        </v-col>
      </v-row>

      <!-- 手牌エリア -->
      <v-row class="hand-area">
        <v-col cols="12">
          <v-card class="hand-card">
            <v-card-title>手牌</v-card-title>
            <v-card-text>
              <MahjongHand
                :tiles="hand.tiles"
                :drawn-tile="currentTile"
                :is-draggable="gameState === 'playing'"
                @tile-discarded="onTileDiscarded"
                @tile-selected="onTileSelected"
                @tiles-changed="onHandChanged"
              />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- 捨牌エリア -->
      <v-row class="discard-area">
        <v-col cols="12">
          <v-card class="discard-card">
            <v-card-title>捨牌</v-card-title>
            <v-card-text>
              <div class="discards-container">
                <MahjongTile
                  v-for="tile in hand.discards"
                  :key="tile.id"
                  :tile="tile"
                  :is-draggable="false"
                  :is-discarded="true"
                  size="small"
                />
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- デバッグ情報 (開発時のみ) -->
      <v-row v-if="showDebugInfo" class="debug-area">
        <v-col cols="12">
          <v-card class="debug-card">
            <v-card-title>デバッグ情報</v-card-title>
            <v-card-text>
              <div class="debug-info">
                <p>Enhanced Draw Stats:</p>
                <ul>
                  <li>Total Draws: {{ drawStats.totalDraws }}</li>
                  <li>Useful Draws: {{ drawStats.usefulDraws }}</li>
                  <li>Useful Rate: {{ (drawStats.usefulRate * 100).toFixed(1) }}%</li>
                </ul>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useMahjongStore, type Tile } from '../stores/mahjong'
import { calculateShanten, canRiichi as canRiichiLogic, isWinningHand } from '../utils/mahjong-logic'
import { EnhancedDraw } from '../utils/enhanced-draw'
import MahjongHand from '../components/MahjongHand.vue'
import MahjongTile from '../components/MahjongTile.vue'

const mahjongStore = useMahjongStore()
const enhancedDraw = new EnhancedDraw({ boostProbability: 0.8, enableDebugLog: true })

const showDebugInfo = ref(true)
const drawHistory = ref<{ tile: Tile, wasUseful: boolean }[]>([])

const { 
  hand, 
  gameState, 
  currentTile, 
  wall, 
  score,
  startNewGame,
  addTileToHand,
  discardTile,
  resetGame: storeReset
} = mahjongStore

const gameStatusColor = computed(() => {
  switch (gameState) {
    case 'waiting': return 'grey'
    case 'playing': return 'success'
    case 'finished': return 'primary'
    default: return 'grey'
  }
})

const gameStatusText = computed(() => {
  switch (gameState) {
    case 'waiting': return '待機中'
    case 'playing': return 'プレイ中'
    case 'finished': return '終了'
    default: return '不明'
  }
})

const remainingTiles = computed(() => wall.length)

const canDraw = computed(() => {
  return gameState === 'playing' && 
         remainingTiles.value > 0 && 
         !currentTile
})

const canRiichiComputed = computed(() => {
  return gameState === 'playing' && 
         !hand.riichi &&
         canRiichiLogic(hand.tiles, hand.discards)
})

const drawStats = computed(() => {
  return enhancedDraw.getStats(drawHistory.value)
})

function startGame() {
  startNewGame()
  drawHistory.value = []
  enhancedDraw.reseed()
}

function drawTile() {
  if (!canDraw.value) return

  const drawnTile = enhancedDraw.drawEnhancedTile(hand.tiles, wall)
  
  if (drawnTile) {
    const tileIndex = wall.findIndex((t: Tile) => t.id === drawnTile.id)
    if (tileIndex !== -1) {
      wall.splice(tileIndex, 1)
    }
    
    const wasUseful = calculateShanten([...hand.tiles, drawnTile]) < 
                     calculateShanten(hand.tiles)
    drawHistory.value.push({ tile: drawnTile, wasUseful })
    
    addTileToHand(drawnTile)
    
    if (isWinningHand([...hand.tiles])) {
      mahjongStore.gameState = 'finished'
      hand.tsumo = true
    }
  }
}

function onTileDiscarded(tile: Tile) {
  discardTile(tile.id)
  
  if (remainingTiles.value === 0) {
    mahjongStore.gameState = 'finished'
  }
}

function onTileSelected(tile: Tile) {
  console.log('Tile selected:', tile)
}

function onHandChanged(newTiles: Tile[]) {
  hand.tiles = newTiles
}

function declareRiichi() {
  if (canRiichiComputed.value) {
    hand.riichi = true
  }
}

function resetGame() {
  storeReset()
  drawHistory.value = []
  enhancedDraw.reseed()
}

onMounted(() => {
  // 初期化処理があれば実行
})
</script>

<style scoped>
.game-view {
  width: 100vw;
  min-height: 100vh;
  margin: 0;
  padding: 1rem 0;
  background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
}

.game-header {
  margin-bottom: 16px;
}

.game-status-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
}

.game-status {
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-label {
  font-weight: 500;
  color: #666;
}

.status-value {
  font-weight: bold;
  color: #333;
}

.game-controls {
  margin-bottom: 24px;
}

.playing-controls {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.hand-card, .discard-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(5px);
}

.hand-card {
  border: 2px solid #1976d2;
}

.discards-container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: center;
  min-height: 60px;
  padding: 8px;
  border: 1px dashed #ccc;
  border-radius: 4px;
}

.debug-card {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #ff9800;
}

.debug-info {
  font-family: monospace;
  font-size: 12px;
}

.debug-info ul {
  margin: 8px 0;
  padding-left: 20px;
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .game-status {
    flex-direction: column;
    gap: 8px;
  }
  
  .status-item {
    justify-content: center;
  }
  
  .playing-controls {
    flex-direction: column;
    align-items: center;
  }
}
</style>