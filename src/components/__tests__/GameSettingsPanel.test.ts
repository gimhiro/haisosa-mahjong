import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import GameSettingsPanel from '../GameSettingsPanel.vue'
import { resetGameSettings } from '../../utils/useGameSettings'

// Vuetifyコンポーネントのモック
const VCard = {
  template: '<div class="v-card"><slot /></div>',
}

const VCardTitle = {
  template: '<div class="v-card-title"><slot /></div>',
}

const VCardText = {
  template: '<div class="v-card-text"><slot /></div>',
}

const VSwitch = {
  template: '<div><input type="checkbox" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" /> {{ label }}</div>',
  props: ['modelValue', 'label'],
  emits: ['update:modelValue'],
}

describe('GameSettingsPanel', () => {
  const STORAGE_KEY = 'mahjong-game-settings'
  
  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY)
    resetGameSettings()
  })

  const createWrapper = () => {
    return mount(GameSettingsPanel, {
      global: {
        components: {
          VCard,
          VCardTitle,
          VCardText,
          VSwitch,
        },
      },
    })
  }

  describe('基本表示', () => {
    it('コンポーネントが正しく描画される', () => {
      const wrapper = createWrapper()
      expect(wrapper.exists()).toBe(true)
    })

    it('タイトルが表示される', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('ゲーム設定')
    })

    it('鳴きなしスイッチが表示される', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('鳴きなし')
    })

    it('自動アガリスイッチが表示される', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('自動アガリ')
    })
  })

  describe('設定の初期状態', () => {
    it('デフォルトで両方のスイッチがオフになっている', () => {
      const wrapper = createWrapper()
      const switches = wrapper.findAllComponents(VSwitch)
      
      expect(switches).toHaveLength(2)
      switches.forEach(switchComponent => {
        expect(switchComponent.props('modelValue')).toBe(false)
      })
    })
  })

  describe('設定の変更', () => {
    it('鳴きなしスイッチの切り替えが動作する', async () => {
      const wrapper = createWrapper()
      const switches = wrapper.findAllComponents(VSwitch)
      const disableMeldSwitch = switches[0]
      
      await disableMeldSwitch.find('input').setValue(true)
      expect(disableMeldSwitch.props('modelValue')).toBe(true)
    })

    it('自動アガリスイッチの切り替えが動作する', async () => {
      const wrapper = createWrapper()
      const switches = wrapper.findAllComponents(VSwitch)
      const autoWinSwitch = switches[1]
      
      await autoWinSwitch.find('input').setValue(true)
      expect(autoWinSwitch.props('modelValue')).toBe(true)
    })
  })
})