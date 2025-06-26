import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MahjongTile from '../../components/MahjongTile.vue'
import type { Tile } from '../../stores/fourPlayerMahjong'

describe('MahjongTileのドラ表示統合テスト', () => {
  it('isDora=trueの場合、ドラマスクが表示される', () => {
    const testTile: Tile = {
      id: 'test-tile',
      suit: 'man',
      rank: 2,
      isRed: false
    }

    const wrapper = mount(MahjongTile, {
      props: {
        tile: testTile,
        isDora: true
      }
    })

    // ドラマスクの要素が存在することを確認
    const doraMask = wrapper.find('.dora-mask')
    expect(doraMask.exists()).toBe(true)
  })

  it('isDora=falseの場合、ドラマスクが表示されない', () => {
    const testTile: Tile = {
      id: 'test-tile',
      suit: 'man',
      rank: 2,
      isRed: false
    }

    const wrapper = mount(MahjongTile, {
      props: {
        tile: testTile,
        isDora: false
      }
    })

    // ドラマスクの要素が存在しないことを確認
    const doraMask = wrapper.find('.dora-mask')
    expect(doraMask.exists()).toBe(false)
  })

  it('isDoraプロパティが省略された場合、ドラマスクが表示されない', () => {
    const testTile: Tile = {
      id: 'test-tile',
      suit: 'man',
      rank: 2,
      isRed: false
    }

    const wrapper = mount(MahjongTile, {
      props: {
        tile: testTile
        // isDoraを省略
      }
    })

    // ドラマスクの要素が存在しないことを確認
    const doraMask = wrapper.find('.dora-mask')
    expect(doraMask.exists()).toBe(false)
  })
})