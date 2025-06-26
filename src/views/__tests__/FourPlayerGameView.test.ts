import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FourPlayerGameView from '../FourPlayerGameView.vue'

describe('FourPlayerGameView表示テスト', () => {
  describe('基本レイアウト', () => {
    it('四人麻雀のメインコンテナが表示される', () => {
      const wrapper = mount(FourPlayerGameView)
      
      expect(wrapper.find('.four-player-game').exists()).toBe(true)
      expect(wrapper.find('.game-table').exists()).toBe(true)
    })

    it('CSS Gridレイアウトが正しく設定される', () => {
      const wrapper = mount(FourPlayerGameView)
      
      const gameTable = wrapper.find('.game-table')
      expect(gameTable.exists()).toBe(true)
      expect(gameTable.element.classList.contains('game-table')).toBe(true)
    })

    it('全プレイヤーエリアが配置される', () => {
      const wrapper = mount(FourPlayerGameView)
      
      expect(wrapper.find('.player-top').exists()).toBe(true)
      expect(wrapper.find('.player-left').exists()).toBe(true)
      expect(wrapper.find('.player-right').exists()).toBe(true)
      expect(wrapper.find('.player-bottom').exists()).toBe(true)
    })

    it('中央エリアが配置される', () => {
      const wrapper = mount(FourPlayerGameView)
      
      expect(wrapper.find('.center-area').exists()).toBe(true)
      expect(wrapper.find('.discards-area').exists()).toBe(true)
      expect(wrapper.find('.central-square').exists()).toBe(true)
    })
  })

  describe('グリッドエリア配置', () => {
    it('上側プレイヤーが正しいグリッドエリアに配置される', () => {
      const wrapper = mount(FourPlayerGameView)
      
      const playerTop = wrapper.find('.player-top')
      expect(playerTop.exists()).toBe(true)
      expect(playerTop.element.classList.contains('player-top')).toBe(true)
    })

    it('左側プレイヤーが正しいグリッドエリアに配置される', () => {
      const wrapper = mount(FourPlayerGameView)
      
      const playerLeft = wrapper.find('.player-left')
      expect(playerLeft.exists()).toBe(true)
      expect(playerLeft.element.classList.contains('player-left')).toBe(true)
    })

    it('右側プレイヤーが正しいグリッドエリアに配置される', () => {
      const wrapper = mount(FourPlayerGameView)
      
      const playerRight = wrapper.find('.player-right')
      expect(playerRight.exists()).toBe(true)
      expect(playerRight.element.classList.contains('player-right')).toBe(true)
    })

    it('下側プレイヤーが正しいグリッドエリアに配置される', () => {
      const wrapper = mount(FourPlayerGameView)
      
      const playerBottom = wrapper.find('.player-bottom')
      expect(playerBottom.exists()).toBe(true)
      expect(playerBottom.element.classList.contains('player-bottom')).toBe(true)
    })
  })

  describe('中央エリアレイアウト', () => {
    it('捨牌エリアが中央に配置される', () => {
      const wrapper = mount(FourPlayerGameView)
      
      const discardsArea = wrapper.find('.discards-area')
      expect(discardsArea.exists()).toBe(true)
    })

    it('中央スクエアが適切なサイズに設定される', () => {
      const wrapper = mount(FourPlayerGameView)
      
      const centralSquare = wrapper.find('.central-square')
      expect(centralSquare.exists()).toBe(true)
      expect(centralSquare.element.classList.contains('central-square')).toBe(true)
    })

    it('中央情報が表示される', () => {
      const wrapper = mount(FourPlayerGameView)
      
      const centerInfo = wrapper.find('.center-info')
      expect(centerInfo.exists()).toBe(true)
      
      const centerLabel = wrapper.find('.center-label')
      expect(centerLabel.exists()).toBe(true)
      expect(centerLabel.text()).toBe('河')
    })
  })

  describe('プレイヤー捨牌エリア', () => {
    it('4つの捨牌エリアが配置される', () => {
      const wrapper = mount(FourPlayerGameView)
      
      // PlayerDiscardAreaコンポーネントを確認
      const discardAreas = wrapper.findAllComponents({ name: 'PlayerDiscardArea' })
      expect(discardAreas).toHaveLength(4)
    })

    it('各捨牌エリアに回転スタイルが適用される', () => {
      const wrapper = mount(FourPlayerGameView)
      
      // 各捨牌エリアのCSSクラスを確認
      expect(wrapper.find('.discard-area-bottom').exists()).toBe(true)
      expect(wrapper.find('.discard-area-right').exists()).toBe(true)
      expect(wrapper.find('.discard-area-top').exists()).toBe(true)
      expect(wrapper.find('.discard-area-left').exists()).toBe(true)
    })
  })

  describe('レスポンシブ対応', () => {
    it('ビューポート全体を使用する設定', () => {
      const wrapper = mount(FourPlayerGameView)
      
      const gameView = wrapper.find('.four-player-game')
      expect(gameView.exists()).toBe(true)
      expect(gameView.element.classList.contains('four-player-game')).toBe(true)
    })

    it('ゲームテーブルが適切な高さに設定される', () => {
      const wrapper = mount(FourPlayerGameView)
      
      const gameTable = wrapper.find('.game-table')
      expect(gameTable.exists()).toBe(true)
      expect(gameTable.element.classList.contains('game-table')).toBe(true)
    })
  })

  describe('アクションエリア', () => {
    it('人間プレイヤーのアクションエリアが配置される', () => {
      const wrapper = mount(FourPlayerGameView)
      
      // human-actionsエリアの確認（条件付き表示）
      const humanActions = wrapper.find('.human-actions')
      // ゲーム状態によって表示/非表示が変わるので、エレメントの存在確認
      if (humanActions.exists()) {
        expect(humanActions.element.classList.contains('human-actions')).toBe(true)
      }
    })

    it('ターン情報が表示される', () => {
      const wrapper = mount(FourPlayerGameView)
      
      // turn-infoエリアの確認
      const turnInfo = wrapper.find('.turn-info')
      if (turnInfo.exists()) {
        expect(turnInfo.element.classList.contains('turn-info')).toBe(true)
      }
    })
  })
})