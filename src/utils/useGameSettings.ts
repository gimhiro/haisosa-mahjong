import { ref, watch, type Ref } from 'vue'

interface GameSettings {
  disableMeld: boolean
  autoWin: boolean
}

const STORAGE_KEY = 'mahjong-game-settings'

const defaultSettings: GameSettings = {
  disableMeld: false,
  autoWin: false,
}

let settings: Ref<GameSettings> | null = null

export function useGameSettings() {
  if (!settings) {
    settings = ref<GameSettings>((() => {
      try {
        const savedSettings = localStorage.getItem(STORAGE_KEY)
        return savedSettings ? JSON.parse(savedSettings) : defaultSettings
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

  return {
    settings: settings as Ref<GameSettings>,
    updateSettings,
  }
}

// テスト用のリセット関数
export function resetGameSettings() {
  settings = null
}