<template>
  <v-card class="game-info-panel panel-scrollable">
    <v-card-title class="text-subtitle-2">ゲーム情報</v-card-title>
    <v-card-text class="text-caption">
      <div class="info-row">
        <span class="info-label">局:</span>
        <span class="info-value">{{ dealerText }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">現在:</span>
        <span class="info-value">{{ currentPlayerName }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">供託:</span>
        <span class="info-value">{{ kyotaku }}本</span>
      </div>
      <div class="game-controls">
        <v-btn
          v-if="gamePhase === 'waiting'"
          color="success"
          size="small"
          block
          @click="$emit('startGame')"
        >
          ゲーム開始
        </v-btn>
        <v-btn
          v-else
          :color="isMuted ? 'error' : 'primary'"
          size="small"
          block
          @click="$emit('toggleMute')"
        >
          <v-icon>{{ isMuted ? 'mdi-volume-off' : 'mdi-volume-high' }}</v-icon>
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
interface Props {
  dealerText: string
  currentPlayerName: string
  kyotaku: number
  gamePhase: string
  isMuted: boolean
}

defineProps<Props>()

defineEmits<{
  startGame: []
  toggleMute: []
}>()
</script>

<style scoped>
@import '@/styles/panel-common.css';

.info-row {
  display: flex;
  justify-content: space-between;
  margin: 2px 0;
}

.info-label {
  font-weight: 500;
  color: rgba(0, 0, 0, 0.7);
}

.info-value {
  font-weight: bold;
}

.game-controls {
  margin-top: 8px;
}

/* スマホ横画面向けレスポンシブ対応 */
@media screen and (max-width: 1024px) and (max-height: 600px) and (orientation: landscape) {
  .scroll-spacer {
    height: 100px;
  }
}

/* より小さいスマホ向け（高さ480px以下） */
@media screen and (max-width: 768px) and (max-height: 480px) and (orientation: landscape) {
  .scroll-spacer {
    height: 80px;
  }
}

/* PC表示では空白ブロックを非表示 */
@media screen and (min-width: 1025px), screen and (min-height: 601px) {
  .scroll-spacer {
    display: none;
  }
}
</style>