<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// コンポーネントマウント時の処理
onMounted(() => {
  // 必要に応じて初期化処理を追加
})

// ゲーム設定
const gameSettings = ref({
  cpuStrengthPreset: 'normal', // 'easy', 'normal', 'hard', 'super', 'custom'
  customCpuStrengths: ['normal', 'normal', 'normal'], // CPU1, CPU2, CPU3の個別設定
  gameType: 'tonpuusen', // 'tonpuusen' (東風戦) or 'tonnanssen' (東南戦)
  agariRenchan: false, // 上がり連荘
  hakoshita: false, // トビ終了
  manipulationRate: 80, // 牌操作率
  handQuality: 'good' // 手牌の良さ
})

// 各設定セクションの開閉状態
const sectionExpanded = ref({
  cpu: false,
  gameType: false,
  manipulation: false
})


const cpuPresetOptions = [
  { 
    value: 'easy', 
    title: 'Easy × 3', 
    description: 'ランダム打牌',
    detail: '基本的な判断のみ、初心者におすすめ'
  },
  { 
    value: 'normal', 
    title: 'Normal × 3', 
    description: 'ターツ構成を理解した打牌',
    detail: '適度な判断力で、初心者から中級者におすすめ'
  },
  { 
    value: 'hard', 
    title: 'Hard × 3', 
    description: '牌効率を考慮した打牌',
    detail: '高い判断力で効率的に打牌、中級者以上向け'
  },
  { 
    value: 'super', 
    title: 'Super × 3', 
    description: 'hardAI + 80% の牌操作',
    detail: '最適解に近い打牌、上級者向けの高難易度'
  },
  { 
    value: 'custom', 
    title: '詳細設定', 
    description: 'CPUごとに個別設定',
    detail: 'CPU1〜3の強さを個別にカスタマイズ'
  }
]

const cpuStrengthOptions = [
  { value: 'easy', title: '簡単', description: 'ランダム打牌' },
  { value: 'normal', title: '普通', description: 'ターツ構成を理解した打牌' },
  { value: 'hard', title: '難しい', description: '牌効率を考慮した打牌' },
  { value: 'super', title: '超難しい', description: '80% の牌操作' }
]

const gameTypeOptions = [
  { 
    value: 'tonpuusen', 
    title: '東風戦', 
    description: '東場のみ（4局）の短時間戦',
    icon: 'mdi-clock-fast'
  },
  { 
    value: 'tonnanssen', 
    title: '東南戦', 
    description: '東場・南場（8局）の本格戦',
    icon: 'mdi-clock'
  }
]

const manipulationRateOptions = [
  { value: 0, title: '0%', description: '完全ランダム' },
  { value: 40, title: '40%', description: '軽微な操作' },
  { value: 80, title: '80%', description: '高確率操作' }
]

const handQualityOptions = [
  { value: 'normal', title: '普通', description: 'ランダム配牌' },
  { value: 'good', title: '良い', description: '2候補から最良を選択' },
  { value: 'excellent', title: '最高', description: '5候補から最良を選択' }
]


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
  
  // ゲーム中設定も保存
  const gameplaySettings = {
    disableMeld: false,
    autoWin: false,
    showAcceptance: false,
    showAcceptanceHighlight: false,
    manipulationRate: gameSettings.value.manipulationRate,
    handQuality: gameSettings.value.handQuality,
    testMode: {
      isActive: false,
      players: [
        { tiles: [], drawTiles: [] },
        { tiles: [], drawTiles: [] },
        { tiles: [], drawTiles: [] },
        { tiles: [], drawTiles: [] }
      ]
    }
  }
  
  // ローカルストレージに保存
  localStorage.setItem('mahjongGameSettings', JSON.stringify(settings))
  localStorage.setItem('mahjong-game-settings', JSON.stringify(gameplaySettings))
  
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

// 現在の設定値を表示用に整形
const cpuSettingDisplay = computed(() => {
  const preset = cpuPresetOptions.find(p => p.value === gameSettings.value.cpuStrengthPreset)
  if (gameSettings.value.cpuStrengthPreset === 'custom') {
    return `カスタム: ${gameSettings.value.customCpuStrengths.join(', ')}`
  }
  return preset?.title || ''
})

