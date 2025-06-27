import type { Tile } from '../stores/mahjong'
import type { Tile as FourPlayerTile } from '../stores/fourPlayerMahjong'
import { syanten } from 'syanten'

export function convertTilesToSyantenFormat(tiles: Tile[] | FourPlayerTile[]): [number[], number[], number[], number[]] {
  const man = new Array(9).fill(0)
  const pin = new Array(9).fill(0) 
  const sou = new Array(9).fill(0)
  const honor = new Array(7).fill(0)
  
  for (const tile of tiles) {
    if (tile.suit === 'man') {
      man[tile.rank - 1]++
    } else if (tile.suit === 'pin') {
      pin[tile.rank - 1]++
    } else if (tile.suit === 'sou') {
      sou[tile.rank - 1]++
    } else { // honor
      honor[tile.rank - 1]++
    }
  }
  
  return [man, pin, sou, honor]
}

export function calculateShanten(tiles: Tile[] | FourPlayerTile[]): number {
  // 手牌枚数のチェック（13枚または14枚でない場合は計算不可）
  if (tiles.length !== 13 && tiles.length !== 14) {
    return 8 // 不正な手牌サイズの場合は最大シャンテン数を返す
  }
  
  const [man, pin, sou, honor] = convertTilesToSyantenFormat(tiles)
  
  try {
    // syantenライブラリは配列の配列形式を要求する
    const result = syanten([man as any, pin as any, sou as any, honor as any])
    
    // syantenライブラリは-1で和了、0以上でシャンテン数を返す
    return result
  } catch (error) {
    console.error('シャンテン数計算エラー:', error, { man, pin, sou, honor })
    return 8 // エラーの場合は最大シャンテン数を返す
  }
}

export function getUsefulTiles(tiles: Tile[]): number[] {
  const currentShanten = calculateShanten(tiles)
  if (currentShanten === -1) return []
  
  const useful: number[] = []
  
  // 全ての可能な牌をテスト (34種類)
  for (let i = 0; i < 34; i++) {
    const testTile = createTileFromIndex(i, 'test')
    const testTiles = [...tiles, testTile]
    
    // 手牌数チェック - 13枚または14枚の場合のみ処理
    if (testTiles.length !== 14 && testTiles.length !== 13) continue
    
    const newShanten = calculateShanten(testTiles)
    
    if (newShanten < currentShanten) {
      useful.push(i)
    }
  }
  
  return useful
}

export function createTileFromIndex(index: number, id: string): Tile {
  if (index < 9) {
    return { id, suit: 'man', rank: index + 1, isRed: false } as any
  } else if (index < 18) {
    return { id, suit: 'pin', rank: index - 9 + 1, isRed: false } as any
  } else if (index < 27) {
    return { id, suit: 'sou', rank: index - 18 + 1, isRed: false } as any
  } else {
    return { id, suit: 'honor', rank: index - 27 + 1, isRed: false } as any
  }
}

export function isWinningHand(tiles: Tile[] | FourPlayerTile[]): boolean {
  return calculateShanten(tiles) === -1
}

export function canRiichi(tiles: Tile[] | FourPlayerTile[], discards?: Tile[] | FourPlayerTile[]): boolean {
  // リーチ条件：14枚の手牌でテンパイ判定を行う
  // 1. 14枚の手牌でなければならない
  // 2. どれか1枚を捨てることでテンパイになる
  // 3. まだリーチしていない (GameManagerで判定)
  // 4. 鳴いていない (melds が空) (GameManagerで判定)
  // 5. 1000点以上持っている (GameManagerで判定)
  
  if (tiles.length !== 14) {
    return false
  }
  
  // 各牌を1枚ずつ取り除いて、残り13枚でテンパイ（シャンテン0）になるかチェック
  for (let i = 0; i < tiles.length; i++) {
    const testTiles = [...tiles]
    testTiles.splice(i, 1) // i番目の牌を除去
    
    if (testTiles.length === 13) {
      const shanten = calculateShanten(testTiles)
      if (shanten === 0) {
        return true // 1枚捨てることでテンパイになる
      }
    }
  }
  
  return false
}

