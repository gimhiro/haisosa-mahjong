<template>
  <div class="four-player-game">

    <!-- メインゲーム画面 -->
    <div class="game-table">
      <!-- ドラ表示エリア -->
      <div class="dora-area">
        <v-card class="dora-panel">
          <v-card-title class="text-subtitle-2">ドラ表示牌</v-card-title>
          <v-card-text class="dora-content">
            <div class="dora-tiles">
              <MahjongTile
                v-for="dora in doraIndicators"
                :key="dora.id"
                :tile="dora"
                size="small"
                :is-draggable="false"
              />
            </div>
          </v-card-text>
        </v-card>
      </div>

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
        <!-- Debug: GameManager info -->
        {{ console.log('FourPlayerGameView passing gameManager:', gameManager, 'value:', gameManager.value) }}
      </div>

      <!-- アクションボタンエリア -->
      <div class="action-area">
        <v-card class="action-panel">
          <v-card-title class="text-subtitle-2">アクション</v-card-title>
          <v-card-text class="action-content">
            <!-- ツモボタン -->
            <v-btn
              v-if="canTsumo"
              color="success"
              size="small"
              block
              class="action-btn"
              @click="declareTsumo"
            >
              ツモ
            </v-btn>

            <!-- ロンボタン -->
            <v-btn
              v-if="canRon"
              color="error"
              size="small"
              block
              class="action-btn"
              @click="declareRon"
            >
              ロン
            </v-btn>

            <!-- リーチボタン -->
            <v-btn
              v-if="canDeclareRiichi && isHumanTurn && humanPlayer.tiles.length === 13 && currentDrawnTile"
              :color="riichiPreviewMode ? 'error' : 'warning'"
              size="small"
              block
              class="action-btn"
              @click="toggleRiichiPreview"
            >
              {{ riichiButtonText }}
            </v-btn>

            <!-- キャンセルボタン（ロン表示時のみ） -->
            <v-btn
              v-if="canRon"
              color="grey"
              size="small"
              block
              class="action-btn"
              @click="cancelRon"
            >
              キャンセル
            </v-btn>

            <!-- デバッグ情報 -->
            <div v-if="isHumanTurn" class="debug-info" style="font-size: 0.7rem; color: #666; margin-top: 8px;">
              デバッグ: 手牌{{ humanPlayer.tiles.length }}枚, ツモ牌: {{ currentDrawnTile ? 'あり' : 'なし' }}, リーチ可能: {{ canDeclareRiichi }}, シャンテン: {{ humanShanten }}<br>
              リーチ済み: {{ humanPlayer.riichi }}, 点数: {{ humanPlayer.score }}, ゲーム状態: {{ gamePhase }}<br>
              手牌内容: {{ humanPlayer.tiles.map(t => t.suit + t.rank).join(' ') }}{{ currentDrawnTile ? ' + ' + currentDrawnTile.suit + currentDrawnTile.rank : '' }}
            </div>

            <!-- 捨牌のヒント -->
            <div v-if="isHumanTurn && humanPlayer.tiles.length === 14 && !canTsumo && !canRon" class="discard-hint">
              不要な牌をクリックして捨ててください
            </div>
          </v-card-text>
        </v-card>
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

// リーチプレビューモード状態
const riichiPreviewMode = ref(false)

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
  console.log('canDeclareRiichi computed 実行中')
  const result = gameManager.value.canPlayerRiichi(0)
  console.log('canDeclareRiichi computed 結果:', result)
  return result
})

const canTsumo = computed(() => {
  if (!isHumanTurn.value || !currentDrawnTile.value) return false
  
  const winResult = gameManager.value.checkWinConditionForPlayer(0, currentDrawnTile.value, true)
  return winResult.isWin
})

