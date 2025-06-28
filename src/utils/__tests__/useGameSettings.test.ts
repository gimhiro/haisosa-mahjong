import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useGameSettings, resetGameSettings } from '../useGameSettings'

describe('useGameSettings', () => {
  const STORAGE_KEY = 'mahjong-game-settings'
  
  beforeEach(() => {
    // 特定のキーのみを削除
    localStorage.removeItem(STORAGE_KEY)
    // composableの状態をリセット
    resetGameSettings()
    vi.clearAllMocks()
  })

  describe('基本機能', () => {
    it('デフォルト設定が正しく初期化される', () => {
      const { settings } = useGameSettings()
      
      expect(settings.value.disableMeld).toBe(false)
      expect(settings.value.autoWin).toBe(false)
    })

    it('設定を更新できる', () => {
      const { settings, updateSettings } = useGameSettings()
      
      updateSettings({ disableMeld: true })
      expect(settings.value.disableMeld).toBe(true)
      expect(settings.value.autoWin).toBe(false)
      
      updateSettings({ autoWin: true })
      expect(settings.value.disableMeld).toBe(true)
      expect(settings.value.autoWin).toBe(true)
    })

    it('部分的な設定更新が可能', () => {
      const { settings, updateSettings } = useGameSettings()
      
      updateSettings({ disableMeld: true, autoWin: true })
      expect(settings.value.disableMeld).toBe(true)
      expect(settings.value.autoWin).toBe(true)
      
      updateSettings({ disableMeld: false })
      expect(settings.value.disableMeld).toBe(false)
      expect(settings.value.autoWin).toBe(true) // 変更されない
    })
  })

  describe('localStorage連携', () => {
    it('設定がlocalStorageに保存される', async () => {
      const { updateSettings } = useGameSettings()
      
      updateSettings({ disableMeld: true, autoWin: true })
      
      // Vue の reactivity システムの更新を待つ
      await new Promise(resolve => setTimeout(resolve, 0))
      
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
      expect(saved.disableMeld).toBe(true)
      expect(saved.autoWin).toBe(true)
    })

    it('localStorage から設定が復元される', () => {
      // 事前にlocalStorageに設定を保存
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        disableMeld: true,
        autoWin: true
      }))
      
      const { settings } = useGameSettings()
      expect(settings.value.disableMeld).toBe(true)
      expect(settings.value.autoWin).toBe(true)
    })

    it('無効なlocalStorage データの場合はデフォルト設定を使用', () => {
      localStorage.setItem(STORAGE_KEY, 'invalid-json')
      
      const { settings } = useGameSettings()
      expect(settings.value.disableMeld).toBe(false)
      expect(settings.value.autoWin).toBe(false)
    })
  })
})