const gameTypeDisplay = computed(() => {
  const type = gameTypeOptions.find(t => t.value === gameSettings.value.gameType)
  const options = []
  if (type) options.push(type.title)
  if (gameSettings.value.agariRenchan) options.push('上がり連荘')
  if (gameSettings.value.hakoshita) options.push('トビ終了')
  return options.join(' / ')
})

const manipulationDisplay = computed(() => {
  const rate = manipulationRateOptions.find(r => r.value === gameSettings.value.manipulationRate)
  const quality = handQualityOptions.find(q => q.value === gameSettings.value.handQuality)
  return `有効牌ツモ率: ${rate?.title || ''} / 配牌: ${quality?.title || ''}`
})
</script>

<template>
  <div class="home-view">
    <!-- メインタイトル -->
    <div class="title-section">
      <h1 class="main-title">牌操作麻雀</h1>
      <p class="main-subtitle">リアルタイム牌操作で楽しむ本格4人対戦麻雀</p>
    </div>

    <!-- ゲーム開始設定パネル -->
    <div class="panel-container">
      <v-card class="game-settings-panel" elevation="12">
          <div class="panel-header">
            <div class="header-content">
              <v-icon class="header-icon">mdi-gamepad-variant</v-icon>
              <h2 class="panel-title">ゲーム設定</h2>
            </div>
            <div class="header-decoration"></div>
          </div>
          
          <v-card-text class="pa-8">
            <!-- ゲーム開始ボタン -->
            <div class="start-button-container mb-6">
              <v-btn
                color="primary"
                size="x-large"
                elevation="8"
                @click="startFourPlayerGame"
                class="start-game-btn"
              >
                <v-icon start size="large">mdi-play</v-icon>
                4人対戦を開始
              </v-btn>
            </div>
            
            <v-row class="settings-grid">
              <!-- CPU強さ設定 -->
              <v-col cols="12">
                <div class="setting-section">
                  <div class="section-header" @click="sectionExpanded.cpu = !sectionExpanded.cpu">
                    <div class="section-header-content">
                      <v-icon class="section-icon">mdi-robot</v-icon>
                      <h3 class="section-title">CPU の強さ</h3>
                      <span class="section-value">{{ cpuSettingDisplay }}</span>
                    </div>
                    <v-icon class="expand-icon" :class="{ 'expand-icon--expanded': sectionExpanded.cpu }">
                      mdi-chevron-down
                    </v-icon>
                  </div>
                  
                  <v-expand-transition>
                    <div v-show="sectionExpanded.cpu">
                      <div class="preset-grid">
                        <div
                          v-for="preset in cpuPresetOptions"
                          :key="preset.value"
                          :class="['preset-card', { 'preset-card--selected': gameSettings.cpuStrengthPreset === preset.value }]"
                          @click="gameSettings.cpuStrengthPreset = preset.value; onPresetChange()"
                        >
                          <div class="preset-card-inner">
                            <div class="preset-header">
                              <v-icon 
                                :class="['preset-icon', { 'preset-icon--selected': gameSettings.cpuStrengthPreset === preset.value }]"
                              >
                                {{ preset.value === 'custom' ? 'mdi-tune' : 'mdi-robot' }}
                              </v-icon>
                              <div class="preset-title">{{ preset.title }}</div>
                            </div>
                            <div class="preset-description">{{ preset.description }}</div>
                            <div class="preset-detail">{{ preset.detail }}</div>
                            <div 
                              :class="['preset-indicator', { 'preset-indicator--selected': gameSettings.cpuStrengthPreset === preset.value }]"
                            ></div>
                          </div>
                        </div>
                      </div>
                      
                      <!-- 詳細設定 -->
                      <v-expand-transition>
                        <div v-show="gameSettings.cpuStrengthPreset === 'custom'" class="custom-settings mt-6">
                          <div class="custom-header">
                            <v-icon class="custom-icon">mdi-tune</v-icon>
                            <span class="custom-title">個別CPU設定</span>
                          </div>
                          <v-row class="mt-4">
                            <v-col cols="12" sm="4" v-for="(strength, index) in gameSettings.customCpuStrengths" :key="index">
                              <div class="cpu-custom-section">
                                <h4 class="cpu-custom-label">CPU{{ index + 1 }}</h4>
                                <v-select
                                  v-model="gameSettings.customCpuStrengths[index]"
                                  :items="cpuStrengthOptions"
                                  variant="outlined"
                                  density="comfortable"
                                  class="cpu-select"
                                >
                                  <template #item="{ props, item }">
                                    <v-list-item v-bind="props" class="cpu-option-item">
                                      <v-list-item-title>{{ item.value }}</v-list-item-title>
                                      <v-list-item-subtitle>{{ item.raw.description }}</v-list-item-subtitle>
                                    </v-list-item>
                                  </template>
                                </v-select>
                              </div>
                            </v-col>
                          </v-row>
                        </div>
                      </v-expand-transition>
                    </div>
                  </v-expand-transition>
                </div>
              </v-col>
              
              <!-- 局数・ルール設定 -->
              <v-col cols="12">
                <div class="setting-section">
                  <div class="section-header" @click="sectionExpanded.gameType = !sectionExpanded.gameType">
                    <div class="section-header-content">
                      <v-icon class="section-icon">mdi-gamepad-square</v-icon>
                      <h3 class="section-title">ゲーム形式</h3>
                      <span class="section-value">{{ gameTypeDisplay }}</span>
                    </div>
                    <v-icon class="expand-icon" :class="{ 'expand-icon--expanded': sectionExpanded.gameType }">
                      mdi-chevron-down
                    </v-icon>
                  </div>
                  
                  <v-expand-transition>
                    <div v-show="sectionExpanded.gameType">
                      <v-row>
                  <!-- 局数設定 -->
                  <v-col cols="12" sm="6">
                    <div class="setting-section">
                      <div class="section-header">
                        <v-icon class="section-icon">mdi-clock-outline</v-icon>
                        <h3 class="section-title">局数</h3>
                      </div>
                      <div class="game-type-grid">
                        <div
                          v-for="gameType in gameTypeOptions"
                          :key="gameType.value"
                          :class="['game-type-card', { 'game-type-card--selected': gameSettings.gameType === gameType.value }]"
                          @click="gameSettings.gameType = gameType.value"
                        >
                          <div class="game-type-header">
                            <v-icon 
                              :class="['game-type-icon', { 'game-type-icon--selected': gameSettings.gameType === gameType.value }]"
                            >
                              {{ gameType.icon }}
                            </v-icon>
                            <div class="game-type-title">{{ gameType.title }}</div>
                          </div>
                          <div class="game-type-description">{{ gameType.description }}</div>
                          <div 
                            :class="['game-type-indicator', { 'game-type-indicator--selected': gameSettings.gameType === gameType.value }]"
                          ></div>
                        </div>
                      </div>
                    </div>
                  </v-col>
                  
                  <!-- ゲームルール設定 -->
                  <v-col cols="12" sm="6">
                    <div class="setting-section">
                      <div class="section-header">
                        <v-icon class="section-icon">mdi-gavel</v-icon>
                        <h3 class="section-title">ルール</h3>
                      </div>
                      <div class="rule-switches">
                        <v-switch
                          v-model="gameSettings.agariRenchan"
                          label="上がり連荘"
                          color="primary"
                          class="rule-switch"
                        ></v-switch>
                        <v-switch
                          v-model="gameSettings.hakoshita"
                          label="トビ終了"
                          color="primary"
                          class="rule-switch"
                        ></v-switch>
                      </div>
                    </div>
                  </v-col>
                </v-row>
                    </div>
                  </v-expand-transition>
                </div>
              </v-col>
              
              <!-- 牌操作・配牌設定 -->
              <v-col cols="12">
                <div class="setting-section">
                  <div class="section-header" @click="sectionExpanded.manipulation = !sectionExpanded.manipulation">
                    <div class="section-header-content">
                      <v-icon class="section-icon">mdi-dice-6</v-icon>
                      <h3 class="section-title">牌操作・配牌</h3>
                      <span class="section-value">{{ manipulationDisplay }}</span>
                    </div>
                    <v-icon class="expand-icon" :class="{ 'expand-icon--expanded': sectionExpanded.manipulation }">
                      mdi-chevron-down
                    </v-icon>
                  </div>
                  
                  <v-expand-transition>
                    <div v-show="sectionExpanded.manipulation">
                      <v-row>
                  <!-- 牌操作率設定 -->
                  <v-col cols="12" sm="6">
                    <div class="setting-section">
                      <div class="section-header">
                        <v-icon class="section-icon">mdi-shuffle-variant</v-icon>
                        <h3 class="section-title">有効牌ツモ率</h3>
                      </div>
                      <div class="manipulation-grid">
                        <div
                          v-for="option in manipulationRateOptions"
                          :key="option.value"
                          :class="['manipulation-card', { 'manipulation-card--selected': gameSettings.manipulationRate === option.value }]"
                          @click="gameSettings.manipulationRate = option.value"
                        >
                          <div class="manipulation-header">
                            <v-icon 
                              :class="['manipulation-icon', { 'manipulation-icon--selected': gameSettings.manipulationRate === option.value }]"
                            >
                              mdi-shuffle-variant
                            </v-icon>
                            <div class="manipulation-title">{{ option.title }}</div>
                          </div>
                          <div class="manipulation-description">{{ option.description }}</div>
                          <div 
                            :class="['manipulation-indicator', { 'manipulation-indicator--selected': gameSettings.manipulationRate === option.value }]"
                          ></div>
                        </div>
                      </div>
                    </div>
                  </v-col>
                  
                  <!-- 手牌の良さ設定 -->
                  <v-col cols="12" sm="6">
                    <div class="setting-section">
                      <div class="section-header">
                        <v-icon class="section-icon">mdi-cards</v-icon>
                        <h3 class="section-title">配牌の良さ</h3>
                      </div>
                      <div class="hand-quality-grid">
                        <div
                          v-for="option in handQualityOptions"
                          :key="option.value"
                          :class="['hand-quality-card', { 'hand-quality-card--selected': gameSettings.handQuality === option.value }]"
                          @click="gameSettings.handQuality = option.value"
                        >
                          <div class="hand-quality-header">
                            <v-icon 
                              :class="['hand-quality-icon', { 'hand-quality-icon--selected': gameSettings.handQuality === option.value }]"
                            >
                              mdi-cards
                            </v-icon>
                            <div class="hand-quality-title">{{ option.title }}</div>
                          </div>
                          <div class="hand-quality-description">{{ option.description }}</div>
                          <div 
                            :class="['hand-quality-indicator', { 'hand-quality-indicator--selected': gameSettings.handQuality === option.value }]"
                          ></div>
                        </div>
                      </div>
                    </div>
                  </v-col>
                </v-row>
                    </div>
                  </v-expand-transition>
                </div>
              </v-col>
            </v-row>
            
            <!-- ゲーム開始ボタン（下部） -->
            <!-- <div class="start-button-container mt-8 mb-2">
              <v-btn
                color="primary"
                size="x-large"
                elevation="8"
                @click="startFourPlayerGame"
                class="start-game-btn"
              >
                <v-icon start size="large">mdi-play</v-icon>
                4人対戦を開始
              </v-btn>
            </div> -->
          </v-card-text>
        </v-card>
      </div>
    
    <!-- 使い方 -->
    <div class="info-section">
      <v-card class="info-card" elevation="6">
          <v-card-title class="info-title">
            <v-icon class="info-icon">mdi-help-circle</v-icon>
            使い方
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="4">
                <div class="instruction-step">
                  <div class="step-icon-wrapper">
                    <v-icon size="48" class="step-icon">mdi-numeric-1-circle</v-icon>
                  </div>
                  <h3>ゲーム設定</h3>
                  <p>CPU の強さや局数、ゲームルールを設定します。</p>
                </div>
              </v-col>
              
              <v-col cols="12" md="4">
                <div class="instruction-step">
                  <div class="step-icon-wrapper">
                    <v-icon size="48" class="step-icon">mdi-numeric-2-circle</v-icon>
                  </div>
                  <h3>ゲーム開始</h3>
                  <p>設定完了後、4人対戦ボタンでゲームを開始します。</p>
                </div>
              </v-col>
              
              <v-col cols="12" md="4">
                <div class="instruction-step">
                  <div class="step-icon-wrapper">
                    <v-icon size="48" class="step-icon">mdi-numeric-3-circle</v-icon>
                  </div>
                  <h3>対戦・分析</h3>
                  <p>本格的な麻雀を楽しめます。</p>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </div>

    <!-- バージョン履歴 -->
    <div class="version-history-section">
      <v-card class="version-history-card" elevation="4">
          <v-card-title class="version-history-title">
            <div class="version-history-title-content">
              <div class="version-history-title-left">
                <v-icon class="version-history-icon">mdi-history</v-icon>
                バージョン履歴
              </div>
              <div class="current-version">v1.1.5</div>
            </div>
          </v-card-title>
          <v-card-text>
            <div class="version-history-content">
              <div class="version-item">
                <div class="version-header">
                  <div class="version-badge">v1.1.0</div>
                  <h4 class="version-title">レスポンシブ対応・UI最適化</h4>
                  <div class="version-date">2025-07-01</div>
                </div>
                <div class="version-description">
                  <ul class="version-features">
                    <li>スマホ横画面レスポンシブ対応</li>
                    <li>フリテンチェック処理の最適化</li>
                  </ul>
                </div>
              </div>
              <div class="version-item">
                <div class="version-header">
                  <div class="version-badge">v1.0.0</div>
                  <h4 class="version-title">初回リリース</h4>
                  <div class="version-date">2025-06-30</div>
                </div>
                <div class="version-description">
                  <ul class="version-features">
                    <li>4人対戦麻雀の実装</li>
                    <li>牌操作機能による手牌品質調整</li>
                    <li>受け入れ計算・表示機能</li>
                  </ul>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </div>

    <!-- フィードバック・バグ報告 -->
    <div class="feedback-section">
      <v-card class="feedback-card" elevation="4">
        <v-card-title class="feedback-title">
          <v-icon class="feedback-icon">mdi-bug-outline</v-icon>
          バグ報告・機能要望
        </v-card-title>
        <v-card-text class="feedback-content">
          <p class="feedback-description">
            バグの報告や新機能はこちら
          </p>
          <v-btn
            color="primary"
            variant="outlined"
            href="https://github.com/gimhiro/haisosa-mahjong/issues"
            target="_blank"
            rel="noopener noreferrer"
            class="feedback-button"
          >
            <v-icon start>mdi-github</v-icon>
            GitHub Issues
          </v-btn>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<style scoped>
