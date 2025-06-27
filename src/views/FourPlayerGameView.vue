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
              <div class="remaining-tiles">{{ wallRemaining }}</div>
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

            <!-- ポンボタン -->
            <v-btn
              v-if="canPon"
              color="info"
              size="small"
              block
              class="action-btn"
              @click="declarePon"
            >
              ポン
            </v-btn>

            <!-- カンボタン -->
            <v-btn
              v-if="canKan"
              color="warning"
              size="small"
              block
              class="action-btn"
              @click="declareKan"
            >
              カン
            </v-btn>

            <!-- チーボタン -->
            <v-btn
              v-if="canChi"
              color="primary"
              size="small"
              block
              class="action-btn"
              @click="declareChi"
            >
              チー
            </v-btn>

            <!-- キャンセルボタン（ロンまたはポン・カン・チー表示時） -->
            <v-btn
              v-if="canRon || canPon || canKan || canChi"
              color="grey"
              size="small"
              block
              class="action-btn"
              @click="cancelActions"
            >
              キャンセル
            </v-btn>

            <!-- 結果表示・次の局へボタン（モーダル閉じ後のみ） -->
            <v-btn
              v-if="showResultAndNextButtons && !showDrawResultButtons"
              color="info"
              size="small"
              block
              class="action-btn"
              @click="reopenWinModal"
            >
              結果表示
            </v-btn>

            <v-btn
              v-if="showResultAndNextButtons && !showDrawResultButtons"
              color="primary"
              size="small"
              block
              class="action-btn"
              @click="onContinueGame"
            >
              次の局へ
            </v-btn>

            <!-- 流局結果表示・次の局へボタン（流局モーダル閉じ後のみ） -->
            <v-btn
              v-if="showDrawResultButtons"
              color="info"
              size="small"
              block
              class="action-btn"
              @click="reopenDrawModal"
            >
              流局結果表示
            </v-btn>

            <v-btn
              v-if="showDrawResultButtons"
              color="primary"
              size="small"
              block
              class="action-btn"
              @click="onContinueFromDraw"
            >
              次の局へ
            </v-btn>

            <!-- デバッグ情報 -->
            <div v-if="isHumanTurn" class="debug-info" style="font-size: 0.7rem; color: #666; margin-top: 8px;">
              デバッグ: 手牌{{ humanPlayer.tiles.length }}枚, ツモ牌: {{ currentDrawnTile ? 'あり' : 'なし' }}, リーチ可能: {{ canDeclareRiichi }}, シャンテン: {{ humanShanten }}<br>
              リーチ済み: {{ humanPlayer.riichi }}, 点数: {{ humanPlayer.score }}, ゲーム状態: {{ gamePhase }}<br>
              ツモ可能: {{ canTsumo }}, ロン可能: {{ canRon }}, 自分のターン: {{ isHumanTurn }}<br>
              手牌内容: {{ humanPlayer.tiles.map(t => t.suit + t.rank).join(' ') }}{{ currentDrawnTile ? ' + ' + currentDrawnTile.suit + currentDrawnTile.rank : '' }}
            </div>

            <!-- 捨牌のヒント -->
            <div v-if="isHumanTurn && humanPlayer.tiles.length === 13 && currentDrawnTile && !canTsumo && !canRon" class="discard-hint">
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
      @close="onWinModalClose"
    />

    <!-- 流局モーダル -->
    <DrawModal
      v-if="drawModalData"
      v-model="showDrawModal"
      :draw-data="drawModalData"
      @continue="onContinueFromDraw"
      @close="onDrawModalClose"
    />

    <!-- ゲーム終了モーダル -->
    <GameEndModal
      v-if="gameEndModalData"
      v-model="showGameEndModal"
      :game-end-data="gameEndModalData"
      @back-to-home="onBackToHome"
      @rematch="onRematch"
      @close="onGameEndModalClose"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { GameManager } from '../utils/game-manager'
import { cpuAIs } from '../utils/cpu-ai'
import { calculateShanten, calculateShantenWithMelds, canRiichi, checkWinCondition } from '../utils/mahjong-logic'
import { defaultEnhancedDraw } from '../utils/enhanced-draw'
import type { Tile } from '../stores/fourPlayerMahjong'
import PlayerArea from '../components/PlayerArea.vue'
import PlayerDiscardArea from '../components/PlayerDiscardArea.vue'
import MahjongTile from '../components/MahjongTile.vue'
import WinModal, { type WinData } from '../components/WinModal.vue'
import DrawModal, { type DrawData } from '../components/DrawModal.vue'
import GameEndModal, { type GameEndData } from '../components/GameEndModal.vue'
import { useRouter } from 'vue-router'

