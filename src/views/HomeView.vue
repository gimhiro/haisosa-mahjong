<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// ゲーム設定
const gameSettings = ref({
  cpuStrengthPreset: 'normal', // 'normal', 'hard', 'super', 'custom'
  customCpuStrengths: ['normal', 'normal', 'normal'], // CPU1, CPU2, CPU3の個別設定
  gameType: 'tonpuusen', // 'tonpuusen' (東風戦) or 'tonnanssen' (東南戦)
  agariRenchan: false, // 上がり連荘
  hakoshita: true // 箱下
})

const cpuStrengthOptions = [
  { value: 'easy', title: '簡単' },
  { value: 'normal', title: '普通' },
  { value: 'hard', title: '難しい' },
  { value: 'super', title: '超難しい' }
]

const cpuPresetOptions = [
  { value: 'normal', title: '普通 × 3', description: 'バランスの取れた難易度' },
  { value: 'hard', title: '難しい × 3', description: '上級者向け' },
  { value: 'super', title: '超難しい × 3', description: '最高難易度' },
  { value: 'custom', title: '詳細設定', description: 'CPUごとに個別設定' }
]

function startUkeireDemo() {
  router.push('/game')
}

function startFourPlayerGame() {
  // ゲーム設定を保存してから遷移
  const settings = {
    cpuStrengths: gameSettings.value.cpuStrengthPreset === 'custom' 
      ? gameSettings.value.customCpuStrengths
      : [gameSettings.value.cpuStrengthPreset, gameSettings.value.cpuStrengthPreset, gameSettings.value.cpuStrengthPreset],
    gameType: gameSettings.value.gameType,
    agariRenchan: gameSettings.value.agariRenchan,
    hakoshita: gameSettings.value.hakoshita
  }
  
  // ローカルストレージに保存
  localStorage.setItem('mahjongGameSettings', JSON.stringify(settings))
  
  router.push('/four-player')
}

// プリセット選択時の処理
function onPresetChange() {
  if (gameSettings.value.cpuStrengthPreset !== 'custom') {
    // プリセットの場合は個別設定をリセット
    gameSettings.value.customCpuStrengths = [
      gameSettings.value.cpuStrengthPreset,
      gameSettings.value.cpuStrengthPreset,
      gameSettings.value.cpuStrengthPreset
    ]
  }
}
</script>

