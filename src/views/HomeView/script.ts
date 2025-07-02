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

// エクスポート
export {
  gameSettings,
  sectionExpanded,
  cpuPresetOptions,
  cpuStrengthOptions,
  gameTypeOptions,
  manipulationRateOptions,
  handQualityOptions,
  startFourPlayerGame,
  onPresetChange,
  cpuSettingDisplay,
  gameTypeDisplay,
  manipulationDisplay,
  specialModeDisplay
}