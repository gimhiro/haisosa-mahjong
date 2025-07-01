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
import type { Tile } from '../stores/fourPlayerMahjong'

interface Props {
  tile: Tile
  size?: 'small' | 'medium' | 'large'
  clickable?: boolean
  showText?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  clickable: false,
  showText: false
})

const emit = defineEmits<{
  click: [tile: Tile]
}>()

// publicディレクトリのパスベース（本番では /haisosa-mahjong/、開発では /）
const basePath = import.meta.env.PROD ? '/haisosa-mahjong/' : '/'

const tileImageSrc = computed(() => {
  const { suit, rank } = props.tile
  let filename = ''
  
  switch (suit) {
    case 'man':
      filename = `m${rank}.png`
      break
    case 'pin':
      filename = `p${rank}.png`
      break
    case 'sou':
      filename = `s${rank}.png`
      break
    case 'honor':
      // 字牌の場合: 1=東, 2=南, 3=西, 4=北, 5=白, 6=發, 7=中
      if (rank >= 1 && rank <= 4) {
        filename = `w${rank}.png`
      } else if (rank >= 5 && rank <= 7) {
        filename = `d${rank - 4}.png`
      }
      break
    default:
      filename = `m1.png` // フォールバック
  }
  
  return `${basePath}tiles/${filename}`
})

const tileDisplayText = computed(() => {
  const { suit, rank } = props.tile
  
  switch (suit) {
    case 'man':
      return `${rank}m`
    case 'pin':
      return `${rank}p`
    case 'sou':
      return `${rank}s`
    case 'honor':
      const honorNames = ['', '東', '南', '西', '北', '白', '發', '中']
      return honorNames[rank] || ''
    default:
      return ''
  }
})

function handleClick() {
  if (props.clickable) {
    emit('click', props.tile)
  }
}
</script>

<style scoped>
.tile-image {
  display: inline-block;
  position: relative;
  border-radius: 4px;
  overflow: hidden;
  user-select: none;
}

.tile-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.tile-text {
  position: absolute;
  bottom: 2px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 10px;
  padding: 1px 3px;
  border-radius: 2px;
  pointer-events: none;
}

.tile-clickable {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.tile-clickable:hover {
  transform: scale(1.05);
}

.tile-small {
  width: 28px;
  height: 38px;
}

.tile-medium {
  width: 42px;
  height: 57px;
}

.tile-large {
  width: 56px;
  height: 76px;
}
</style>