const gameManager = ref(new GameManager())
const router = useRouter()

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

// Draw modal state  
const showDrawModal = ref(false)
const drawModalData = ref<DrawData | null>(null)

// Game end modal state
const showGameEndModal = ref(false)
const gameEndModalData = ref<GameEndData | null>(null)

const winModalData = ref<WinData>({
  winner: gameManager.value.players[0],
  winningHand: [],
  winningTile: null,
  isTsumo: false,
  basePoints: 0,
  totalPoints: 0,
  paymentInfo: '',
  yaku: [],
  totalHan: 0,
  fu: 0,
  yakuman: 0,
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
  
  try {
    const winResult = gameManager.value.checkWinConditionForPlayer(0, drawnTile, true)
    // 上がり形かつ点数が0より大きい場合のみツモ可能
    return winResult.isWin && (winResult.result?.totalPoints || 0) > 0
  } catch (error) {
    return false
  }
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
  
  // 鳴き牌を考慮した枚数チェック
  const meldTileCount = player.melds.reduce((count, meld) => count + meld.tiles.length, 0)
  const expectedHandTiles = 13 - meldTileCount
  const expectedTotalTiles = [expectedHandTiles, expectedHandTiles + 1]
  
  if (!expectedTotalTiles.includes(allTiles.length)) {
    return 8
  }
  
  // 鳴き牌を考慮したシャンテン数計算
  return calculateShantenWithMelds(allTiles, player.melds)
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
      gameManager.value.drawTileAndKeepSeparate(currentPlayerIndex.value)
      
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

async function onHumanTileDiscard(tileId: string) {
  if (!isHumanTurn.value) {
    return
  }
  
  const success = gameManager.value.discardTile(0, tileId)
  
  if (success) {
    // プレイヤーが牌を捨てた後、CPUのロン判定を行う
    const cpuRonOccurred = await checkCpuRon(0)
    
    if (!cpuRonOccurred) {
      // ロンが発生しなかった場合のみ次のターンに進む
      gameManager.value.nextTurn()
      
      // 次のターンに進んだ後、流局判定を行う
      checkForDraw()
    }
  } 
}

async function processCpuTurn() {
  // 重複処理を防ぐ
  if (processingCpuTurn.value) {
    return
  }
  
  if (gamePhase.value !== 'playing' || currentPlayer.value.type === 'human') {
    return
  }
  
  processingCpuTurn.value = true
  
  try {
    const currentIndex = currentPlayerIndex.value
    const player = currentPlayer.value
    
    
    if (currentDrawnTile.value) {
      const winResult = gameManager.value.checkWinConditionForPlayer(currentIndex, currentDrawnTile.value, true)
      if (winResult.isWin && winResult.result) {
        // CPU上がり処理（既にチェック済みの結果を渡す）
        handleCpuWinWithResult(currentIndex, currentDrawnTile.value, true, winResult.result)
        return
      }
    }
    
    const ai = cpuAIs[currentIndex as 1 | 2 | 3]
    
    if (ai) {
      // プレイヤーの難易度をAIに設定（初期化時のみ）
      if (player.difficulty) {
        ai.setDifficulty(player.difficulty)
      }
      
      const allTiles = currentDrawnTile.value ? [...player.tiles, currentDrawnTile.value] : player.tiles
      
      const decision = await ai.makeDecision({ ...player, tiles: allTiles }, currentDrawnTile.value)
    
    if (decision.action === 'riichi') {
      // リーチ宣言前にテンパイにするための捨て牌を決定
      const riichiDiscardTile = ai.getRiichiDiscardTile(player, currentDrawnTile.value)
      
      if (riichiDiscardTile) {
        // リーチ宣言
        const riichiSuccess = gameManager.value.declareRiichi(currentIndex)
        
        if (riichiSuccess) {
          // リーチ宣言と同時に決定した牌を捨てる
          const discardSuccess = gameManager.value.discardTile(currentIndex, riichiDiscardTile, true)
          
          if (discardSuccess) {
            // CPUが牌を捨てた後、人間プレイヤーがロン可能かチェック
            if (gameManager.value.canHumanRon()) {
              return
            }
            
            // 人間プレイヤーがポン・カン・チー可能かチェック
            checkHumanMeldActions(currentIndex)
            
            // ポン・カン・チーが可能な場合はプレイヤーの選択を待つ
            if (canPon.value || canKan.value || canChi.value) {
              return
            }
            
            // CPUプレイヤーがロンできるかチェック
            if (await checkCpuRon(currentIndex)) {
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
        
        // 人間プレイヤーがポン・カン・チー可能かチェック
        checkHumanMeldActions(currentIndex)
        
        // ポン・カン・チーが可能な場合はプレイヤーの選択を待つ
        if (canPon.value || canKan.value || canChi.value) {
          return
        }
        
        // CPUプレイヤーがロンできるかチェック
        if (await checkCpuRon(currentIndex)) {
          return
        }
        
        gameManager.value.nextTurn()
        
        // 次のターンに進んだ後、流局判定を行う
        checkForDraw()
      }
    }
  }
  } finally {
    processingCpuTurn.value = false
  }
}

function declareRiichi() {
  if (canDeclareRiichi.value) {
    const success = gameManager.value.declareRiichi(0)
  } else {
  }
}

// リーチプレビューモードの切り替え
function toggleRiichiPreview() {
  // すでにリーチしている場合は何もしない
  if (humanPlayer.value.riichi) {
    return
  }
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

  // リーチ後は手牌の全ての牌をdisabledにする（ツモ牌のみ捨てられる）
  return humanPlayer.value.tiles.map(tile => tile.id)
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

  // 牌を捨てる（リーチ宣言牌としてマーク）
  const success = gameManager.value.discardTile(0, tileId, true)
  if (success) {
    gameManager.value.nextTurn()
  }
}

function declareTsumo() {
  if (canTsumo.value && currentDrawnTile.value) {
    const winResult = gameManager.value.checkWinConditionForPlayer(0, currentDrawnTile.value, true, true)
    
    if (winResult.isWin && winResult.result) {
      const player = humanPlayer.value
      
      winModalData.value = {
        winner: player,
        winningHand: [...player.tiles, currentDrawnTile.value],
        winningTile: currentDrawnTile.value,
        isTsumo: true,
        basePoints: winResult.result.basePoints,
        totalPoints: winResult.result.totalPoints,
        paymentInfo: winResult.result.paymentInfo,
        yaku: winResult.result.yaku,
        totalHan: winResult.result.totalHan,
        fu: winResult.result.fu,
        yakuman: winResult.result.yakuman,
        doraIndicators: doraIndicators.value,
        doraCount: winResult.result.doraCount,
        uradoraIndicators: player.riichi && gameManager.value.wall.length >= 2 ? [gameManager.value.wall[gameManager.value.wall.length - 2]] : [],
        uradoraCount: winResult.result.uradoraCount
      }
      
      // 供託分を加算
      gameManager.value.applyKyotakuToWinner(0)
      
      // 点数移動を実行（ツモ）
      gameManager.value.executeScoreTransfer(
        0, // winner index (human player)
        winResult.result.paymentInfo,
        winResult.result.totalPoints,
        true // isTsumo
      )
      
      // 人間プレイヤーの上がりを記録
      gameManager.value.recordHumanWin(
        winResult.result.yaku.map(y => y.name),
        winResult.result.totalPoints
      )
      
      // ゲーム状態を終了に変更
      gameManager.value.gamePhase = 'finished'
      showWinModal.value = true
    }
  }
}

function declareRon() {
  if (canRon.value && gameManager.value.lastDiscardedTile) {
    const winResult = gameManager.value.checkWinConditionForPlayer(0, gameManager.value.lastDiscardedTile, false, true)
    
    if (winResult.isWin && winResult.result) {
      const player = humanPlayer.value
      
      winModalData.value = {
        winner: player,
        winningHand: [...player.tiles, gameManager.value.lastDiscardedTile],
        winningTile: gameManager.value.lastDiscardedTile,
        isTsumo: false,
        basePoints: winResult.result.basePoints,
        totalPoints: winResult.result.totalPoints,
        paymentInfo: winResult.result.paymentInfo,
        yaku: winResult.result.yaku,
        totalHan: winResult.result.totalHan,
        fu: winResult.result.fu,
        yakuman: winResult.result.yakuman,
        doraIndicators: doraIndicators.value,
        doraCount: winResult.result.doraCount,
        uradoraIndicators: player.riichi && gameManager.value.wall.length >= 2 ? [gameManager.value.wall[gameManager.value.wall.length - 2]] : [],
        uradoraCount: winResult.result.uradoraCount
      }
      
      // 供託分を加算
      gameManager.value.applyKyotakuToWinner(0)
      
      // 点数移動を実行（ロン）
      gameManager.value.executeScoreTransfer(
        0, // winner index (human player)
        winResult.result.paymentInfo,
        winResult.result.totalPoints,
        false, // isTsumo
        gameManager.value.lastDiscardPlayerIndex ?? undefined // ron target
      )
      
      // 人間プレイヤーの上がりを記録
      gameManager.value.recordHumanWin(
        winResult.result.yaku.map(y => y.name),
        winResult.result.totalPoints
      )
      
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

// ポン・カン・チーのアクション
function declarePon() {
  if (!lastDiscardedTile.value) return
  
  const humanPlayer = gameManager.value.humanPlayer
  const tile = lastDiscardedTile.value
  
  // ポンの実行（手牌から同じ牌2枚を削除し、鳴き牌に追加）
  const sameRankTiles = humanPlayer.tiles.filter(t => t.suit === tile.suit && t.rank === tile.rank)
  
  if (sameRankTiles.length >= 2) {
    // 手牌から2枚削除
    for (let i = 0; i < 2; i++) {
      const index = humanPlayer.tiles.findIndex(t => t.suit === tile.suit && t.rank === tile.rank)
      if (index !== -1) {
        humanPlayer.tiles.splice(index, 1)
      }
    }
    
    // 捨て牌を削除し、どのプレイヤーから鳴いたかを記録
    const lastDiscardPlayer = gameManager.value.players.find(p => 
      p.discards.length > 0 && p.discards[p.discards.length - 1].id === tile.id
    )
    let fromPlayerIndex = 0
    if (lastDiscardPlayer) {
      fromPlayerIndex = lastDiscardPlayer.id
      lastDiscardPlayer.discards.pop()
    }
    
    // 鳴き牌に追加
    humanPlayer.melds.push({
      type: 'pon',
      tiles: [sameRankTiles[0], sameRankTiles[1], tile],
      calledTile: tile,
      fromPlayer: fromPlayerIndex
    })
    
    // 人間プレイヤーのターンに設定
    gameManager.value.currentPlayerIndex = 0
    
    // フラグリセット
    resetActionFlags()
  }
}

function declareKan() {
  if (!lastDiscardedTile.value) return
  
  const humanPlayer = gameManager.value.humanPlayer
  const tile = lastDiscardedTile.value
  
  // カンの実行（手牌から同じ牌3枚を削除し、鳴き牌に追加）
  const sameRankTiles = humanPlayer.tiles.filter(t => t.suit === tile.suit && t.rank === tile.rank)
  
  if (sameRankTiles.length >= 3) {
    // 手牌から3枚削除
    for (let i = 0; i < 3; i++) {
      const index = humanPlayer.tiles.findIndex(t => t.suit === tile.suit && t.rank === tile.rank)
      if (index !== -1) {
        humanPlayer.tiles.splice(index, 1)
      }
    }
    
    // 捨て牌を削除し、どのプレイヤーから鳴いたかを記録
    const lastDiscardPlayer = gameManager.value.players.find(p => 
      p.discards.length > 0 && p.discards[p.discards.length - 1].id === tile.id
    )
    let fromPlayerIndex = 0
    if (lastDiscardPlayer) {
      fromPlayerIndex = lastDiscardPlayer.id
      lastDiscardPlayer.discards.pop()
    }
    
    // 鳴き牌に追加
    humanPlayer.melds.push({
      type: 'kan',
      tiles: [sameRankTiles[0], sameRankTiles[1], sameRankTiles[2], tile],
      calledTile: tile,
      fromPlayer: fromPlayerIndex
    })
    
    // カン後は嶺上牌を引く
    const kanTile = gameManager.value.drawTileAndKeepSeparate(0)
    
    // 人間プレイヤーのターンに設定
    gameManager.value.currentPlayerIndex = 0
    
    // フラグリセット
    resetActionFlags()
  }
}

function declareChi() {
  // チーの場合は選択肢があるので、最初の選択肢を使用（簡易実装）
  if (!lastDiscardedTile.value || chiOptions.value.length === 0) return
  
  const humanPlayer = gameManager.value.humanPlayer
  const tile = lastDiscardedTile.value
  const option = chiOptions.value[0] // 最初の選択肢を使用
  
  // チーの実行
  // 鳴き牌のタイル情報を削除前に収集
  const calledTile = tile // チーした牌
  const handTiles: Tile[] = [] // 手牌から使う牌
  
  option.forEach(id => {
    if (id !== tile.id) {
      const handTile = humanPlayer.tiles.find(t => t.id === id)
      if (handTile) {
        handTiles.push(handTile)
      }
    }
  })
  
  // 手牌の牌を数字順に並べ替え
  handTiles.sort((a, b) => a.rank - b.rank)
  
  // チーした牌を左端に、残りを数字順で配置
  const meldTiles = [calledTile, ...handTiles]
  
  // 手牌から必要な牌を削除
  const tilesToRemove = option.filter(id => id !== tile.id)
  tilesToRemove.forEach(tileId => {
    const index = humanPlayer.tiles.findIndex(t => t.id === tileId)
    if (index !== -1) {
      humanPlayer.tiles.splice(index, 1)
    }
  })
  
  humanPlayer.melds.push({
    type: 'chi',
    tiles: meldTiles,
    calledTile: tile
  })
  
  // 捨て牌を削除し、どのプレイヤーから鳴いたかを記録
  const lastDiscardPlayer = gameManager.value.players.find(p => 
    p.discards.length > 0 && p.discards[p.discards.length - 1].id === tile.id
  )
  let fromPlayerIndex = 0
  if (lastDiscardPlayer) {
    fromPlayerIndex = lastDiscardPlayer.id
    lastDiscardPlayer.discards.pop()
  }
  
  // 鳴き牌の fromPlayer フィールドを更新
  const lastMeld = humanPlayer.melds[humanPlayer.melds.length - 1]
  if (lastMeld) {
    lastMeld.fromPlayer = fromPlayerIndex
  }
  
  // 人間プレイヤーのターンに設定
  gameManager.value.currentPlayerIndex = 0
  
  // フラグリセット
  resetActionFlags()
}

function cancelActions() {
  resetActionFlags()
  
  // キャンセル後は次のプレイヤーのターンに進む
  gameManager.value.nextTurn()
}

function resetActionFlags() {
  canPon.value = false
  canKan.value = false
  canChi.value = false
  chiOptions.value = []
  selectedChiOption.value = null
  lastDiscardedTile.value = null
}

// 人間プレイヤーがポン・カン・チー可能かチェックする関数
function checkHumanMeldActions(discardPlayerIndex: number) {
  // まず既存のフラグをリセット
  canPon.value = false
  canKan.value = false
  canChi.value = false
  chiOptions.value = []
  lastDiscardedTile.value = null

  // 最後に捨てられた牌を取得
  const discardedTile = gameManager.value.lastDiscardedTile
  if (!discardedTile) {
    return
  }

  const humanPlayer = gameManager.value.humanPlayer
  lastDiscardedTile.value = discardedTile

  // ポンの判定：同じ牌が2枚以上手牌にある
  const ponCount = humanPlayer.tiles.filter(t => 
    t.suit === discardedTile.suit && t.rank === discardedTile.rank
  ).length
  
  canPon.value = ponCount >= 2

  // カンの判定：同じ牌が3枚以上手牌にある
  canKan.value = ponCount >= 3

  // チーの判定：数牌のみ、かつ左隣のプレイヤーからの捨て牌のみ
  if (discardedTile.suit !== 'honor' && isLeftNeighbor(discardPlayerIndex)) {
    chiOptions.value = getChiOptions(humanPlayer.tiles, discardedTile)
    canChi.value = chiOptions.value.length > 0
  }
}

// 左隣のプレイヤーかどうかを判定（人間プレイヤーは0番、左隣は3番）
function isLeftNeighbor(playerIndex: number): boolean {
  return playerIndex === 3
}

// チーの選択肢を取得
function getChiOptions(handTiles: Tile[], discardedTile: Tile): string[][] {
  const options: string[][] = []
  const suit = discardedTile.suit
  const rank = discardedTile.rank

  if (suit === 'honor') {
    return options // 字牌はチーできない
  }

  // パターン1: [n-2, n-1, n] の n
  if (rank >= 3) {
    const tile1 = handTiles.find(t => t.suit === suit && t.rank === rank - 2)
    const tile2 = handTiles.find(t => t.suit === suit && t.rank === rank - 1)
    if (tile1 && tile2) {
      options.push([tile1.id, tile2.id, discardedTile.id])
    }
  }

  // パターン2: [n-1, n, n+1] の n
  if (rank >= 2 && rank <= 8) {
    const tile1 = handTiles.find(t => t.suit === suit && t.rank === rank - 1)
    const tile2 = handTiles.find(t => t.suit === suit && t.rank === rank + 1)
    if (tile1 && tile2) {
      options.push([tile1.id, discardedTile.id, tile2.id])
    }
  }

  // パターン3: [n, n+1, n+2] の n
  if (rank <= 7) {
    const tile1 = handTiles.find(t => t.suit === suit && t.rank === rank + 1)
    const tile2 = handTiles.find(t => t.suit === suit && t.rank === rank + 2)
    if (tile1 && tile2) {
      options.push([discardedTile.id, tile1.id, tile2.id])
    }
  }

  return options
}

function handleCpuWinWithResult(playerIndex: number, winTile: any, isTsumo: boolean, winResult: any) {
  const player = players.value[playerIndex]
  
  // 実際の上がり確定時に一発フラグをリセット
  gameManager.value.checkWinConditionForPlayer(playerIndex, winTile, isTsumo, true)
  
  winModalData.value = {
    winner: player,
    winningHand: [...player.tiles, winTile],
    winningTile: winTile,
    isTsumo,
    basePoints: winResult.basePoints,
    totalPoints: winResult.totalPoints,
    paymentInfo: winResult.paymentInfo,
    yaku: winResult.yaku,
    totalHan: winResult.totalHan,
    fu: winResult.fu,
    yakuman: winResult.yakuman,
    doraIndicators: doraIndicators.value,
    doraCount: winResult.doraCount,
    uradoraIndicators: player.riichi && gameManager.value.wall.length >= 2 ? [gameManager.value.wall[gameManager.value.wall.length - 2]] : [],
    uradoraCount: winResult.uradoraCount
  }
  
  // 供託分を加算
  gameManager.value.applyKyotakuToWinner(playerIndex)
  
  // 点数移動を実行
  if (isTsumo) {
    gameManager.value.executeScoreTransfer(
      playerIndex,
      winResult.paymentInfo,
      winResult.totalPoints,
      true
    )
  } else {
    // ロンの場合（放銃者のインデックスを特定する必要がある）
    gameManager.value.executeScoreTransfer(
      playerIndex,
      winResult.paymentInfo,
      winResult.totalPoints,
      false,
      gameManager.value.lastDiscardPlayerIndex ?? undefined
    )
  }
  
  // ゲーム状態を終了に変更
  gameManager.value.gamePhase = 'finished'
  showWinModal.value = true
}

function handleCpuWin(playerIndex: number, winTile: any, isTsumo: boolean) {
  const result = gameManager.value.checkWinConditionForPlayer(playerIndex, winTile, isTsumo, true)
  
  if (result.isWin && result.result) {
    const player = players.value[playerIndex]
    const winResult = result.result
    
    winModalData.value = {
      winner: player,
      winningHand: [...player.tiles, winTile],
      winningTile: winTile,
      isTsumo,
      basePoints: winResult.basePoints,
      totalPoints: winResult.totalPoints,
      paymentInfo: winResult.paymentInfo,
      yaku: winResult.yaku,
      totalHan: winResult.totalHan,
      fu: winResult.fu,
      yakuman: winResult.yakuman,
      doraIndicators: doraIndicators.value,
      doraCount: winResult.doraCount,
      uradoraIndicators: player.riichi && gameManager.value.wall.length >= 2 ? [gameManager.value.wall[gameManager.value.wall.length - 2]] : [],
      uradoraCount: winResult.uradoraCount
    }
    
    // 供託分を加算
    gameManager.value.applyKyotakuToWinner(playerIndex)
    
    // 点数移動を実行
    if (isTsumo) {
      gameManager.value.executeScoreTransfer(
        playerIndex,
        winResult.paymentInfo,
        winResult.totalPoints,
        true
      )
    } else {
      // ロンの場合（放銃者のインデックスを特定する必要がある）
      gameManager.value.executeScoreTransfer(
        playerIndex,
        winResult.paymentInfo,
        winResult.totalPoints,
        false,
        gameManager.value.lastDiscardPlayerIndex ?? undefined
      )
    }
    
    // ゲーム状態を終了に変更
    gameManager.value.gamePhase = 'finished'
    showWinModal.value = true
  }
}

function checkWinConditionForPlayer(playerIndex: number, winTile: any, isTsumo: boolean): boolean {
  const result = gameManager.value.checkWinConditionForPlayer(playerIndex, winTile, isTsumo)
  
  if (result.isWin && result.result) {
    // CPUプレイヤーの場合は自動で上がる
    if (players.value[playerIndex].type === 'cpu') {
      handleCpuWin(playerIndex, winTile, isTsumo)
      return true
    }
    
    // 人間プレイヤーの場合はボタンで選択制にするため、ここでは何もしない
    return true
  }
  
  return false
}

function onContinueGame() {
  showWinModal.value = false
  showResultAndNextButtons.value = false
  
  // ゲーム終了判定
  const gameEndCheck = gameManager.value.checkGameEnd()
  if (gameEndCheck.isGameEnd) {
    gameEndModalData.value = gameEndCheck.gameEndData
    showGameEndModal.value = true
    return
  }
  
  gameManager.value.advanceToNextRound()
  
  // 次局開始後、最初のプレイヤーにツモ牌を配る
  setTimeout(() => {
    if (gameManager.value.gamePhase === 'playing') {
      gameManager.value.drawTileAndKeepSeparate(currentPlayerIndex.value)
      
      // CPUプレイヤーの場合は自動的にターンを開始
      if (players.value[currentPlayerIndex.value].type === 'cpu') {
        setTimeout(() => {
          processCpuTurn()
        }, 500)
      }
    }
  }, 100)
}

function onNewGame() {
  showWinModal.value = false
  showResultAndNextButtons.value = false
  gameManager.value.resetGame()
}

const showResultAndNextButtons = ref(false)
const showDrawResultButtons = ref(false)

// ポン・カン・チー関連
const canPon = ref(false)
const canKan = ref(false)
const canChi = ref(false)
const chiOptions = ref<string[][]>([]) // チーの選択肢
const selectedChiOption = ref<string[] | null>(null)
const lastDiscardedTile = ref<Tile | null>(null)

function onWinModalClose() {
  showResultAndNextButtons.value = gameManager.value.gamePhase === 'finished'
}

function reopenWinModal() {
  showWinModal.value = true
  showResultAndNextButtons.value = false
}

function reopenDrawModal() {
  showDrawModal.value = true
  showDrawResultButtons.value = false
}

// 流局関連のハンドラー
function onContinueFromDraw() {
  showDrawModal.value = false
  showDrawResultButtons.value = false
  
  // ゲーム終了判定
  const gameEndCheck = gameManager.value.checkGameEnd()
  if (gameEndCheck.isGameEnd) {
    gameEndModalData.value = gameEndCheck.gameEndData
    showGameEndModal.value = true
    return
  }
  
  gameManager.value.advanceToNextRound()
  
  // 次局開始後、最初のプレイヤーにツモ牌を配る
  setTimeout(() => {
    if (gameManager.value.gamePhase === 'playing') {
      gameManager.value.drawTileAndKeepSeparate(currentPlayerIndex.value)
      
      // CPUプレイヤーの場合は自動的にターンを開始
      if (players.value[currentPlayerIndex.value].type === 'cpu') {
        setTimeout(() => {
          processCpuTurn()
        }, 500)
      }
    }
  }, 100)
}

function onDrawModalClose() {
  // 流局モーダルを閉じた後、結果表示ボタンを表示
  showDrawResultButtons.value = gameManager.value.gamePhase === 'finished'
}

// ゲーム終了関連のハンドラー
function onBackToHome() {
  // ゲーム終了時の記録（上がりなし）
  gameManager.value.recordGameEnd()
  router.push('/')
}

function onRematch() {
  showGameEndModal.value = false
  gameManager.value.resetGame()
  
  // 新しいゲーム開始
  setTimeout(() => {
    gameManager.value.startNewGame()
    
    setTimeout(() => {
      if (gameManager.value.gamePhase === 'playing') {
        gameManager.value.drawTileAndKeepSeparate(currentPlayerIndex.value)
        
        // CPUプレイヤーの場合は自動的にターンを開始
        if (players.value[currentPlayerIndex.value].type === 'cpu') {
          setTimeout(() => {
            processCpuTurn()
          }, 500)
        }
      }
    }, 100)
  }, 100)
}

function onGameEndModalClose() {
  // ゲーム終了モーダルを閉じるだけ
}

// 流局判定
function checkForDraw() {
  if (gameManager.value.gamePhase !== 'playing') {
    return
  }
  
  const drawCheck = gameManager.value.checkDraw()
  if (drawCheck.isDraw) {
    drawModalData.value = drawCheck.drawData
    showDrawModal.value = true
    gameManager.value.gamePhase = 'finished'
  }
}

async function checkCpuRon(discardPlayerIndex: number): Promise<boolean> {
  if (!gameManager.value.lastDiscardedTile) {
    return false
  }

  const lastDiscardedTile = gameManager.value.lastDiscardedTile
  const doraIndicators = gameManager.value.doraIndicators
  
  // 捨て牌を出したプレイヤー以外の全プレイヤーをチェック（人間プレイヤーは除く）  
  for (let i = 1; i <= 3; i++) {
    if (i === discardPlayerIndex) continue // 捨てたプレイヤー自身はスキップ
    
    const player = players.value[i]
    if (player.type !== 'cpu') continue
    
    const ai = cpuAIs[i as 1 | 2 | 3]
    if (!ai) continue
    
    // CPUがロンできるかチェック
    if (ai.canRon(player, lastDiscardedTile, doraIndicators)) {
      // CPUがロンするかどうかを決定（難易度に応じた確率）
      if (ai.shouldDeclareRon(player, lastDiscardedTile, doraIndicators)) {
        // CPUのロン処理を実行
        await handleCpuRon(i, discardPlayerIndex, lastDiscardedTile)
        return true
      }
    }
  }
  
  return false
}

async function handleCpuRon(winnerIndex: number, loserIndex: number, winTile: any) {
  const winner = players.value[winnerIndex]
  
  // ロン判定と得点計算
  const winResult = gameManager.value.checkWinConditionForPlayer(winnerIndex, winTile, false, true)
  
  if (winResult.isWin && winResult.result) {
    // 実際の上がり確定時に一発フラグをリセット
    gameManager.value.checkWinConditionForPlayer(winnerIndex, winTile, false, true)
    
    winModalData.value = {
      winner: winner,
      winningHand: [...winner.tiles, winTile],
      winningTile: winTile,
      isTsumo: false,
      basePoints: winResult.result.basePoints,
      totalPoints: winResult.result.totalPoints,
      paymentInfo: winResult.result.paymentInfo,
      yaku: winResult.result.yaku,
      totalHan: winResult.result.totalHan,
      fu: winResult.result.fu,
      yakuman: winResult.result.yakuman,
      doraIndicators: doraIndicators.value,
      doraCount: winResult.result.doraCount,
      uradoraIndicators: winner.riichi && gameManager.value.wall.length >= 2 ? [gameManager.value.wall[gameManager.value.wall.length - 2]] : [],
      uradoraCount: winResult.result.uradoraCount
    }
    
    // 供託分を加算
    gameManager.value.applyKyotakuToWinner(winnerIndex)
    
    // 点数移動を実行（ロン）
    gameManager.value.executeScoreTransfer(
      winnerIndex, // winner index
      winResult.result.paymentInfo,
      winResult.result.totalPoints,
      false, // isTsumo
      loserIndex // ron target (放銃者)
    )
    
    // ゲーム状態を終了に変更
    gameManager.value.gamePhase = 'finished'
    showWinModal.value = true
  }
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
        gameManager.value.drawTileAndKeepSeparate(currentPlayerIndex.value)
      }
    }, 100)
  }
})

watch(() => currentPlayerIndex.value, async (newIndex) => {
  if (gamePhase.value === 'playing') {
    // プレイヤーの手牌が適切な枚数でない場合はツモを行わない
    const player = players.value[newIndex]
    
    // 鳴き牌を考慮した枚数計算
    const meldTileCount = player.melds.reduce((count, meld) => {
      return count + meld.tiles.length
    }, 0)
    const expectedHandTiles = 13 - meldTileCount
    
    if (player.tiles.length !== expectedHandTiles) {
      return
    }
    
    // すべてのプレイヤーはdrawTileAndKeepSeparateを使用
    // （super CPUの場合は内部で有効牌処理が行われる）
    const drawnTile = gameManager.value.drawTileAndKeepSeparate(newIndex)
    
    // ツモが成功しなかった場合（山が空など）は流局判定
    if (!drawnTile) {
      checkForDraw()
      return
    }
    
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

.remaining-tiles {
  font-size: 1.2rem;
  font-weight: bold;
  color: rgba(0, 0, 0, 0.5);
  margin-top: 8px;
  padding: 4px 8px;
  border-radius: 4px;
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