<template>
  <div class="four-player-game">

    <!-- メインゲーム画面 -->
    <div class="game-table">
      <!-- ドラ表示エリア -->
      <div class="dora-area">
        <DoraPanel class="dora-panel" :dora-indicators="doraIndicators" />
      </div>

      <!-- ゲーム情報エリア -->
      <div class="game-info-area">
        <GameInfoPanel
          class="game-info-panel"
          :round="round"
          :wall-remaining="wallRemaining"
          :dealer="getDealerText()"
          :dealer-text="getDealerText()"
          :current-player="currentPlayer"
          :current-player-name="currentPlayer?.name || ''"
          :riichi-bets="gameManagerInstance?.kyotaku || 0"
          :honba="0"
          :kyotaku="gameManagerInstance?.kyotaku || 0"
          :dora-count="doraIndicators.length"
          :game-phase="gamePhase"
          :is-muted="isMuted"
          :east-wind="'東'"
          :south-wind="'南'"
          :west-wind="'西'"
          :north-wind="'北'"
          @toggle-mute="toggleMute"
        />
      </div>

      <!-- 上側プレイヤー（プレイヤー2） -->
      <div class="player-area player-top">
        <PlayerArea
          :player="players[2]"
          :is-current="currentPlayerIndex === 2"
          :position="'top'"
          :show-tiles="cpuTilesVisible[2]"
          :drawn-tile="currentPlayerIndex === 2 ? currentDrawnTile : null"
          :game-manager="gameManagerInstance"
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
          :game-manager="gameManagerInstance"
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
                :game-manager="gameManagerInstance"
              />
            </div>
            <div class="discard-area-right">
              <PlayerDiscardArea
                :player-index="1"
                :get-player-discard-row="getPlayerDiscardRow"
                :game-manager="gameManagerInstance"
              />
            </div>
            <div class="discard-area-top">
              <PlayerDiscardArea
                :player-index="2"
                :get-player-discard-row="getPlayerDiscardRow"
                :game-manager="gameManagerInstance"
              />
            </div>
            <div class="discard-area-left">
              <PlayerDiscardArea
                :player-index="3"
                :get-player-discard-row="getPlayerDiscardRow"
                :game-manager="gameManagerInstance"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 右側プレイヤー（プレイヤー1） -->
      <div class="player-area player-right">
        <PlayerArea
          :player="players[1]"
          :is-current="currentPlayerIndex === 1"
          :position="'right'"
          :show-tiles="cpuTilesVisible[1]"
          :drawn-tile="currentPlayerIndex === 1 ? currentDrawnTile : null"
          :game-manager="gameManagerInstance"
          :cpu-tiles-visible="cpuTilesVisible[1]"
          @toggle-cpu-tiles="toggleCpuTiles(1)"
        />
      </div>

      <!-- 下側プレイヤー（人間プレイヤー） -->
      <div class="player-area player-bottom">
        <PlayerArea
          :player="players[0]"
          :is-current="currentPlayerIndex === 0"
          :position="'bottom'"
          :show-tiles="true"
          :drawn-tile="currentPlayerIndex === 0 ? currentDrawnTile : null"
          :game-manager="gameManagerInstance"
          :is-riichi-preview-mode="riichiPreviewMode"
          :riichi-valid-tiles="getRiichiValidTiles()"
          :riichi-disabled-tiles="riichiPreviewMode ? getRiichiDisabledTiles() : getPostRiichiDisabledTiles()"
          :show-acceptance-highlight="settings.showAcceptanceHighlight"
          :best-acceptance-tiles="bestAcceptanceTiles"
          :show-acceptance-tooltip="settings.showAcceptance"
          :acceptance-infos="acceptanceInfos"
          @tile-discarded="onHumanTileDiscard"
          @riichi-confirmed="confirmRiichiAndDiscard"
          @tile-hover="onTileHover"
          @tile-leave="onTileLeave"
        />
      </div>

      <!-- 設定エリア -->
      <div class="settings-area">
        <GameSettingsPanel
          class="settings-panel"
          :game-manager="gameManagerInstance"
          @toggle-mute="toggleMute"
          @start-game="startGame"
          @reset-game="resetGame"
          @show-test-dialog="showTestDialog = true"
        />
      </div>

      <!-- アクションエリア -->
      <div class="action-area">
        <ActionPanel
          class="action-panel"
          :can-tsumo="canTsumo"
          :can-ron="canRon"
          :can-declare-riichi="canDeclareRiichi"
          :can-pon="canPon"
          :can-kan="canKan"
          :can-ankan="canAnkan"
          :can-chi="canChi"
          :riichi-preview-mode="riichiPreviewMode"
          :riichi-button-text="riichiButtonText"
          :shanten="humanShanten"
          :shanten-color="shantenColor"
          :shanten-text="shantenText"
          :is-human-turn="isHumanTurn"
          :human-player="humanPlayer"
          :current-drawn-tile="currentDrawnTile"
          :human-player-riichi="humanPlayer?.riichi || false"
          :show-result-and-next-buttons="showResultAndNextButtons"
          :show-draw-result-buttons="showDrawResultButtons"
          @declare-tsumo="declareTsumo"
          @declare-ron="declareRon"
          @declare-riichi="declareRiichi"
          @toggle-riichi-preview="toggleRiichiPreview"
          @declare-pon="declarePon"
          @declare-kan="declareKan"
          @declare-ankan="declareAnkan"
          @declare-chi="declareChi"
          @cancel-actions="cancelActions"
          @cancel-tsumo="cancelTsumo"
          @reopen-win-modal="reopenWinModal"
          @on-continue-game="onContinueGame"
          @reopen-draw-modal="reopenDrawModal"
          @on-continue-from-draw="onContinueFromDraw"
        />
      </div>
    </div>

    <!-- モーダル -->
    <WinModal 
      v-model="showWinModal" 
      :win-data="winModalData"
      :show-result-and-next-buttons="showResultAndNextButtons"
      @close="onWinModalClose"
      @continue="onContinueGame"
      @new-game="onNewGame"
      @reopen="reopenWinModal"
    />

    <DrawModal 
      v-if="drawModalData"
      v-model="showDrawModal" 
      :draw-data="drawModalData"
      :show-draw-result-buttons="showDrawResultButtons"
      @close="onDrawModalClose"
      @continue="onContinueFromDraw"
      @new-game="onNewGame"
      @reopen="reopenDrawModal"
    />

    <GameEndModal 
      v-if="gameEndModalData"
      v-model="showGameEndModal" 
      :game-end-data="gameEndModalData"
      @close="onGameEndModalClose"
      @back-to-home="onBackToHome"
      @rematch="onRematch"
    />

    <!-- テストモードダイアログ -->
    <TestModeDialog
      v-model="showTestDialog"
      :game-manager="gameManager"
      @close="showTestDialog = false"
      @apply="onTestModeApplied"
    />

    <!-- 受け入れ情報ポップアップ -->
    <AcceptancePopup
      v-model="showAcceptancePopup"
      :tile-acceptance-info="currentHoveredTileAcceptance"
      :mouse-x="mouseX"
      :mouse-y="mouseY"
      :is-useful-tiles="isUsefulTilesMode"
      :is-calculating="isCalculatingAcceptance"
      :is-fixed-position="true"
    />
  </div>
