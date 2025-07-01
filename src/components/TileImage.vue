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

// 全ての牌画像を静的にインポート
// 萬子 (1m-9m)
import m1 from '@/assets/tiles/m1.png'
import m2 from '@/assets/tiles/m2.png'
import m3 from '@/assets/tiles/m3.png'
import m4 from '@/assets/tiles/m4.png'
import m5 from '@/assets/tiles/m5.png'
import m6 from '@/assets/tiles/m6.png'
import m7 from '@/assets/tiles/m7.png'
import m8 from '@/assets/tiles/m8.png'
import m9 from '@/assets/tiles/m9.png'

// 筒子 (1p-9p)
import p1 from '@/assets/tiles/p1.png'
import p2 from '@/assets/tiles/p2.png'
import p3 from '@/assets/tiles/p3.png'
import p4 from '@/assets/tiles/p4.png'
import p5 from '@/assets/tiles/p5.png'
import p6 from '@/assets/tiles/p6.png'
import p7 from '@/assets/tiles/p7.png'
import p8 from '@/assets/tiles/p8.png'
import p9 from '@/assets/tiles/p9.png'

// 索子 (1s-9s)
import s1 from '@/assets/tiles/s1.png'
import s2 from '@/assets/tiles/s2.png'
import s3 from '@/assets/tiles/s3.png'
import s4 from '@/assets/tiles/s4.png'
import s5 from '@/assets/tiles/s5.png'
import s6 from '@/assets/tiles/s6.png'
import s7 from '@/assets/tiles/s7.png'
import s8 from '@/assets/tiles/s8.png'
import s9 from '@/assets/tiles/s9.png'

// 風牌 (東南西北)
import w1 from '@/assets/tiles/w1.png'
import w2 from '@/assets/tiles/w2.png'
import w3 from '@/assets/tiles/w3.png'
import w4 from '@/assets/tiles/w4.png'

// 三元牌 (白發中)
import d1 from '@/assets/tiles/d1.png'
import d2 from '@/assets/tiles/d2.png'
import d3 from '@/assets/tiles/d3.png'

// ファイル名と画像URLのマッピング
const tileImageMap: Record<string, string> = {
  'm1.png': m1, 'm2.png': m2, 'm3.png': m3, 'm4.png': m4, 'm5.png': m5,
  'm6.png': m6, 'm7.png': m7, 'm8.png': m8, 'm9.png': m9,
  'p1.png': p1, 'p2.png': p2, 'p3.png': p3, 'p4.png': p4, 'p5.png': p5,
  'p6.png': p6, 'p7.png': p7, 'p8.png': p8, 'p9.png': p9,
  's1.png': s1, 's2.png': s2, 's3.png': s3, 's4.png': s4, 's5.png': s5,
  's6.png': s6, 's7.png': s7, 's8.png': s8, 's9.png': s9,
  'w1.png': w1, 'w2.png': w2, 'w3.png': w3, 'w4.png': w4,
  'd1.png': d1, 'd2.png': d2, 'd3.png': d3
}

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

// 牌IDから画像URLを取得
const tileImageSrc = computed(() => {
  const fileName = getTileFileName(props.tileId)
  const url = tileImageMap[fileName]
  
  if (url) {
    return url
  }
  
  return tileImageMap['m1.png'] // フォールバック
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