.home-view {
  width: 100%;
  min-height: calc(100vh - 64px);
  margin: 0;
  padding: 2rem 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  box-sizing: border-box;
}

.home-view::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 40% 80%, rgba(120, 219, 255, 0.2) 0%, transparent 50%);
  pointer-events: none;
}

/* セクション共通 */
.title-section,
.panel-container,
.info-section,
.version-history-section,
.feedback-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  box-sizing: border-box;
}

.title-section {
  text-align: center;
  margin-bottom: 2rem;
}

.panel-container {
  margin-bottom: 3rem;
}

.info-section {
  margin-bottom: 2rem;
}

.version-history-section {
  max-width: 800px;
}

/* メインタイトル */
.main-title {
  font-size: 3.5rem;
  font-weight: 900;
  background: linear-gradient(45deg, #fff 0%, #e8f5e8 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  margin-bottom: 0.5rem;
}

.main-subtitle {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

/* ゲーム設定パネル */
.game-settings-panel {
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px !important;
  overflow: hidden;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.05);
}

.panel-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  color: white;
  position: relative;
  overflow: hidden;
}

.panel-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><g fill="rgba(255,255,255,0.1)"><circle cx="20" cy="20" r="2"/></g></svg>');
  opacity: 0.3;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  position: relative;
  z-index: 1;
}

