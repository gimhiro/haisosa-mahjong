<template>
  <v-card class="settings-panel">
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
      <v-btn
        v-if="settings.testMode"
        :color="settings.testMode.isActive ? 'success' : 'warning'"
        variant="tonal"
        size="small"
        density="compact"
        @click="handleTestModeToggle"
        class="test-mode-btn"
      >
        {{ settings.testMode.isActive ? 'テストモード停止' : 'テストモック起動' }}
      </v-btn>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { useGameSettings } from '../utils/useGameSettings'

const { settings, updateSettings, toggleTestMode } = useGameSettings()

const emit = defineEmits<{
  openTestDialog: []
}>()

const handleTestModeToggle = () => {
  if (!settings.value.testMode) {
    console.error('testMode設定が見つかりません')
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
.settings-content {
  padding: 8px !important;
  display: flex;
  flex-direction: column;
  gap: 4px;
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

.test-mode-btn {
  margin-top: 8px;
  width: 100%;
}
</style>