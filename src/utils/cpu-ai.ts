import type { Tile, Player } from '../stores/fourPlayerMahjong'
import { calculateShanten, getUsefulTiles, checkWinCondition } from './mahjong-logic'

export class CpuAI {
  private difficulty: 'easy' | 'medium' | 'hard' | 'super'

  constructor(difficulty: 'easy' | 'medium' | 'hard' | 'super' = 'medium') {
    this.difficulty = difficulty
  }

  // 動的に難易度を設定するメソッド
  setDifficulty(difficulty: 'easy' | 'medium' | 'hard' | 'super'): void {
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

    // リーチ後はツモ切りのみ
    if (player.riichi && drawnTile) {
      return drawnTile.id
    }

    // 難易度による戦略
    switch (this.difficulty) {
      case 'easy':
        return this.randomDiscard(allTiles)
      case 'medium':
        return this.mediumAIDiscard(allTiles)
      case 'hard':
      case 'super':
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
   * 中級AI: 旧上級AIと同様の複雑な戦略（hardAIと同じロジック）
   */
  private mediumAIDiscard(tiles: Tile[]): string {
    // allTilesの最後がツモ牌なので、これを除いた13枚でシャンテン数を計算
    const handTiles = tiles.slice(0, -1) // 最後のツモ牌を除いた13枚
    const currentShanten = calculateShanten(handTiles)
    const candidates: { tileId: string, shanten: number, score: number }[] = []

    for (const tile of tiles) {
      const remainingTiles = tiles.filter(t => t.id !== tile.id)
      const newShanten = calculateShanten(remainingTiles)

      // シャンテン数が悪化しない牌のみを候補とする
      if (newShanten <= currentShanten) {
        let score = 0

        // シャンテン数改善への大きなボーナス
        if (newShanten < currentShanten) {
          score += 300
        }

        // 孤立牌を最優先で捨てる
        if (this.isIsolatedTile(tile, tiles)) {
          score += 200
        }

        // 塔子の種類と対子数による細かい優先順位
        const taatsuType = this.getTaatsuType(tile, tiles)
        const pairCount = this.countPairs(tiles)

        if (taatsuType === 'shanpon' && pairCount >= 3) {
          // 対子が3つ以上ある場合のシャンポン形
          if (tile.suit !== 'honor' && tile.rank >= 3 && tile.rank <= 7) {
            score += 100  // 中張牌の対子
          } else if (tile.suit !== 'honor' && (tile.rank === 1 || tile.rank === 9)) {
            score += 120  // 1,9牌の対子
          } else if (tile.suit === 'honor') {
            score += 140  // 字牌の対子
          }
        } else if (taatsuType === 'penchan') {
          score += 80  // ペンチャン
        } else if (taatsuType === 'kanchan') {
          score += 60  // カンチャン
        } else if (taatsuType === 'ryanmen') {
          score += 0   // リャンメンは残したい
        }

        // その他の基本的な評価
        if (taatsuType === 'none') {
          // 塔子を形成していない牌の評価
          if (tile.suit === 'honor') {
            score += 50
          } else if (tile.rank === 1 || tile.rank === 9) {
            score += 30
          }
        }

        candidates.push({ tileId: tile.id, shanten: newShanten, score })
      }
    }

    // 候補がない場合
    if (candidates.length === 0) {
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
   * 牌が孤立牌かどうかを判定する
   */
  private isIsolatedTile(tile: Tile, tiles: Tile[]): boolean {
    if (tile.suit === 'honor') {
      // 字牌の場合は同じ牌が1枚のみで孤立
      return tiles.filter(t => t.suit === tile.suit && t.rank === tile.rank).length === 1
    }

    // 数牌の場合：同じ牌が複数あるか、隣接する牌があるかをチェック
    const sameRankCount = tiles.filter(t => t.suit === tile.suit && t.rank === tile.rank).length

    // 同じ牌が2枚以上あれば孤立ではない（対子・刻子の可能性）
    if (sameRankCount >= 2) {
      return false
    }

    // 隣接する牌があるかチェック（カンチャン塔子も考慮）
    const hasNearby = tiles.some(t =>
      t.suit === tile.suit &&
      t.rank !== tile.rank &&
      Math.abs(t.rank - tile.rank) <= 2  // 差が2以内なら塔子の可能性あり
    )

    return !hasNearby
  }

  /**
   * 塔子の種類を判定する
   */
  private getTaatsuType(tile: Tile, tiles: Tile[]): 'ryanmen' | 'kanchan' | 'penchan' | 'shanpon' | 'none' {
    if (tile.suit === 'honor') {
      // 字牌は対子のみ考慮
      const count = tiles.filter(t => t.suit === tile.suit && t.rank === tile.rank).length
      return count >= 2 ? 'shanpon' : 'none'
    }

    const suitTiles = tiles.filter(t => t.suit === tile.suit)
    const sameCount = suitTiles.filter(t => t.rank === tile.rank).length

    // 対子の場合
    if (sameCount >= 2) {
      return 'shanpon'
    }

    // 数牌の塔子判定
    const hasMinusTwo = suitTiles.some(t => t.rank === tile.rank - 2)
    const hasMinusOne = suitTiles.some(t => t.rank === tile.rank - 1)
    const hasPlusOne = suitTiles.some(t => t.rank === tile.rank + 1)
    const hasPlusTwo = suitTiles.some(t => t.rank === tile.rank + 2)

    // ペンチャン判定 (12, 89)
    if (tile.rank === 1 && hasPlusOne && !hasPlusTwo) return 'penchan'
    if (tile.rank === 2 && hasMinusOne && !hasMinusTwo) return 'penchan'
    if (tile.rank === 8 && hasPlusOne && !hasMinusTwo) return 'penchan'
    if (tile.rank === 9 && hasMinusOne && !hasMinusTwo) return 'penchan'

    // リャンメン判定
    if (hasMinusOne && hasPlusOne) return 'ryanmen'
    if (tile.rank >= 2 && tile.rank <= 8) {
      if (hasMinusOne || hasPlusOne) return 'ryanmen'
    }

    // カンチャン判定
    if (hasMinusTwo || hasPlusTwo) return 'kanchan'

    return 'none'
  }

  /**
   * 対子の数を数える
   */
  private countPairs(tiles: Tile[]): number {
    const counts = new Map<string, number>()

    for (const tile of tiles) {
      const key = `${tile.suit}-${tile.rank}`
      counts.set(key, (counts.get(key) || 0) + 1)
    }

    let pairCount = 0
    for (const count of counts.values()) {
      if (count >= 2) pairCount++
    }

    return pairCount
  }

  /**
   * 上級AI: より複雑な戦略
   */
  private hardAIDiscard(tiles: Tile[]): string {
    // allTilesの最後がツモ牌なので、これを除いた13枚でシャンテン数を計算
    const handTiles = tiles.slice(0, -1) // 最後のツモ牌を除いた13枚
    const currentShanten = calculateShanten(handTiles)
    const candidates: { tileId: string, shanten: number, score: number }[] = []

    for (const tile of tiles) {
      const remainingTiles = tiles.filter(t => t.id !== tile.id)
      const newShanten = calculateShanten(remainingTiles)

      // シャンテン数が悪化しない牌のみを候補とする
      if (newShanten <= currentShanten) {
        let score = 0

        // シャンテン数改善への大きなボーナス
        if (newShanten < currentShanten) {
          score += 300
        }

        // 孤立牌を最優先で捨てる
        if (this.isIsolatedTile(tile, tiles)) {
          score += 200
        }

        // 塔子の種類と対子数による細かい優先順位
        const taatsuType = this.getTaatsuType(tile, tiles)
        const pairCount = this.countPairs(tiles)

        if (taatsuType === 'shanpon' && pairCount >= 3) {
          // 対子が3つ以上ある場合のシャンポン形
          if (tile.suit !== 'honor' && tile.rank >= 3 && tile.rank <= 7) {
            score += 100  // 中張牌の対子
          } else if (tile.suit !== 'honor' && (tile.rank === 1 || tile.rank === 9)) {
            score += 120  // 1,9牌の対子
          } else if (tile.suit === 'honor') {
            score += 140  // 字牌の対子
          }
        } else if (taatsuType === 'penchan') {
          score += 80  // ペンチャン
        } else if (taatsuType === 'kanchan') {
          score += 60  // カンチャン
        } else if (taatsuType === 'ryanmen') {
          score += 0   // リャンメンは残したい
        }

        // その他の基本的な評価
        if (taatsuType === 'none') {
          // 塔子を形成していない牌の評価
          if (tile.suit === 'honor') {
            score += 50
          } else if (tile.rank === 1 || tile.rank === 9) {
            score += 30
          }
        }

        candidates.push({ tileId: tile.id, shanten: newShanten, score })
      }
    }

    // 候補がない場合次局
    if (candidates.length === 0) {
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

    // player.tilesに既にdrawnTileが含まれているかチェック
    const allTiles = drawnTile && player.tiles.length === 13 ? [...player.tiles, drawnTile] : player.tiles
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

    if (!canReach) {
      return false
    }

    // リーチ可能状態なら積極的にリーチ
    const shouldRiichi = (() => {
      switch (this.difficulty) {
        case 'easy':
          return Math.random() < 0.7 // 70%の確率
        case 'medium':
          return Math.random() < 0.85 // 85%の確率
        case 'hard':
          return Math.random() < 0.95 // 95%の確率
        case 'super':
          return true // 100%リーチ
        default:
          return false
      }
    })()

    return shouldRiichi
  }

  /**
   * リーチ宣言時に捨てるべき牌を決定する
   */
  getRiichiDiscardTile(player: Player, drawnTile: Tile | null): string | null {
    // player.tilesに既にdrawnTileが含まれているかチェック
    const allTiles = drawnTile && player.tiles.length === 13 ? [...player.tiles, drawnTile] : player.tiles
    if (allTiles.length !== 14) return null

    // 各牌を捨てた時にテンパイになる牌を探す
    for (const tile of allTiles) {
      const remainingTiles = allTiles.filter(t => t.id !== tile.id)
      const shanten = calculateShanten(remainingTiles)
      if (shanten === 0) {
        return tile.id
      }
    }

    return null
  }

  /**
   * CPUのターン全体の処理時間（ミリ秒）
   */
  getThinkingTime(): number {
    const baseTime = 10
    // const randomTime = Math.random() * 1000
    return baseTime
  }

  /**
   * CPUがロンできるかどうかを判定する
   */
  canRon(player: Player, winTile: Tile, doraIndicators: Tile[]): boolean {
    // ロン時は手牌13枚（player.tiles）と上がり牌（winTile）を分けて渡す
    const winResult = checkWinCondition(player.tiles, winTile, false, player.riichi, doraIndicators, [], false, false, player.melds)
    return winResult.isWin
  }

  /**
   * CPUがロンするかどうかを決定する
   */
  shouldDeclareRon(player: Player, winTile: Tile, doraIndicators: Tile[]): boolean {
    if (!this.canRon(player, winTile, doraIndicators)) {
      return false
    }

    // 常に100%ロンする（難易度に関わらず）
    return true
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

    // リーチ後はツモ切りのみ
    if (player.riichi && drawnTile) {
      return { action: 'discard', tileId: drawnTile.id }
    }

    // リーチ判定（ツモ牌を含めて判定）
    if (this.shouldDeclareRiichi(player, drawnTile)) {
      return { action: 'riichi' }
    }

    // 捨て牌決定
    const tileId = this.decideTileToDiscard(player, drawnTile)
    return { action: 'discard', tileId }
  }
}

// 各CPU用のAIインスタンス（動的に難易度を適用）
export const cpuAIs = {
  1: new CpuAI('easy'),
  2: new CpuAI('medium'),
  3: new CpuAI('super')
}