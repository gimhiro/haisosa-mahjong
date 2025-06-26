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
          :is-riichi-declaration="!!tile.isRiichiDeclaration"
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
  gameManager?: GameManager
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
  if (!props.gameManager) {
    return false
  }
  
  const isDora = props.gameManager.isDoraTile(tile)
  
  return isDora
}

// 固定レイアウトで行を取得
function getDiscardRowFixed(rowIndex: number): Tile[] {
  const tiles = allDiscards.value
  const rowTiles = tiles.slice(rowIndex * 6, (rowIndex + 1) * 6)
  
  // リーチ宣言牌をログ出力
  rowTiles.forEach(tile => {
    if (tile.isRiichiDeclaration) {
    }
  })
  
  return rowTiles
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