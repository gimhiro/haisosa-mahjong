<template>
  <v-dialog v-model="isOpen" max-width="900" :scrim="false">
    <v-card class="records-modal">
      <v-card-title class="text-h5 text-center records-title">
        <v-icon class="mr-2">mdi-chart-line</v-icon>
        対戦記録
      </v-card-title>
      
      <v-card-text>
        <v-tabs v-model="activeTab" align-tabs="center" class="mb-4">
          <v-tab value="stats">統計</v-tab>
          <v-tab value="yaku">役記録</v-tab>
        </v-tabs>

        <v-window v-model="activeTab">
          <!-- 統計タブ -->
          <v-window-item value="stats">
            <div class="stats-content">
              <div class="stats-grid">
                <!-- 東風戦連荘なし -->
                <v-card class="stats-card" variant="outlined">
                  <v-card-title class="stats-card-title">
                    <v-icon class="mr-2">mdi-clock-fast</v-icon>
                    東風戦（連荘なし）
                  </v-card-title>
                  <v-card-text>
                    <div class="stat-item">
                      <span class="stat-label">対戦回数:</span>
                      <span class="stat-value">{{ records.gameStats.tonpuusenNoRenchan.totalGames }}回</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">平均上がり回数:</span>
                      <span class="stat-value">{{ getAverageWinCount('tonpuusenNoRenchan') }}回</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">平均上がり点:</span>
                      <span class="stat-value">{{ getAverageWinPoints('tonpuusenNoRenchan') }}点</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">平均上がり巡目:</span>
                      <span class="stat-value">{{ getAverageWinTurns('tonpuusenNoRenchan') }}巡目</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">最高持ち点:</span>
                      <span class="stat-value highlight">{{ records.gameStats.tonpuusenNoRenchan.maxPoints.toLocaleString() }}点</span>
                    </div>
                  </v-card-text>
                </v-card>

                <!-- 東風戦連荘あり -->
                <v-card class="stats-card" variant="outlined">
                  <v-card-title class="stats-card-title">
                    <v-icon class="mr-2">mdi-clock-fast</v-icon>
                    東風戦（連荘あり）
                  </v-card-title>
                  <v-card-text>
                    <div class="stat-item">
                      <span class="stat-label">対戦回数:</span>
                      <span class="stat-value">{{ records.gameStats.tonpuusenRenchan.totalGames }}回</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">平均上がり回数:</span>
                      <span class="stat-value">{{ getAverageWinCount('tonpuusenRenchan') }}回</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">平均上がり点:</span>
                      <span class="stat-value">{{ getAverageWinPoints('tonpuusenRenchan') }}点</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">平均上がり巡目:</span>
                      <span class="stat-value">{{ getAverageWinTurns('tonpuusenRenchan') }}巡目</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">最高持ち点:</span>
                      <span class="stat-value highlight">{{ records.gameStats.tonpuusenRenchan.maxPoints.toLocaleString() }}点</span>
                    </div>
                  </v-card-text>
                </v-card>

                <!-- 東南戦連荘なし -->
                <v-card class="stats-card" variant="outlined">
                  <v-card-title class="stats-card-title">
                    <v-icon class="mr-2">mdi-clock</v-icon>
                    東南戦（連荘なし）
                  </v-card-title>
                  <v-card-text>
                    <div class="stat-item">
                      <span class="stat-label">対戦回数:</span>
                      <span class="stat-value">{{ records.gameStats.tonnansenNoRenchan.totalGames }}回</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">平均上がり回数:</span>
                      <span class="stat-value">{{ getAverageWinCount('tonnansenNoRenchan') }}回</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">平均上がり点:</span>
                      <span class="stat-value">{{ getAverageWinPoints('tonnansenNoRenchan') }}点</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">平均上がり巡目:</span>
                      <span class="stat-value">{{ getAverageWinTurns('tonnansenNoRenchan') }}巡目</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">最高持ち点:</span>
                      <span class="stat-value highlight">{{ records.gameStats.tonnansenNoRenchan.maxPoints.toLocaleString() }}点</span>
                    </div>
                  </v-card-text>
                </v-card>

                <!-- 東南戦連荘あり -->
                <v-card class="stats-card" variant="outlined">
                  <v-card-title class="stats-card-title">
                    <v-icon class="mr-2">mdi-clock</v-icon>
                    東南戦（連荘あり）
                  </v-card-title>
                  <v-card-text>
                    <div class="stat-item">
                      <span class="stat-label">対戦回数:</span>
                      <span class="stat-value">{{ records.gameStats.tonnansenRenchan.totalGames }}回</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">平均上がり回数:</span>
                      <span class="stat-value">{{ getAverageWinCount('tonnansenRenchan') }}回</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">平均上がり点:</span>
                      <span class="stat-value">{{ getAverageWinPoints('tonnansenRenchan') }}点</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">平均上がり巡目:</span>
                      <span class="stat-value">{{ getAverageWinTurns('tonnansenRenchan') }}巡目</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">最高持ち点:</span>
                      <span class="stat-value highlight">{{ records.gameStats.tonnansenRenchan.maxPoints.toLocaleString() }}点</span>
                    </div>
                  </v-card-text>
                </v-card>
              </div>
            </div>
          </v-window-item>

          <!-- 役記録タブ -->
          <v-window-item value="yaku">
            <div class="yaku-content">
              <div class="yaku-search mb-4">
                <v-text-field
                  v-model="yakuSearch"
                  label="役名で検索"
                  prepend-inner-icon="mdi-magnify"
                  variant="outlined"
                  density="compact"
                  clearable
                ></v-text-field>
              </div>
              
              <div class="yaku-sections">
                <!-- 1翻 -->
                <div class="han-section">
                  <h3 class="han-title">1翻</h3>
                  <div class="yaku-grid">
                    <v-card
                      v-for="yakuKey in getFilteredYakuByHan(1)"
                      :key="yakuKey"
                      :class="['yaku-card', { 'yaku-card-disabled': getYakuCount(yakuKey) === 0 }]"
                      variant="outlined"
                    >
                      <v-card-text class="yaku-card-content">
                        <div class="yaku-name">{{ YAKU_NAMES[yakuKey] }}</div>
                        <div class="yaku-count">
                          <span v-if="getYakuCount(yakuKey) > 0" class="count-active">
                            {{ getYakuCount(yakuKey) }}回
                          </span>
                          <span v-else class="count-disabled">0回</span>
                        </div>
                      </v-card-text>
                    </v-card>
                  </div>
                </div>

                <!-- 2翻 -->
                <div class="han-section">
                  <h3 class="han-title">2翻</h3>
                  <div class="yaku-grid">
                    <v-card
                      v-for="yakuKey in getFilteredYakuByHan(2)"
                      :key="yakuKey"
                      :class="['yaku-card', { 'yaku-card-disabled': getYakuCount(yakuKey) === 0 }]"
                      variant="outlined"
                    >
                      <v-card-text class="yaku-card-content">
                        <div class="yaku-name">{{ YAKU_NAMES[yakuKey] }}</div>
                        <div class="yaku-count">
                          <span v-if="getYakuCount(yakuKey) > 0" class="count-active">
                            {{ getYakuCount(yakuKey) }}回
                          </span>
                          <span v-else class="count-disabled">0回</span>
                        </div>
                      </v-card-text>
                    </v-card>
                  </div>
                </div>

                <!-- 3翻 -->
                <div class="han-section">
                  <h3 class="han-title">3翻</h3>
                  <div class="yaku-grid">
                    <v-card
                      v-for="yakuKey in getFilteredYakuByHan(3)"
                      :key="yakuKey"
                      :class="['yaku-card', { 'yaku-card-disabled': getYakuCount(yakuKey) === 0 }]"
                      variant="outlined"
                    >
                      <v-card-text class="yaku-card-content">
                        <div class="yaku-name">{{ YAKU_NAMES[yakuKey] }}</div>
                        <div class="yaku-count">
                          <span v-if="getYakuCount(yakuKey) > 0" class="count-active">
                            {{ getYakuCount(yakuKey) }}回
                          </span>
                          <span v-else class="count-disabled">0回</span>
                        </div>
                      </v-card-text>
                    </v-card>
                  </div>
                </div>

                <!-- 6翻 -->
                <div class="han-section">
                  <h3 class="han-title">6翻</h3>
                  <div class="yaku-grid">
                    <v-card
                      v-for="yakuKey in getFilteredYakuByHan(6)"
                      :key="yakuKey"
                      :class="['yaku-card', { 'yaku-card-disabled': getYakuCount(yakuKey) === 0 }]"
                      variant="outlined"
                    >
                      <v-card-text class="yaku-card-content">
                        <div class="yaku-name">{{ YAKU_NAMES[yakuKey] }}</div>
                        <div class="yaku-count">
                          <span v-if="getYakuCount(yakuKey) > 0" class="count-active">
                            {{ getYakuCount(yakuKey) }}回
                          </span>
                          <span v-else class="count-disabled">0回</span>
                        </div>
                      </v-card-text>
                    </v-card>
                  </div>
                </div>

                <!-- 役満 -->
                <div class="han-section">
                  <h3 class="han-title yakuman-title">役満</h3>
                  <div class="yaku-grid">
                    <v-card
                      v-for="yakuKey in getFilteredYakuByHan('yakuman')"
                      :key="yakuKey"
                      :class="['yaku-card yakuman-card', { 'yaku-card-disabled': getYakuCount(yakuKey) === 0 }]"
                      variant="outlined"
                    >
                      <v-card-text class="yaku-card-content">
                        <div class="yaku-name">{{ YAKU_NAMES[yakuKey] }}</div>
                        <div class="yaku-count">
                          <span v-if="getYakuCount(yakuKey) > 0" class="count-active yakuman-count">
                            {{ getYakuCount(yakuKey) }}回
                          </span>
                          <span v-else class="count-disabled">0回</span>
                        </div>
                      </v-card-text>
                    </v-card>
                  </div>
                </div>
              </div>
            </div>
          </v-window-item>
        </v-window>
      </v-card-text>
      
      <v-card-actions class="justify-center pb-4">
        <v-btn color="error" variant="outlined" @click="clearRecords" class="mr-2">
          <v-icon start>mdi-delete</v-icon>
          記録をクリア
        </v-btn>
        <v-btn color="primary" @click="closeModal">
          <v-icon start>mdi-check</v-icon>
          閉じる
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { GameRecords, GameModeStats } from '../types/records'
import { DEFAULT_RECORDS, YAKU_NAMES, YAKU_BY_HAN, YAKU_NAME_TO_KEY } from '../types/records'

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

