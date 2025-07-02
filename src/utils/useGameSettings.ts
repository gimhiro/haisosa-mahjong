import { ref, watch, type Ref } from 'vue'

interface PlayerTestData {
  tiles: string[]
  drawTiles: string[]
}

interface TestModeData {
  isActive: boolean
  players: PlayerTestData[]
}

interface GameSettings {
  disableMeld: boolean
  autoWin: boolean
  showAcceptance: boolean
  showAcceptanceHighlight: boolean
  manipulationRate: number
  handQuality: 'normal' | 'good' | 'excellent'
  testMode: TestModeData
}

const STORAGE_KEY = 'mahjong-game-settings'

const defaultSettings: GameSettings = {
  disableMeld: false,
  autoWin: false,
  showAcceptance: true,
  showAcceptanceHighlight: true,
  manipulationRate: 80,
  handQuality: 'good',
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

let settings: Ref<GameSettings> | null = null

export function useGameSettings() {
  if (!settings) {
    settings = ref<GameSettings>((() => {
      try {
        const savedSettings = localStorage.getItem(STORAGE_KEY)
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings)
          // 古い設定形式の場合は新しい形式にマイグレーション
          if (!parsed.testMode || parsed.showAcceptance === undefined || parsed.showAcceptanceHighlight === undefined || parsed.manipulationRate === undefined || parsed.handQuality === undefined) {
            return {
              disableMeld: parsed.disableMeld ?? false,
              autoWin: parsed.autoWin ?? false,
              showAcceptance: parsed.showAcceptance ?? true,
              showAcceptanceHighlight: parsed.showAcceptanceHighlight ?? true,
              manipulationRate: parsed.manipulationRate ?? 80,
              handQuality: parsed.handQuality ?? 'good',
              testMode: parsed.testMode ?? defaultSettings.testMode
            }
          }
          return parsed
        }
        return defaultSettings
      } catch {
        return defaultSettings
      }
    })())

    watch(settings, (newSettings) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings))
    }, { deep: true })
  }

  const updateSettings = (newSettings: Partial<GameSettings>) => {
    if (settings) {
      settings.value = { ...settings.value, ...newSettings }
    }
  }

  const toggleTestMode = () => {
    if (settings) {
      settings.value.testMode.isActive = !settings.value.testMode.isActive
    }
  }

  const updateTestModeData = (playerIndex: number, data: Partial<PlayerTestData>) => {
    if (settings && playerIndex >= 0 && playerIndex < 4) {
      settings.value.testMode.players[playerIndex] = {
        ...settings.value.testMode.players[playerIndex],
        ...data
      }
    }
  }

  return {
    settings: settings as Ref<GameSettings>,
    updateSettings,
    toggleTestMode,
    updateTestModeData,
  }
}

// テスト用のリセット関数
export function resetGameSettings() {
  settings = null
}

// 型エクスポート
export type { GameSettings, TestModeData, PlayerTestData }