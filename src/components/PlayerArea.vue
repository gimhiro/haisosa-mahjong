<template>
  <div :class="playerAreaClasses">
    <!-- プレイヤー情報 -->
    <div class="player-info">
      <div class="player-name">
        <v-chip 
          :color="isDealer ? 'red' : 'primary'"
          size="small"
          :variant="isCurrent ? 'flat' : 'outlined'"
        >
          {{ windText }}家 {{ player.name }}
        </v-chip>
        <v-btn
          v-if="isCpuPlayer"
          size="x-small"
          color="primary"
          variant="text"
          class="ml-1 cpu-toggle-btn"
          @click="emit('toggleCpuTiles')"
        >
          {{ cpuTilesVisible ? '隠す' : '表示' }}
        </v-btn>
        <v-chip 
          v-if="player.riichi"
          color="orange"
          size="x-small"
          class="ml-1"
        >
          リーチ
        </v-chip>
        <v-chip 
          v-if="shantenInfo && showTiles"
          :color="shantenInfo.color"
          size="x-small"
          class="ml-1"
        >
          {{ shantenInfo.text }}
        </v-chip>
      </div>
      <div class="player-score">{{ player.score.toLocaleString() }}点</div>
    </div>

    <!-- 手牌エリア -->
    <div v-if="showTiles" class="hand-area">
      <div :class="handTilesClasses">
        <MahjongTile
          v-for="tile in player.tiles"
          :key="tile.id"
          :tile="tile"
          :size="tileSize"
          :is-draggable="isCurrent && showTiles && position === 'bottom'"
          :is-dora="checkIsDora(tile)"
          @click="onTileClick"
        />
        
        <!-- ツモ牌 -->
        <div v-if="drawnTile" :class="drawnTileClasses">
          <MahjongTile
            :tile="drawnTile"
            :size="tileSize"
            :is-draggable="isCurrent && showTiles && position === 'bottom'"
            :is-dora="checkIsDora(drawnTile)"
            @click="onTileClick"
          />
        </div>
      </div>
      
    </div>
    
    <!-- CPU手牌（裏面表示） -->
    <div v-else class="cpu-hand">
      <div :class="handTilesClasses">
        <!-- 手牌の裏面 -->
        <div 
          v-for="n in player.tiles.length"
          :key="'tile-' + n"
          :class="tileBackClasses"
        ></div>
        
        <!-- ツモ牌の裏面 -->
        <div v-if="drawnTile" :class="drawnTileBackClasses">
          <div :class="tileBackClasses"></div>
        </div>
      </div>
    </div>


    <!-- 鳴きエリア -->
    <div v-if="player.melds.length > 0" class="melds-area">
      <div 
        v-for="(meld, index) in player.melds"
        :key="index"
        class="meld-group"
      >
        <MahjongTile
          v-for="tile in meld"
          :key="tile.id"
          :tile="tile"
          size="small"
          :is-draggable="false"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Player } from '../stores/fourPlayerMahjong'
import type { Tile } from '../stores/fourPlayerMahjong'
import type { GameManager } from '../utils/game-manager'
import MahjongTile from './MahjongTile.vue'

interface Props {
  player: Player
  isCurrent: boolean
  position: 'top' | 'right' | 'bottom' | 'left'
  showTiles?: boolean
  drawnTile?: Tile | null
  isDealer?: boolean
  shantenInfo?: {
    text: string
    color: string
  }
  gameManager?: { value: GameManager }
  cpuTilesVisible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showTiles: false,
  drawnTile: null,
  isDealer: false,
  shantenInfo: undefined,
  gameManager: undefined,
  cpuTilesVisible: false
})

const emit = defineEmits<{
  tileDiscarded: [tileId: string]
  toggleCpuTiles: []
}>()

const playerAreaClasses = computed(() => [
  'player-area',
  `position-${props.position}`,
  {
    'current-turn': props.isCurrent,
    'show-tiles': props.showTiles
  }
])

const tileSize = computed(() => {
  // 画面サイズに応じて調整
  if (props.position === 'bottom') {
    // 13枚が横に並ぶようにサイズを調整
    return window.innerWidth < 768 ? 'small' : 'medium'
  }
  return 'small'
})

const tileBackClasses = computed(() => [
  'tile-back',
  `tile-back-${props.position}`
])

const windText = computed(() => {
  const windMap = {
    east: '東',
    south: '南', 
    west: '西',
    north: '北'
  }
  return windMap[props.player.wind]
})

const handTilesClasses = computed(() => [
  'hand-tiles',
  `hand-tiles-${props.position}`
])

const drawnTileClasses = computed(() => [
  'drawn-tile',
  `drawn-tile-${props.position}`
])

const drawnTileBackClasses = computed(() => [
  'drawn-tile',
  `drawn-tile-${props.position}`
])

