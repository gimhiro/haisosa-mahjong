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
            
            <!-- プレイヤー点数表示 -->
            <!-- 下側プレイヤー（人間）の点数 -->
            <div class="score-bottom">
              {{ players[0].score.toLocaleString() }}点
            </div>
            
            <!-- 右側プレイヤーの点数 -->
            <div class="score-right">
              {{ players[1].score.toLocaleString() }}点
            </div>
            
            <!-- 上側プレイヤーの点数 -->
            <div class="score-top">
              {{ players[2].score.toLocaleString() }}点
            </div>
            
            <!-- 左側プレイヤーの点数 -->
            <div class="score-left">
              {{ players[3].score.toLocaleString() }}点
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
              <span class="info-value">{{ getDealerText() }}</span>
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
              <!-- <span class="info-value">{{ isHumanTurn ? '(あなたのターン)' : '(CPUのターン)' }}</span> -->
            </div>
            <div class="info-row">
              <span class="info-label">供託:</span>
              <span class="info-value">{{ gameManager.kyotaku }}本</span>
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
          :is-riichi-preview-mode="riichiPreviewMode && !humanPlayer.riichi"
          :riichi-disabled-tiles="humanPlayer.riichi ? getPostRiichiDisabledTiles() : getRiichiDisabledTiles()"
          @tile-discarded="onHumanTileDiscard"
          @riichi-confirmed="confirmRiichiAndDiscard"
        />
        <!-- Debug: GameManager info -->
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
              v-if="canDeclareRiichi && isHumanTurn && humanPlayer.tiles.length === 13 && currentDrawnTile && !humanPlayer.riichi"
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
              <span v-if="humanPlayer.riichi && currentDrawnTile">
                リーチ中：ツモ牌のみ捨てることができます
              </span>
              <span v-else>
                不要な牌をクリックして捨ててください
              </span>
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

// CPU処理中フラグ
const processingCpuTurn = ref(false)

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
  const result = gameManager.value.canPlayerRiichi(0)
  return result
})

const canTsumo = computed(() => {
  const isMyTurn = isHumanTurn.value
  const drawnTile = currentDrawnTile.value
  
  if (!isMyTurn || !drawnTile) {
    return false
  }
  
  const winResult = gameManager.value.checkWinConditionForPlayer(0, drawnTile, true)
  return winResult.isWin
})

