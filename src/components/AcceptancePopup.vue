<template>
  <Teleport to="body">
    <div v-if="show && (tileAcceptanceInfo || isCalculating)"
      :class="['acceptance-popup-overlay', { 'fixed-position': isFixedPosition }]" :style="isFixedPosition ? {
        top: `${mouseY}px`,
        left: `${mouseX}px`
      } : {
        top: `${mouseY - 20}px`,
        left: `${mouseX + 10}px`
      }" @click="logDebugInfo">
      <v-card class="acceptance-popup-card">
        <v-card-text class="pa-3">
          <!-- ローディング表示 -->
          <div v-if="isCalculating" class="acceptance-loading">
            <v-progress-circular indeterminate size="20" width="2" color="primary" />
            <span class="loading-text">計算中...</span>
          </div>

          <!-- 受け入れ情報なし -->
          <div v-else-if="!tileAcceptanceInfo" class="text-center">
            受け入れ情報なし
          </div>

          <!-- 受け入れ情報表示 -->
          <div v-else class="acceptance-tooltip">
            <div class="tooltip-header">
              <div class="discard-tile-small">
                <MahjongTile :tile="tileAcceptanceInfo.tile" size="small" :is-draggable="false" />
                <span class="tile-name">{{ getTileText(tileAcceptanceInfo.tile) }}</span>
              </div>
              <div class="total-acceptance">
                {{ getAcceptanceLabel() }}: {{ tileAcceptanceInfo.totalAcceptance }}枚
                <div class="shanten-info">
                  シャンテン: {{ tileAcceptanceInfo.shantenAfterDiscard }}
                </div>
              </div>
            </div>

            <div class="acceptance-tiles">
              <div v-for="(tileIndex, idx) in tileAcceptanceInfo.acceptanceTiles" :key="idx"
                class="acceptance-tile-item">
                <MahjongTile :tile="createTileFromIndex(tileIndex, `tooltip_${idx}`)" size="small"
                  :is-draggable="false" />
                <div class="remaining-count">
                  {{ tileAcceptanceInfo.remainingCounts[idx] }}枚
                </div>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import MahjongTile from './MahjongTile.vue'
import { getTileText } from '../utils/tile-renderer'
import { createTileFromIndex, type AcceptanceInfo } from '../utils/mahjong-logic'

interface Props {
  modelValue: boolean
  tileAcceptanceInfo: AcceptanceInfo | null
  mouseX?: number
  mouseY?: number
  isUsefulTiles?: boolean // 有効牌表示かどうか
  isCalculating?: boolean // 計算中かどうか
  isFixedPosition?: boolean // 固定位置表示かどうか
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  mouseX: 0,
  mouseY: 0,
  isUsefulTiles: false,
  isCalculating: false,
  isFixedPosition: true
})
const emit = defineEmits<Emits>()

const show = computed({
  get: () => {
    return props.modelValue
  },
  set: (value) => emit('update:modelValue', value)
})

function getAcceptanceLabel(): string {
  return props.isUsefulTiles ? '有効牌' : '受け入れ'
}

function logDebugInfo() {
  // デバッグ情報のログ出力（削除済み）
}

// propsの変更を監視
watch(() => props.modelValue, () => {
  // modelValue変更の監視（ログ出力削除済み）
})

watch(() => props.tileAcceptanceInfo, () => {
  // tileAcceptanceInfo変更の監視（ログ出力削除済み）
})
</script>

<style scoped>
.acceptance-popup-overlay {
  position: fixed;
  pointer-events: none;
  z-index: 9999;
  max-width: 400px;
}

.acceptance-popup-overlay.fixed-position {
  position: fixed;
  /* 動的に設定される位置を使用 */
}

.acceptance-popup-card {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
}

.acceptance-tooltip {
  min-width: 200px;
}

.tooltip-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.discard-tile-small {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tile-name {
  font-size: 12px;
  font-weight: bold;
}

.total-acceptance {
  font-weight: bold;
  color: #1976d2;
  font-size: 12px;
  text-align: right;
}

.shanten-info {
  font-size: 10px;
  color: #666;
  margin-top: 2px;
}

.acceptance-tiles {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
}

.acceptance-tile-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.remaining-count {
  font-size: 10px;
  font-weight: bold;
  text-align: center;
  color: #666;
}

.acceptance-loading {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  padding: 12px;
  min-width: 120px;
}

.loading-text {
  font-size: 12px;
  color: #666;
}
</style>