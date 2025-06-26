import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import FourPlayerGameView from '../FourPlayerGameView.vue'
import { GameManager } from '../../utils/game-manager'
import type { Tile } from '../../stores/fourPlayerMahjong'

function createTile(suit: 'man' | 'pin' | 'sou' | 'honor', rank: number, id: string): Tile {
  return { id, suit, rank, isRed: false }
}

// Vuetifyコンポーネントのモック
const mockVuetifyComponents = {
  'v-card': { template: '<div class="v-card"><slot /></div>' },
  'v-card-title': { template: '<div class="v-card-title"><slot /></div>' },
  'v-card-text': { template: '<div class="v-card-text"><slot /></div>' },
  'v-card-actions': { template: '<div class="v-card-actions"><slot /></div>' },
  'v-btn': { 
    template: '<button @click="$emit(\'click\')" :disabled="disabled" role="button"><slot /></button>',
    props: ['disabled'],
    emits: ['click']
  },
  'v-chip': { template: '<span class="v-chip"><slot /></span>' },
  'v-dialog': { 
    template: '<div v-if="modelValue" class="v-dialog"><slot /></div>',
    props: ['modelValue'],
    emits: ['update:modelValue']
  },
  'v-row': { template: '<div class="v-row"><slot /></div>' },
  'v-col': { template: '<div class="v-col"><slot /></div>' },
  'v-list': { template: '<div class="v-list"><slot /></div>' },
  'v-list-item': { template: '<div class="v-list-item"><slot /></div>' },
  'v-list-item-title': { template: '<div class="v-list-item-title"><slot /></div>' }
}