.header-icon {
  font-size: 2.2rem;
  color: rgba(255, 255, 255, 0.9);
}

.panel-title {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
}

.header-decoration {
  width: 60px;
  height: 4px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.8) 0%, transparent 100%);
  margin-top: 1rem;
  border-radius: 2px;
}

/* 設定セクション */
.setting-section {
  background: rgba(248, 250, 252, 0.7);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(226, 232, 240, 0.8);
  transition: all 0.3s ease;
}

.setting-section:hover {
  background: rgba(248, 250, 252, 0.9);
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.section-icon {
  font-size: 1.5rem;
  color: #667eea;
  margin-right: 0.75rem;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #334155;
  margin: 0;
}

/* CPU プリセット */
.preset-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.preset-card {
  background: rgba(255, 255, 255, 0.8);
  border: 2px solid rgba(226, 232, 240, 0.6);
  border-radius: 16px;
  padding: 0;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.preset-card:hover {
  background: rgba(255, 255, 255, 0.95);
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.2);
}

.preset-card--selected {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-color: #667eea;
  box-shadow: 0 0 0 1px #667eea, 0 4px 12px rgba(102, 126, 234, 0.15);
}

.preset-card-inner {
  padding: 1.5rem;
  position: relative;
}

.preset-header {
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
}

.preset-icon {
  font-size: 1.5rem;
  color: #64748b;
  margin-right: 0.75rem;
  transition: color 0.3s ease;
}

.preset-icon--selected {
  color: #667eea;
}

.preset-title {
  font-weight: 700;
  color: #334155;
  font-size: 1.1rem;
}

.preset-description {
  font-size: 0.9rem;
  color: #64748b;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.preset-detail {
  font-size: 0.8rem;
  color: #94a3b8;
  line-height: 1.4;
}

.preset-indicator {
  position: absolute;
  top: 0;
  right: 0;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 20px 20px 0;
  border-color: transparent rgba(226, 232, 240, 0.6) transparent transparent;
  transition: all 0.3s ease;
}

.preset-indicator--selected {
  border-color: transparent #667eea transparent transparent;
}

.preset-indicator--selected::after {
  content: '✓';
  position: absolute;
  top: 2px;
  right: -16px;
  color: white;
  font-size: 0.7rem;
  font-weight: bold;
}

/* カスタム設定 */
.custom-settings {
  background: rgba(241, 245, 249, 0.8);
  border-radius: 12px;
  padding: 1.5rem;
  border: 2px dashed rgba(148, 163, 184, 0.4);
}

.custom-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.custom-icon {
  color: #8b5cf6;
  margin-right: 0.5rem;
}

.custom-title {
  font-weight: 600;
  color: #475569;
}

.cpu-custom-section {
  margin-bottom: 1rem;
}

.cpu-custom-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 0.5rem;
}