const canRon = computed(() => {
  const isMyTurn = isHumanTurn.value
  const canHumanRonResult = gameManager.value.canHumanRon()
  
  if (isMyTurn) return false // 自分のターンではロンできない
  
  return canHumanRonResult
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
  
  // ゲーム開始後、最初のプレイヤーにツモ牌を配る
  setTimeout(() => {
    if (gameManager.value.gamePhase === 'playing') {
      const firstTile = gameManager.value.drawTileAndKeepSeparate(currentPlayerIndex.value)
      
      // CPUプレイヤーの場合は自動的にターンを開始
      if (players.value[currentPlayerIndex.value].type === 'cpu') {
        setTimeout(() => {
          processCpuTurn()
        }, 500)
      }
    }
  }, 100)
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
  console.log('onHumanTileDiscard called with tileId:', tileId, 'riichi:', humanPlayer.value.riichi, 'currentDrawnTile:', currentDrawnTile.value?.id)
  
  if (!isHumanTurn.value) {
    console.log('Not human turn, aborting')
    return
  }
  
  const success = gameManager.value.discardTile(0, tileId)
  console.log('Normal discard success:', success)
  
  if (success) {
    // 人間プレイヤーが牌を捨てた場合はそのまま次のターンに進む
    // （他の人間プレイヤーがロンすることは想定しない）
    gameManager.value.nextTurn()
  } else {
    console.log('Could not discard tile')
  }
}

async function processCpuTurn() {
  console.log('processCpuTurn called - gamePhase:', gamePhase.value, 'currentPlayer type:', currentPlayer.value?.type, 'currentIndex:', currentPlayerIndex.value, 'processing:', processingCpuTurn.value)
  
  // 重複処理を防ぐ
  if (processingCpuTurn.value) {
    console.log('CPU turn already processing, aborting')
    return
  }
  
  if (gamePhase.value !== 'playing' || currentPlayer.value.type === 'human') {
    console.log('Aborting processCpuTurn - invalid conditions')
    return
  }
  
  processingCpuTurn.value = true
  console.log('Set processing flag to true')
  
  try {
    const currentIndex = currentPlayerIndex.value
    const player = currentPlayer.value
    
    console.log('CPU turn for player:', currentIndex, 'tiles count:', player.tiles.length, 'drawnTile:', currentDrawnTile.value?.id)
    
    if (currentDrawnTile.value && checkWinConditionForPlayer(currentIndex, currentDrawnTile.value, true)) {
      console.log('CPU can win with tsumo, returning early')
      return
    }
    
    const ai = cpuAIs[currentIndex as 1 | 2 | 3]
    console.log('AI found for player:', currentIndex, ':', !!ai)
    
    if (ai) {
      const allTiles = currentDrawnTile.value ? [...player.tiles, currentDrawnTile.value] : player.tiles
      console.log('Making AI decision with', allTiles.length, 'tiles')
      
      const decision = await ai.makeDecision({ ...player, tiles: allTiles }, currentDrawnTile.value)
      console.log('AI decision:', decision)
    
    if (decision.action === 'riichi') {
      // リーチ宣言
      const riichiSuccess = gameManager.value.declareRiichi(currentIndex)
      
      if (riichiSuccess) {
        // リーチ後は最適な捨て牌を決定する
        const tileToDiscard = ai.decideTileToDiscard(player, currentDrawnTile.value)
        
        if (tileToDiscard) {
          const discardSuccess = gameManager.value.discardTile(currentIndex, tileToDiscard, true)
          
          if (discardSuccess) {
            // CPUが牌を捨てた後、人間プレイヤーがロン可能かチェック
            if (gameManager.value.canHumanRon()) {
              return
            }
            
            gameManager.value.nextTurn()
          }
        }
      }
    } else if (decision.tileId) {
      // 通常の捨て牌
      const success = gameManager.value.discardTile(currentIndex, decision.tileId)
      if (success) {
        // CPUが牌を捨てた後、人間プレイヤーがロン可能かチェック
        if (gameManager.value.canHumanRon()) {
          // ロンボタンが表示されるので、ここでは次のターンに進まない
          return
        }
        
        gameManager.value.nextTurn()
      }
    }
  }
  } finally {
    processingCpuTurn.value = false
    console.log('Set processing flag to false')
  }
}

function declareRiichi() {
  if (canDeclareRiichi.value) {
    gameManager.value.declareRiichi(0)
  }
}

// リーチプレビューモードの切り替え
function toggleRiichiPreview() {
  console.log('toggleRiichiPreview called, current riichi:', humanPlayer.value.riichi, 'preview mode:', riichiPreviewMode.value)
  // すでにリーチしている場合は何もしない
  if (humanPlayer.value.riichi) {
    console.log('Already riichi, cannot toggle preview')
    return
  }
  riichiPreviewMode.value = !riichiPreviewMode.value
  console.log('Preview mode toggled to:', riichiPreviewMode.value)
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

// リーチプレビューで無効な牌IDのリストを取得
function getRiichiDisabledTiles(): string[] {
  if (!canDeclareRiichi.value || !currentDrawnTile.value || humanPlayer.value.riichi) {
    return []
  }

  const player = humanPlayer.value
  const allTiles = [...player.tiles, currentDrawnTile.value]
  const disabledTileIds: string[] = []

  // 各牌を捨てた場合にテンパイにならない牌をチェック
  for (const tile of allTiles) {
    const remainingTiles = allTiles.filter(t => t.id !== tile.id)
    const shanten = calculateShanten(remainingTiles)
    
    if (shanten !== 0) { // テンパイにならない
      disabledTileIds.push(tile.id)
    }
  }

  return disabledTileIds
}

// リーチ後の手牌で無効な牌IDのリストを取得
function getPostRiichiDisabledTiles(): string[] {
  if (!humanPlayer.value.riichi || !currentDrawnTile.value) {
    return []
  }

  console.log('Getting post-riichi disabled tiles')
  
  // リーチ後は手牌の全ての牌をdisabledにする（ツモ牌のみ捨てられる）
  return humanPlayer.value.tiles.map(tile => tile.id)
}

// リーチ確定と牌捨て
function confirmRiichiAndDiscard(tileId: string) {
  console.log('confirmRiichiAndDiscard called with tileId:', tileId, 'previewMode:', riichiPreviewMode.value)
  
  if (!riichiPreviewMode.value) {
    console.log('Not in preview mode, aborting')
    return
  }

  const validTiles = getRiichiValidTiles()
  if (!validTiles.includes(tileId)) {
    // 無効な牌をクリックした場合は何もしない
    console.log('Invalid tile for riichi, aborting')
    return
  }

  // リーチを宣言
  if (canDeclareRiichi.value) {
    console.log('Declaring riichi')
    gameManager.value.declareRiichi(0)
  }

  // プレビューモードを解除
  riichiPreviewMode.value = false
  console.log('Preview mode disabled, riichi state:', humanPlayer.value.riichi)

  // 牌を捨てる（リーチ宣言牌としてマーク）
  const success = gameManager.value.discardTile(0, tileId, true)
  console.log('Riichi discard success:', success)
  if (success) {
    gameManager.value.nextTurn()
  }
}

function declareTsumo() {
  if (canTsumo.value && currentDrawnTile.value) {
    const winResult = gameManager.value.checkWinConditionForPlayer(0, currentDrawnTile.value, true)
    
    if (winResult.isWin && winResult.result) {
      const player = humanPlayer.value
      
      console.log('Tsumo win - doraIndicators:', doraIndicators.value, 'doraCount:', winResult.result.doraCount, 'uradoraCount:', winResult.result.uradoraCount, 'player riichi:', player.riichi)
      console.log('Tsumo win - uradoraIndicators:', winResult.result.uradoraCount > 0 && gameManager.value.wall.length >= 2 ? [gameManager.value.wall[gameManager.value.wall.length - 2]] : [])
      
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
        uradoraIndicators: player.riichi && gameManager.value.wall.length >= 2 ? [gameManager.value.wall[gameManager.value.wall.length - 2]] : [],
        uradoraCount: winResult.result.uradoraCount
      }
      
      // 供託分を加算
      gameManager.value.applyKyotakuToWinner(0)
      
      // ゲーム状態を終了に変更
      gameManager.value.gamePhase = 'finished'
      showWinModal.value = true
    }
  }
}

function declareRon() {
  if (canRon.value && gameManager.value.lastDiscardedTile) {
    const player = humanPlayer.value
    
    const winResult = gameManager.value.checkWinConditionForPlayer(0, gameManager.value.lastDiscardedTile, false)
    
    if (winResult.isWin && winResult.result) {
      const player = humanPlayer.value
      
      console.log('Ron win - doraIndicators:', doraIndicators.value, 'doraCount:', winResult.result.doraCount, 'uradoraCount:', winResult.result.uradoraCount, 'player riichi:', player.riichi)
      console.log('Ron win - uradoraIndicators:', winResult.result.uradoraCount > 0 && gameManager.value.wall.length >= 2 ? [gameManager.value.wall[gameManager.value.wall.length - 2]] : [])
      
      winModalData.value = {
        winner: player,
        winningHand: [...player.tiles, gameManager.value.lastDiscardedTile],
        winningTile: gameManager.value.lastDiscardedTile,
        isTsumo: false,
        basePoints: winResult.result.basePoints,
        totalPoints: winResult.result.totalPoints,
        yaku: winResult.result.yaku,
        totalHan: winResult.result.totalHan,
        fu: winResult.result.fu,
        doraIndicators: doraIndicators.value,
        doraCount: winResult.result.doraCount,
        uradoraIndicators: player.riichi && gameManager.value.wall.length >= 2 ? [gameManager.value.wall[gameManager.value.wall.length - 2]] : [],
        uradoraCount: winResult.result.uradoraCount
      }
      
      // 供託分を加算
      gameManager.value.applyKyotakuToWinner(0)
      
      // ゲーム状態を終了に変更
      gameManager.value.gamePhase = 'finished'
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
    // CPUプレイヤーの場合は自動で上がる
    if (players.value[playerIndex].type === 'cpu') {
      const player = players.value[playerIndex]
      const winResult = result.result
      
      winModalData.value = {
        winner: player,
        winningHand: [...player.tiles, winTile],
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
      
      // 供託分を加算
      gameManager.value.applyKyotakuToWinner(playerIndex)
      
      showWinModal.value = true
      return true
    }
    
    // 人間プレイヤーの場合はボタンで選択制にするため、ここでは何もしない
    return true
  }
  
  return false
}

function onContinueGame() {
  console.log('onContinueGame called')
  showWinModal.value = false
  gameManager.value.advanceToNextRound()
  
  console.log('After advanceToNextRound - currentPlayerIndex:', currentPlayerIndex.value, 'dealer:', gameManager.value.dealer)
  
  // 次局開始後、最初のプレイヤーにツモ牌を配る
  setTimeout(() => {
    if (gameManager.value.gamePhase === 'playing') {
      console.log('Drawing first tile for player:', currentPlayerIndex.value, 'type:', players.value[currentPlayerIndex.value]?.type)
      const firstTile = gameManager.value.drawTileAndKeepSeparate(currentPlayerIndex.value)
      console.log('Drew first tile:', firstTile?.id)
      
      // CPUプレイヤーの場合は自動的にターンを開始
      if (players.value[currentPlayerIndex.value].type === 'cpu') {
        console.log('Starting CPU turn for new round')
        setTimeout(() => {
          processCpuTurn()
        }, 500)
      }
    }
  }, 100)
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
  if (gamePhase.value === 'waiting') {
    gameManager.value.startNewGame()
    
    setTimeout(() => {
      if (gameManager.value.gamePhase === 'playing') {
        const firstTile = gameManager.value.drawTileAndKeepSeparate(currentPlayerIndex.value)
      }
    }, 100)
  }
})

watch(() => currentPlayerIndex.value, (newIndex, oldIndex) => {
  if (gamePhase.value === 'playing') {
    // プレイヤーの手牌が13枚でない場合はツモを行わない
    const player = players.value[newIndex]
    if (player.tiles.length !== 13) {
      return
    }
    
    // 人間プレイヤーの場合は80%確率で有効牌を引く
    if (players.value[newIndex].type === 'human') {
      if (player.tiles.length === 13) {
        // 80%の確率で有効牌を引く
        if (Math.random() < 0.8) {
          const usefulTile = findUsefulTileInWall(player.tiles)
          if (usefulTile) {
            const tileIndex = gameManager.value.wall.findIndex(t => t.id === usefulTile.id)
            if (tileIndex !== -1) {
              gameManager.value.wall.splice(tileIndex, 1)
              gameManager.value.currentDrawnTile = usefulTile
              return
            }
          }
        }
      }
    }
    
    const drawnTile = gameManager.value.drawTileAndKeepSeparate(newIndex)
    
    if (players.value[newIndex].type === 'cpu') {
      setTimeout(() => {
        processCpuTurn()
      }, 500)
    } else if (players.value[newIndex].type === 'human') {
      // 人間プレイヤーのターン開始
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

/* プレイヤー点数表示 */
.score-bottom,
.score-top,
.score-left,
.score-right {
  position: absolute;
  font-size: 0.9rem;
  font-weight: bold;
  color: #333;
  /* background: rgba(255, 255, 255, 0.9); */
  padding: 4px 8px;
  /* border-radius: 4px; */
  /* border: 1px solid #ddd; */
}

.score-bottom {
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
}

.score-top {
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
}

.score-left {
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  writing-mode: vertical-lr;
  text-orientation: mixed;
}

.score-right {
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  writing-mode: vertical-lr;
  text-orientation: mixed;
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