const activeTab = ref('stats')
const yakuSearch = ref('')
const records = ref<GameRecords>(DEFAULT_RECORDS)

// 記録を読み込み
function loadRecords() {
  try {
    const savedRecords = localStorage.getItem('mahjongGameRecords')
    if (savedRecords) {
      const parsed = JSON.parse(savedRecords)
      records.value = {
        ...DEFAULT_RECORDS,
        ...parsed,
        gameStats: {
          ...DEFAULT_RECORDS.gameStats,
          ...parsed.gameStats
        }
      }
    }
  } catch (error) {
    console.error('記録の読み込みに失敗しました:', error)
  }
}

// モーダルが開かれるたびに記録を読み込み
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    loadRecords()
  }
})

// 平均上がり点を計算
function getAverageWinPoints(gameMode: keyof GameRecords['gameStats']): string {
  const stats = records.value.gameStats[gameMode]
  if (stats.winCount === 0) return '---'
  return Math.round(stats.totalWinPoints / stats.winCount).toLocaleString()
}

// 平均上がり巡目を計算
function getAverageWinTurns(gameMode: keyof GameRecords['gameStats']): string {
  const stats = records.value.gameStats[gameMode]
  if (stats.winCount === 0) return '---'
  return (stats.totalWinTurns / stats.winCount).toFixed(1)
}

