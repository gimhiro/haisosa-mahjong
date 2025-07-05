<template>
  <Transition name="fade">
    <div v-if="visible" class="loading-mask">
      <div class="loading-content">
        <v-progress-circular
          indeterminate
          size="60"
          width="6"
          color="primary"
        />
        <p class="loading-text">{{ text }}</p>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'

interface Props {
  show: boolean
  text?: string
  delay?: number // ミリ秒単位の遅延時間
}

const props = withDefaults(defineProps<Props>(), {
  text: '計算中...',
  delay: 500 // デフォルト0.5秒
})

const visible = ref(false)
let showTimer: number | null = null
let hideTimer: number | null = null

watch(() => props.show, (newValue) => {
  
  if (newValue) {
    // 表示する場合
    if (hideTimer) {
      clearTimeout(hideTimer)
      hideTimer = null
    }
    
    if (props.delay > 0) {
      // 遅延がある場合
      showTimer = window.setTimeout(() => {
        visible.value = true
        showTimer = null
      }, props.delay)
    } else {
      // 遅延がない場合は即座に表示
      visible.value = true
    }
  } else {
    // 非表示にする場合
    if (showTimer) {
      // まだ表示されていない場合はタイマーをクリア
      clearTimeout(showTimer)
      showTimer = null
    } else if (visible.value) {
      // 既に表示されている場合は、最低限の表示時間を保証
      hideTimer = window.setTimeout(() => {
        visible.value = false
        hideTimer = null
      }, 200) // 最低200ms表示
      return
    }
    
    // 即座に非表示
    visible.value = false
  }
})

onBeforeUnmount(() => {
  if (showTimer) {
    clearTimeout(showTimer)
  }
  if (hideTimer) {
    clearTimeout(hideTimer)
  }
})
</script>

<style scoped>
.loading-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  border-radius: inherit;
}

.loading-content {
  text-align: center;
}

.loading-text {
  margin-top: 16px;
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

/* フェードトランジション */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>