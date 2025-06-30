<template>
  <v-dialog v-model="isOpen" max-width="900" :scrim="false">
    <v-card class="settings-modal">
      <v-card-title class="text-h5 text-center settings-title">
        <v-icon class="mr-2">mdi-cog</v-icon>
        現在の設定
      </v-card-title>
      
      <v-card-text>
        <div class="settings-content">
          <!-- CPU強さ設定 -->
          <div class="setting-section">
            <div class="section-header">
              <v-icon class="section-icon">mdi-robot</v-icon>
              <h3 class="section-title">CPU の強さ</h3>
            </div>
            <div class="setting-values">
              <div class="cpu-setting">
                <span class="cpu-label">CPU1 (南家):</span>
                <v-chip :color="getCpuStrengthColor(settings.cpuStrengths[0])" class="ml-2">
                  {{ getCpuStrengthText(settings.cpuStrengths[0]) }}
                </v-chip>
              </div>
              <div class="cpu-setting">
                <span class="cpu-label">CPU2 (西家):</span>
                <v-chip :color="getCpuStrengthColor(settings.cpuStrengths[1])" class="ml-2">
                  {{ getCpuStrengthText(settings.cpuStrengths[1]) }}
                </v-chip>
              </div>
              <div class="cpu-setting">
                <span class="cpu-label">CPU3 (北家):</span>
                <v-chip :color="getCpuStrengthColor(settings.cpuStrengths[2])" class="ml-2">
                  {{ getCpuStrengthText(settings.cpuStrengths[2]) }}
                </v-chip>
              </div>
            </div>
          </div>

          <!-- ゲームタイプ設定 -->
          <div class="setting-section">
            <div class="section-header">
              <v-icon class="section-icon">mdi-clock-outline</v-icon>
              <h3 class="section-title">局数</h3>
            </div>
            <div class="setting-values">
              <v-chip :color="settings.gameType === 'tonpuusen' ? 'primary' : 'secondary'" size="large">
                <v-icon start>{{ settings.gameType === 'tonpuusen' ? 'mdi-clock-fast' : 'mdi-clock' }}</v-icon>
                {{ settings.gameType === 'tonpuusen' ? '東風戦 (4局)' : '東南戦 (8局)' }}
              </v-chip>
            </div>
          </div>

          <!-- ルール設定 -->
          <div class="setting-section">
            <div class="section-header">
              <v-icon class="section-icon">mdi-gavel</v-icon>
              <h3 class="section-title">ルール</h3>
            </div>
            <div class="setting-values">
              <div class="rule-setting">
                <v-icon :color="settings.agariRenchan ? 'success' : 'grey'">
                  {{ settings.agariRenchan ? 'mdi-check-circle' : 'mdi-close-circle' }}
                </v-icon>
                <span class="rule-label">上がり連荘</span>
                <span :class="['rule-status', settings.agariRenchan ? 'enabled' : 'disabled']">
                  {{ settings.agariRenchan ? '有効' : '無効' }}
                </span>
              </div>
              <div class="rule-setting">
                <v-icon :color="settings.hakoshita ? 'success' : 'grey'">
                  {{ settings.hakoshita ? 'mdi-check-circle' : 'mdi-close-circle' }}
                </v-icon>
                <span class="rule-label">トビ終了</span>
                <span :class="['rule-status', settings.hakoshita ? 'enabled' : 'disabled']">
                  {{ settings.hakoshita ? '有効' : '無効' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </v-card-text>
      
      <v-card-actions class="justify-center pb-4">
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

const settings = ref({
  cpuStrengths: ['normal', 'normal', 'normal'],
  gameType: 'tonpuusen',
  agariRenchan: false,
  hakoshita: true
})

// 設定を読み込み
function loadSettings() {
  try {
    const savedSettings = localStorage.getItem('mahjongGameSettings')
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings)
      settings.value = {
        cpuStrengths: parsed.cpuStrengths || ['normal', 'normal', 'normal'],
        gameType: parsed.gameType || 'tonpuusen',
        agariRenchan: parsed.agariRenchan || false,
        hakoshita: parsed.hakoshita !== undefined ? parsed.hakoshita : true
      }
    }
  } catch (error) {
    console.error('設定の読み込みに失敗しました:', error)
  }
}

// モーダルが開かれるたびに設定を読み込み
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    loadSettings()
  }
})

function getCpuStrengthText(strength: string): string {
  const strengthMap: Record<string, string> = {
    easy: '簡単',
    normal: '普通',
    hard: '難しい',
    super: '超難しい'
  }
  return strengthMap[strength] || '普通'
}

function getCpuStrengthColor(strength: string): string {
  const colorMap: Record<string, string> = {
    easy: 'success',
    normal: 'primary',
    hard: 'warning',
    super: 'error'
  }
  return colorMap[strength] || 'primary'
}

function closeModal() {
  emit('update:modelValue', false)
}
</script>

<style scoped>
.settings-modal {
  max-height: 90vh;
  overflow-y: auto;
  width: 100% !important;
  max-width: 900px !important;
}

.settings-title {
  background: linear-gradient(45deg, #1976d2, #42a5f5);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: bold;
  margin-bottom: 16px;
}

.settings-content {
  padding: 0 8px;
}

.setting-section {
  background: rgba(248, 250, 252, 0.7);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.section-icon {
  font-size: 1.25rem;
  color: #1976d2;
  margin-right: 8px;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #334155;
  margin: 0;
}

.setting-values {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cpu-setting {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0;
}

.cpu-label {
  font-weight: 500;
  color: #475569;
}

.rule-setting {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
}

.rule-label {
  font-weight: 500;
  color: #475569;
  flex: 1;
}

.rule-status {
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.875rem;
}

.rule-status.enabled {
  color: #059669;
  background: rgba(5, 150, 105, 0.1);
}

.rule-status.disabled {
  color: #6b7280;
  background: rgba(107, 114, 128, 0.1);
}

@media (max-width: 768px) {
  .cpu-setting {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .rule-setting {
    flex-wrap: wrap;
  }
}
</style>