// 平均上がり回数を計算（上がり回数 / 対戦回数）
function getAverageWinCount(gameMode: keyof GameRecords['gameStats']): string {
  const stats = records.value.gameStats[gameMode]
  if (stats.totalGames === 0) return '---'
  return (stats.winCount / stats.totalGames).toFixed(2)
}

// 役の上がり回数を取得
function getYakuCount(yakuKey: string): number {
  return records.value.yakuRecords[yakuKey]?.count || 0
}

// ハン数別にフィルターされた役を取得
function getFilteredYakuByHan(han: number | string): string[] {
  const yakuList = YAKU_BY_HAN[han as keyof typeof YAKU_BY_HAN] || []
  
  if (!yakuSearch.value) return yakuList
  
  const search = yakuSearch.value.toLowerCase()
  return yakuList.filter(yakuKey => {
    const yakuName = YAKU_NAMES[yakuKey]
    return yakuName.toLowerCase().includes(search) || yakuKey.toLowerCase().includes(search)
  })
}

// 記録をクリア
function clearRecords() {
  if (confirm('記録をすべてクリアしますか？この操作は取り消せません。')) {
    localStorage.removeItem('mahjongGameRecords')
    records.value = DEFAULT_RECORDS
  }
}

function closeModal() {
  emit('update:modelValue', false)
}
</script>