<template>
  <v-container class="home-view">
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <v-card class="welcome-card" elevation="8">
          <v-card-title class="text-h3 text-center">
            麻雀アプリ
          </v-card-title>
          
          <v-card-subtitle class="text-h6 text-center">
            riichi-rs-bundlers 受け入れ計算デモ & 4人対戦
          </v-card-subtitle>
          
          <v-card-text>
            <!-- ゲーム開始設定パネル -->
            <v-card class="game-settings-panel mt-4" variant="outlined">
              <v-card-title class="text-h5">
                <v-icon start>mdi-cog</v-icon>
                ゲーム設定
              </v-card-title>
              
              <v-card-text>
                <v-row>
                  <!-- CPU強さ設定 -->
                  <v-col cols="12">
                    <v-card variant="outlined" class="mb-4">
                      <v-card-subtitle class="font-weight-bold">CPU の強さ</v-card-subtitle>
                      <v-card-text>
                        <v-radio-group 
                          v-model="gameSettings.cpuStrengthPreset"
                          @update:model-value="onPresetChange"
                        >
                          <v-radio
                            v-for="preset in cpuPresetOptions"
                            :key="preset.value"
                            :value="preset.value"
                            :label="preset.title"
                          >
                            <template #label>
                              <div>
                                <div class="font-weight-medium">{{ preset.title }}</div>
                                <div class="text-caption text-medium-emphasis">{{ preset.description }}</div>
                              </div>
                            </template>
                          </v-radio>
                        </v-radio-group>
                        
                        <!-- 詳細設定 -->
                        <v-expand-transition>
                          <div v-show="gameSettings.cpuStrengthPreset === 'custom'" class="mt-4">
                            <v-divider class="mb-4"></v-divider>
                            <div class="text-subtitle-2 mb-3">個別CPU設定</div>
                            <v-row>
                              <v-col cols="12" sm="4" v-for="(strength, index) in gameSettings.customCpuStrengths" :key="index">
                                <v-select
                                  v-model="gameSettings.customCpuStrengths[index]"
                                  :items="cpuStrengthOptions"
                                  :label="`CPU${index + 1}`"
                                  variant="outlined"
                                  density="comfortable"
                                />
                              </v-col>
                            </v-row>
                          </div>
                        </v-expand-transition>
                      </v-card-text>
                    </v-card>
                  </v-col>
                  
                  <!-- 局数設定 -->
                  <v-col cols="12" sm="6">
                    <v-card variant="outlined">
                      <v-card-subtitle class="font-weight-bold">局数</v-card-subtitle>
                      <v-card-text>
                        <v-radio-group v-model="gameSettings.gameType" density="compact">
                          <v-radio value="tonpuusen" label="東風戦"></v-radio>
                          <v-radio value="tonnanssen" label="東南戦"></v-radio>
                        </v-radio-group>
                      </v-card-text>
                    </v-card>
                  </v-col>
                  
                  <!-- ゲームルール設定 -->
                  <v-col cols="12" sm="6">
                    <v-card variant="outlined">
                      <v-card-subtitle class="font-weight-bold">ゲームルール</v-card-subtitle>
                      <v-card-text>
                        <v-switch
                          v-model="gameSettings.agariRenchan"
                          label="上がり連荘"
                          color="primary"
                          density="comfortable"
                        ></v-switch>
                        <v-switch
                          v-model="gameSettings.hakoshita"
                          label="箱下"
                          color="primary"
                          density="comfortable"
                        ></v-switch>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
            
            <!-- ゲームモード説明 -->
            <div class="feature-list mt-6">
              <v-list>
                <v-list-item>
                  <template #prepend>
                    <v-icon color="success">mdi-calculator-variant</v-icon>
                  </template>
                  <v-list-item-title>受け入れ計算デモ</v-list-item-title>
                  <v-list-item-subtitle>2シャンテンからの受け入れ枚数を計算</v-list-item-subtitle>
                </v-list-item>
                
                <v-list-item>
                  <template #prepend>
                    <v-icon color="primary">mdi-account-group</v-icon>
                  </template>
                  <v-list-item-title>4人対戦</v-list-item-title>
                  <v-list-item-subtitle>CPU3人との本格的な麻雀ゲーム</v-list-item-subtitle>
                </v-list-item>
                
                <v-list-item>
                  <template #prepend>
                    <v-icon color="info">mdi-code-braces</v-icon>
                  </template>
                  <v-list-item-title>riichi-rs-bundlers 使用</v-list-item-title>
                  <v-list-item-subtitle>Rust製の高速・高精度な麻雀ライブラリ</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </div>
          </v-card-text>
          
          <v-card-actions class="justify-center pb-6">
            <div class="game-mode-buttons">
              <v-btn
                color="success"
                size="large"
                elevation="2"
                @click="startUkeireDemo"
                class="mb-2"
                variant="elevated"
              >
                <v-icon start>mdi-calculator-variant</v-icon>
                受け入れ計算デモ
              </v-btn>
              
              <v-btn
                color="primary"
                size="x-large"
                elevation="3"
                @click="startFourPlayerGame"
                variant="elevated"
                class="start-game-btn"
              >
                <v-icon start size="large">mdi-account-group</v-icon>
                4人対戦を開始
              </v-btn>
            </div>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    
    <v-row justify="center" class="mt-8">
      <v-col cols="12" md="10">
        <v-card class="info-card">
          <v-card-title>使い方</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="4">
                <div class="instruction-step">
                  <v-icon size="48" color="primary">mdi-numeric-1-circle</v-icon>
                  <h3>ゲーム設定</h3>
                  <p>CPU の強さや局数、ゲームルールを設定します。</p>
                </div>
              </v-col>
              
              <v-col cols="12" md="4">
                <div class="instruction-step">
                  <v-icon size="48" color="success">mdi-numeric-2-circle</v-icon>
                  <h3>ゲーム開始</h3>
                  <p>受け入れ計算デモまたは4人対戦を選択してゲームを開始します。</p>
                </div>
              </v-col>
              
              <v-col cols="12" md="4">
                <div class="instruction-step">
                  <v-icon size="48" color="warning">mdi-numeric-3-circle</v-icon>
                  <h3>対戦・分析</h3>
                  <p>4人対戦では本格的な麻雀を楽しめ、デモでは受け入れ分析ができます。</p>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.home-view {
  width: 100vw;
  min-height: calc(100vh - 64px);
  margin: 0;
  padding: 1rem 0;
  background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
}

.welcome-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

.game-settings-panel {
  background: rgba(248, 249, 250, 0.8);
}

.feature-list {
  margin: 1rem 0;
}

.info-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(5px);
}

.instruction-step {
  text-align: center;
  padding: 1rem;
}

.instruction-step h3 {
  margin: 0.5rem 0;
  color: #1976d2;
}

.instruction-step p {
  color: #666;
  line-height: 1.6;
}

.game-mode-buttons {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
}

.start-game-btn {
  font-size: 1.1rem;
  font-weight: 600;
  padding: 16px 32px !important;
}

.v-radio :deep(.v-label) {
  opacity: 1;
}
</style>