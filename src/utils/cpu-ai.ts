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
    const candidates: { tileId: string, shanten: number, score: number }[] = []

    // 各牌を捨てた場合のシャンテン数を計算
    for (const tile of tiles) {
      const remainingTiles = tiles.filter(t => t.id !== tile.id)
      const newShanten = calculateShanten(remainingTiles)

      // シャンテン数が悪化しない牌のみを候補とする
      if (newShanten <= currentShanten) {
        let score = 0

        // シャンテン数改善ボーナス
        if (newShanten < currentShanten) {
          score += 100
        }

        // 字牌を優先的に捨てる
        if (tile.suit === 'honor') {
          score += 50
        }

        // 1,9牌も捨てやすい
        if (tile.suit !== 'honor' && (tile.rank === 1 || tile.rank === 9)) {
          score += 20
        }

        // 少しのランダム要素
        score += Math.random() * 10

        candidates.push({ tileId: tile.id, shanten: newShanten, score })
      }
    }

    // 候補がない場合（すべての牌を捨てるとシャンテン数が悪化する場合）
    if (candidates.length === 0) {
      console.log('CPU: シャンテン数を維持できる捨て牌がないため、ランダムに選択')
      return tiles[Math.floor(Math.random() * tiles.length)].id
    }

    // 最も良いスコアの牌を選択
    candidates.sort((a, b) => b.score - a.score)
    return candidates[0].tileId
  }

  /**
   * 上級AI: より複雑な戦略
   */
  private hardAIDiscard(tiles: Tile[]): string {
    const currentShanten = calculateShanten(tiles)
    const candidates: { tileId: string, shanten: number, score: number }[] = []

    for (const tile of tiles) {
      const remainingTiles = tiles.filter(t => t.id !== tile.id)
      const newShanten = calculateShanten(remainingTiles)

      // シャンテン数が悪化しない牌のみを候補とする
      if (newShanten <= currentShanten) {
        let score = 0

        // シャンテン数改善への大きなボーナス
        if (newShanten < currentShanten) {
          score += 200
        }

        // 字牌を優先的に捨てる
        if (tile.suit === 'honor') {
          score += 80
        }

        // 1,9牌も捨てやすい
        if (tile.suit !== 'honor' && (tile.rank === 1 || tile.rank === 9)) {
          score += 40
        }

        // 中張牌の価値を評価（連続性を考慮）
        if (tile.suit !== 'honor' && tile.rank >= 3 && tile.rank <= 7) {
          // 中張牌は基本的に残したい
          score -= 20
        }

        candidates.push({ tileId: tile.id, shanten: newShanten, score })
      }
    }

    // 候補がない場合
    if (candidates.length === 0) {
      console.log('CPU上級: シャンテン数を維持できる捨て牌がないため、最小ダメージを選択')
      // 最もダメージの少ない牌を選択
      let minDamage = Infinity
      let bestTileId = ''

      for (const tile of tiles) {
        const remainingTiles = tiles.filter(t => t.id !== tile.id)
        const newShanten = calculateShanten(remainingTiles)
        const damage = newShanten - currentShanten

        if (damage < minDamage) {
          minDamage = damage
          bestTileId = tile.id
        }
      }

      return bestTileId || tiles[Math.floor(Math.random() * tiles.length)].id
    }

    // 最も良いスコアの牌を選択
    candidates.sort((a, b) => b.score - a.score)
    return candidates[0].tileId
  }

  /**
   * CPUがリーチするかどうかを決定
   * リーチ可能状態（14枚でリーチ判定が可能）の場合は積極的にリーチする
   */
  shouldDeclareRiichi(player: Player, drawnTile: Tile | null): boolean {
    if (player.riichi) return false // 既にリーチ済み
    if (player.score < 1000) return false // 点数不足
    if (!drawnTile) return false // ツモ牌がない

    // 14枚でリーチ可能かチェック（手牌13枚+ツモ牌1枚）
    const allTiles = [...player.tiles, drawnTile]
    if (allTiles.length !== 14) return false

    // 各牌を捨てた時にテンパイになるかチェック
    let canReach = false
    for (const tile of allTiles) {
      const remainingTiles = allTiles.filter(t => t.id !== tile.id)
      const shanten = calculateShanten(remainingTiles)
      if (shanten === 0) {
        canReach = true
        break
      }
    }

    if (!canReach) return false

    // リーチ可能状態なら積極的にリーチ
    switch (this.difficulty) {
      case 'easy':
        return Math.random() < 0.7 // 70%の確率
      case 'medium':
        return Math.random() < 0.85 // 85%の確率
      case 'hard':
        return Math.random() < 0.95 // 95%の確率
      default:
        return false
    }
  }

  /**
   * CPUのターン全体の処理時間（ミリ秒）
   */
  getThinkingTime(): number {
    const baseTime = 500
    // const randomTime = Math.random() * 1000
    const randomTime = 10

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

    // リーチ判定（ツモ牌を含めて判定）
    if (this.shouldDeclareRiichi(player, drawnTile)) {
      console.log(`CPU${player.id}: リーチ可能状態を検出、リーチを宣言します`)
      return { action: 'riichi' }
    }

    // 捨て牌決定
    const tileId = this.decideTileToDiscard(player, drawnTile)
    console.log(`CPU${player.id}: ${tileId} を捨てます`)
    return { action: 'discard', tileId }
  }
}

// 各CPU用のAIインスタンス
export const cpuAIs = {
  1: new CpuAI('easy'),
  2: new CpuAI('medium'),
  3: new CpuAI('hard')
}