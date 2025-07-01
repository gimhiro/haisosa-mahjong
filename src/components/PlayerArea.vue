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
          :is-acceptance-highlight="checkIsAcceptanceHighlight(tile)"
          :disabled="(isRiichiPreviewMode || player.riichi) && riichiDisabledTiles.includes(tile.id)"
          @click="onTileClick"
          @mouseenter="(event) => onTileHover(tile, event)"
          @mouseleave="onTileLeave"
        />
        
        <!-- ツモ牌エリア（常に表示） -->
        <div :class="drawnTileClasses">
          <MahjongTile
            v-if="drawnTile"
            :tile="drawnTile"
            :size="tileSize"
            :is-draggable="isCurrent && showTiles && position === 'bottom'"
            :is-dora="checkIsDora(drawnTile)"
            :is-acceptance-highlight="checkIsAcceptanceHighlight(drawnTile)"
            :disabled="(isRiichiPreviewMode || player.riichi) && drawnTile && riichiDisabledTiles.includes(drawnTile.id)"
            @click="onTileClick"
            @mouseenter="(event) => drawnTile && onTileHover(drawnTile, event)"
            @mouseleave="onTileLeave"
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
          v-for="(tile, tileIndex) in meld.tiles"
          :key="tile.id"
          :tile="tile"
          :size="tileSize"
          :is-draggable="false"
          :is-yoko="shouldTileBeYoko(meld, tileIndex)"
          :is-back="shouldTileBeBack(meld, tileIndex)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Player, Meld } from '../stores/fourPlayerMahjong'
import type { Tile } from '../stores/fourPlayerMahjong'
import type { GameManager } from '../utils/game-manager'
import { getTileIndex } from '../utils/mahjong-logic'
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
  showAcceptanceHighlight?: boolean
  bestAcceptanceTiles?: number[]
  showAcceptanceTooltip?: boolean
  acceptanceInfos?: Array<any>
}

const props = withDefaults(defineProps<Props>(), {
  showTiles: false,
  drawnTile: null,
  isDealer: false,
  shantenInfo: undefined,
  gameManager: undefined,
  cpuTilesVisible: false,
  isRiichiPreviewMode: false,
  riichiDisabledTiles: () => [],
  showAcceptanceHighlight: false,
  bestAcceptanceTiles: () => [],
  showAcceptanceTooltip: false,
  acceptanceInfos: () => []
})