</template>

<script setup lang="ts">
import PlayerArea from '../../components/PlayerArea.vue'
import PlayerDiscardArea from '../../components/PlayerDiscardArea.vue'
import WinModal from '../../components/WinModal.vue'
import DrawModal from '../../components/DrawModal.vue'
import GameEndModal from '../../components/GameEndModal.vue'
import GameSettingsPanel from '../../components/GameSettingsPanel.vue'
import GameInfoPanel from '../../components/GameInfoPanel.vue'
import ActionPanel from '../../components/ActionPanel.vue'
import DoraPanel from '../../components/DoraPanel.vue'
import TestModeDialog from '../../components/TestModeDialog.vue'
import AcceptancePopup from '../../components/AcceptancePopup.vue'
import { useFourPlayerGameView } from './script'

// Composition APIを使用してロジックを分離
const {
  // リアクティブ変数
  gameManagerInstance,
  cpuTilesVisible,
  riichiPreviewMode,
  showWinModal,
  winModalData,
  showDrawModal,
  drawModalData,
  showGameEndModal,
  gameEndModalData,
  showTestDialog,
  showAcceptancePopup,
  currentHoveredTileAcceptance,
  mouseX,
  mouseY,
  isUsefulTilesMode,
  isCalculatingAcceptance,
  showResultAndNextButtons,
  showDrawResultButtons,
  canPon,
  canKan,
  canAnkan,
  canChi,
  isMuted,
  acceptanceInfos,
  bestAcceptanceTiles,
  
  // computed properties
  players,
  gamePhase,
  currentPlayerIndex,
  currentDrawnTile,
  doraIndicators,
  round,
  currentPlayer,
  humanPlayer,
  wallRemaining,
  isHumanTurn,
  canDeclareRiichi,
  canTsumo,
  canRon,
  humanShanten,
  shantenColor,
  shantenText,
  riichiButtonText,
  
  // メソッド
  getDealerText,
  startGame,
  resetGame,
  toggleMute,
  onTestModeApplied,
  onHumanTileDiscard,
  toggleRiichiPreview,
  getRiichiValidTiles,
  getRiichiDisabledTiles,
  getPostRiichiDisabledTiles,
  confirmRiichiAndDiscard,
  declareRiichi,
  declareTsumo,
  declareRon,
  cancelRon,
  declarePon,
  declareKan,
  declareAnkan,
  declareChi,
  cancelActions,
  cancelTsumo,
  onContinueGame,
  onNewGame,
  onWinModalClose,
  reopenWinModal,
  reopenDrawModal,
  onContinueFromDraw,
  onDrawModalClose,
  onBackToHome,
  onRematch,
  onGameEndModalClose,
  getPlayerDiscardRow,
  toggleCpuTiles,
  onTileHover,
  onTileLeave,
  settings
} = useFourPlayerGameView()

// 互換性のためのアクセサ
const gameManager = gameManagerInstance

// 互換性チェック
const isGameReady = computed(() => {
  return gameManagerInstance && players.value && players.value.length > 0
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
    "settings bottom actions";
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

.settings-area {
  grid-area: settings;
  padding: 8px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  overflow: visible;
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
  padding: 4px 8px;
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

/* レスポンシブ対応 */
@media (max-width: 1024px) and (orientation: landscape) {
  .game-table {
    grid-template-rows: 20% 60% 20%;
    grid-template-columns: 20% 60% 20%;
    gap: 2px;
    padding: 2px;
  }
  
  .central-square {
    width: min(210px, 30vh, 30vw);
    height: min(210px, 30vh, 30vw);
  }
}

/* 河の文字を常に非表示 */
.center-label {
  display: none !important;
}

/* パネルスタイル */
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

.settings-panel {
  width: 100%;
  max-width: 280px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #9c27b0;
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
</style>