const canRon = computed(() => {
  if (isHumanTurn.value) return false // 自分のターンではロンできない
  
  return gameManager.value.canHumanRon()
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

// リーチボタンのテキスト
const riichiButtonText = computed(() => {
  return riichiPreviewMode.value ? 'キャンセル' : 'リーチ'
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
    // 人間プレイヤーが牌を捨てた場合はそのまま次のターンに進む
    // （他の人間プレイヤーがロンすることは想定しない）
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
      // リーチ宣言
      const riichiSuccess = gameManager.value.declareRiichi(currentIndex)
      console.log(`CPU${currentIndex}: リーチ宣言 ${riichiSuccess ? '成功' : '失敗'}`)
      
      if (riichiSuccess) {
        // リーチ後は最適な捨て牌を決定する
        const tileToDiscard = ai.decideTileToDiscard(player, currentDrawnTile.value)
        console.log(`CPU${currentIndex}: リーチ後の捨て牌 ${tileToDiscard}`)
        
        if (tileToDiscard) {
          const discardSuccess = gameManager.value.discardTile(currentIndex, tileToDiscard)
          console.log('Riichi discard success:', discardSuccess)
          
          if (discardSuccess) {
            // CPUが牌を捨てた後、人間プレイヤーがロン可能かチェック
            if (gameManager.value.canHumanRon()) {
              console.log('Human player can Ron after CPU riichi!')
              return
            }
            
            console.log('Moving to next turn after riichi')
            gameManager.value.nextTurn()
          }
        }
      }
    } else if (decision.tileId) {
      // 通常の捨て牌
      console.log('Attempting to discard tile:', decision.tileId)
      const success = gameManager.value.discardTile(currentIndex, decision.tileId)
      console.log('Discard success:', success)
      if (success) {
        // CPUが牌を捨てた後、人間プレイヤーがロン可能かチェック
        if (gameManager.value.canHumanRon()) {
          console.log('Human player can Ron!')
          // ロンボタンが表示されるので、ここでは次のターンに進まない
          return
        }
        
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

// リーチプレビューモードの切り替え
function toggleRiichiPreview() {
  riichiPreviewMode.value = !riichiPreviewMode.value
}

// リーチ時に有効な牌IDのリストを取得
function getRiichiValidTiles(): string[] {
  if (!canDeclareRiichi.value || !currentDrawnTile.value) {
    return []
  }

  const player = humanPlayer.value
  const allTiles = [...player.tiles, currentDrawnTile.value]
  const validTileIds: string[] = []

  // 各牌を捨てた場合にテンパイを維持するかチェック
  for (const tile of allTiles) {
    const remainingTiles = allTiles.filter(t => t.id !== tile.id)
    const shanten = calculateShanten(remainingTiles)
    
    if (shanten === 0) { // テンパイを維持
      validTileIds.push(tile.id)
    }
  }

  return validTileIds
}

// リーチ確定と牌捨て
function confirmRiichiAndDiscard(tileId: string) {
  if (!riichiPreviewMode.value) {
    return
  }

  const validTiles = getRiichiValidTiles()
  if (!validTiles.includes(tileId)) {
    // 無効な牌をクリックした場合は何もしない
    return
  }

  // リーチを宣言
  if (canDeclareRiichi.value) {
    gameManager.value.declareRiichi(0)
  }

  // プレビューモードを解除
  riichiPreviewMode.value = false

  // 牌を捨てる
  const success = gameManager.value.discardTile(0, tileId)
  if (success) {
    gameManager.value.nextTurn()
  }
}

function declareTsumo() {
  if (canTsumo.value && currentDrawnTile.value) {
    const winResult = gameManager.value.checkWinConditionForPlayer(0, currentDrawnTile.value, true)
    
    if (winResult.isWin && winResult.result) {
      const player = humanPlayer.value
      
      winModalData.value = {
        winner: player,
        winningHand: [...player.tiles, currentDrawnTile.value],
        winningTile: currentDrawnTile.value,
        isTsumo: true,
        basePoints: winResult.result.basePoints,
        totalPoints: winResult.result.totalPoints,
        yaku: winResult.result.yaku,
        totalHan: winResult.result.totalHan,
        fu: winResult.result.fu,
        doraIndicators: doraIndicators.value,
        doraCount: winResult.result.doraCount,
        uradoraIndicators: winResult.result.uradoraCount > 0 ? [gameManager.value.wall[gameManager.value.wall.length - 1]] : [],
        uradoraCount: winResult.result.uradoraCount
      }
      
      showWinModal.value = true
    }
  }
}

function declareRon() {
  if (canRon.value && gameManager.value.lastDiscardedTile) {
    const winResult = gameManager.value.checkWinConditionForPlayer(0, gameManager.value.lastDiscardedTile, false)
    
    if (winResult.isWin && winResult.result) {
      const player = humanPlayer.value
      
      winModalData.value = {
        winner: player,
        winningHand: player.tiles,
        winningTile: gameManager.value.lastDiscardedTile,
        isTsumo: false,
        basePoints: winResult.result.basePoints,
        totalPoints: winResult.result.totalPoints,
        yaku: winResult.result.yaku,
        totalHan: winResult.result.totalHan,
        fu: winResult.result.fu,
        doraIndicators: doraIndicators.value,
        doraCount: winResult.result.doraCount,
        uradoraIndicators: winResult.result.uradoraCount > 0 ? [gameManager.value.wall[gameManager.value.wall.length - 1]] : [],
        uradoraCount: winResult.result.uradoraCount
      }
      
      showWinModal.value = true
    }
  }
}

function cancelRon() {
  // ロンをキャンセルして次のプレイヤーのターンに進む
  gameManager.value.clearLastDiscard()
  gameManager.value.nextTurn()
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
    "dora top info"
    "left center right"
    ". bottom actions";
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

.dora-area {
  grid-area: dora;
  padding: 8px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  overflow: hidden;
}

.game-info-area {
  grid-area: info;
  padding: 8px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  overflow: hidden;
}

.action-area {
  grid-area: actions;
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


.dora-panel {
  width: 100%;
  max-width: 280px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #4caf50;
  font-size: 0.85rem;
}

.dora-content {
  padding: 8px !important;
}

.game-info-panel {
  width: 100%;
  max-width: 280px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #1976d2;
  font-size: 0.85rem;
}

.action-panel {
  width: 100%;
  max-width: 280px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #ff9800;
  font-size: 0.85rem;
}

.action-content {
  padding: 8px !important;
}

.action-btn {
  margin-bottom: 8px;
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