.cpu-select :deep(.v-field) {
  border-radius: 8px;
}

.cpu-option-item {
  padding: 8px 16px;
}

.cpu-option-item :deep(.v-list-item-subtitle) {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 2px;
}

/* ゲーム開始ボタン */
.start-button-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 0;
  padding-top: 0;
  border-top: none;
}

.start-game-btn {
  font-size: 1.1rem !important;
  font-weight: 700 !important;
  padding: 12px 32px !important;
  border-radius: 12px !important;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  box-shadow: 
    0 6px 16px rgba(102, 126, 234, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset !important;
  transition: all 0.3s ease !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.start-game-btn .v-btn__content {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 8px !important;
}

.start-game-btn:hover {
  transform: translateY(-1px) !important;
  box-shadow: 
    0 8px 20px rgba(102, 126, 234, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.2) inset !important;
}

/* ゲームタイプ */
.game-type-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 1rem;
}

.game-type-card {
  background: rgba(255, 255, 255, 0.8);
  border: 2px solid rgba(226, 232, 240, 0.6);
  border-radius: 12px;
  padding: 1rem;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.game-type-card:hover {
  background: rgba(255, 255, 255, 0.95);
  border-color: #667eea;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.game-type-card--selected {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-color: #667eea;
  box-shadow: 0 0 0 1px #667eea, 0 4px 12px rgba(102, 126, 234, 0.15);
}

.game-type-header {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.game-type-icon {
  font-size: 1.2rem;
  color: #64748b;
  margin-right: 0.5rem;
  transition: color 0.3s ease;
}

.game-type-icon--selected {
  color: #667eea;
}

.game-type-title {
  font-weight: 600;
  color: #334155;
  font-size: 0.95rem;
}

.game-type-description {
  font-size: 0.8rem;
  color: #64748b;
  line-height: 1.3;
}

.game-type-indicator {
  position: absolute;
  top: 0;
  right: 0;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 16px 16px 0;
  border-color: transparent rgba(226, 232, 240, 0.6) transparent transparent;
  transition: all 0.3s ease;
}

.game-type-indicator--selected {
  border-color: transparent #667eea transparent transparent;
}

.game-type-indicator--selected::after {
  content: '✓';
  position: absolute;
  top: 1px;
  right: -13px;
  color: white;
  font-size: 0.6rem;
  font-weight: bold;
}

/* ルール設定 */
.rule-switches {
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.rule-switch {
  margin-bottom: 0;
}

.rule-switch :deep(.v-input__details) {
  display: none;
}

.rule-switch :deep(.v-input__control) {
  min-height: auto;
}

/* 牌操作率設定 */
.manipulation-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.manipulation-card {
  position: relative;
  background: rgba(255, 255, 255, 0.8);
  border: 2px solid rgba(226, 232, 240, 0.6);
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.manipulation-card:hover {
  background: rgba(255, 255, 255, 0.95);
  border-color: rgba(102, 126, 234, 0.3);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.manipulation-card--selected {
  background: rgba(102, 126, 234, 0.1);
  border-color: #667eea;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.2);
}

.manipulation-header {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.manipulation-icon {
  font-size: 1.2rem;
  color: #64748b;
  margin-right: 0.5rem;
  transition: color 0.3s ease;
}

.manipulation-icon--selected {
  color: #667eea;
}

.manipulation-title {
  font-weight: 600;
  font-size: 0.9rem;
  color: #1e293b;
}

.manipulation-description {
  font-size: 0.8rem;
  color: #64748b;
  line-height: 1.3;
}

.manipulation-indicator {
  position: absolute;
  top: 0;
  right: 0;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 16px 16px 0;
  border-color: transparent rgba(226, 232, 240, 0.6) transparent transparent;
  transition: all 0.3s ease;
}

.manipulation-indicator--selected {
  border-color: transparent #667eea transparent transparent;
}

.manipulation-indicator--selected::after {
  content: '✓';
  position: absolute;
  top: 1px;
  right: -13px;
  color: white;
  font-size: 0.6rem;
  font-weight: bold;
}

/* 手牌の良さ設定 */
.hand-quality-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.hand-quality-card {
  position: relative;
  background: rgba(255, 255, 255, 0.8);
  border: 2px solid rgba(226, 232, 240, 0.6);
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.hand-quality-card:hover {
  background: rgba(255, 255, 255, 0.95);
  border-color: rgba(102, 126, 234, 0.3);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.hand-quality-card--selected {
  background: rgba(102, 126, 234, 0.1);
  border-color: #667eea;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.2);
}

.hand-quality-header {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.hand-quality-icon {
  font-size: 1.2rem;
  color: #64748b;
  margin-right: 0.5rem;
  transition: color 0.3s ease;
}

.hand-quality-icon--selected {
  color: #667eea;
}

.hand-quality-title {
  font-weight: 600;
  font-size: 0.9rem;
  color: #1e293b;
}

.hand-quality-description {
  font-size: 0.8rem;
  color: #64748b;
  line-height: 1.3;
}

.hand-quality-indicator {
  position: absolute;
  top: 0;
  right: 0;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 16px 16px 0;
  border-color: transparent rgba(226, 232, 240, 0.6) transparent transparent;
  transition: all 0.3s ease;
}

.hand-quality-indicator--selected {
  border-color: transparent #667eea transparent transparent;
}

.hand-quality-indicator--selected::after {
  content: '✓';
  position: absolute;
  top: 1px;
  right: -13px;
  color: white;
  font-size: 0.6rem;
  font-weight: bold;
}

/* 使い方セクション */
.info-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(15px);
  border-radius: 20px !important;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.info-title {
  display: flex;
  align-items: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: #334155;
}

.info-icon {
  margin-right: 0.75rem;
  color: #667eea;
}

.instruction-step {
  text-align: center;
  padding: 1.5rem;
}

.step-icon-wrapper {
  margin-bottom: 1rem;
}

.step-icon {
  color: #667eea;
  filter: drop-shadow(0 2px 4px rgba(102, 126, 234, 0.3));
}

.instruction-step h3 {
  margin: 0.75rem 0 0.5rem;
  color: #334155;
  font-weight: 600;
}

.instruction-step p {
  color: #64748b;
  line-height: 1.6;
  margin: 0;
}

/* バージョン履歴 */
.version-history-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 16px !important;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.version-history-title {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: #334155;
}

.version-history-title-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.version-history-title-left {
  display: flex;
  align-items: center;
}

.current-version {
  font-size: 0.9rem;
  font-weight: 400;
  color: #94a3b8;
  opacity: 0.8;
}

.version-history-icon {
  margin-right: 0.75rem;
  color: #667eea;
}

.version-history-content {
  padding: 0.5rem 0;
}

.version-item {
  padding: 1rem 0;
}

.version-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.version-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9rem;
}

.version-title {
  color: #334155;
  font-weight: 600;
  font-size: 1.1rem;
  margin: 0;
  flex: 1;
}

.version-date {
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 500;
  margin-left: auto;
}

.version-features {
  margin: 0;
  padding-left: 1.25rem;
  color: #64748b;
  line-height: 1.6;
}

.version-features li {
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
}

.tech-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
}

.tech-icon {
  font-size: 2rem;
  color: #8b5cf6;
  flex-shrink: 0;
}

.tech-text h4 {
  margin: 0 0 0.25rem;
  color: #334155;
  font-weight: 600;
}

.tech-text p {
  margin: 0;
  color: #64748b;
  font-size: 0.9rem;
}

/* レスポンシブ */
@media (max-width: 768px) {
  .home-view {
    padding: 1rem 0;
  }
  
  .title-section,
  .panel-container,
  .info-section,
  .version-history-section {
    padding: 0 0.75rem;
  }
  
  .main-title {
    font-size: 2.5rem;
  }
  
  .panel-header {
    padding: 1.5rem;
  }
  
  .preset-grid {
    grid-template-columns: 1fr;
  }
  
  .game-type-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .title-section,
  .panel-container,
  .info-section,
  .version-history-section {
    padding: 0 0.5rem;
  }
  
  .main-title {
    font-size: 2rem;
  }
  
  .panel-header {
    padding: 1rem;
  }
  
  .setting-section {
    padding: 1rem;
  }
}

/* フィードバック・バグ報告セクション */
.feedback-section {
  max-width: 1200px;
  margin: 2rem auto 0;
  padding: 0 1rem;
}

.feedback-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 16px !important;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.feedback-title {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: #334155;
}

.feedback-icon {
  margin-right: 0.75rem;
  color: #667eea;
}

.feedback-content {
  padding-top: 0 !important;
}

.feedback-description {
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.feedback-button {
  border-radius: 12px;
}

/* ラジオボタンのスタイル調整 */
.v-radio :deep(.v-label) {
  opacity: 1;
}

.v-radio :deep(.v-selection-control__wrapper) {
  margin-right: 0.75rem;
}

/* 開閉式セクションヘッダー */
.section-header {
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem;
  margin: -0.5rem;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.section-header:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.section-header-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.section-value {
  font-size: 1.1rem;
  color: #334155;
  font-weight: 600;
  margin-left: auto;
  margin-right: 0.5rem;
}

.expand-icon {
  transition: transform 0.3s ease;
  color: #64748b;
}

.expand-icon--expanded {
  transform: rotate(180deg);
}

/* 設定セクション内の入れ子を調整 */
.setting-section .setting-section {
  padding: 0;
  border: none;
  background: none;
}

.setting-section .setting-section .section-header {
  display: block;
  cursor: default;
  padding: 0;
  margin: 0;
}

.setting-section .setting-section .section-header:hover {
  background: none;
}
</style>