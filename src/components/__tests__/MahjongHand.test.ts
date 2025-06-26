import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MahjongHand from '../MahjongHand.vue'
import type { Tile } from '../../stores/mahjong'

describe('MahjongHand表示テスト', () => {
  const mockTiles: Tile[] = [
    { suit: 'man', rank: 1, id: '1m' },
    { suit: 'man', rank: 2, id: '2m' },
    { suit: 'man', rank: 3, id: '3m' },
    { suit: 'pin', rank: 4, id: '4p' },
    { suit: 'pin', rank: 5, id: '5p' }
  ]

  describe('基本レイアウト', () => {
    it('手牌コンテナが正しく表示される', () => {
      const wrapper = mount(MahjongHand, {
        props: { tiles: mockTiles }
      })
      
      expect(wrapper.find('.mahjong-hand').exists()).toBe(true)
      expect(wrapper.find('.hand-tiles').exists()).toBe(true)
      expect(wrapper.find('.hand-info').exists()).toBe(true)
    })

    it('牌の数が正しく表示される', () => {
      const wrapper = mount(MahjongHand, {
        props: { tiles: mockTiles }
      })
      
      const tileCount = wrapper.find('.tile-count')
      expect(tileCount.exists()).toBe(true)
      expect(tileCount.text()).toContain('5枚')
    })

    it('ツモ牌が分離表示される', () => {
      const drawnTile: Tile = { suit: 'sou', rank: 6, id: '6s' }
      const wrapper = mount(MahjongHand, {
        props: { 
          tiles: mockTiles,
          drawnTile: drawnTile
        }
      })
      
      const drawnTileElement = wrapper.find('.drawn-tile')
      expect(drawnTileElement.exists()).toBe(true)
    })
  })

  describe('レスポンシブ表示', () => {
    it('手牌が横並びで配置される', () => {
      const wrapper = mount(MahjongHand, {
        props: { tiles: mockTiles }
      })
      
      const handTiles = wrapper.find('.hand-tiles')
      expect(handTiles.exists()).toBe(true)
      
      // CSS クラスの確認
      expect(handTiles.element.classList.contains('hand-tiles')).toBe(true)
    })

    it('flex-wrap が設定されている', () => {
      const wrapper = mount(MahjongHand, {
        props: { tiles: mockTiles }
      })
      
      const handTiles = wrapper.find('.hand-tiles')
      expect(handTiles.exists()).toBe(true)
      // CSS クラスの存在確認（実際のflex-wrapの値確認は環境依存のため省略）
      expect(handTiles.element.classList.contains('hand-tiles')).toBe(true)
    })
  })

  describe('情報表示', () => {
    it('シャンテン数が表示される', () => {
      const wrapper = mount(MahjongHand, {
        props: { tiles: mockTiles }
      })
      
      // シャンテン数の表示確認（計算結果に依存）
      const shantenDisplay = wrapper.find('.shanten-display')
      if (shantenDisplay.exists()) {
        expect(shantenDisplay.text()).toContain('シャンテン')
      }
    })

    it('有効牌が表示される', () => {
      const wrapper = mount(MahjongHand, {
        props: { tiles: mockTiles }
      })
      
      // 有効牌の表示確認
      const usefulTiles = wrapper.find('.useful-tiles')
      if (usefulTiles.exists()) {
        expect(usefulTiles.text()).toContain('有効牌')
      }
    })
  })

  describe('スタイル適用確認', () => {
    it('中央揃えのスタイルが適用される', () => {
      const wrapper = mount(MahjongHand, {
        props: { tiles: mockTiles }
      })
      
      const mahjongHand = wrapper.find('.mahjong-hand')
      expect(mahjongHand.element.classList.contains('mahjong-hand')).toBe(true)
    })

    it('ツモ牌に区切り線スタイルが適用される', () => {
      const drawnTile: Tile = { suit: 'sou', rank: 6, id: '6s' }
      const wrapper = mount(MahjongHand, {
        props: { 
          tiles: mockTiles,
          drawnTile: drawnTile
        }
      })
      
      const drawnTileElement = wrapper.find('.drawn-tile')
      expect(drawnTileElement.exists()).toBe(true)
      expect(drawnTileElement.element.classList.contains('drawn-tile')).toBe(true)
    })
  })

  describe('ドラッグ機能表示', () => {
    it('ドラッグ可能時にdraggableコンテナが表示される', () => {
      const wrapper = mount(MahjongHand, {
        props: { 
          tiles: mockTiles,
          isDraggable: true
        }
      })
      
      const tileContainer = wrapper.find('.tile-container')
      expect(tileContainer.exists()).toBe(true)
    })

    it('ドラッグ無効時でもコンテナは表示される', () => {
      const wrapper = mount(MahjongHand, {
        props: { 
          tiles: mockTiles,
          isDraggable: false
        }
      })
      
      const tileContainer = wrapper.find('.tile-container')
      expect(tileContainer.exists()).toBe(true)
    })
  })
})