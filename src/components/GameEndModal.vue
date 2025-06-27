<template>
  <v-dialog 
    v-model="isOpen" 
    max-width="900" 
    :scrim="false"
    persistent
  >
    <v-card class="game-end-modal">
      <v-card-title class="text-h3 text-center game-end-title">
        対局終了
      </v-card-title>
      
      <v-card-text>
        <!-- 最終結果 -->
        <div class="final-results">
          <h3 class="results-title">最終結果</h3>
          
          <div class="ranking-list">
            <div 
              v-for="(player, index) in rankedPlayers"
              :key="player.id"
              :class="['ranking-item', `ranking-item--${getRankClass(index)}`]"
            >
              <div class="rank-badge">
                <span class="rank-number">{{ index + 1 }}</span>
                <span class="rank-suffix">位</span>
              </div>
              
              <div class="player-info">
                <div class="player-name">{{ player.name }}</div>
                <div class="player-position">{{ getPositionText(player.originalPosition) }}</div>
              </div>
              
              <div class="score-info">
                <div class="final-score">{{ player.score.toLocaleString() }}点</div>
                <div class="score-diff">
                  <span v-if="player.scoreDiff > 0" class="score-plus">+{{ player.scoreDiff.toLocaleString() }}</span>
                  <span v-else-if="player.scoreDiff < 0" class="score-minus">{{ player.scoreDiff.toLocaleString() }}</span>
                  <span v-else class="score-even">±0</span>
                </div>
              </div>
              
              <div v-if="index === 0" class="winner-crown">
                <v-icon color="gold" size="32">mdi-crown</v-icon>
              </div>
            </div>
          </div>
        </div>
        
        <!-- ゲーム統計 -->
        <div class="game-stats mt-6">
          <v-card variant="outlined">
            <v-card-title class="text-h6">対局情報</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="6" sm="3">
                  <div class="stat-item">
                    <div class="stat-label">対局種別</div>
                    <div class="stat-value">{{ gameEndData.gameType === 'tonpuusen' ? '東風戦' : '東南戦' }}</div>
                  </div>
                </v-col>
                <v-col cols="6" sm="3">
                  <div class="stat-item">
                    <div class="stat-label">終了局</div>
                    <div class="stat-value">{{ gameEndData.finalRound }}</div>
                  </div>
                </v-col>
                <v-col cols="6" sm="3">
                  <div class="stat-item">
                    <div class="stat-label">終了理由</div>
                    <div class="stat-value">{{ gameEndData.endReason }}</div>
                  </div>
                </v-col>
                <v-col cols="6" sm="3">
                  <div class="stat-item">
                    <div class="stat-label">対局時間</div>
                    <div class="stat-value">{{ gameEndData.gameTime }}</div>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </div>
      </v-card-text>
      
      <v-card-actions class="justify-center pb-6">
        <div class="action-buttons">
          <v-btn 
            color="secondary" 
            size="large"
            variant="outlined"
            @click="$emit('backToHome')"
            class="mr-4"
          >
            <v-icon start>mdi-home</v-icon>
            タイトルへ戻る
          </v-btn>
          
          <v-btn 
            color="primary" 
            size="large"
            elevation="3"
            @click="$emit('rematch')"
          >
            <v-icon start>mdi-refresh</v-icon>
            再戦
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface GameEndPlayer {
  id: number
  name: string
  score: number
  scoreDiff: number
  originalPosition: number
}

export interface GameEndData {
  players: GameEndPlayer[]
  gameType: 'tonpuusen' | 'tonnanssen'
  finalRound: string
  endReason: string
  gameTime: string
}

interface Props {
  modelValue: boolean
  gameEndData: GameEndData
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'backToHome'): void
  (e: 'rematch'): void
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

// プレイヤーを順位順にソート
const rankedPlayers = computed(() => {
  return [...props.gameEndData.players].sort((a, b) => {
    // 点数で降順ソート
    if (a.score !== b.score) {
      return b.score - a.score
    }
    // 同点の場合、元の座順で昇順ソート（東→南→西→北）
    return a.originalPosition - b.originalPosition
  })
})

const closeModal = () => {
  emit('update:modelValue', false)
  emit('close')
}

const getPositionText = (position: number): string => {
  const positions = ['東', '南', '西', '北']
  return positions[position] || '?'
}

const getRankClass = (rank: number): string => {
  switch (rank) {
    case 0: return 'first'
    case 1: return 'second'
    case 2: return 'third'
    case 3: return 'fourth'
    default: return 'other'
  }
}
</script>

<style scoped>
.game-end-modal {
  max-height: 90vh;
  overflow-y: auto;
}

.game-end-title {
  background: linear-gradient(45deg, #1976d2, #42a5f5);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: bold;
  margin-bottom: 24px;
}

.final-results {
  margin-bottom: 32px;
}

.results-title {
  color: #333;
  font-weight: 600;
  margin-bottom: 24px;
  text-align: center;
  font-size: 1.5rem;
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ranking-item {
  display: flex;
  align-items: center;
  padding: 20px;
  border-radius: 12px;
  border: 2px solid;
  position: relative;
  transition: all 0.3s ease;
}

.ranking-item--first {
  border-color: #ffd700;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 215, 0, 0.05));
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
}

.ranking-item--second {
  border-color: #c0c0c0;
  background: linear-gradient(135deg, rgba(192, 192, 192, 0.1), rgba(192, 192, 192, 0.05));
}

.ranking-item--third {
  border-color: #cd7f32;
  background: linear-gradient(135deg, rgba(205, 127, 50, 0.1), rgba(205, 127, 50, 0.05));
}

.ranking-item--fourth {
  border-color: #e0e0e0;
  background: rgba(245, 245, 245, 0.5);
}

.rank-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 24px;
  min-width: 60px;
}

.rank-number {
  font-size: 2rem;
  font-weight: 900;
  line-height: 1;
}

.rank-suffix {
  font-size: 0.9rem;
  font-weight: 600;
  color: #666;
}

.ranking-item--first .rank-number {
  color: #ffd700;
}

.ranking-item--second .rank-number {
  color: #c0c0c0;
}

.ranking-item--third .rank-number {
  color: #cd7f32;
}

.ranking-item--fourth .rank-number {
  color: #666;
}

.player-info {
  flex: 1;
  margin-right: 16px;
}

.player-name {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.player-position {
  font-size: 0.9rem;
  color: #666;
}

.score-info {
  text-align: right;
  margin-right: 16px;
}

.final-score {
  font-size: 1.4rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 4px;
}

.score-diff {
  font-size: 0.9rem;
  font-weight: 500;
}

.score-plus {
  color: #4caf50;
}

.score-minus {
  color: #f44336;
}

.score-even {
  color: #666;
}

.winner-crown {
  position: absolute;
  top: -8px;
  right: 16px;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-8px);
  }
  60% {
    transform: translateY(-4px);
  }
}

.game-stats {
  background: #f9f9f9;
  border-radius: 8px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  font-size: 0.85rem;
  color: #666;
  font-weight: 500;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 1rem;
  color: #333;
  font-weight: 600;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 16px;
}

@media (max-width: 768px) {
  .ranking-item {
    padding: 16px;
  }
  
  .rank-badge {
    margin-right: 16px;
    min-width: 50px;
  }
  
  .rank-number {
    font-size: 1.5rem;
  }
  
  .player-name {
    font-size: 1rem;
  }
  
  .final-score {
    font-size: 1.2rem;
  }
  
  .action-buttons {
    flex-direction: column;
    width: 100%;
  }
  
  .action-buttons .v-btn {
    width: 100%;
    margin: 0 !important;
  }
}
</style>