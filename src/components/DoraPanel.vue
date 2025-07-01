<template>
  <v-card class="dora-panel panel-scrollable">
    <v-card-title class="text-subtitle-2">ドラ表示牌</v-card-title>
    <v-card-text class="dora-content">
      <div class="dora-tiles">
        <MahjongTile
          v-for="dora in doraIndicators"
          :key="dora.id"
          :tile="dora"
          size="small"
          :is-draggable="false"
        />
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import MahjongTile from './MahjongTile.vue'
import type { Tile } from '../stores/fourPlayerMahjong'

interface Props {
  doraIndicators: Tile[]
}

defineProps<Props>()
</script>

<style scoped>
@import '@/styles/panel-common.css';

.dora-content {
  padding: 8px !important;
}

.dora-tiles {
  display: flex;
  gap: 2px;
  justify-content: flex-start;
  flex-wrap: wrap;
}
</style>