// 役判定の基本的な実装 (簡易版)
export function checkBasicYaku(tiles: Tile[], winTile: Tile, isTsumo: boolean): string[] {
  const yaku: string[] = []
  
  if (isTsumo) {
    yaku.push('門前清自摸和')
  }
  
  // リーチ判定は別途実装が必要
  // その他の役も段階的に実装
  
  return yaku
}

export function calculateScore(yaku: string[], han: number, fu: number): number {
  // 簡易的な得点計算
  // 実際の麻雀得点計算は複雑なので、基本的なもののみ
  
  if (han >= 13) return 32000 // 役満
  if (han >= 11) return 24000 // 三倍満
  if (han >= 8) return 16000  // 倍満
  if (han >= 6) return 12000  // 跳満
  if (han >= 5) return 8000   // 満貫
  
  // 通常の計算 (簡易版)
  let baseScore = fu * Math.pow(2, han + 2)
  if (baseScore > 8000) baseScore = 8000 // 満貫切り上げ
  
  return Math.ceil(baseScore / 100) * 100
}

// Import the new scoring function
import { calculateScore as calculateRiichiScore } from './scoring'

// 麻雀の上がり判定（詳細版）
export function checkWinCondition(tiles: FourPlayerTile[], winTile: FourPlayerTile, isTsumo: boolean, riichi: boolean, doraIndicators: FourPlayerTile[], uradoraIndicators: FourPlayerTile[] = [], isDealer: boolean = false, isIppatsu: boolean = false): {
  isWin: boolean
  yaku: Array<{ name: string; han: number }>
  totalHan: number
  fu: number
  basePoints: number
  totalPoints: number
  paymentInfo: string
  yakuman: number
  doraCount: number
  uradoraCount: number
} {
  try {
    // Use riichi-rs-bundlers for accurate scoring calculation
    const scoringResult = calculateRiichiScore({
      hand: tiles,
      winningTile: winTile,
      isTsumo,
      isRiichi: riichi,
      doraIndicators,
      uradoraIndicators,
      isDealer,
      isIppatsu
    })

    if (!scoringResult) {
      return {
        isWin: false,
        yaku: [],
        totalHan: 0,
        fu: 0,
        basePoints: 0,
        totalPoints: 0,
        paymentInfo: '',
        yakuman: 0,
        doraCount: 0,
        uradoraCount: 0
      }
    }

    // Extract dora counts from yaku
    const doraCount = scoringResult.yaku.filter(y => y.name === 'ドラ').reduce((sum, y) => sum + y.han, 0)
    const uradoraCount = scoringResult.yaku.filter(y => y.name === '裏ドラ').reduce((sum, y) => sum + y.han, 0)

    return {
      isWin: true,
      yaku: scoringResult.yaku,
      totalHan: scoringResult.han,
      fu: scoringResult.fu,
      basePoints: scoringResult.points,
      totalPoints: scoringResult.totalPoints,
      paymentInfo: scoringResult.paymentInfo,
      yakuman: scoringResult.yakuman,
      doraCount,
      uradoraCount
    }
  } catch (error) {
    console.error('Error in checkWinCondition:', error)
    
    // Fallback to simple logic if riichi-rs-bundlers fails
    const convertedTiles = tiles.map(t => ({ id: t.id, suit: t.suit, rank: t.rank, isRed: t.isRed })) as Tile[]
    const isWin = calculateShanten(convertedTiles) === -1
    
    if (!isWin) {
      return {
        isWin: false,
        yaku: [],
        totalHan: 0,
        fu: 0,
        basePoints: 0,
        totalPoints: 0,
        paymentInfo: '',
        yakuman: 0,
        doraCount: 0,
        uradoraCount: 0
      }
    }
    
    // Basic fallback scoring
    const yaku: Array<{ name: string; han: number }> = []
    
    if (isTsumo) {
      yaku.push({ name: '門前清自摸和', han: 1 })
    }
    
    if (riichi) {
      yaku.push({ name: 'リーチ', han: 1 })
    }
    
    if (isIppatsu && riichi) {
      yaku.push({ name: '一発', han: 1 })
    }
    
    if (hasAllSimples(tiles)) {
      yaku.push({ name: '断ヤオ九', han: 1 })
    }
    
    const doraCount = countDora(tiles, doraIndicators)
    const uradoraCount = riichi ? countDora(tiles, uradoraIndicators) : 0
    
    if (doraCount > 0) {
      yaku.push({ name: 'ドラ', han: doraCount })
    }
    
    if (uradoraCount > 0) {
      yaku.push({ name: '裏ドラ', han: uradoraCount })
    }
    
    if (yaku.length === 0) {
      return {
        isWin: false,
        yaku: [],
        totalHan: 0,
        fu: 0,
        basePoints: 0,
        totalPoints: 0,
        paymentInfo: '',
        doraCount,
        uradoraCount
      }
    }
    
    const totalHan = yaku.reduce((sum, y) => sum + y.han, 0)
    const fu = calculateFu(tiles, winTile, isTsumo)
    const basePoints = calculateScore(yaku.map(y => y.name), totalHan, fu)
    
    // フォールバック時も支払い形式を計算
    const paymentInfo = isTsumo 
      ? (isDealer ? `${Math.ceil(basePoints / 3 / 100) * 100} all` : `${Math.ceil(basePoints / 4 / 100) * 100}-${Math.ceil(basePoints / 2 / 100) * 100}`)
      : `${isDealer ? Math.ceil(basePoints * 1.5 / 100) * 100 : basePoints}`
    
    return {
      isWin: true,
      yaku,
      totalHan,
      fu,
      basePoints,
      totalPoints: basePoints,
      paymentInfo,
      yakuman: 0,
      doraCount,
      uradoraCount
    }
  }
}

