<template>
  <div :class="discardAreaClasses">
    <div class="discard-rows">
      <div v-for="rowIndex in maxRows" :key="rowIndex" class="discard-row">
        <MahjongTile
          v-for="tile in getDiscardRowFixed(rowIndex - 1)"
          :key="tile.id"
          :tile="tile"
          size="small"
          :is-draggable="false"
          :is-dora="checkIsDora(tile)"
          :is-tsumo-discard="tile.isTsumoDiscard || false"
          class="discard-tile"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Tile } from '../stores/fourPlayerMahjong'
import type { GameManager } from '../utils/game-manager'
import MahjongTile from './MahjongTile.vue'

interface Props {
  playerIndex: number
  getPlayerDiscardRow: (playerIndex: number, rowIndex: number) => Tile[]
  gameManager?: { value: GameManager }
}

const props = defineProps<Props>()

const discardAreaClasses = computed(() => [
  'player-discards'
])

// 全ての捨て牌を取得
const allDiscards = computed(() => {
  const allTiles: Tile[] = []
  // 最大4段×6枚＝24枚まで取得
  for (let row = 0; row < 4; row++) {
    const rowTiles = props.getPlayerDiscardRow(props.playerIndex, row)
    allTiles.push(...rowTiles)
  }
  return allTiles
})

// 必要な段数を計算
const maxRows = computed(() => {
  const tilesCount = allDiscards.value.length
  if (tilesCount === 0) return 1
  if (tilesCount <= 6) return 1
  return Math.ceil((tilesCount - 6) / 6) + 1
})

function checkIsDora(tile: Tile): boolean {
  if (!props.gameManager?.value) {
    return false
  }
  
  return props.gameManager.value.isDoraTile(tile)
}

// 固定レイアウトで行を取得
function getDiscardRowFixed(rowIndex: number): Tile[] {
  const tiles = allDiscards.value
  
  if (rowIndex === 0) {
    // 1段目: 最初の6枚
    return tiles.slice(0, 6)
  } else {
    // 2段目以降: 6枚ずつ
    const startIndex = 6 + (rowIndex - 1) * 6
    const endIndex = startIndex + 6
    return tiles.slice(startIndex, endIndex)
  }
}
</script>

<style scoped>
.player-discards {
  position: absolute;
  transform-origin: center;
}

.discard-rows {
  display: flex;
  flex-direction: column;
  gap: 0px;
  align-items: flex-start;
  justify-content: flex-start;
}

.discard-row {
  display: flex;
  gap: 0px;
  justify-content: flex-start;
}

.discard-tile {
  transition: all 0.3s ease;
}
</style>