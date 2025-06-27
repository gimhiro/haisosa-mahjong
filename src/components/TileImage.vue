<template>
  <div 
    class="tile-image"
    :class="{ 
      'tile-clickable': clickable,
      'tile-small': size === 'small',
      'tile-medium': size === 'medium',
      'tile-large': size === 'large'
    }"
    @click="handleClick"
  >
    <img 
      :src="tileImageSrc" 
      :alt="tileDisplayText"
      class="tile-img"
    />
    <div v-if="showText" class="tile-text">{{ tileDisplayText }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Tile } from 'riichi-rs-bundlers'

interface Props {
  tileId: number
  size?: 'small' | 'medium' | 'large'
  clickable?: boolean
  showText?: boolean
}

interface Emits {
  (e: 'click', tileId: number): void
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  clickable: false,
  showText: false
})

const emit = defineEmits<Emits>()

// 牌IDから画像ファイル名を取得
const tileImageSrc = computed(() => {
  const fileName = getTileFileName(props.tileId)
  return new URL(`../assets/tiles/${fileName}`, import.meta.url).href
})

// 牌IDから表示用テキストを取得
const tileDisplayText = computed(() => {
  return getTileDisplayText(props.tileId)
})

function getTileFileName(tileId: number): string {
  // riichi-rs-bundlersの牌IDは0から始まる数値
  const tileMap: { [key: number]: string } = {
    // 萬子 (0-8 → 1m-9m)
    0: 'm1.png', 1: 'm2.png', 2: 'm3.png', 3: 'm4.png', 4: 'm5.png',
    5: 'm6.png', 6: 'm7.png', 7: 'm8.png', 8: 'm9.png',
    // 筒子 (9-17 → 1p-9p)
    9: 'p1.png', 10: 'p2.png', 11: 'p3.png', 12: 'p4.png', 13: 'p5.png',
    14: 'p6.png', 15: 'p7.png', 16: 'p8.png', 17: 'p9.png',
    // 索子 (18-26 → 1s-9s)
    18: 's1.png', 19: 's2.png', 20: 's3.png', 21: 's4.png', 22: 's5.png',
    23: 's6.png', 24: 's7.png', 25: 's8.png', 26: 's9.png',
    // 風牌 (27-30)
    27: 'w1.png', // 東
    28: 'w2.png', // 南
    29: 'w3.png', // 西
    30: 'w4.png', // 北
    // 三元牌 (31-33)
    31: 'd1.png', // 白
    32: 'd2.png', // 發
    33: 'd3.png'  // 中
  }
  
  const fileName = tileMap[tileId]
  if (fileName !== undefined) {
    return fileName
  }
  
  console.warn('Unknown tile ID:', tileId)
  return 'm1.png' // フォールバック
}

function getTileDisplayText(tileId: number): string {
  // riichi-rs-bundlersの牌IDと表示文字列の直接マッピング
  const displayMap: { [key: number]: string } = {
    // 萬子 (0-8 → 1m-9m)
    0: '1m', 1: '2m', 2: '3m', 3: '4m', 4: '5m', 5: '6m', 6: '7m', 7: '8m', 8: '9m',
    // 筒子 (9-17 → 1p-9p)
    9: '1p', 10: '2p', 11: '3p', 12: '4p', 13: '5p', 14: '6p', 15: '7p', 16: '8p', 17: '9p',
    // 索子 (18-26 → 1s-9s)
    18: '1s', 19: '2s', 20: '3s', 21: '4s', 22: '5s', 23: '6s', 24: '7s', 25: '8s', 26: '9s',
    // 風牌 (27-30)
    27: '東', 28: '南', 29: '西', 30: '北',
    // 三元牌 (31-33)
    31: '白', 32: '發', 33: '中'
  }
  
  const display = displayMap[tileId]
  if (display !== undefined) {
    return display
  }
  
  console.warn('Unknown tile ID for display:', tileId)
  return '?'
}

function handleClick() {
  if (props.clickable) {
    emit('click', props.tileId)
  }
}
</script>

<style scoped>
.tile-image {
  display: inline-block;
  position: relative;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.tile-clickable {
  cursor: pointer;
}

.tile-clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.tile-img {
  display: block;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* サイズ設定 */
.tile-small .tile-img {
  width: 30px;
  height: 42px;
}

.tile-medium .tile-img {
  width: 40px;
  height: 56px;
}

.tile-large .tile-img {
  width: 50px;
  height: 70px;
}

.tile-text {
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 10px;
  color: #666;
  background: rgba(255, 255, 255, 0.9);
  padding: 2px 4px;
  border-radius: 2px;
  white-space: nowrap;
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .tile-small .tile-img {
    width: 25px;
    height: 35px;
  }

  .tile-medium .tile-img {
    width: 35px;
    height: 49px;
  }

  .tile-large .tile-img {
    width: 45px;
    height: 63px;
  }
}
</style>