// 簡易的な符計算
function calculateFu(tiles: FourPlayerTile[], winTile: FourPlayerTile, isTsumo: boolean): number {
  let fu = 20 // 基本符
  
  if (isTsumo) {
    fu += 2 // ツモ符
  }
  
  // 実際は面子構成や待ちの種類で変わるが、簡易版では固定
  fu += 30 // 面子符（簡易）
  
  return Math.ceil(fu / 10) * 10 // 10符単位に切り上げ
}

// 清一色判定
function isAllSameSuit(tiles: FourPlayerTile[]): boolean {
  const suits = [...new Set(tiles.map(t => t.suit).filter(s => s !== 'honor'))]
  return suits.length === 1 && tiles.every(t => t.suit !== 'honor')
}

// 混老頭判定
function isAllTerminalsAndHonors(tiles: FourPlayerTile[]): boolean {
  return tiles.every(t => 
    t.suit === 'honor' || t.rank === 1 || t.rank === 9
  )
}

// 断ヤオ九判定
function hasAllSimples(tiles: FourPlayerTile[]): boolean {
  return tiles.every(t => 
    t.suit !== 'honor' && t.rank >= 2 && t.rank <= 8
  )
}

// ドラ計算
function countDora(tiles: FourPlayerTile[], doraIndicators: FourPlayerTile[]): number {
  let count = 0
  
  for (const tile of tiles) {
    for (const indicator of doraIndicators) {
      if (isDoraFromIndicator(tile, indicator)) {
        count++
      }
    }
  }
  
  return count
}

// ドラ表示牌からドラを判定
function isDoraFromIndicator(tile: FourPlayerTile, indicator: FourPlayerTile): boolean {
  if (indicator.suit === 'honor') {
    // 字牌の場合
    if (tile.suit !== 'honor') return false
    
    if (indicator.rank <= 4) {
      // 風牌: 東→南→西→北→東
      const nextRank = indicator.rank === 4 ? 1 : indicator.rank + 1
      return tile.rank === nextRank
    } else {
      // 三元牌: 白→發→中→白
      const nextRank = indicator.rank === 7 ? 5 : indicator.rank + 1
      return tile.rank === nextRank
    }
  } else {
    // 数牌の場合
    if (tile.suit !== indicator.suit) return false
    
    const nextRank = indicator.rank === 9 ? 1 : indicator.rank + 1
    return tile.rank === nextRank
  }
}