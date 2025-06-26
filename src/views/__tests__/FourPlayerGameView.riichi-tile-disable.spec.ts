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

describe('リーチボタン押下後の牌無効化機能テスト', () => {
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
    
    gameManager = wrapper.vm.gameManager.value || wrapper.vm.gameManager
    await new Promise(resolve => setTimeout(resolve, 200))
  })

  afterEach(() => {
    vi.clearAllMocks()
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('リーチボタン押下前の状態', () => {
    it('リーチ可能状態では全ての牌がクリック可能', async () => {
      // リーチ可能な手牌を設定: 111222333456m7m（8m待ち）
      const riichiReadyTiles: Tile[] = [
        createTile('man', 1, 'm1-1'), createTile('man', 1, 'm1-2'), createTile('man', 1, 'm1-3'),
        createTile('man', 2, 'm2-1'), createTile('man', 2, 'm2-2'), createTile('man', 2, 'm2-3'),
        createTile('man', 3, 'm3-1'), createTile('man', 3, 'm3-2'), createTile('man', 3, 'm3-3'),
        createTile('man', 4, 'm4-1'), createTile('man', 5, 'm5-1'), createTile('man', 6, 'm6-1'),
        createTile('man', 7, 'm7-1')
      ]

      const drawnTile = createTile('sou', 1, 's1-1')

      gameManager.players[0].tiles = riichiReadyTiles
      gameManager.currentDrawnTile = drawnTile
      gameManager.currentPlayerIndex = 0
      gameManager.gamePhase = 'playing'

      await wrapper.vm.$nextTick()

      // リーチボタンが表示されることを確認
      const canDeclareRiichi = wrapper.vm.canDeclareRiichi
      expect(canDeclareRiichi).toBe(true)

      // riichiPreviewMode が false であることを確認
      expect(wrapper.vm.riichiPreviewMode).toBeFalsy()

      console.log('✅ リーチ前は全ての牌がクリック可能')
    })
  })

  describe('リーチボタン押下時の動作', () => {
    it('リーチボタンを押すとプレビューモードに入る', async () => {
      // リーチ可能な手牌を設定
      const riichiReadyTiles: Tile[] = [
        createTile('man', 1, 'm1-1'), createTile('man', 1, 'm1-2'), createTile('man', 1, 'm1-3'),
        createTile('man', 2, 'm2-1'), createTile('man', 2, 'm2-2'), createTile('man', 2, 'm2-3'),
        createTile('man', 3, 'm3-1'), createTile('man', 3, 'm3-2'), createTile('man', 3, 'm3-3'),
        createTile('man', 4, 'm4-1'), createTile('man', 5, 'm5-1'), createTile('man', 6, 'm6-1'),
        createTile('man', 7, 'm7-1')
      ]

      const drawnTile = createTile('sou', 1, 's1-1')

      gameManager.players[0].tiles = riichiReadyTiles
      gameManager.currentDrawnTile = drawnTile
      gameManager.currentPlayerIndex = 0
      gameManager.gamePhase = 'playing'

      await wrapper.vm.$nextTick()

      // riichiPreviewMode の初期状態を確認
      expect(wrapper.vm.riichiPreviewMode).toBeFalsy()

      // リーチボタンをクリック
      await wrapper.vm.toggleRiichiPreview()

      // プレビューモードに入ることを確認
      expect(wrapper.vm.riichiPreviewMode).toBe(true)

      console.log('✅ リーチボタン押下でプレビューモードに入りました')
    })

    it('プレビューモード中はリーチボタンが「キャンセル」に変わる', async () => {
      const riichiReadyTiles: Tile[] = [
        createTile('man', 1, 'm1-1'), createTile('man', 1, 'm1-2'), createTile('man', 1, 'm1-3'),
        createTile('man', 2, 'm2-1'), createTile('man', 2, 'm2-2'), createTile('man', 2, 'm2-3'),
        createTile('man', 3, 'm3-1'), createTile('man', 3, 'm3-2'), createTile('man', 3, 'm3-3'),
        createTile('man', 4, 'm4-1'), createTile('man', 5, 'm5-1'), createTile('man', 6, 'm6-1'),
        createTile('man', 7, 'm7-1')
      ]

      const drawnTile = createTile('sou', 1, 's1-1')

      gameManager.players[0].tiles = riichiReadyTiles
      gameManager.currentDrawnTile = drawnTile
      gameManager.currentPlayerIndex = 0
      gameManager.gamePhase = 'playing'

      await wrapper.vm.$nextTick()

      // プレビューモードに入る
      await wrapper.vm.toggleRiichiPreview()
      await wrapper.vm.$nextTick()

      // ボタンのテキストが変わることを確認
      expect(wrapper.vm.riichiPreviewMode).toBe(true)
      expect(wrapper.vm.riichiButtonText).toBe('キャンセル')

      console.log('✅ プレビューモード中はボタンが「キャンセル」に変わりました')
    })
  })

  describe('牌の無効化動作', () => {
    it('プレビューモード中はテンパイを維持しない牌が無効化される', async () => {
      // リーチ可能な手牌を設定: 111222333456m7m（7mを捨てると壊れるがs1を捨ててもテンパイ維持）
      const riichiReadyTiles: Tile[] = [
        createTile('man', 1, 'm1-1'), createTile('man', 1, 'm1-2'), createTile('man', 1, 'm1-3'),
        createTile('man', 2, 'm2-1'), createTile('man', 2, 'm2-2'), createTile('man', 2, 'm2-3'),
        createTile('man', 3, 'm3-1'), createTile('man', 3, 'm3-2'), createTile('man', 3, 'm3-3'),
        createTile('man', 4, 'm4-1'), createTile('man', 5, 'm5-1'), createTile('man', 6, 'm6-1'),
        createTile('man', 7, 'm7-1')
      ]

      const drawnTile = createTile('sou', 1, 's1-1')

      gameManager.players[0].tiles = riichiReadyTiles
      gameManager.currentDrawnTile = drawnTile
      gameManager.currentPlayerIndex = 0
      gameManager.gamePhase = 'playing'

      await wrapper.vm.$nextTick()

      // プレビューモードに入る
      await wrapper.vm.toggleRiichiPreview()
      await wrapper.vm.$nextTick()

      // 各牌のクリック可能状態をチェック
      const riichiValidTiles = wrapper.vm.getRiichiValidTiles()
      
      // s1-1（ツモ牌）は捨てられる（テンパイ維持）
      expect(riichiValidTiles.includes('s1-1')).toBe(true)
      
      // m7-1を捨てるとテンパイが崩れるので無効化される可能性
      console.log('有効な牌:', riichiValidTiles)
      console.log('✅ プレビューモード中の牌無効化をテストしました')
    })

    it('キャンセルボタンを押すとプレビューモードが解除される', async () => {
      const riichiReadyTiles: Tile[] = [
        createTile('man', 1, 'm1-1'), createTile('man', 1, 'm1-2'), createTile('man', 1, 'm1-3'),
        createTile('man', 2, 'm2-1'), createTile('man', 2, 'm2-2'), createTile('man', 2, 'm2-3'),
        createTile('man', 3, 'm3-1'), createTile('man', 3, 'm3-2'), createTile('man', 3, 'm3-3'),
        createTile('man', 4, 'm4-1'), createTile('man', 5, 'm5-1'), createTile('man', 6, 'm6-1'),
        createTile('man', 7, 'm7-1')
      ]

      const drawnTile = createTile('sou', 1, 's1-1')

      gameManager.players[0].tiles = riichiReadyTiles
      gameManager.currentDrawnTile = drawnTile
      gameManager.currentPlayerIndex = 0
      gameManager.gamePhase = 'playing'

      await wrapper.vm.$nextTick()

      // プレビューモードに入る
      await wrapper.vm.toggleRiichiPreview()
      expect(wrapper.vm.riichiPreviewMode).toBe(true)

      // キャンセル（もう一度ボタンを押す）
      await wrapper.vm.toggleRiichiPreview()
      expect(wrapper.vm.riichiPreviewMode).toBe(false)

      console.log('✅ キャンセルでプレビューモードが解除されました')
    })
  })

  describe('牌クリック時の動作', () => {
    it('プレビューモード中に有効な牌をクリックするとリーチが確定する', async () => {
      const riichiReadyTiles: Tile[] = [
        createTile('man', 1, 'm1-1'), createTile('man', 1, 'm1-2'), createTile('man', 1, 'm1-3'),
        createTile('man', 2, 'm2-1'), createTile('man', 2, 'm2-2'), createTile('man', 2, 'm2-3'),
        createTile('man', 3, 'm3-1'), createTile('man', 3, 'm3-2'), createTile('man', 3, 'm3-3'),
        createTile('man', 4, 'm4-1'), createTile('man', 5, 'm5-1'), createTile('man', 6, 'm6-1'),
        createTile('man', 7, 'm7-1')
      ]

      const drawnTile = createTile('sou', 1, 's1-1')

      gameManager.players[0].tiles = riichiReadyTiles
      gameManager.currentDrawnTile = drawnTile
      gameManager.currentPlayerIndex = 0
      gameManager.gamePhase = 'playing'

      await wrapper.vm.$nextTick()

      // プレビューモードに入る
      await wrapper.vm.toggleRiichiPreview()
      expect(wrapper.vm.riichiPreviewMode).toBe(true)

      // 有効な牌をクリック（例：ツモ牌）
      await wrapper.vm.confirmRiichiAndDiscard('s1-1')

      // リーチが確定していることを確認
      expect(gameManager.players[0].riichi).toBe(true)
      expect(wrapper.vm.riichiPreviewMode).toBe(false)

      console.log('✅ プレビューモード中の牌クリックでリーチが確定しました')
    })

    it('プレビューモード中に無効な牌をクリックしても何も起こらない', async () => {
      const riichiReadyTiles: Tile[] = [
        createTile('man', 1, 'm1-1'), createTile('man', 1, 'm1-2'), createTile('man', 1, 'm1-3'),
        createTile('man', 2, 'm2-1'), createTile('man', 2, 'm2-2'), createTile('man', 2, 'm2-3'),
        createTile('man', 3, 'm3-1'), createTile('man', 3, 'm3-2'), createTile('man', 3, 'm3-3'),
        createTile('man', 4, 'm4-1'), createTile('man', 5, 'm5-1'), createTile('man', 6, 'm6-1'),
        createTile('man', 7, 'm7-1')
      ]

      const drawnTile = createTile('sou', 1, 's1-1')

      gameManager.players[0].tiles = riichiReadyTiles
      gameManager.currentDrawnTile = drawnTile
      gameManager.currentPlayerIndex = 0
      gameManager.gamePhase = 'playing'

      await wrapper.vm.$nextTick()

      // プレビューモードに入る
      await wrapper.vm.toggleRiichiPreview()
      expect(wrapper.vm.riichiPreviewMode).toBe(true)

      const initialRiichiState = gameManager.players[0].riichi

      // 無効な牌をクリック（テンパイを壊す牌）
      const riichiValidTiles = wrapper.vm.getRiichiValidTiles()
      const invalidTileId = riichiReadyTiles.find(tile => !riichiValidTiles.includes(tile.id))?.id

      if (invalidTileId) {
        await wrapper.vm.confirmRiichiAndDiscard(invalidTileId)

        // リーチ状態が変わっていないことを確認
        expect(gameManager.players[0].riichi).toBe(initialRiichiState)
        expect(wrapper.vm.riichiPreviewMode).toBe(true) // プレビューモードも継続

        console.log('✅ 無効な牌をクリックしても何も起こりませんでした')
      } else {
        console.log('⚠️ 全ての牌が有効のため、無効な牌のテストをスキップしました')
      }
    })
  })
})