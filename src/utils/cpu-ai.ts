import type { Tile, Player } from '../stores/fourPlayerMahjong'
import { calculateShanten, getUsefulTiles } from './mahjong-logic'

export class CpuAI {
  private difficulty: 'easy' | 'medium' | 'hard'

  constructor(difficulty: 'easy' | 'medium' | 'hard' = 'medium') {
    this.difficulty = difficulty
  }

  /**
   * CPUが捨てる牌を決定する
   */
  decideTileToDiscard(player: Player, drawnTile: Tile | null): string {
    const allTiles = drawnTile ? [...player.tiles, drawnTile] : player.tiles
    
    if (allTiles.length === 0) {
      return ''
    }

    // 難易度による戦略
    switch (this.difficulty) {
      case 'easy':
        return this.randomDiscard(allTiles)
      case 'medium':
        return this.mediumAIDiscard(allTiles)
      case 'hard':
        return this.hardAIDiscard(allTiles)
      default:
        return this.randomDiscard(allTiles)
    }
  }

  /**
   * 簡単AI: ランダムに捨てる
   */
  private randomDiscard(tiles: Tile[]): string {
    const randomIndex = Math.floor(Math.random() * tiles.length)
    return tiles[randomIndex].id
  }

  /**
   * 中級AI: シャンテン数を考慮して捨てる
   */
  private mediumAIDiscard(tiles: Tile[]): string {
    const currentShanten = calculateShanten(tiles)
    let bestTileId = ''
    let bestShanten = currentShanten

    // 各牌を捨てた場合のシャンテン数を計算
    for (const tile of tiles) {
      const remainingTiles = tiles.filter(t => t.id !== tile.id)
      const newShanten = calculateShanten(remainingTiles)
      
      // より良いシャンテン数の場合、またはランダム要素を含める
      if (newShanten < bestShanten || (newShanten === bestShanten && Math.random() < 0.3)) {
        bestShanten = newShanten
        bestTileId = tile.id
      }
    }

    // 最適解が見つからない場合はランダム
    return bestTileId || tiles[Math.floor(Math.random() * tiles.length)].id
  }

  /**
   * 上級AI: より複雑な戦略
   */
  private hardAIDiscard(tiles: Tile[]): string {
    const currentShanten = calculateShanten(tiles)
    const usefulTiles = getUsefulTiles(tiles.slice(0, -1)) // 最後の牌（ツモ牌）を除く
    
    let bestTileId = ''
    let bestScore = -1000

    for (const tile of tiles) {
      const remainingTiles = tiles.filter(t => t.id !== tile.id)
      const newShanten = calculateShanten(remainingTiles)
      
      // スコア計算（シャンテン数、牌の価値など）
      let score = (currentShanten - newShanten) * 100
      
      // 字牌は捨てやすい
      if (tile.suit === 'honor') {
        score += 10
      }
      
      // 1,9牌は中程度に捨てやすい
      if (tile.suit !== 'honor' && (tile.rank === 1 || tile.rank === 9)) {
        score += 5
      }
      
      // ランダム要素
      score += Math.random() * 20 - 10
      
      if (score > bestScore) {
        bestScore = score
        bestTileId = tile.id
      }
    }

    return bestTileId || tiles[Math.floor(Math.random() * tiles.length)].id
  }

  /**
   * CPUがリーチするかどうかを決定
   */
  shouldDeclareRiichi(player: Player): boolean {
    const shanten = calculateShanten(player.tiles)
    
    if (shanten !== 0) return false // テンパイでない
    if (player.riichi) return false // 既にリーチ済み
    if (player.score < 1000) return false // 点数不足
    
    // 難易度による判断
    switch (this.difficulty) {
      case 'easy':
        return Math.random() < 0.3 // 30%の確率
      case 'medium':
        return Math.random() < 0.6 // 60%の確率
      case 'hard':
        return Math.random() < 0.8 // 80%の確率
      default:
        return false
    }
  }

  /**
   * CPUのターン全体の処理時間（ミリ秒）
   */
  getThinkingTime(): number {
    const baseTime = 500
    const randomTime = Math.random() * 1000
    
    switch (this.difficulty) {
      case 'easy':
        return baseTime + randomTime * 0.5 // 0.5-1秒
      case 'medium':
        return baseTime + randomTime * 1.0 // 0.5-1.5秒
      case 'hard':
        return baseTime + randomTime * 1.5 // 0.5-2秒
      default:
        return baseTime
    }
  }

  /**
   * CPUの行動を決定する（統合メソッド）
   */
  async makeDecision(player: Player, drawnTile: Tile | null): Promise<{
    action: 'discard' | 'riichi'
    tileId?: string
  }> {
    // 思考時間をシミュレート
    await new Promise(resolve => setTimeout(resolve, this.getThinkingTime()))
    
    // リーチ判定
    if (this.shouldDeclareRiichi(player)) {
      return { action: 'riichi' }
    }
    
    // 捨て牌決定
    const tileId = this.decideTileToDiscard(player, drawnTile)
    return { action: 'discard', tileId }
  }
}

// 各CPU用のAIインスタンス
export const cpuAIs = {
  1: new CpuAI('easy'),
  2: new CpuAI('medium'), 
  3: new CpuAI('hard')
}