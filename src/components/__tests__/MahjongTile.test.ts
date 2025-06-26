import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import MahjongTile from '../MahjongTile.vue'
import type { Tile } from '../../stores/fourPlayerMahjong'

describe('MahjongTile', () => {
  const mockTile: Tile = {
    suit: 'man',
    rank: 5,
    id: '5m'
  }

  describe('基本表示', () => {
    it('牌が正しく表示される', () => {
      const wrapper = mount(MahjongTile, {
        props: { tile: mockTile }
      })
      expect(wrapper.exists()).toBe(true)
    })

    it('牌のテキストが表示される', () => {
      const wrapper = mount(MahjongTile, {
        props: { tile: mockTile }
      })
      // 画像のalt属性でテキストを確認
      const img = wrapper.find('img')
      expect(img.exists()).toBe(true)
      expect(img.attributes('alt')).toBe('5萬')
    })

    it('画像が正しいsrc属性を持つ', () => {
      const wrapper = mount(MahjongTile, {
        props: { tile: mockTile }
      })
      const img = wrapper.find('img')
      expect(img.exists()).toBe(true)
      expect(img.attributes('src')).toContain('m5')
    })
  })

  describe('プロパティ', () => {
    it('isSelectedがtrueの時選択状態のクラスが付く', () => {
      const wrapper = mount(MahjongTile, {
        props: { 
          tile: mockTile,
          isSelected: true
        }
      })
      expect(wrapper.classes()).toContain('tile-selected')
    })

    it('isSelectedがfalseの時選択状態のクラスが付かない', () => {
      const wrapper = mount(MahjongTile, {
        props: { 
          tile: mockTile,
          isSelected: false
        }
      })
      expect(wrapper.classes()).not.toContain('tile-selected')
    })

    it('isDoraがtrueの時ドラ状態のマスクが表示される', () => {
      const wrapper = mount(MahjongTile, {
        props: { 
          tile: mockTile,
          isDora: true
        }
      })
      const doraMask = wrapper.find('.dora-mask')
      expect(doraMask.exists()).toBe(true)
    })

    it('isTsumoDiscardがtrueの時ツモ切り状態のマスクが表示される', () => {
      const wrapper = mount(MahjongTile, {
        props: { 
          tile: mockTile,
          isTsumoDiscard: true
        }
      })
      const tsumoMask = wrapper.find('.tsumo-discard-mask')
      expect(tsumoMask.exists()).toBe(true)
    })

    it('sizeプロパティでサイズクラスが変わる', () => {
      const wrapper = mount(MahjongTile, {
        props: { 
          tile: mockTile,
          size: 'large'
        }
      })
      expect(wrapper.classes()).toContain('tile-large')
    })
  })

  describe('イベント', () => {
    it('クリックイベントが発生する', async () => {
      const wrapper = mount(MahjongTile, {
        props: { tile: mockTile }
      })
      await wrapper.trigger('click')
      expect(wrapper.emitted()).toHaveProperty('click')
      expect(wrapper.emitted('click')).toHaveLength(1)
      expect(wrapper.emitted('click')![0]).toEqual([mockTile])
    })

    it('ドラッグスタートイベントが発生する', async () => {
      const wrapper = mount(MahjongTile, {
        props: { 
          tile: mockTile,
          isDraggable: true
        }
      })
      await wrapper.trigger('dragstart')
      expect(wrapper.emitted()).toHaveProperty('dragStart')
    })

    it('isDraggableがfalseの時ドラッグできない', () => {
      const wrapper = mount(MahjongTile, {
        props: { 
          tile: mockTile,
          isDraggable: false
        }
      })
      expect(wrapper.classes()).not.toContain('tile-draggable')
    })
  })

  describe('画像エラーハンドリング', () => {
    it('画像読み込みエラー時にフォールバック表示される', async () => {
      const wrapper = mount(MahjongTile, {
        props: { tile: mockTile }
      })
      const img = wrapper.find('img')
      await img.trigger('error')
      
      // フォールバック表示の確認
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.tile-error').exists()).toBe(true)
    })
  })

  describe('様々な牌タイプ', () => {
    it('筒子が正しく表示される', () => {
      const circleTile: Tile = {
        suit: 'pin',
        rank: 3,
        id: '3p'
      }
      const wrapper = mount(MahjongTile, {
        props: { tile: circleTile }
      })
      const img = wrapper.find('img')
      expect(img.attributes('alt')).toBe('3筒')
    })

    it('索子が正しく表示される', () => {
      const bambooTile: Tile = {
        suit: 'sou',
        rank: 7,
        id: '7s'
      }
      const wrapper = mount(MahjongTile, {
        props: { tile: bambooTile }
      })
      const img = wrapper.find('img')
      expect(img.attributes('alt')).toBe('7索')
    })

    it('字牌が正しく表示される', () => {
      const honorTile: Tile = {
        suit: 'honor',
        rank: 1,
        id: 'east'
      }
      const wrapper = mount(MahjongTile, {
        props: { tile: honorTile }
      })
      const img = wrapper.find('img')
      expect(img.attributes('alt')).toBe('東')
    })
  })

  describe('レスポンシブ対応', () => {
    it('small sizeで小さいクラスが付く', () => {
      const wrapper = mount(MahjongTile, {
        props: { 
          tile: mockTile,
          size: 'small'
        }
      })
      expect(wrapper.classes()).toContain('tile-small')
    })

    it('medium sizeで中くらいクラスが付く', () => {
      const wrapper = mount(MahjongTile, {
        props: { 
          tile: mockTile,
          size: 'medium'
        }
      })
      expect(wrapper.classes()).toContain('tile-medium')
    })
  })

  describe('アクセシビリティ', () => {
    it('適切なaria-labelが設定される', () => {
      const wrapper = mount(MahjongTile, {
        props: { tile: mockTile }
      })
      expect(wrapper.attributes('aria-label')).toBe('5萬')
    })

    it('選択状態の時aria-selectedが設定される', () => {
      const wrapper = mount(MahjongTile, {
        props: { 
          tile: mockTile,
          isSelected: true
        }
      })
      expect(wrapper.attributes('aria-selected')).toBe('true')
    })

    it('非選択状態の時aria-selectedがfalse', () => {
      const wrapper = mount(MahjongTile, {
        props: { 
          tile: mockTile,
          isSelected: false
        }
      })
      expect(wrapper.attributes('aria-selected')).toBe('false')
    })
  })
})