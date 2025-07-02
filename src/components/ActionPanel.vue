<template>
  <v-card class="action-panel panel-scrollable">
    <v-card-title class="text-subtitle-2">アクション</v-card-title>
    <v-card-text class="action-content">
      <!-- ツモボタン -->
      <v-btn
        v-if="canTsumo"
        color="success"
        size="small"
        block
        class="action-btn"
        @click="$emit('declareTsumo')"
      >
        ツモ
      </v-btn>

      <!-- キャンセルボタン（ツモ可能時） -->
      <v-btn
        v-if="canTsumo && humanPlayerRiichi"
        color="grey"
        size="small"
        block
        class="action-btn"
        @click="$emit('cancelTsumo')"
      >
        キャンセル
      </v-btn>

      <!-- ロンボタン -->
      <v-btn
        v-if="canRon"
        color="error"
        size="small"
        block
        class="action-btn"
        @click="$emit('declareRon')"
      >
        ロン
      </v-btn>

      <!-- リーチボタン -->
      <v-btn
        v-if="canDeclareRiichi && isHumanTurn && currentDrawnTile && !humanPlayerRiichi"
        :color="riichiPreviewMode ? 'error' : 'warning'"
        size="small"
        block
        class="action-btn"
        @click="riichiPreviewMode ? $emit('toggleRiichiPreview') : $emit('declareRiichi')"
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
        @click="$emit('declarePon')"
      >
        ポン
      </v-btn>

      <!-- 明カンボタン -->
      <v-btn
        v-if="canKan"
        color="warning"
        size="small"
        block
        class="action-btn"
        @click="$emit('declareKan')"
      >
        カン
      </v-btn>

      <!-- 暗カンボタン -->
      <v-btn
        v-if="canAnkan"
        color="orange"
        size="small"
        block
        class="action-btn"
        @click="$emit('declareAnkan')"
      >
        暗カン
      </v-btn>

      <!-- チーボタン -->
      <v-btn
        v-if="canChi"
        color="primary"
        size="small"
        block
        class="action-btn"
        @click="$emit('declareChi')"
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
        @click="$emit('cancelActions')"
      >
        キャンセル
      </v-btn>

      <!-- 結果表示・次の局へボタン（モーダル閉じ後のみ） -->
      <v-btn
        v-if="showResultAndNextButtons && !showDrawResultButtons"
        color="info"
        size="x-small"
        block
        class="action-btn"
        @click="$emit('reopenWinModal')"
      >
        結果表示
      </v-btn>

      <v-btn
        v-if="showResultAndNextButtons && !showDrawResultButtons"
        color="primary"
        size="x-small"
        block
        class="action-btn"
        @click="$emit('onContinueGame')"
      >
        次の局へ
      </v-btn>

      <!-- 流局時のボタン -->
      <v-btn
        v-if="showDrawResultButtons"
        color="info"
        size="x-small"
        block
        class="action-btn"
        @click="$emit('reopenDrawModal')"
      >
        流局結果表示
      </v-btn>

      <v-btn
        v-if="showDrawResultButtons"
        color="primary"
        size="x-small"
        block
        class="action-btn"
        @click="$emit('onContinueFromDraw')"
      >
        次の局へ
      </v-btn>

      <!-- デバッグ情報 -->
      <div v-if="isHumanTurn && isDebugMode" class="debug-info" style="font-size: 0.7rem; color: #666; margin-top: 8px;">
        デバッグ: 手牌{{ humanPlayerTilesLength }}枚, ツモ牌: {{ currentDrawnTile ? 'あり' : 'なし' }}, リーチ可能: {{ canDeclareRiichi }}, シャンテン: {{ humanShanten }}<br>
        リーチ済み: {{ humanPlayerRiichi }}, 点数: {{ humanPlayerScore }}, ゲーム状態: {{ gamePhase }}<br>
        ツモ可能: {{ canTsumo }}, ロン可能: {{ canRon }}, 自分のターン: {{ isHumanTurn }}<br>
        手牌内容: {{ debugHandContent }}
      </div>

      <!-- 捨牌のヒント -->
      <div v-if="isHumanTurn && humanPlayerTilesLength === 13 && currentDrawnTile && !canTsumo && !canRon" class="discard-hint">
        <span v-if="humanPlayerRiichi && currentDrawnTile">
          <!-- リーチ中：ツモ牌のみ捨てることができます -->
        </span>
        <span v-else>
          <!-- 不要な牌をクリックして捨ててください -->
        </span>
      </div>
      
      <!-- スクロール領域を広げるための空白ブロック -->
      <div class="scroll-spacer"></div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
interface Props {
  canTsumo: boolean
  canRon: boolean
  canDeclareRiichi: boolean
  canPon: boolean
  canKan: boolean
  canAnkan: boolean
  canChi: boolean
  isHumanTurn: boolean
  currentDrawnTile: any
  humanPlayerRiichi: boolean
  riichiPreviewMode: boolean
  riichiButtonText: string
  showResultAndNextButtons: boolean
  showDrawResultButtons: boolean
  // デバッグ情報用
  isDebugMode?: boolean
  humanPlayerTilesLength?: number
  humanShanten?: number
  humanPlayerScore?: number
  gamePhase?: string
  debugHandContent?: string
}

defineProps<Props>()

defineEmits<{
  declareTsumo: []
  cancelTsumo: []
  declareRon: []
  declareRiichi: []
  toggleRiichiPreview: []
  declarePon: []
  declareKan: []
  declareAnkan: []
  declareChi: []
  cancelActions: []
  reopenWinModal: []
  onContinueGame: []
  reopenDrawModal: []
  onContinueFromDraw: []
}>()
</script>

<style scoped>
@import '@/styles/panel-common.css';

.action-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* スマホ横画面向けレスポンシブ対応 - アクションパネル専用 */
@media screen and (max-width: 1024px) and (max-height: 600px) and (orientation: landscape) {
  .action-content {
    min-height: 200px !important;
  }
}

.action-btn {
  font-size: 0.9rem;
}

/* ゲームアクションボタンのサイズ */
.action-btn.v-btn--size-small {
  max-height: 32px !important;
  padding: 0 12px !important;
}

/* 結果表示・次の局へボタンのサイズ */
.action-btn.v-btn--size-x-small {
  max-height: 28px !important;
  padding: 0 8px !important;
}

/* スマホ横画面向けレスポンシブ対応 */
@media screen and (max-width: 1024px) and (max-height: 600px) and (orientation: landscape) {
  .scroll-spacer {
    height: 400px;
  }
}

/* より小さいスマホ向け（高さ480px以下） */
@media screen and (max-width: 768px) and (max-height: 480px) and (orientation: landscape) {
  .scroll-spacer {
    height: 300px;
  }
}

/* PC表示でも適度な空白ブロックを表示（スクロール可能にするため） */
@media screen and (min-width: 1025px), screen and (min-height: 601px) {
  .scroll-spacer {
    height: 100px;
  }
}
</style>