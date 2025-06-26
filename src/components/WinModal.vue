<template>
  <v-dialog 
    v-model="isOpen" 
    max-width="900" 
    persistent
    :scrim="false"
  >
    <v-card class="win-modal">
      <v-card-title class="text-h4 text-center win-title">
        {{ winData.isTsumo ? 'ツモ' : 'ロン' }}
      </v-card-title>
      
      <v-card-text>
        <!-- 勝利プレイヤー情報 -->
        <div class="winner-info">
          <h3>{{ winData.winner.name }} の勝利！</h3>
        </div>
        
        <!-- 上がり牌表示 -->
        <div class="winning-tiles">
          <h4>上がり牌</h4>
          <div class="tiles-display">
            <MahjongTile
              v-for="tile in winData.winningHand"
              :key="tile.id"
              :tile="tile"
              size="medium"
              :is-draggable="false"
              :is-winning-tile="tile.id === winData.winningTile?.id"
            />
          </div>
        </div>
        
        <!-- 得点情報 -->
        <div class="score-info">
          <v-row>
            <v-col cols="6">
              <v-card variant="outlined">
                <v-card-text class="text-center">
                  <div class="score-label">基本点</div>
                  <div class="score-value">{{ winData.basePoints }}点</div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="6">
              <v-card variant="outlined">
                <v-card-text class="text-center">
                  <div class="score-label">{{ winData.winner.wind === 'east' ? '親' : '子' }}の獲得点</div>
                  <div class="score-value">{{ winData.totalPoints }}点</div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>
        
        <!-- 役一覧 -->
        <div class="yaku-list">
          <h4>役</h4>
          <v-list density="compact">
            <v-list-item
              v-for="yaku in winData.yaku"
              :key="yaku.name"
            >
              <v-list-item-title>{{ yaku.name }}</v-list-item-title>
              <template #append>
                <span class="yaku-han">{{ yaku.han }}翻</span>
              </template>
            </v-list-item>
          </v-list>
          
          <div class="total-han">
            合計: {{ winData.totalHan }}翻 {{ winData.fu }}符
          </div>
        </div>
        
        <!-- ドラ情報 -->
        <div class="dora-info">
          <h4>ドラ</h4>
          <div class="dora-tiles">
            <MahjongTile
              v-for="dora in winData.doraIndicators"
              :key="dora.id"
              :tile="dora"
              size="small"
              :is-draggable="false"
            />
          </div>
          <div class="dora-count">ドラ: {{ winData.doraCount }}枚</div>
        </div>
        
        <!-- 裏ドラ情報（リーチ時のみ） -->
        <div v-if="winData.uradoraCount > 0" class="uradora-info">
          <h4>裏ドラ</h4>
          <div class="uradora-tiles">
            <MahjongTile
              v-for="uradora in winData.uradoraIndicators"
              :key="uradora.id"
              :tile="uradora"
              size="small"
              :is-draggable="false"
            />
          </div>
          <div class="uradora-count">裏ドラ: {{ winData.uradoraCount }}枚</div>
        </div>
      </v-card-text>
      
      <v-card-actions class="justify-center">
        <v-btn 
          color="primary" 
          size="large"
          @click="$emit('continue')"
        >
          次の局へ
        </v-btn>
        <v-btn 
          color="secondary" 
          size="large"
          @click="$emit('newGame')"
        >
          新ゲーム
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Tile, Player } from '../stores/fourPlayerMahjong'
import MahjongTile from './MahjongTile.vue'

export interface WinData {
  winner: Player
  winningHand: Tile[]
  winningTile: Tile | null
  isTsumo: boolean
  basePoints: number
  totalPoints: number
  yaku: Array<{ name: string; han: number }>
  totalHan: number
  fu: number
  doraIndicators: Tile[]
  doraCount: number
  uradoraIndicators: Tile[]
  uradoraCount: number
}

interface Props {
  modelValue: boolean
  winData: WinData
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'continue'): void
  (e: 'newGame'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})
</script>

<style scoped>
.win-modal {
  max-height: 90vh;
  overflow-y: auto;
}

.win-title {
  background: linear-gradient(45deg, #ff6b6b, #feca57);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: bold;
  margin-bottom: 16px;
}

.winner-info {
  text-align: center;
  margin-bottom: 24px;
}

.winner-info h3 {
  color: #1976d2;
  font-size: 1.5rem;
}

.winning-tiles {
  margin-bottom: 24px;
}

.winning-tiles h4 {
  margin-bottom: 12px;
  color: #333;
}

.tiles-display {
  display: flex;
  flex-wrap: nowrap;
  gap: 2px;
  justify-content: center;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 8px;
  overflow-x: auto;
}

.score-info {
  margin-bottom: 24px;
}

.score-label {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 4px;
}

.score-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1976d2;
}

.yaku-list {
  margin-bottom: 24px;
}

.yaku-list h4 {
  margin-bottom: 12px;
  color: #333;
}

.yaku-han {
  font-weight: bold;
  color: #ff9800;
}

.total-han {
  text-align: center;
  font-weight: bold;
  font-size: 1.1rem;
  color: #1976d2;
  margin-top: 12px;
  padding: 8px;
  background: #e3f2fd;
  border-radius: 4px;
}

.dora-info,
.uradora-info {
  margin-bottom: 16px;
}

.dora-info h4,
.uradora-info h4 {
  margin-bottom: 8px;
  color: #333;
}

.dora-tiles,
.uradora-tiles {
  display: flex;
  gap: 4px;
  justify-content: center;
  margin-bottom: 8px;
}

.dora-count,
.uradora-count {
  text-align: center;
  font-weight: bold;
  color: #4caf50;
}
</style>