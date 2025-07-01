<template>
  <v-dialog 
    v-model="isOpen" 
    max-width="900" 
    :scrim="false"
    @click:outside="closeModal"
  >
    <v-card class="draw-modal">
      <v-card-title class="text-h4 text-center draw-title">
        流局
      </v-card-title>
      
      <v-card-text>
        <!-- プレイヤー別テンパイ状況 -->
        <div class="players-info">
          <v-row>
            <v-col 
              cols="3"
              v-for="player in drawData.players"
              :key="player.id"
            >
              <v-card 
                :class="['player-card', { 'player-card--tenpai': player.isTenpai }]"
                variant="outlined"
              >
                <v-card-text class="text-center">
                  <div class="player-name">{{ player.name }}</div>
                  <div class="player-position">{{ getPositionText(player.id) }}</div>
                  <div :class="['tenpai-status', { 'tenpai-status--tenpai': player.isTenpai }]">
                    {{ player.isTenpai ? 'テンパイ' : 'ノーテン' }}
                  </div>
                  <div class="score-change">
                    <span v-if="player.scoreChange > 0" class="score-gain">+{{ player.scoreChange }}</span>
                    <span v-else-if="player.scoreChange < 0" class="score-loss">{{ player.scoreChange }}</span>
                    <span v-else class="score-no-change">±0</span>
                  </div>
                  <div class="total-score">{{ player.totalScore }}点</div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>
        
        <!-- 流局理由と統計 -->
        <!-- <div class="draw-info mt-6">
          <v-card variant="outlined">
            <v-card-text>
              <div class="draw-reason">
                <v-icon color="warning" class="mr-2">mdi-clock-alert</v-icon>
                <span>{{ drawData.reason }}</span>
              </div>
              <div class="draw-stats mt-3">
                <div class="stat-item">
                  <span class="stat-value">{{ drawData.tenpaiCount }}人</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value">{{ drawData.notenCount }}人</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value">{{ drawData.remainingTiles }}枚</span>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </div> -->
      </v-card-text>
      
      <v-card-actions class="justify-center pb-6">
        <v-btn 
          color="primary" 
          size="large"
          @click="$emit('continue')"
        >
          次の局へ
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Player } from '../stores/fourPlayerMahjong'

export interface DrawData {
  players: Array<{
    id: number
    name: string
    isTenpai: boolean
    scoreChange: number
    totalScore: number
  }>
  reason: string
  tenpaiCount: number
  notenCount: number
  remainingTiles: number
}

interface Props {
  modelValue: boolean
  drawData: DrawData
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'continue'): void
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

const closeModal = () => {
  emit('update:modelValue', false)
  emit('close')
}

const getPositionText = (playerId: number): string => {
  const positions = ['東', '南', '西', '北']
  return positions[playerId] || '?'
}
</script>

<style scoped>
.draw-modal {
  max-height: 90vh;
  overflow-y: auto;
}

.draw-title {
  background: linear-gradient(45deg, #ff9800, #f57c00);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: bold;
  margin-bottom: 16px;
}

.players-info {
  margin-bottom: 24px;
}

.player-card {
  transition: all 0.3s ease;
  border: 2px solid #e0e0e0;
}

.player-card--tenpai {
  border-color: #4caf50;
  background: rgba(76, 175, 80, 0.05);
}

.player-name {
  font-weight: 600;
  font-size: 1.1rem;
  color: #333;
  margin-bottom: 4px;
}

.player-position {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 8px;
}

.tenpai-status {
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.85rem;
  background: #f5f5f5;
  color: #666;
  display: inline-block;
  margin-bottom: 8px;
}

.tenpai-status--tenpai {
  background: #e8f5e9;
  color: #2e7d32;
}

.score-change {
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 4px;
}

.score-gain {
  color: #4caf50;
}

.score-loss {
  color: #f44336;
}

.score-no-change {
  color: #666;
}

.total-score {
  font-size: 0.9rem;
  color: #666;
}

.draw-info {
  background: #f9f9f9;
  border-radius: 8px;
}

.draw-reason {
  display: flex;
  align-items: center;
  font-size: 1.1rem;
  font-weight: 500;
  color: #333;
}

.draw-stats {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-value {
  font-weight: 600;
  color: #333;
}

@media (max-width: 768px) {
  .draw-stats {
    flex-direction: column;
    gap: 8px;
  }
  
  .players-info {
    margin-bottom: 16px;
  }
}

/* スマホ横画面向けレスポンシブ対応 */
@media screen and (max-width: 1024px) and (max-height: 600px) and (orientation: landscape) {
  /* 流局タイトルを小さく */
  .draw-title {
    font-size: 1.5rem !important;
    margin-bottom: 8px !important;
  }
  
  /* プレイヤー情報を4人横並びに */
  .players-info .v-row {
    margin: 0 !important;
  }
  
  .players-info .v-col {
    padding: 2px !important;
  }
  
  /* プレイヤー情報をコンパクトに */
  .player-name {
    font-size: 0.9rem !important;
    margin-bottom: 2px !important;
  }
  
  .player-position {
    display: none !important;
  }
  
  .tenpai-status {
    font-size: 0.75rem !important;
    padding: 2px 8px !important;
    margin-bottom: 4px !important;
  }
  
  .score-change {
    font-size: 0.9rem !important;
    margin-bottom: 2px !important;
  }
  
  .total-score {
    font-size: 0.8rem !important;
  }
  
  /* 流局情報をコンパクトに */
  .draw-info {
    margin-top: 12px !important;
  }
  
  .draw-reason {
    font-size: 0.9rem !important;
  }
  
  .draw-stats {
    gap: 12px !important;
  }
  
  .stat-value {
    font-size: 0.8rem !important;
  }
  
  /* モーダルサイズ調整 */
  .draw-modal {
    max-height: 95vh !important;
  }
}

/* より小さいスマホ向け（高さ480px以下） */
@media screen and (max-width: 768px) and (max-height: 480px) and (orientation: landscape) {
  /* 流局タイトルを非表示 */
  .draw-title {
    display: none !important;
  }
  
  /* プレイヤー情報を4人横並びに（継承） */
  .players-info .v-row {
    margin: 0 !important;
  }
  
  .players-info .v-col {
    padding: 1px !important;
  }
  
  /* プレイヤー情報をさらにコンパクトに */
  .player-name {
    font-size: 0.8rem !important;
  }
  
  .tenpai-status {
    font-size: 0.7rem !important;
    padding: 1px 6px !important;
  }
  
  .score-change {
    font-size: 0.8rem !important;
  }
  
  .total-score {
    font-size: 0.7rem !important;
  }
  
  /* 流局情報をさらにコンパクトに */
  .draw-reason {
    font-size: 0.8rem !important;
  }
  
  .stat-value {
    font-size: 0.7rem !important;
  }
  
  /* モーダルサイズ調整 */
  .draw-modal {
    max-height: 98vh !important;
  }
}
</style>