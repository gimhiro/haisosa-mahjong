<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// コンポーネントマウント時の処理
onMounted(() => {
  // specialModeプロパティが初期化されていることを確認
  if (!gameSettings.value.specialMode) {
    gameSettings.value.specialMode = {
      chinitsuMode: false
    }
  }
})

// ゲーム設定
const gameSettings = ref({
  cpuStrengthPreset: 'normal', // 'easy', 'normal', 'hard', 'super', 'custom'
  customCpuStrengths: ['normal', 'normal', 'normal'], // CPU1, CPU2, CPU3の個別設定
  gameType: 'tonpuusen', // 'tonpuusen' (東風戦) or 'tonnanssen' (東南戦)
  agariRenchan: false, // 上がり連荘
  hakoshita: false, // トビ終了
  manipulationRate: 80, // 牌操作率
  handQuality: 'good', // 手牌の良さ
  specialMode: {
    chinitsuMode: false // 清一色モード
  }
})

// 各設定セクションの開閉状態
const sectionExpanded = ref({
  cpu: false,
  gameType: false,
  manipulation: false,
  special: false
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
    showAcceptance: true,
    showAcceptanceHighlight: true,
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
    },
    specialMode: {
      chinitsuMode: gameSettings.value.specialMode.chinitsuMode
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

const specialModeDisplay = computed(() => {
  return gameSettings.value.specialMode?.chinitsuMode ? '清一色モード' : 'OFF'
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
            <v-btn color="primary" size="x-large" elevation="8" @click="startFourPlayerGame" class="start-game-btn">
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
                      <div v-for="preset in cpuPresetOptions" :key="preset.value"
                        :class="['preset-card', { 'preset-card--selected': gameSettings.cpuStrengthPreset === preset.value }]"
                        @click="gameSettings.cpuStrengthPreset = preset.value; onPresetChange()">
                        <div class="preset-card-inner">
                          <div class="preset-header">
                            <v-icon
                              :class="['preset-icon', { 'preset-icon--selected': gameSettings.cpuStrengthPreset === preset.value }]">
                              {{ preset.value === 'custom' ? 'mdi-tune' : 'mdi-robot' }}
                            </v-icon>
                            <div class="preset-title">{{ preset.title }}</div>
                          </div>
                          <div class="preset-description">{{ preset.description }}</div>
                          <div class="preset-detail">{{ preset.detail }}</div>
                          <div
                            :class="['preset-indicator', { 'preset-indicator--selected': gameSettings.cpuStrengthPreset === preset.value }]">
                          </div>
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
                          <v-col cols="12" sm="4" v-for="(strength, index) in gameSettings.customCpuStrengths"
                            :key="index">
                            <div class="cpu-custom-section">
                              <h4 class="cpu-custom-label">CPU{{ index + 1 }}</h4>
                              <v-select v-model="gameSettings.customCpuStrengths[index]" :items="cpuStrengthOptions"
                                variant="outlined" density="comfortable" class="cpu-select">
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
                            <div v-for="gameType in gameTypeOptions" :key="gameType.value"
                              :class="['game-type-card', { 'game-type-card--selected': gameSettings.gameType === gameType.value }]"
                              @click="gameSettings.gameType = gameType.value">
                              <div class="game-type-header">
                                <v-icon
                                  :class="['game-type-icon', { 'game-type-icon--selected': gameSettings.gameType === gameType.value }]">
                                  {{ gameType.icon }}
                                </v-icon>
                                <div class="game-type-title">{{ gameType.title }}</div>
                              </div>
                              <div class="game-type-description">{{ gameType.description }}</div>
                              <div
                                :class="['game-type-indicator', { 'game-type-indicator--selected': gameSettings.gameType === gameType.value }]">
                              </div>
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
                            <v-switch v-model="gameSettings.agariRenchan" label="上がり連荘" color="primary"
                              class="rule-switch"></v-switch>
                            <v-switch v-model="gameSettings.hakoshita" label="トビ終了" color="primary"
                              class="rule-switch"></v-switch>
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
                            <div v-for="option in manipulationRateOptions" :key="option.value"
                              :class="['manipulation-card', { 'manipulation-card--selected': gameSettings.manipulationRate === option.value }]"
                              @click="gameSettings.manipulationRate = option.value">
                              <div class="manipulation-header">
                                <v-icon
                                  :class="['manipulation-icon', { 'manipulation-icon--selected': gameSettings.manipulationRate === option.value }]">
                                  mdi-shuffle-variant
                                </v-icon>
                                <div class="manipulation-title">{{ option.title }}</div>
                              </div>
                              <div class="manipulation-description">{{ option.description }}</div>
                              <div
                                :class="['manipulation-indicator', { 'manipulation-indicator--selected': gameSettings.manipulationRate === option.value }]">
                              </div>
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
                            <div v-for="option in handQualityOptions" :key="option.value"
                              :class="['hand-quality-card', { 'hand-quality-card--selected': gameSettings.handQuality === option.value }]"
                              @click="gameSettings.handQuality = option.value">
                              <div class="hand-quality-header">
                                <v-icon
                                  :class="['hand-quality-icon', { 'hand-quality-icon--selected': gameSettings.handQuality === option.value }]">
                                  mdi-cards
                                </v-icon>
                                <div class="hand-quality-title">{{ option.title }}</div>
                              </div>
                              <div class="hand-quality-description">{{ option.description }}</div>
                              <div
                                :class="['hand-quality-indicator', { 'hand-quality-indicator--selected': gameSettings.handQuality === option.value }]">
                              </div>
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

          <!-- 特殊モード設定 -->
          <v-row class="settings-grid">
            <v-col cols="12">
              <div class="setting-section">
                <div class="section-header" @click="sectionExpanded.special = !sectionExpanded.special">
                  <div class="section-header-content">
                    <v-icon class="section-icon">mdi-star</v-icon>
                    <h3 class="section-title">特殊モード</h3>
                    <span class="section-value">{{ specialModeDisplay }}</span>
                  </div>
                  <v-icon class="expand-icon" :class="{ 'expand-icon--expanded': sectionExpanded.special }">
                    mdi-chevron-down
                  </v-icon>
                </div>

                <v-expand-transition>
                  <div v-show="sectionExpanded.special">
                    <div class="special-mode-grid">
                      <div class="special-mode-card">
                        <v-switch v-model="gameSettings.specialMode.chinitsuMode" hide-details color="primary"
                          class="special-mode-switch">
                          <template v-slot:label>
                            <div class="special-mode-label">
                              <div class="special-mode-title">清一色モード</div>
                              <div class="special-mode-description">
                                配牌およびすべてのツモがランダムな特定の一色になります (萬子、筒子、索子)
                              </div>
                            </div>
                          </template>
                        </v-switch>
                      </div>
                    </div>
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
            <div class="current-version">v1.3.0</div>
          </div>
        </v-card-title>
        <v-card-text>
          <div class="version-history-content">
            <div class="version-item">
              <div class="version-header">
                <div class="version-badge">v1.3.0</div>
                <h4 class="version-title">受け入れ計算の高速化</h4>
                <div class="version-date">2025-07-05</div>
              </div>
              <div class="version-description">
                <ul class="version-features">
                  <li>受け入れ計算をRust化して高速化</li>
                  <li>リーチプレビューモードのパフォーマンス改善</li>
                  <li>清一色モードの有効牌確率設定修正</li>
                </ul>
              </div>
            </div>
            <div class="version-item">
              <div class="version-header">
                <div class="version-badge">v1.2.0</div>
                <h4 class="version-title">清一色モードの追加</h4>
                <div class="version-date">2025-07-02</div>
              </div>
              <div class="version-description">
                <ul class="version-features">
                  <li>特殊モード：清一色モードの実装 ※現段階では処理が重いので将来的に軽量化予定</li>
                  <li>受け入れ計算パフォーマンスの軽量化</li>
                </ul>
              </div>
            </div>
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
                  <li>v1.1.6: リファクタリング実施</li>
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
          <v-btn color="primary" variant="outlined" href="https://github.com/gimhiro/haisosa-mahjong/issues"
            target="_blank" rel="noopener noreferrer" class="feedback-button">
            <v-icon start>mdi-github</v-icon>
            GitHub Issues
          </v-btn>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<style>
@import '/src/views/HomeView/styles.css';
</style>