const emit = defineEmits<{
  tileDiscarded: [tileId: string]
  riichiConfirmed: [tileId: string]
  toggleCpuTiles: []
  tileHover: [tile: Tile, mouseX: number, mouseY: number]
  tileLeave: []
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

function checkIsAcceptanceHighlight(tile: Tile): boolean {
  if (!props.showAcceptanceHighlight || !props.bestAcceptanceTiles) {
    return false
  }
  
  const tileIndex = getTileIndex(tile)
  return props.bestAcceptanceTiles.includes(tileIndex)
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
  if (props.isCurrent && props.showTiles) {
    if (props.isRiichiPreviewMode) {
      emit('riichiConfirmed', tile.id)
    } else {
      emit('tileDiscarded', tile.id)
    }
  } 
}

function onTileHover(tile: Tile, event?: any) {
  if (props.showAcceptanceTooltip && props.position === 'bottom') {
    const mouseX = event?.clientX || 0
    const mouseY = event?.clientY || 0
    emit('tileHover', tile, mouseX, mouseY)
  }
}

function onTileLeave() {
  if (props.showAcceptanceTooltip && props.position === 'bottom') {
    emit('tileLeave')
  }
}

function shouldTileBeYoko(meld: Meld, tileIndex: number): boolean {
  if (meld.type === 'chi') {
    // チーの場合、どのプレイヤーから鳴いたかに応じて横向きにする位置を決定
    // fromPlayer: 1=下家(右), 2=対面, 3=上家(左) from human player perspective
    switch (meld.fromPlayer) {
      case 1: // 右のプレイヤーからチー → 一番右の牌を横向き
        return tileIndex === meld.tiles.length - 1
      case 2: // 対面のプレイヤーからチー → 真ん中の牌を横向き
        return tileIndex === Math.floor(meld.tiles.length / 2)
      case 3: // 左のプレイヤーからチー → 一番左の牌を横向き
        return tileIndex === 0
      default:
        return false
    }
  } else if (meld.type === 'pon') {
    // ポンの場合、鳴いた牌を横向きにする
    const tile = meld.tiles[tileIndex]
    const isCalledTile = tile.id === meld.calledTile.id
    return isCalledTile
  } else if (meld.type === 'kan') {
    // カンの場合の横向き表示ルール
    if (meld.fromPlayer === 0) {
      // 暗槓の場合：横向きなし（1枚目と4枚目は裏向き）
      return false
    } else {
      // 明槓の場合：プレイヤーに応じて横向き位置を決定
      switch (meld.fromPlayer) {
        case 1: // 右からのミンカン → 4枚目を横向き
          return tileIndex === 3
        case 2: // 上からのミンカン → 3枚目を横向き  
          return tileIndex === 2
        case 3: // 左からのミンカン → 1枚目を横向き
          return tileIndex === 0
        default:
          return false
      }
    }
  }
  
  return false
}

// 裏向き表示を判定する関数
function shouldTileBeBack(meld: Meld, tileIndex: number): boolean {
  if (meld.type === 'kan' && meld.fromPlayer === 0) {
    // 暗槓の場合：1枚目と4枚目を裏向き
    return tileIndex === 0 || tileIndex === 3
  }
  return false
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

/* スマホ横画面向けスクロール対応 */
@media screen and (max-width: 1024px) and (max-height: 600px) and (orientation: landscape) {
  .hand-tiles-left,
  .hand-tiles-right {
    overflow-y: auto !important;
    overflow-x: hidden !important;
    height: 100% !important;
    max-height: calc(100vh - 100px) !important;
    flex-shrink: 0 !important;
    scrollbar-width: thin;
    scrollbar-color: rgba(0,0,0,0.3) transparent;
    padding: 5px 0 !important;
  }
  
  .hand-tiles-left::-webkit-scrollbar,
  .hand-tiles-right::-webkit-scrollbar {
    width: 4px;
  }
  
  .hand-tiles-left::-webkit-scrollbar-track,
  .hand-tiles-right::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .hand-tiles-left::-webkit-scrollbar-thumb,
  .hand-tiles-right::-webkit-scrollbar-thumb {
    background-color: rgba(0,0,0,0.3);
    border-radius: 2px;
  }
  
  /* 左右プレイヤーの情報エリアを回転してfloat化 */
  .player-info-left,
  .player-info-right {
    transform: rotate(90deg);
    transform-origin: center center;
    float: left !important;
    clear: both !important;
    width: 100px !important;
    height: 30px !important;
    text-align: center !important;
  }
  
  /* プレイヤー名のv-chipのみを非表示にして、ボタンは表示 */
  .position-right .player-name .v-chip,
  .position-left .player-name .v-chip,
  .position-top .player-name .v-chip,
  .position-bottom .player-name .v-chip,
  .player-area.position-right .player-name .v-chip,
  .player-area.position-left .player-name .v-chip,
  .player-area.position-top .player-name .v-chip,
  .player-area.position-bottom .player-name .v-chip {
    display: none !important;
  }
  
  /* プレイヤー情報エリアを最小化 */
  .position-right .player-info,
  .position-left .player-info,
  .position-top .player-info,
  .position-bottom .player-info,
  .player-area.position-right .player-info,
  .player-area.position-left .player-info,
  .player-area.position-top .player-info,
  .player-area.position-bottom .player-info {
    position: relative !important;
    height: 0 !important;
    overflow: visible !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  
  /* 表示ボタンを確実に表示 */
  .position-right .cpu-toggle-btn,
  .position-left .cpu-toggle-btn,
  .position-top .cpu-toggle-btn,
  .position-bottom .cpu-toggle-btn,
  .player-area.position-right .cpu-toggle-btn,
  .player-area.position-left .cpu-toggle-btn,
  .player-area.position-top .cpu-toggle-btn,
  .player-area.position-bottom .cpu-toggle-btn {
    display: inline-block !important;
    visibility: visible !important;
    position: absolute !important;
    top: 0 !important;
    right: 0 !important;
    margin: 0 !important;
    font-size: 0.45rem !important;
    padding: 2px 6px !important;
    min-width: auto !important;
    height: 18px !important;
    z-index: 1000 !important;
    background-color: rgba(255, 255, 255, 0.9) !important;
    border: 1px solid #ccc !important;
    border-radius: 3px !important;
  }
  
  /* プレイヤー情報エリアの位置を固定 */
  .position-right .player-info,
  .position-left .player-info,
  .position-top .player-info {
    position: relative !important;
    height: 0 !important;
    overflow: visible !important;
  }
  
  /* 手牌エリアの位置を統一 */
  .position-right .cpu-hand,
  .position-left .cpu-hand,
  .position-top .cpu-hand {
    margin-top: 0 !important;
    position: relative !important;
  }
  
  /* 左右の牌サイズを非表示時に統一 */
  .position-right .tile-back,
  .position-left .tile-back,
  .position-right .mahjong-tile,
  .position-left .mahjong-tile {
    width: 18px !important;
    height: 25px !important;
  }
  
  .position-right .drawn-tile,
  .position-left .drawn-tile {
    width: 18px !important;
    height: 25px !important;
  }
  
  .position-right .empty-drawn-tile,
  .position-left .empty-drawn-tile {
    width: 18px !important;
    height: 25px !important;
  }
  
  .player-info-left .player-points,
  .player-info-right .player-points {
    font-size: 0.6rem !important;
    margin: 0 !important;
    white-space: nowrap !important;
    line-height: 30px !important;
  }
}

@media screen and (max-width: 768px) and (max-height: 480px) and (orientation: landscape) {
  .hand-tiles-left,
  .hand-tiles-right {
    overflow-y: auto !important;
    overflow-x: hidden !important;
    height: 100% !important;
    max-height: calc(100vh - 80px) !important;
    flex-shrink: 0 !important;
    scrollbar-width: thin;
    scrollbar-color: rgba(0,0,0,0.3) transparent;
    padding: 3px 0 !important;
  }
  
  .hand-tiles-left::-webkit-scrollbar,
  .hand-tiles-right::-webkit-scrollbar {
    width: 3px;
  }
  
  .hand-tiles-left::-webkit-scrollbar-track,
  .hand-tiles-right::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .hand-tiles-left::-webkit-scrollbar-thumb,
  .hand-tiles-right::-webkit-scrollbar-thumb {
    background-color: rgba(0,0,0,0.3);
    border-radius: 2px;
  }
  
  /* 左右プレイヤーの情報エリアを回転してfloat化（小画面） */
  .player-info-left,
  .player-info-right {
    transform: rotate(90deg);
    transform-origin: center center;
    float: left !important;
    clear: both !important;
    width: 80px !important;
    height: 25px !important;
    text-align: center !important;
  }
  
  /* プレイヤー名のv-chipのみを非表示にして、ボタンは表示 */
  .position-right .player-name .v-chip,
  .position-left .player-name .v-chip,
  .position-top .player-name .v-chip,
  .position-bottom .player-name .v-chip,
  .player-area.position-right .player-name .v-chip,
  .player-area.position-left .player-name .v-chip,
  .player-area.position-top .player-name .v-chip,
  .player-area.position-bottom .player-name .v-chip {
    display: none !important;
  }
  
  /* プレイヤー情報エリアを最小化 */
  .position-right .player-info,
  .position-left .player-info,
  .position-top .player-info,
  .position-bottom .player-info,
  .player-area.position-right .player-info,
  .player-area.position-left .player-info,
  .player-area.position-top .player-info,
  .player-area.position-bottom .player-info {
    position: relative !important;
    height: 0 !important;
    overflow: visible !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  
  /* 表示ボタンを確実に表示 */
  .position-right .cpu-toggle-btn,
  .position-left .cpu-toggle-btn,
  .position-top .cpu-toggle-btn,
  .position-bottom .cpu-toggle-btn,
  .player-area.position-right .cpu-toggle-btn,
  .player-area.position-left .cpu-toggle-btn,
  .player-area.position-top .cpu-toggle-btn,
  .player-area.position-bottom .cpu-toggle-btn {
    display: inline-block !important;
    visibility: visible !important;
    position: absolute !important;
    top: 0 !important;
    right: 0 !important;
    margin: 0 !important;
    font-size: 0.45rem !important;
    padding: 2px 6px !important;
    min-width: auto !important;
    height: 18px !important;
    z-index: 1000 !important;
    background-color: rgba(255, 255, 255, 0.9) !important;
    border: 1px solid #ccc !important;
    border-radius: 3px !important;
  }
  
  /* プレイヤー情報エリアの位置を固定 */
  .position-right .player-info,
  .position-left .player-info,
  .position-top .player-info {
    position: relative !important;
    height: 0 !important;
    overflow: visible !important;
  }
  
  /* 手牌エリアの位置を統一 */
  .position-right .cpu-hand,
  .position-left .cpu-hand,
  .position-top .cpu-hand {
    margin-top: 0 !important;
    position: relative !important;
  }
  
  /* 左右の牌サイズを非表示時に統一 */
  .position-right .tile-back,
  .position-left .tile-back,
  .position-right .mahjong-tile,
  .position-left .mahjong-tile {
    width: 18px !important;
    height: 25px !important;
  }
  
  .position-right .drawn-tile,
  .position-left .drawn-tile {
    width: 18px !important;
    height: 25px !important;
  }
  
  .position-right .empty-drawn-tile,
  .position-left .empty-drawn-tile {
    width: 18px !important;
    height: 25px !important;
  }
  
  .player-info-left .player-points,
  .player-info-right .player-points {
    font-size: 0.55rem !important;
    margin: 0 !important;
    white-space: nowrap !important;
    line-height: 25px !important;
  }
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
  align-items: flex-end; /* 下揃え */
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