const isCpuPlayer = computed(() => props.player.type === 'cpu')


function checkIsDora(tile: Tile): boolean {
  if (!props.gameManager?.value) {
    return false
  }
  
  return props.gameManager.value.isDoraTile(tile)
}

function onTileClick(tile: Tile) {
  console.log('PlayerArea onTileClick called:', {
    tile: tile,
    isCurrent: props.isCurrent,
    showTiles: props.showTiles,
    position: props.position
  })
  
  if (props.isCurrent && props.showTiles) {
    console.log('Emitting tileDiscarded event with tileId:', tile.id)
    emit('tileDiscarded', tile.id)
  } else {
    console.log('Tile click ignored - conditions not met')
  }
}
</script>

<style scoped>
.player-area {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 6px;
  padding: 4px;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.current-turn {
  border-color: #1976d2;
  background: rgba(25, 118, 210, 0.1);
  box-shadow: 0 0 12px rgba(25, 118, 210, 0.3);
}

.player-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  flex-shrink: 0;
}

.player-name {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.cpu-toggle-btn {
  font-size: 10px !important;
  min-width: 30px !important;
  height: 18px !important;
  padding: 0 4px !important;
}

.player-score {
  font-size: 0.8rem;
  color: #666;
  font-weight: 500;
}

/* 位置別レイアウト */
.position-bottom {
  flex-direction: column;
}

.position-top {
  flex-direction: column;
  justify-content: flex-end;
}

.position-left {
  flex-direction: column;
  justify-content: center;
}

.position-left .player-info {
  flex-direction: column;
  margin-bottom: 8px;
  text-align: center;
}

.position-right {
  flex-direction: column;
  justify-content: center;
}

.position-right .player-info {
  flex-direction: column;
  margin-bottom: 8px;
  text-align: center;
}

/* 手牌エリア */
.hand-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* 基本手牌スタイル */
.hand-tiles {
  display: flex;
  gap: 0px;
  flex-wrap: nowrap;
  justify-content: center;
  overflow: auto;
}

/* 位置別の手牌スタイル */
.hand-tiles-bottom {
  flex-direction: row;
  width: 100%;
}

.hand-tiles-top {
  flex-direction: row;
  transform: rotate(180deg);
  margin-bottom: -15%;
}

.hand-tiles-left {
  flex-direction: column;
  height: 100%;
  align-items: center;
  gap: 0;
  margin-top: -15%;
}

.hand-tiles-left .mahjong-tile,
.hand-tiles-left .tile-back {
  transform: rotate(90deg);
  margin: -2.5% 0;
}

.hand-tiles-right {
  flex-direction: column;
  height: 100%;
  align-items: center;
  gap: 0;
  margin-top: -15%;
}

.hand-tiles-right .mahjong-tile,
.hand-tiles-right .tile-back {
  transform: rotate(-90deg);
  margin: -2.5% 0;
}

/* ツモ牌スタイル */
.drawn-tile {
  margin-left: 8px;
  padding-left: 8px;
  border-left: 2px solid #ccc;
}

.drawn-tile-top {
  transform: rotate(180deg);
}

.drawn-tile-left {
  margin-top: 8px;
  margin-left: 0;
  padding-top: 8px;
  padding-left: 0;
  border-left: none;
  border-top: 2px solid #ccc;
}

.drawn-tile-right {
  margin-top: 8px;
  margin-left: 0;
  padding-top: 8px;
  padding-left: 0;
  border-left: none;
  border-top: 2px solid #ccc;
}


/* CPU手牌 */
.cpu-hand {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tile-back {
  background: linear-gradient(135deg, #4a5568 0%, #2d3748 100%);
  border: 1px solid #1a202c;
  border-radius: 2px;
  margin: 1px;
  transition: all 0.2s ease;
}

/* 位置別の牌裏面サイズ */
.position-bottom .tile-back {
  width: clamp(32px, 4.5vw, 45px);
  height: clamp(45px, 6.3vw, 63px);
}

.position-top .tile-back {
  width: clamp(24px, 3vw, 35px);
  height: clamp(33px, 4.2vw, 49px);
}

.position-left .tile-back,
.position-right .tile-back {
  width: clamp(24px, 3vw, 35px);
  height: clamp(33px, 4.2vw, 49px);
}


/* 鳴きエリア */
.melds-area {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.meld-group {
  display: flex;
  gap: 1px;
  padding: 2px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.8);
}

/* レスポンシブ対応 */
@media (max-width: 1024px) {
  .player-area {
    padding: 4px;
  }
  
  .player-info {
    font-size: 0.8rem;
  }
  
  .hand-tiles {
    gap: 1px;
  }
  
}

@media (max-width: 768px) {
  .player-area {
    padding: 2px;
  }
  
  .tile-back {
    width: 12px;
    height: 16px;
  }
}
</style>