<style scoped>
.records-modal {
  max-height: 90vh;
  overflow-y: auto;
  width: 100% !important;
  max-width: 900px !important;
}

.records-title {
  background: linear-gradient(45deg, #1976d2, #42a5f5);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: bold;
  margin-bottom: 16px;
}

.stats-content {
  padding: 0 8px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.stats-card {
  transition: all 0.3s ease;
}

.stats-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stats-card-title {
  font-size: 1rem !important;
  font-weight: 600;
  color: #1976d2;
  padding-bottom: 8px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
}

.stat-value {
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
}

.stat-value.highlight {
  color: #d32f2f;
  font-size: 1rem;
}

.yaku-content {
  padding: 0 8px;
}

.yaku-sections {
  max-height: 400px;
  overflow-y: auto;
}

.han-section {
  margin-bottom: 24px;
}

.han-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1976d2;
  margin: 0 0 12px 0;
  padding-bottom: 4px;
  border-bottom: 2px solid #e3f2fd;
}

.yakuman-title {
  color: #d32f2f;
  border-bottom-color: #ffebee;
}

.yaku-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.yaku-card {
  transition: all 0.3s ease;
  border: 1px solid #e0e0e0;
}

.yaku-card:hover:not(.yaku-card-disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-color: #1976d2;
}

.yaku-card-disabled {
  opacity: 0.4;
  background-color: #f5f5f5;
}

.yaku-card-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px !important;
}

.yaku-name {
  font-size: 0.9rem;
  font-weight: 500;
  color: #333;
}

.yaku-count {
  font-size: 0.85rem;
  font-weight: 600;
}

.count-active {
  color: #1976d2;
  background: rgba(25, 118, 210, 0.1);
  padding: 2px 8px;
  border-radius: 12px;
}

.count-disabled {
  color: #999;
}

.yakuman-card {
  border-color: #ffcdd2;
}

.yakuman-card:hover:not(.yaku-card-disabled) {
  border-color: #d32f2f;
}

.yakuman-count {
  background: rgba(211, 47, 47, 0.1) !important;
  color: #d32f2f !important;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .yaku-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
  
  .stat-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }
}
</style>