describe('ツモボタン機能テスト (Testing Library)', () => {
  let wrapper: any
  let gameManager: GameManager

  beforeEach(async () => {
    wrapper = mount(FourPlayerGameView, {
      global: {
        stubs: {
          'PlayerArea': true,
          'PlayerDiscardArea': true,
          'MahjongTile': true,
          'WinModal': true,
          ...mockVuetifyComponents
        }
      }
    })
    
    // GameManagerの参照を取得
    gameManager = wrapper.vm.gameManager.value || wrapper.vm.gameManager
    
    // 自動ゲーム開始を待機
    await new Promise(resolve => setTimeout(resolve, 200))
  })

  afterEach(() => {
    // テスト間でのモック状態をクリア
    vi.clearAllMocks()
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('ツモボタンの表示条件', () => {
    it('上がり状態（14枚の完成手牌+ツモ牌）でツモボタンが表示される', async () => {
      // checkWinConditionForPlayerをモックして確実に勝利を返すようにする
      const mockWinResult = {
        isWin: true,
        result: {
          yaku: [{ name: '門前清自摸和', han: 1 }],
          totalHan: 1,
          fu: 60,
          basePoints: 500,
          totalPoints: 500,
          doraCount: 0,
          uradoraCount: 0
        }
      }
      
      gameManager.checkWinConditionForPlayer = vi.fn().mockReturnValue(mockWinResult)

      // 13枚の完成手牌を設定
      const completeTiles: Tile[] = [
        createTile('man', 1, 'm1-1'), createTile('man', 1, 'm1-2'), createTile('man', 1, 'm1-3'),
        createTile('man', 2, 'm2-1'), createTile('man', 2, 'm2-2'), createTile('man', 2, 'm2-3'),
        createTile('man', 3, 'm3-1'), createTile('man', 3, 'm3-2'), createTile('man', 3, 'm3-3'),
        createTile('man', 4, 'm4-1'), createTile('man', 4, 'm4-2'), createTile('man', 4, 'm4-3'),
        createTile('pin', 1, 'p1-1')
      ]

      // ツモ牌を設定（ペア完成で上がり）
      const tsumoTile = createTile('pin', 1, 'p1-2')

      // ゲーム状態を設定
      gameManager.players[0].tiles = completeTiles
      gameManager.currentDrawnTile = tsumoTile
      gameManager.currentPlayerIndex = 0
      gameManager.gamePhase = 'playing'

      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // ツモボタンが表示されることを確認
      // canTsumoプロパティを直接チェック
      const hasTsumoButton = wrapper.vm.canTsumo
      
      console.log('=== ツモボタン表示テスト ===')
      console.log('手牌:', completeTiles.map(t => t.suit + t.rank).join(' '))
      console.log('ツモ牌:', tsumoTile.suit + tsumoTile.rank)
      console.log('ツモボタン表示:', hasTsumoButton)
      console.log('isHumanTurn:', wrapper.vm.isHumanTurn)
      console.log('currentDrawnTile:', !!wrapper.vm.currentDrawnTile)
      console.log('currentPlayerIndex:', wrapper.vm.currentPlayerIndex)
      console.log('gamePhase:', wrapper.vm.gamePhase)

      expect(hasTsumoButton).toBe(true)
    })

    it('上がり状態でない場合はツモボタンが表示されない', async () => {
      // 負けの結果をモック
      const mockLoseResult = {
        isWin: false
      }
      
      gameManager.checkWinConditionForPlayer = vi.fn().mockReturnValue(mockLoseResult)

      // 1シャンテンの手牌を設定
      const incompleteTiles: Tile[] = [
        createTile('man', 1, 'm1-1'), createTile('man', 1, 'm1-2'), createTile('man', 1, 'm1-3'),
        createTile('man', 2, 'm2-1'), createTile('man', 2, 'm2-2'), createTile('man', 2, 'm2-3'),
        createTile('man', 3, 'm3-1'), createTile('man', 3, 'm3-2'), createTile('man', 3, 'm3-3'),
        createTile('pin', 1, 'p1-1'), createTile('pin', 4, 'p4-1'), createTile('pin', 5, 'p5-1'),
        createTile('man', 9, 'm9-1')
      ]

      const drawnTile = createTile('sou', 1, 's1-1')

      gameManager.players[0].tiles = incompleteTiles
      gameManager.currentDrawnTile = drawnTile
      gameManager.currentPlayerIndex = 0
      gameManager.gamePhase = 'playing'

      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // canTsumoプロパティを直接チェック
      const hasTsumoButton = wrapper.vm.canTsumo

      expect(hasTsumoButton).toBe(false)
    })

    it('人間プレイヤーのターンでない場合はツモボタンが表示されない', async () => {
      // 勝利結果をモック（勝利状態でもCPUのターンなのでボタンは表示されない）
      const mockWinResult = {
        isWin: true,
        result: {
          yaku: [{ name: '門前清自摸和', han: 1 }],
          totalHan: 1,
          fu: 60,
          basePoints: 500,
          totalPoints: 500,
          doraCount: 0,
          uradoraCount: 0
        }
      }
      
      gameManager.checkWinConditionForPlayer = vi.fn().mockReturnValue(mockWinResult)

      // 完成手牌を設定
      const completeTiles: Tile[] = [
        createTile('man', 1, 'm1-1'), createTile('man', 1, 'm1-2'), createTile('man', 1, 'm1-3'),
        createTile('man', 2, 'm2-1'), createTile('man', 2, 'm2-2'), createTile('man', 2, 'm2-3'),
        createTile('man', 3, 'm3-1'), createTile('man', 3, 'm3-2'), createTile('man', 3, 'm3-3'),
        createTile('man', 4, 'm4-1'), createTile('man', 4, 'm4-2'), createTile('man', 4, 'm4-3'),
        createTile('pin', 1, 'p1-1')
      ]

      const tsumoTile = createTile('pin', 1, 'p1-2')

      gameManager.players[0].tiles = completeTiles
      gameManager.currentDrawnTile = tsumoTile
      gameManager.currentPlayerIndex = 1 // CPUのターン
      gameManager.gamePhase = 'playing'

      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // canTsumoプロパティを直接チェック
      const hasTsumoButton = wrapper.vm.canTsumo

      expect(hasTsumoButton).toBe(false)
    })
  })

  describe('ツモボタンクリック時の動作', () => {
    it('ツモボタンをクリックすると上がりモーダルが表示される', async () => {
      // 勝利結果をモック
      const mockWinResult = {
        isWin: true,
        result: {
          yaku: [{ name: '門前清自摸和', han: 1 }],
          totalHan: 1,
          fu: 60,
          basePoints: 500,
          totalPoints: 500,
          doraCount: 0,
          uradoraCount: 0
        }
      }
      
      gameManager.checkWinConditionForPlayer = vi.fn().mockReturnValue(mockWinResult)

      // 完成手牌を設定
      const completeTiles: Tile[] = [
        createTile('man', 1, 'm1-1'), createTile('man', 1, 'm1-2'), createTile('man', 1, 'm1-3'),
        createTile('man', 2, 'm2-1'), createTile('man', 2, 'm2-2'), createTile('man', 2, 'm2-3'),
        createTile('man', 3, 'm3-1'), createTile('man', 3, 'm3-2'), createTile('man', 3, 'm3-3'),
        createTile('man', 4, 'm4-1'), createTile('man', 4, 'm4-2'), createTile('man', 4, 'm4-3'),
        createTile('pin', 1, 'p1-1')
      ]

      const tsumoTile = createTile('pin', 1, 'p1-2')

      gameManager.players[0].tiles = completeTiles
      gameManager.currentDrawnTile = tsumoTile
      gameManager.currentPlayerIndex = 0
      gameManager.gamePhase = 'playing'

      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // ツモボタンが表示されていることを確認
      // canTsumoプロパティを直接チェック
      const hasTsumoButton = wrapper.vm.canTsumo
      expect(hasTsumoButton).toBe(true)

      // showWinModalの初期状態を確認
      expect(wrapper.vm.showWinModal).toBe(false)

      // ツモボタンクリック（declareTsumoメソッドを直接呼び出し）
      await wrapper.vm.declareTsumo()

      // 上がりモーダルが表示されることを確認
      expect(wrapper.vm.showWinModal).toBe(true)
      
      // winModalDataが設定されていることを確認
      expect(wrapper.vm.winModalData).toBeDefined()
      expect(wrapper.vm.winModalData.isTsumo).toBe(true)
      expect(wrapper.vm.winModalData.winner).toBe(gameManager.players[0])

      console.log('✅ ツモボタンクリックで上がりモーダルが表示されました')
    })
  })

  describe('上がりモーダルの内容', () => {
    it('ツモ時のモーダルに正しい情報が表示される', async () => {
      // 勝利結果をモック
      const mockWinResult = {
        isWin: true,
        result: {
          yaku: [{ name: '門前清自摸和', han: 1 }],
          totalHan: 1,
          fu: 60,
          basePoints: 500,
          totalPoints: 500,
          doraCount: 0,
          uradoraCount: 0
        }
      }
      
      gameManager.checkWinConditionForPlayer = vi.fn().mockReturnValue(mockWinResult)

      // 完成手牌を設定
      const completeTiles: Tile[] = [
        createTile('man', 1, 'm1-1'), createTile('man', 1, 'm1-2'), createTile('man', 1, 'm1-3'),
        createTile('man', 2, 'm2-1'), createTile('man', 2, 'm2-2'), createTile('man', 2, 'm2-3'),
        createTile('man', 3, 'm3-1'), createTile('man', 3, 'm3-2'), createTile('man', 3, 'm3-3'),
        createTile('man', 4, 'm4-1'), createTile('man', 4, 'm4-2'), createTile('man', 4, 'm4-3'),
        createTile('pin', 1, 'p1-1')
      ]

      const tsumoTile = createTile('pin', 1, 'p1-2')

      gameManager.players[0].tiles = completeTiles
      gameManager.currentDrawnTile = tsumoTile
      gameManager.currentPlayerIndex = 0
      gameManager.gamePhase = 'playing'

      await wrapper.vm.$nextTick()

      // ツモを実行
      await wrapper.vm.declareTsumo()

      // モーダルデータの内容を確認
      const modalData = wrapper.vm.winModalData
      
      expect(modalData.isTsumo).toBe(true)
      expect(modalData.winner).toBe(gameManager.players[0])
      expect(modalData.winningTile).toEqual(tsumoTile)
      expect(modalData.winningHand).toBeDefined()
      expect(modalData.winningHand.length).toBe(14) // 手牌13枚+ツモ牌1枚
      expect(modalData.yaku).toBeDefined()
      expect(modalData.totalPoints).toBeGreaterThan(0)

      console.log('✅ ツモ時のモーダルデータが正しく設定されました')
    })
  })
})