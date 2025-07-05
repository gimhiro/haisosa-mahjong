import type { Tile } from '../stores/mahjong'
import { getUsefulTiles, createTileFromIndex, calculateShanten } from './mahjong-logic'
import weighted from 'weighted'
import seedrandom from 'seedrandom'

export interface EnhancedDrawOptions {
  boostProbability: number // 有効牌を引く確率 (0.0 - 1.0)
  seed?: string // 再現可能な結果のためのシード
  enableDebugLog?: boolean
}

export class EnhancedDraw {
  private rng: seedrandom.PRNG
  private options: Required<EnhancedDrawOptions>
  private tileIdCounter = 1000

  constructor(options: EnhancedDrawOptions = { boostProbability: 0.8 }) {
    this.options = {
      boostProbability: options.boostProbability,
      seed: options.seed || Math.random().toString(),
      enableDebugLog: options.enableDebugLog || false
    }

    this.rng = seedrandom(this.options.seed)
  }

  /**
   * 有効牌を引く確率でのツモシステム（清一色モード対応）
   */
  drawEnhancedTile(hand: Tile[], availableTiles: Tile[], chinitsusuitFilter?: string): Tile | null {
    if (availableTiles.length === 0) return null

    // 清一色モードの場合、利用可能な牌を対象の色でフィルタリング
    let filteredTiles = availableTiles
    if (chinitsusuitFilter) {
      const chinitsuyTiles = availableTiles.filter(tile => tile.suit === chinitsusuitFilter)
      if (chinitsuyTiles.length > 0) {
        filteredTiles = chinitsuyTiles
      }
      // 対象の色の牌がない場合は全ての牌から選択
    }

    const usefulTileIndices = getUsefulTiles(hand)

    // 有効牌が存在し、かつブースト確率に当選した場合
    const randomValue = this.rng()
    if (usefulTileIndices.length > 0 && randomValue < this.options.boostProbability) {
      return this.drawUsefulTile(usefulTileIndices, filteredTiles)
    }

    // 通常のランダムドロー
    return this.drawRandomTile(filteredTiles)
  }

  /**
   * 有効牌からランダムに選択
   */
  private drawUsefulTile(usefulIndices: number[], availableTiles: Tile[]): Tile | null {
    // 利用可能な牌の中から有効牌を抽出
    const availableUsefulTiles = availableTiles.filter(tile => {
      const tileIndex = this.getTileIndex(tile)
      return usefulIndices.includes(tileIndex)
    })

    if (availableUsefulTiles.length === 0) {
      // 有効牌が山にない場合は通常ドロー
      return this.drawRandomTile(availableTiles)
    }

    // 重み付きランダム選択（すべて同じ重みで選択）
    const weights: Record<string, number> = {}
    availableUsefulTiles.forEach(tile => {
      weights[tile.id] = 1
    })

    const selectedId = weighted.select(weights)
    const selectedTile = availableUsefulTiles.find(t => t.id === selectedId)!

    return selectedTile
  }

  /**
   * 通常のランダムドロー
   */
  private drawRandomTile(availableTiles: Tile[]): Tile | null {
    if (availableTiles.length === 0) return null

    const randomIndex = Math.floor(this.rng() * availableTiles.length)
    const selectedTile = availableTiles[randomIndex]

    if (this.options.enableDebugLog) {
    }

    return selectedTile
  }

  /**
   * 牌からインデックスを取得
   */
  private getTileIndex(tile: Tile): number {
    if (tile.suit === 'man') {
      return tile.rank - 1
    } else if (tile.suit === 'pin') {
      return tile.rank - 1 + 9
    } else if (tile.suit === 'sou') {
      return tile.rank - 1 + 18
    } else { // honor
      return tile.rank - 1 + 27
    }
  }

  /**
   * 統計情報の取得
   */
  getStats(drawHistory: { tile: Tile, wasUseful: boolean }[]): {
    totalDraws: number
    usefulDraws: number
    usefulRate: number
  } {
    const totalDraws = drawHistory.length
    const usefulDraws = drawHistory.filter(d => d.wasUseful).length

    return {
      totalDraws,
      usefulDraws,
      usefulRate: totalDraws > 0 ? usefulDraws / totalDraws : 0
    }
  }

  /**
   * シードを変更してRNGをリセット
   */
  reseed(newSeed?: string) {
    this.options.seed = newSeed || Math.random().toString()
    this.rng = seedrandom(this.options.seed)
  }

  /**
   * ブースト確率を変更
   */
  setBoostProbability(probability: number) {
    this.options.boostProbability = Math.max(0, Math.min(1, probability))
  }
}

// デフォルトインスタンス
export const defaultEnhancedDraw = new EnhancedDraw({
  boostProbability: 0.8,
  enableDebugLog: false
})