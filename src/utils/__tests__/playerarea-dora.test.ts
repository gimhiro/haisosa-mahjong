import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PlayerArea from '../../components/PlayerArea.vue'
import { GameManager } from '../game-manager'
import type { Player, Tile } from '../../stores/fourPlayerMahjong'

describe('PlayerAreaのドラ表示テスト', () => {
  it('GameManagerからのドラ判定が正しくMahjongTileに伝わる', () => {
    const gameManager = new GameManager()
    
    // テスト用の手牌を作成（ドラとなる牌を含む）
    const testTiles: Tile[] = [
      { id: 'test-1', suit: 'man', rank: 1, isRed: false },
      { id: 'test-2', suit: 'man', rank: 2, isRed: false }, // これがドラになる予定
      { id: 'test-3', suit: 'pin', rank: 3, isRed: false }
    ]
    
    // ドラ表示牌を設定（1m表示 → 2mがドラ）
    const doraIndicator: Tile = { id: 'dora-indicator', suit: 'man', rank: 1, isRed: false }
    gameManager['_doraIndicators'] = [doraIndicator]
    
    const testPlayer: Player = {
      id: 0,
      name: 'テストプレイヤー',
      type: 'human',
      tiles: testTiles,
      discards: [],
      melds: [],
      riichi: false,
      score: 25000,
      wind: 'east'
    }

    const wrapper = mount(PlayerArea, {
      props: {
        player: testPlayer,
        isCurrent: true,
        position: 'bottom',
        showTiles: true,
        gameManager: { value: gameManager }
      }
    })

    // 2mの牌がドラとして認識されることを確認
    const mahjongTiles = wrapper.findAllComponents({ name: 'MahjongTile' })
    
    // 2mの牌（index 1）を見つける
    const man2Tile = mahjongTiles.find(tile => {
      const tileProps = tile.props()
      return tileProps.tile.suit === 'man' && tileProps.tile.rank === 2
    })
    
    expect(man2Tile).toBeDefined()
    expect(man2Tile?.props().isDora).toBe(true)
    
    // 1mの牌はドラではないことを確認
    const man1Tile = mahjongTiles.find(tile => {
      const tileProps = tile.props()
      return tileProps.tile.suit === 'man' && tileProps.tile.rank === 1
    })
    
    expect(man1Tile).toBeDefined()
    expect(man1Tile?.props().isDora).toBe(false)
  })

  it('checkIsDoraメソッドが正しく動作する', () => {
    const gameManager = new GameManager()
    
    // ドラ表示牌を設定（5p表示 → 6pがドラ）
    const doraIndicator: Tile = { id: 'dora-indicator', suit: 'pin', rank: 5, isRed: false }
    gameManager['_doraIndicators'] = [doraIndicator]
    
    const testPlayer: Player = {
      id: 0,
      name: 'テストプレイヤー',
      type: 'human',
      tiles: [],
      discards: [],
      melds: [],
      riichi: false,
      score: 25000,
      wind: 'east'
    }

    const wrapper = mount(PlayerArea, {
      props: {
        player: testPlayer,
        isCurrent: true,
        position: 'bottom',
        showTiles: true,
        gameManager: { value: gameManager }
      }
    })

    // checkIsDoraメソッドを直接テスト
    const componentInstance = wrapper.vm as any
    
    const testTile6p: Tile = { id: 'test', suit: 'pin', rank: 6, isRed: false }
    const testTile7p: Tile = { id: 'test', suit: 'pin', rank: 7, isRed: false }
    
    expect(componentInstance.checkIsDora(testTile6p)).toBe(true)
    expect(componentInstance.checkIsDora(testTile7p)).toBe(false)
  })
})