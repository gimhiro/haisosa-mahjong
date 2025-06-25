<template>
  <div class="mahjong-hand">
    <div class="hand-tiles">
      <draggable
        v-model="handTiles"
        :disabled="!isDraggable"
        item-key="id"
        class="tile-container"
        ghost-class="tile-ghost"
        chosen-class="tile-chosen"
        drag-class="tile-drag"
        @start="onDragStart"
        @end="onDragEnd"
      >
        <template #item="{ element: tile, index }">
          <MahjongTile
            :tile="tile"
            :is-selected="selectedTileIds.includes(tile.id)"
            :is-draggable="isDraggable"
            size="medium"
            @click="onTileClick"
            @select="onTileSelect"
          />
        </template>
      </draggable>
      
      <!-- ツモ牌 -->
      <div v-if="drawnTile" class="drawn-tile">
        <MahjongTile
          :tile="drawnTile"
          :is-selected="selectedTileIds.includes(drawnTile.id)"
          size="medium"
          @click="onTileClick"
        />
      </div>
    </div>
    
    <!-- 手牌情報 -->
    <div class="hand-info">
      <div class="tile-count">手牌: {{ handTiles.length }}枚</div>
      <div v-if="shanten >= 0" class="shanten-display">
        シャンテン: {{ shanten }}
      </div>
      <div v-if="usefulTiles.length > 0" class="useful-tiles">
        有効牌: {{ usefulTilesText }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { VueDraggableNext as draggable } from 'vue-draggable-next'
import MahjongTile from './MahjongTile.vue'
import type { Tile } from '../stores/mahjong'
import { calculateShanten, getUsefulTiles, createTileFromIndex } from '../utils/mahjong-logic'

interface Props {
  tiles: Tile[]
  drawnTile?: Tile | null
  isDraggable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  drawnTile: null,
  isDraggable: true
})

const emit = defineEmits<{
  tilesChanged: [tiles: Tile[]]
  tileSelected: [tile: Tile]
  tileDiscarded: [tile: Tile]
  dragStart: [tile: Tile]
  dragEnd: [tile: Tile]
}>()

const selectedTileIds = ref<string[]>([])

const handTiles = computed({
  get: () => props.tiles,
  set: (newTiles: Tile[]) => {
    emit('tilesChanged', newTiles)
  }
})

const shanten = computed(() => {
  const allTiles = props.drawnTile 
    ? [...props.tiles, props.drawnTile]
    : props.tiles
  return calculateShanten(allTiles)
})

const usefulTiles = computed(() => {
  const allTiles = props.drawnTile 
    ? [...props.tiles, props.drawnTile]
    : props.tiles
  return getUsefulTiles(allTiles)
})

const usefulTilesText = computed(() => {
  return usefulTiles.value
    .map(index => {
      const tile = createTileFromIndex(index, 'temp')
      return `${tile.suit}${tile.rank}`
    })
    .join(', ')
})

function onTileClick(tile: Tile) {
  const isSelected = selectedTileIds.value.includes(tile.id)
  
  if (isSelected) {
    // 選択解除または切る
    selectedTileIds.value = selectedTileIds.value.filter(id => id !== tile.id)
    emit('tileDiscarded', tile)
  } else {
    // 選択
    selectedTileIds.value = [tile.id] // 単一選択
    emit('tileSelected', tile)
  }
}

function onTileSelect(tile: Tile) {
  emit('tileSelected', tile)
}

function onDragStart(event: any) {
  const tile = event.item.__draggable_context__.element
  emit('dragStart', tile)
}

function onDragEnd(event: any) {
  const tile = event.item.__draggable_context__.element
  emit('dragEnd', tile)
}

function clearSelection() {
  selectedTileIds.value = []
}

defineExpose({
  clearSelection
})
</script>

<style scoped>
.mahjong-hand {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 16px;
}

.hand-tiles {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

.tile-container {
  display: flex;
  gap: 2px;
  align-items: center;
}

.drawn-tile {
  margin-left: 16px;
  padding-left: 16px;
  border-left: 2px solid #ccc;
}

.hand-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-height: 60px;
}

.tile-count {
  font-size: 14px;
  color: #666;
}

.shanten-display {
  font-size: 16px;
  font-weight: bold;
  color: #1976d2;
}

.useful-tiles {
  font-size: 12px;
  color: #666;
  text-align: center;
  background: #f5f5f5;
  padding: 4px 8px;
  border-radius: 4px;
  max-width: 300px;
}

/* ドラッグ状態のスタイル */
.tile-ghost {
  opacity: 0.5;
}

.tile-chosen {
  transform: rotate(5deg);
}

.tile-drag {
  transform: rotate(10deg);
  z-index: 1000;
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .mahjong-hand {
    padding: 8px;
  }
  
  .hand-tiles {
    gap: 4px;
  }
  
  .drawn-tile {
    margin-left: 8px;
    padding-left: 8px;
  }
  
  .useful-tiles {
    font-size: 11px;
    max-width: 250px;
  }
}
</style>