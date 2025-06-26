<template>
  <div
    :class="tileClasses"
    @click="handleClick"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    :aria-label="tileText"
    :aria-selected="props.isSelected"
    role="button"
    tabindex="0"
    :draggable="props.isDraggable"
  >
    <div class="tile-face">
      <img 
        :src="tileImageUrl"
        :alt="tileText"
        class="tile-image"
        @error="handleImageError"
        @load="handleImageLoad"
      />
      <div v-if="imageError" class="tile-error">
        {{ tileText }}
      </div>
      
      <!-- ドラマスク -->
      <div v-if="isDora" class="dora-mask" @click.stop>
      </div>
      
      <!-- ツモ切りマスク -->
      <div v-if="isTsumoDiscard" class="tsumo-discard-mask" @click.stop></div>
    </div>
    <div v-if="isSelected" class="selection-indicator"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Tile } from '../stores/fourPlayerMahjong'
import { getTileImageUrl, getTileText } from '../utils/tile-renderer'

interface Props {
  tile: Tile
  size?: 'small' | 'medium' | 'large'
  isSelected?: boolean
  isDraggable?: boolean
  isDiscarded?: boolean
  isBack?: boolean
  isWinningTile?: boolean
  isDora?: boolean
  isTsumoDiscard?: boolean
  isRiichiDeclaration?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  isSelected: false,
  isDraggable: true,
  isDiscarded: false,
  isBack: false,
  isWinningTile: false,
  isDora: false,
  isTsumoDiscard: false,
  isRiichiDeclaration: false,
  disabled: false
})

const emit = defineEmits<{
  click: [tile: Tile]
  select: [tile: Tile]
  dragStart: [tile: Tile]
  dragEnd: [tile: Tile]
}>()

const touchStartTime = ref(0)
const imageError = ref(false)

const tileClasses = computed(() => [
  'mahjong-tile',
  `tile-${props.size}`,
  {
    'tile-selected': props.isSelected,
    'tile-draggable': props.isDraggable && !props.disabled,
    'tile-discarded': props.isDiscarded,
    'tile-red': props.tile.isRed,
    'tile-winning': props.isWinningTile,
    'tile-riichi-declaration': props.isRiichiDeclaration,
    'tile-disabled': props.disabled
  }
])

const tileImageUrl = computed(() => {
  return getTileImageUrl(props.tile, { isBack: props.isBack })
})

const tileText = computed(() => {
  return getTileText(props.tile)
})


function handleImageError() {
  imageError.value = true
}

function handleImageLoad() {
  imageError.value = false
}

function handleClick() {
  if (props.disabled) {
    return
  }
  emit('click', props.tile)
}

function handleTouchStart() {
  touchStartTime.value = Date.now()
}

function handleTouchEnd() {
  if (props.disabled) {
    return
  }
  const touchDuration = Date.now() - touchStartTime.value
  if (touchDuration < 200) { // タップ判定
    emit('click', props.tile)
  }
}

function handleDragStart() {
  emit('dragStart', props.tile)
}

function handleDragEnd() {
  emit('dragEnd', props.tile)
}

function logDoraRender() {
  return ''
}
</script>

<style scoped>
.mahjong-tile {
  position: relative;
  display: inline-block;
  margin: 1px;
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
  width: clamp(28px, 4vw, 50px);
  height: clamp(39px, 5.6vw, 70px);
}

.tile-small {
  width: clamp(24px, 3vw, 35px);
  height: clamp(33px, 4.2vw, 49px);
}

.tile-medium {
  width: clamp(32px, 4.5vw, 45px);
  height: clamp(45px, 6.3vw, 63px);
}

.tile-large {
  width: clamp(40px, 5.5vw, 55px);
  height: clamp(56px, 7.7vw, 77px);
}

.tile-draggable:hover {
  transform: translateY(-2px) scale(var(--scale, 1));
  box-shadow: 2px 4px 8px rgba(0, 0, 0, 0.3);
}

.tile-selected {
  transform: translateY(-8px) scale(var(--scale, 1));
  box-shadow: 0 8px 16px rgba(0, 100, 200, 0.4);
  border: 2px solid #1976d2;
}

.tile-discarded {
  opacity: 0.7;
  transform: rotate(90deg) scale(0.9);
}

.tile-red {
  border-left: 3px solid #f44336;
}

.tile-face {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  position: relative;
}

.tile-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 2px;
}

.tile-error {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 12px;
  font-weight: bold;
  color: #333;
  background: #f5f5f5;
  border: 1px solid #ccc;
  border-radius: 2px;
}

.tile-winning {
  border: 3px solid #ffd700 !important;
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

.selection-indicator {
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border: 2px solid #1976d2;
  border-radius: 6px;
  pointer-events: none;
}

/* ドラマスク */
.dora-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  /* background: rgba(255, 215, 0, 0.4); */
  border: 2px solid gold;
  border-radius: 2px;
  pointer-events: none;
  z-index: 10;
  /* box-shadow: 0 0 6px rgba(255, 215, 0, 0.8); */
}

@keyframes dora-glow {
  from {
    background: rgba(255, 215, 0, 0.3);
    box-shadow: 0 0 6px rgba(255, 215, 0, 0.4);
  }
  to {
    background: rgba(255, 215, 0, 0.5);
    box-shadow: 0 0 12px rgba(255, 215, 0, 0.8);
  }
}

/* ツモ切りマスク */
.tsumo-discard-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(128, 128, 128, 0.4);
  border-radius: 2px;
  pointer-events: none;
  z-index: 9;
}

/* リーチ宣言牌（90度回転） */
.tile-riichi-declaration {
  transform: rotate(90deg) !important;
  transform-origin: center center !important;
  /* border: 2px solid #ff4444 !important; */
  /* box-shadow: 0 0 8px rgba(255, 68, 68, 0.6) !important; */
}

/* .tile-riichi-declaration .tile-face {
  border: 2px solid #ff4444 !important;
  box-shadow: 0 0 8px rgba(255, 68, 68, 0.6) !important;
} */

/* 無効化された牌のスタイル */
.tile-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  filter: grayscale(50%);
}

.tile-disabled:hover {
  transform: none !important;
  box-shadow: none !important;
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .mahjong-tile {
    margin: 1px;
  }
  
  .tile-small {
    --scale: 0.7;
  }
  
  .tile-medium {
    --scale: 0.9;
  }
  
  .tile-large {
    --scale: 1.1;
  }
}
</style>