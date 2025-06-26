<template>
  <div class="four-player-game">

    <!-- メインゲーム画面 -->
    <div class="game-table">
      <!-- 上側プレイヤー（プレイヤー2） -->
      <div class="player-area player-top">
        <PlayerArea
          :player="players[2]"
          :is-current="currentPlayerIndex === 2"
          :position="'top'"
          :show-tiles="cpuTilesVisible[2]"
          :drawn-tile="currentPlayerIndex === 2 ? currentDrawnTile : null"
          :game-manager="gameManager"
          :cpu-tiles-visible="cpuTilesVisible[2]"
          @toggle-cpu-tiles="toggleCpuTiles(2)"
        />
      </div>

      <!-- 左側プレイヤー（プレイヤー3） -->
      <div class="player-area player-left">
        <PlayerArea
          :player="players[3]"
          :is-current="currentPlayerIndex === 3"
          :position="'left'"
          :show-tiles="cpuTilesVisible[3]"
          :drawn-tile="currentPlayerIndex === 3 ? currentDrawnTile : null"
          :game-manager="gameManager"
          :cpu-tiles-visible="cpuTilesVisible[3]"
          @toggle-cpu-tiles="toggleCpuTiles(3)"
        />
      </div>

      <!-- 中央エリア（河・ドラ表示） -->
      <div class="center-area">
        <!-- 捨牌エリア -->
        <div class="discards-area">
          <div class="central-square">
            <!-- 各プレイヤーの捨牌エリア -->
            <div class="discard-area-bottom">
              <PlayerDiscardArea
                :player-index="0"
                :get-player-discard-row="getPlayerDiscardRow"
                :game-manager="gameManager"
              />
            </div>
            
            <div class="discard-area-right">
              <PlayerDiscardArea
                :player-index="1"
                :get-player-discard-row="getPlayerDiscardRow"
                :game-manager="gameManager"
              />
            </div>
            
            <div class="discard-area-top">
              <PlayerDiscardArea
                :player-index="2"
                :get-player-discard-row="getPlayerDiscardRow"
                :game-manager="gameManager"
              />
            </div>
            
            <div class="discard-area-left">
              <PlayerDiscardArea
                :player-index="3"
                :get-player-discard-row="getPlayerDiscardRow"
                :game-manager="gameManager"
              />
            </div>

            <!-- 中央エリア（ドラ表示など） -->
            <div class="center-info">
              <div class="center-label">河</div>
            </div>
          </div>
        </div>



        <!-- プレイヤーアクション（人間プレイヤーのみ） -->
        <div v-if="isHumanTurn && gamePhase === 'playing'" class="human-actions">
          <v-btn
            v-if="canDeclareRiichi && humanPlayer.tiles.length === 14"
            color="warning"
            size="small"
            @click="declareRiichi"
          >
            リーチ
          </v-btn>
          
          <div v-if="humanPlayer.tiles.length === 14" class="discard-hint">
            不要な牌をクリックして捨ててください
          </div>
        </div>
      </div>

      <!-- ゲーム情報エリア -->
      <div class="game-info-area">
        <v-card class="game-info-panel">
          <v-card-title class="text-subtitle-2">ゲーム情報</v-card-title>
          <v-card-text class="text-caption">
            <div class="info-row">
              <span class="info-label">局:</span>
              <span class="info-value">{{ round }}局 {{ getDealerText() }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">残り牌:</span>
              <span class="info-value">{{ wallRemaining }}枚</span>
            </div>
            <div class="info-row">
              <span class="info-label">状態:</span>
              <v-chip :color="gamePhaseColor" size="x-small">
                {{ gamePhaseText }}
              </v-chip>
            </div>
            <div class="info-row">
              <span class="info-label">現在:</span>
              <span class="info-value">{{ currentPlayer.name }}</span>
              <span class="info-value">{{ isHumanTurn ? '(あなたのターン)' : '(CPUのターン)' }}</span>
            </div>
            <div class="info-row dora-row">
              <span class="info-label">ドラ:</span>
              <div class="dora-tiles">
                <MahjongTile
                  v-for="dora in doraIndicators"
                  :key="dora.id"
                  :tile="dora"
                  size="small"
                  :is-draggable="false"
                />
              </div>
            </div>
            <div class="game-controls">
              <v-btn
                v-if="gamePhase === 'waiting'"
                color="success"
                size="small"
                block
                @click="startGame"
              >
                ゲーム開始
              </v-btn>
              <v-btn
                v-else
                color="error"
                size="small"
                block
                @click="resetGame"
              >
                リセット
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </div>

      <!-- 右側プレイヤー（プレイヤー1） -->
      <div class="player-area player-right">
        <PlayerArea
          :player="players[1]"
          :is-current="currentPlayerIndex === 1"
          :position="'right'"
          :show-tiles="cpuTilesVisible[1]"
          :drawn-tile="currentPlayerIndex === 1 ? currentDrawnTile : null"
          :game-manager="gameManager"
          :cpu-tiles-visible="cpuTilesVisible[1]"
          @toggle-cpu-tiles="toggleCpuTiles(1)"
        />
      </div>

      <!-- 下側プレイヤー（人間プレイヤー） -->
      <div class="player-area player-bottom">
        <PlayerArea
          :player="humanPlayer"
          :is-current="currentPlayerIndex === 0"
          :position="'bottom'"
          :show-tiles="true"
          :drawn-tile="currentPlayerIndex === 0 ? currentDrawnTile : null"
          :shanten-info="{ text: shantenText, color: shantenColor }"
          :game-manager="gameManager"
          @tile-discarded="onHumanTileDiscard"
        />
      </div>
    </div>

    <!-- 勝利モーダル -->
    <WinModal
      v-model="showWinModal"
      :win-data="winModalData"
      @continue="onContinueGame"
      @new-game="onNewGame"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { GameManager } from '../utils/game-manager'
import { cpuAIs } from '../utils/cpu-ai'
import { calculateShanten, canRiichi, checkWinCondition } from '../utils/mahjong-logic'
import { defaultEnhancedDraw } from '../utils/enhanced-draw'
import PlayerArea from '../components/PlayerArea.vue'
import PlayerDiscardArea from '../components/PlayerDiscardArea.vue'
import MahjongTile from '../components/MahjongTile.vue'
import WinModal, { type WinData } from '../components/WinModal.vue'

const gameManager = ref(new GameManager())

// CPU手牌表示状態
const cpuTilesVisible = ref({
  1: false, // CPU1 (右)
  2: false, // CPU2 (上)
  3: false  // CPU3 (左)
})

// Win modal state
const showWinModal = ref(false)
const winModalData = ref<WinData>({
  winner: gameManager.value.players[0],
  winningHand: [],
  winningTile: null,
  isTsumo: false,
  basePoints: 0,
  totalPoints: 0,
  yaku: [],
  totalHan: 0,
  fu: 0,
  doraIndicators: [],
  doraCount: 0,
  uradoraIndicators: [],
  uradoraCount: 0
})

// GameManagerからプロパティを参照
const players = computed(() => gameManager.value.players)
const gamePhase = computed(() => gameManager.value.gamePhase)
const currentPlayerIndex = computed(() => gameManager.value.currentPlayerIndex)
const currentDrawnTile = computed(() => gameManager.value.currentDrawnTile)
const doraIndicators = computed(() => gameManager.value.doraIndicators)
const round = computed(() => gameManager.value.round)
const dealer = computed(() => gameManager.value.dealer)
const currentPlayer = computed(() => gameManager.value.currentPlayer)
const humanPlayer = computed(() => gameManager.value.humanPlayer)
const wallRemaining = computed(() => gameManager.value.wallRemaining)

const gamePhaseColor = computed(() => {
  switch (gamePhase.value) {
    case 'waiting': return 'grey'
    case 'dealing': return 'info'
    case 'playing': return 'success'
    case 'finished': return 'primary'
    default: return 'grey'
  }
})

const gamePhaseText = computed(() => {
  switch (gamePhase.value) {
    case 'waiting': return '待機中'
    case 'dealing': return '配牌中'
    case 'playing': return 'プレイ中'
    case 'finished': return '終了'
    default: return '不明'
  }
})

const isHumanTurn = computed(() => {
  return gameManager.value.isHumanTurn()
})

const canDraw = computed(() => {
  return gameManager.value.canHumanDraw()
})

const canDeclareRiichi = computed(() => {
  return gameManager.value.canPlayerRiichi(0)
})

// シャンテン数計算
const humanShanten = computed(() => {
  const player = humanPlayer.value
  const allTiles = currentDrawnTile.value 
    ? [...player.tiles, currentDrawnTile.value]
    : player.tiles
  
  if (allTiles.length !== 13 && allTiles.length !== 14) {
    return 8
  }
    
  return calculateShanten(allTiles)
})

const shantenColor = computed(() => {
  if (humanShanten.value === -1) return 'success' // アガリ
  if (humanShanten.value === 0) return 'warning'  // テンパイ
  if (humanShanten.value <= 2) return 'info'     // 良形
  if (humanShanten.value >= 8) return 'grey-lighten-2' // 計算不可
  return 'grey'                              // 遠い
})

const shantenText = computed(() => {
  if (humanShanten.value === -1) return 'アガリ'
  if (humanShanten.value === 0) return 'テンパイ'
  if (humanShanten.value >= 8) return '計算不可'
  return `${humanShanten.value}シャンテン`
})


function getDealerText(): string {
  return gameManager.value.getDealerText()
}

function startGame() {
  gameManager.value.startNewGame()
}

function resetGame() {
  gameManager.value.resetGame()
}

// ツモボタンを削除したため、自動ツモ機能は削除
// 人間プレイヤーのターンが開始されたときに自動的にツモする

// 山の中から有効牌を探す関数
function findUsefulTileInWall(hand: any[]): any | null {
  const currentShanten = calculateShanten(hand)
  
  for (const tile of gameManager.value.wall) {
    const testHand = [...hand, tile]
    const newShanten = calculateShanten(testHand)
    
    if (newShanten < currentShanten) {
      return tile // 有効牌発見
    }
  }
  
  return null // 有効牌がない
}

async function onHumanTileDiscard(tileId: string) {
  console.log('onHumanTileDiscard called with tileId:', tileId)
  console.log('isHumanTurn:', isHumanTurn.value)
  console.log('currentPlayerIndex:', currentPlayerIndex.value)
  console.log('gamePhase:', gamePhase.value)
  console.log('humanPlayer tiles length:', humanPlayer.value.tiles.length)
  console.log('currentDrawnTile:', currentDrawnTile.value)
  
  if (!isHumanTurn.value) {
    console.log('Not human turn, aborting discard')
    return
  }
  
  const success = gameManager.value.discardTile(0, tileId)
  console.log('Discard success:', success)
  
  if (success) {
    gameManager.value.nextTurn()
  } else {
    console.log('Could not discard tile')
  }
}

async function processCpuTurn() {
  console.log('processCpuTurn called:', {
    gamePhase: gamePhase.value,
    currentPlayerIndex: currentPlayerIndex.value,
    currentPlayerType: currentPlayer.value.type,
    currentDrawnTile: currentDrawnTile.value
  })
  
  if (gamePhase.value !== 'playing' || currentPlayer.value.type === 'human') {
    console.log('Aborting CPU turn:', { gamePhase: gamePhase.value, playerType: currentPlayer.value.type })
    return
  }
  
  const currentIndex = currentPlayerIndex.value
  const player = currentPlayer.value
  
  console.log('CPU processing turn, currentDrawnTile:', currentDrawnTile.value)
  
  if (currentDrawnTile.value && checkWinConditionForPlayer(currentIndex, currentDrawnTile.value, true)) {
    return
  }
  
  const ai = cpuAIs[currentIndex as 1 | 2 | 3]
  console.log('CPU AI found:', !!ai, 'for player index:', currentIndex)
  
  if (ai) {
    const allTiles = currentDrawnTile.value ? [...player.tiles, currentDrawnTile.value] : player.tiles
    console.log('Making AI decision with tiles:', allTiles.length, 'drawn tile:', currentDrawnTile.value)
    
    const decision = await ai.makeDecision({ ...player, tiles: allTiles }, currentDrawnTile.value)
    console.log('AI decision:', decision)
    
    if (decision.action === 'riichi') {
      gameManager.value.declareRiichi(currentIndex)
    }
    
    if (decision.tileId) {
      console.log('Attempting to discard tile:', decision.tileId)
      const success = gameManager.value.discardTile(currentIndex, decision.tileId)
      console.log('Discard success:', success)
      if (success) {
        console.log('Moving to next turn')
        gameManager.value.nextTurn()
      }
    } else {
      console.log('No tile to discard from AI decision')
    }
  } else {
    console.log('No AI found for player', currentIndex)
  }
}

function declareRiichi() {
  if (canDeclareRiichi.value) {
    gameManager.value.declareRiichi(0)
  }
}

function checkWinConditionForPlayer(playerIndex: number, winTile: any, isTsumo: boolean): boolean {
  const result = gameManager.value.checkWinConditionForPlayer(playerIndex, winTile, isTsumo)
  
  if (result.isWin && result.result) {
    const player = players.value[playerIndex]
    const winResult = result.result
    
    winModalData.value = {
      winner: player,
      winningHand: player.tiles,
      winningTile: winTile,
      isTsumo,
      basePoints: winResult.basePoints,
      totalPoints: winResult.totalPoints,
      yaku: winResult.yaku,
      totalHan: winResult.totalHan,
      fu: winResult.fu,
      doraIndicators: doraIndicators.value,
      doraCount: winResult.doraCount,
      uradoraIndicators: winResult.uradoraCount > 0 ? [gameManager.value.wall[gameManager.value.wall.length - 1]] : [],
      uradoraCount: winResult.uradoraCount
    }
    
    showWinModal.value = true
    return true
  }
  
  return false
}

function onContinueGame() {
  showWinModal.value = false
  gameManager.value.startNewGame()
}

function onNewGame() {
  showWinModal.value = false
  gameManager.value.resetGame()
}

function getPlayerDiscardRow(playerIndex: number, rowIndex: number): any[] {
  return gameManager.value.getPlayerDiscardRow(playerIndex, rowIndex)
}

function getPlayerPosition(playerIndex: number): string {
  return gameManager.value.getPlayerPosition(playerIndex)
}

function toggleCpuTiles(playerIndex: number) {
  if (playerIndex >= 1 && playerIndex <= 3) {
    cpuTilesVisible.value[playerIndex as 1 | 2 | 3] = !cpuTilesVisible.value[playerIndex as 1 | 2 | 3]
  }
}

onMounted(() => {
  console.log('Component mounted, gamePhase:', gamePhase.value)
  if (gamePhase.value === 'waiting') {
    console.log('Starting new game...')
    gameManager.value.startNewGame()
    console.log('Game started, currentPlayerIndex:', currentPlayerIndex.value, 'dealer:', dealer.value)
    
    setTimeout(() => {
      if (gameManager.value.gamePhase === 'playing') {
        const firstTile = gameManager.value.drawTileAndKeepSeparate(currentPlayerIndex.value)
        console.log('Drew first tile for player', currentPlayerIndex.value, ':', firstTile)
      }
    }, 100)
  }
})

watch(() => currentPlayerIndex.value, (newIndex, oldIndex) => {
  console.log('Turn changed from', oldIndex, 'to', newIndex)
  console.log('New player type:', players.value[newIndex]?.type)
  console.log('Game phase:', gamePhase.value)
  
  if (gamePhase.value === 'playing') {
    // 人間プレイヤーの場合は80%確率で有効牌を引く
    if (players.value[newIndex].type === 'human') {
      const player = players.value[newIndex]
      if (player.tiles.length === 13) {
        // 80%の確率で有効牌を引く
        if (Math.random() < 0.8) {
          const usefulTile = findUsefulTileInWall(player.tiles)
          if (usefulTile) {
            const tileIndex = gameManager.value.wall.findIndex(t => t.id === usefulTile.id)
            if (tileIndex !== -1) {
              gameManager.value.wall.splice(tileIndex, 1)
              gameManager.value.currentDrawnTile = usefulTile
              checkWinConditionForPlayer(newIndex, usefulTile, true)
              return
            }
          }
        }
      }
    }
    
    const drawnTile = gameManager.value.drawTileAndKeepSeparate(newIndex)
    console.log('Drew tile for player', newIndex, ':', drawnTile)
    
    if (players.value[newIndex].type === 'cpu') {
      console.log('Starting CPU turn for player', newIndex)
      setTimeout(() => {
        processCpuTurn()
      }, 500)
    } else if (players.value[newIndex].type === 'human') {
      console.log('Human player turn started, drawn tile:', drawnTile)
      if (drawnTile) {
        checkWinConditionForPlayer(newIndex, drawnTile, true)
      }
    }
  }
})
</script>

<style scoped>
.four-player-game {
  width: 100%;
  height: calc(100vh - 64px);
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #e8f5e8 0%, #f0f8ff 100%);
  position: relative;
}

.game-table {
  flex: 1;
  position: relative;
  display: grid;
  grid-template-areas: 
    ". top info"
    "left center right"
    ". bottom .";
  grid-template-rows: 20% 60% 20%;
  grid-template-columns: 20% 60% 20%;
  gap: 4px;
  padding: 4px;
  height: 100%;
  width: 100%;
  max-height: 100%;
}

.player-top {
  grid-area: top;
}

.player-left {
  grid-area: left;
}

.player-right {
  grid-area: right;
}

.player-bottom {
  grid-area: bottom;
}

.game-info-area {
  grid-area: info;
  padding: 8px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  overflow: hidden;
}

.center-area {
  grid-area: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px;
  position: relative;
}

.discards-area {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.central-square {
  position: relative;
  width: min(240px, 36vh, 36vw);
  height: min(240px, 36vh, 36vw);
  background: rgba(255, 255, 255, 0.1);
  border: 2px dashed rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  aspect-ratio: 1;
}



.center-info {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.center-label {
  font-size: 1.5rem;
  font-weight: bold;
  color: rgba(0, 0, 0, 0.3);
}

/* 捨牌エリアの配置 */
.discard-area-bottom {
  position: absolute;
  bottom: -10%;
  left: 0%;
  transform: translate(-50%, 50%);
}

.discard-area-right {
  position: absolute;
  right: -10%;
  top: 100%;
  transform: translate(50%, -50%) rotate(270deg);
}

.discard-area-top {
  position: absolute;
  top: -10%;
  left: 100%;
  transform: translate(-50%, -50%) rotate(180deg);
}

.discard-area-left {
  position: absolute;
  left: -10%;
  top: 0%;
  transform: translate(-50%, -50%) rotate(90deg);
}


.turn-info {
  margin: 8px 0;
}

.human-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.discard-hint {
  font-size: 0.8rem;
  color: #666;
  text-align: center;
  font-style: italic;
}


.game-info-panel {
  width: 100%;
  max-width: 280px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #1976d2;
  font-size: 0.85rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 4px 0;
}

.info-label {
  font-weight: bold;
  color: #666;
}

.info-value {
  color: #333;
}

.game-controls {
  margin-top: 12px;
}

.dora-row {
  flex-direction: column !important;
  align-items: flex-start !important;
}

.dora-tiles {
  display: flex;
  gap: 2px;
  margin-top: 4px;
  flex-wrap: wrap;
}


/* レスポンシブ対応 */
@media (max-width: 1024px) {
  .game-table {
    grid-template-rows: 20% 60% 20%;
    grid-template-columns: 20% 60% 20%;
    gap: 2px;
    padding: 2px;
  }
  
  .game-info-panel {
    max-width: 200px;
    font-size: 0.75rem;
  }
  
  .central-square {
    width: min(210px, 30vh, 30vw);
    height: min(210px, 30vh, 30vw);
  }
  
  .discard-area-bottom,
  .discard-area-top {
    bottom: -25px;
    top: -25px;
  }
  
  .discard-area-left,
  .discard-area-right {
    left: -25px;
    right: -25px;
  }
}

@media (max-width: 768px) {
  .game-table {
    grid-template-rows: 20% 60% 20%;
    grid-template-columns: 20% 60% 20%;
  }
  
  .center-area {
    padding: 2px;
    gap: 2px;
  }
  
  .central-square {
    width: min(168px, 24vh, 42vw);
    height: min(168px, 24vh, 42vw);
  }
  
  .discard-area-bottom,
  .discard-area-top {
    bottom: -20px;
    top: -20px;
  }
  
  .discard-area-left,
  .discard-area-right {
    left: -20px;
    right: -20px;
  }
  
  .game-info-panel {
    max-width: 160px;
    font-size: 0.7rem;
  }
}

@media (max-width: 480px) {
  .game-table {
    grid-template-rows: 40px 1fr 55px;
    grid-template-columns: 50px 1fr 50px;
  }
  
  .central-square {
    width: min(120px, 18vh);
    height: min(120px, 18vh);
  }
  
  .game-info-panel {
    max-width: 120px;
    font-size: 0.65rem;
  }
}
</style>