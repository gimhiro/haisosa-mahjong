<template>
  <v-card class="settings-panel panel-scrollable">
    <v-card-title class="text-subtitle-2">ゲーム設定</v-card-title>
    <v-card-text class="settings-content">
      <v-switch
        v-model="settings.disableMeld"
        label="鳴きなし"
        color="primary"
        density="compact"
        hide-details
        @update:model-value="updateSettings({ disableMeld: $event })"
      />
      <v-switch
        v-model="settings.autoWin"
        label="自動アガリ"
        color="primary"
        density="compact"
        hide-details
        @update:model-value="updateSettings({ autoWin: $event })"
      />
      <v-switch
        v-model="settings.showAcceptance"
        label="受け入れ表示"
        color="primary"
        density="compact"
        hide-details
        @update:model-value="updateSettings({ showAcceptance: $event })"
      />
      <v-switch
        v-model="settings.showAcceptanceHighlight"
        label="受け入れハイライト"
        color="primary"
        density="compact"
        hide-details
        @update:model-value="updateSettings({ showAcceptanceHighlight: $event })"
      />
      
      <v-btn
        v-if="settings.testMode && isDebugMode"
        :color="settings.testMode.isActive ? 'success' : 'warning'"
        variant="tonal"
        size="small"
        density="compact"
        @click="handleTestModeToggle"
        class="test-mode-btn"
      >
        {{ settings.testMode.isActive ? 'テストモード停止' : 'テストモック起動' }}
      </v-btn>
      
      <!-- スクロール領域を広げるための空白ブロック -->
      <div class="scroll-spacer"></div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { useGameSettings } from '../utils/useGameSettings'
import { isDebugMode } from '../utils/env'

const { settings, updateSettings, toggleTestMode } = useGameSettings()

const emit = defineEmits<{
  openTestDialog: []
}>()


const handleTestModeToggle = () => {
  if (!settings.value.testMode) {
    return
  }
  
  if (settings.value.testMode.isActive) {
    // テストモードを停止
    toggleTestMode()
  } else {
    // テストデータ設定ダイアログを開く
    emit('openTestDialog')
  }
}
</script>

<style scoped>
@import '@/styles/panel-common.css';

.settings-content {
  padding: 8px !important;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

/* スマホ横画面向けレスポンシブ対応 - settings-contentのスクロール確保 */
@media screen and (max-width: 1024px) and (max-height: 600px) and (orientation: landscape) {
  .settings-content {
    min-height: 200px !important;
  }
}

.v-switch {
  margin: 0;
  min-height: auto;
}

.v-switch :deep(.v-selection-control) {
  min-height: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  flex-direction: row-reverse;
}

.v-switch :deep(.v-label) {
  margin: 0;
  align-self: flex-start;
}

.v-switch :deep(.v-selection-control__wrapper) {
  align-self: flex-end;
  margin-right: 12px;
}

.v-switch :deep(.v-input__control) {
  min-height: auto;
}

.setting-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 8px;
}

.setting-label {
  font-size: 0.85rem;
  color: rgba(var(--v-theme-on-surface), 0.7);
  font-weight: 500;
}

.test-mode-btn {
  margin-top: 8px;
  width: 100%;
}

/* スマホ横画面向けレスポンシブ対応 */
@media screen and (max-width: 1024px) and (max-height: 600px) and (orientation: landscape) {
  .scroll-spacer {
    height: 300px;
  }
}

/* より小さいスマホ向け（高さ480px以下） */
@media screen and (max-width: 768px) and (max-height: 480px) and (orientation: landscape) {
  .scroll-spacer {
    height: 250px;
  }
}

/* PC表示でも空白ブロックを表示してスクロール可能にする */
@media screen and (min-width: 1025px), screen and (min-height: 601px) {
  .scroll-spacer {
    height: 100px;
  }
}
</style>