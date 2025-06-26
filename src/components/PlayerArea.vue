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
          :disabled="(isRiichiPreviewMode || player.riichi) && riichiDisabledTiles.includes(tile.id)"
          @click="onTileClick"
        />
        
        <!-- ツモ牌エリア（常に表示） -->
        <div :class="drawnTileClasses">
          <MahjongTile
            v-if="drawnTile"
            :tile="drawnTile"
            :size="tileSize"
            :is-draggable="isCurrent && showTiles && position === 'bottom'"
            :is-dora="checkIsDora(drawnTile)"
            :disabled="(isRiichiPreviewMode || player.riichi) && riichiDisabledTiles.includes(drawnTile.id)"
            @click="onTileClick"
          />
          <div
            v-else
            class="empty-drawn-tile"
            :style="{ 
              width: getTileSize().width, 
              height: getTileSize().height
            }"
          ></div>
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
        
        <!-- ツモ牌の裏面（常に表示） -->
        <div :class="drawnTileBackClasses">
          <div
            v-if="drawnTile"
            :class="tileBackClasses"
          ></div>
          <div
            v-else
            class="empty-drawn-tile"
            :style="{ 
              width: getTileSize().width, 
              height: getTileSize().height
            }"
          ></div>
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
  gameManager?: GameManager
  cpuTilesVisible?: boolean
  isRiichiPreviewMode?: boolean
  riichiDisabledTiles?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  showTiles: false,
  drawnTile: null,
  isDealer: false,
  shantenInfo: undefined,
  gameManager: undefined,
  cpuTilesVisible: false,
  isRiichiPreviewMode: false,
  riichiDisabledTiles: () => []
})

const emit = defineEmits<{
  tileDiscarded: [tileId: string]
  riichiConfirmed: [tileId: string]
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
  if (!props.gameManager) {
    return false
  }
  
  const isDora = props.gameManager.isDoraTile(tile)
  if (isDora) {
  }
  
  return isDora
}

function getTileSize() {
  // タイルサイズをposition に応じて決定
  switch (props.position) {
    case 'bottom':
      return { width: '48px', height: '64px' }
    case 'top':
    case 'left':
    case 'right':
      return { width: '36px', height: '48px' }
    default:
      return { width: '48px', height: '64px' }
  }
}

function onTileClick(tile: Tile) {
  console.log('PlayerArea onTileClick:', tile.id, 'player riichi:', props.player.riichi, 'isCurrent:', props.isCurrent, 'isRiichiPreviewMode:', props.isRiichiPreviewMode)
  if (props.isCurrent && props.showTiles) {
    if (props.isRiichiPreviewMode) {
      console.log('Emitting riichiConfirmed for tile:', tile.id)
      emit('riichiConfirmed', tile.id)
    } else {
      console.log('Emitting tileDiscarded for tile:', tile.id)
      emit('tileDiscarded', tile.id)
    }
  } 
}
</script>

<style scoped>
.player-area {
  display: flex;
  flex-direction: column;
  height: 100%;
  /* background: transparent; */
  background: rgba(255, 255, 255, 0.7);
  border-radius: 6px;
  padding: 4px;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.current-turn {
  border-color: #1976d2;
  background: rgba(25, 118, 210, 0.05);
  box-shadow: 0 0 8px rgba(25, 118, 210, 0.2);
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
  font-size: 12px !important;
  min-width: 50px !important;
  height: 28px !important;
  padding: 0 8px !important;
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
  justify-content: flex-start;
}

.position-left .player-info {
  flex-direction: column;
  margin-bottom: 8px;
  text-align: center;
}

.position-right {
  flex-direction: column;
  justify-content: flex-start;
}

.position-right .player-info {
  flex-direction: column;
  margin-bottom: 8px;
  text-align: center;
}

/* 上側プレイヤー: 手牌エリアを下面に合わせ、player-infoをその真上に */

.position-top .player-info {
  order: 2; /* player-infoを後に配置 */
  margin-bottom: 0;
  margin-top: 4px;
}

.position-top .hand-area,
.position-top .cpu-hand {
  order: 1; /* 手牌エリアを先に配置（下面） */
  transform: translateY(10%);
}

/* 左右プレイヤー: player-infoを上面に合わせる */
.position-left,
.position-right {
  justify-content: flex-start;
}

.position-left .player-info,
.position-right .player-info {
  order: 1; /* player-infoを最初に配置（上面） */
  margin-bottom: 4px;
  margin-top: 0;
}

.position-left .hand-area,
.position-left .cpu-hand,
.position-right .hand-area,
.position-right .cpu-hand {
  order: 2; /* 手牌エリアを後に配置 */
  transform: translateY(10%);
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
  margin: -2% 0;
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
  margin: -2% 0;
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


/* 空のツモ牌エリア */
.empty-drawn-tile {
  opacity: 0;
  pointer-events: none;
  background: transparent;
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