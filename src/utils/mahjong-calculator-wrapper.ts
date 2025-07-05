import type { Tile } from '../stores/mahjong'
import type { Tile as FourPlayerTile } from '../stores/fourPlayerMahjong'
import init, { 
  calc_shanten, 
  calc_acceptance,
  tile_to_string,
  get_acceptance_string_js,
  AcceptanceResultJS
} from '../mahjong_calculator_rs/mahjong_calculator_rs.js'

// WASM初期化フラグ
let isInitialized = false

/**
 * WASMモジュールの初期化
 */
export async function initMahjongCalculator(): Promise<void> {
  if (!isInitialized) {
    await init()
    isInitialized = true
  }
}

/**
 * Tile配列を34要素のUint8Arrayに変換
 * @param tiles Tile配列
 * @returns 34要素のUint8Array（0-33: 1m-9m,1p-9p,1s-9s,東南西北白發中）
 */
export function convertTilesToRustFormat(tiles: Tile[] | FourPlayerTile[]): Uint8Array {
  const rustTiles = new Uint8Array(34)
  
  for (const tile of tiles) {
    const index = getTileIndex(tile)
    if (index >= 0 && index < 34) {
      rustTiles[index]++
    }
  }
  
  return rustTiles
}

/**
 * 牌からインデックスを取得（Rustライブラリ用）
 * @param tile 牌
 * @returns インデックス（0-33）
 */
export function getTileIndex(tile: Tile | FourPlayerTile): number {
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
 * インデックスから牌を作成
 * @param index インデックス（0-33）
 * @param id 牌のID
 * @returns 牌
 */
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

/**
 * シャンテン数を計算（Rustライブラリ使用）
 * @param tiles 手牌
 * @returns シャンテン数（-1: 和了、0: 聴牌、1以上: シャンテン数、8: エラー）
 */
export async function calculateShantenRust(tiles: Tile[] | FourPlayerTile[]): Promise<number> {
  await initMahjongCalculator()
  
  if (tiles.length === 0) {
    return 8
  }
  
  try {
    const rustTiles = convertTilesToRustFormat(tiles)
    return calc_shanten(rustTiles)
  } catch (error) {
    console.error('シャンテン計算エラー:', error)
    return 8
  }
}

/**
 * 受け入れ牌を計算（Rustライブラリ使用）
 * @param tiles 手牌（13枚）
 * @returns 受け入れ牌のインデックス配列
 */
export async function getUsefulTilesRust(tiles: Tile[] | FourPlayerTile[]): Promise<number[]> {
  await initMahjongCalculator()
  
  try {
    const rustTiles = convertTilesToRustFormat(tiles)
    const result = calc_acceptance(rustTiles)
    
    // 受け入れ牌のインデックスを配列に変換
    const acceptanceTiles = Array.from(result.acceptance_tiles)
    const acceptanceShanten = Array.from(result.acceptance_shanten)
    const currentShanten = result.current_shanten
    
    // メモリを解放
    result.free()
    
    // 現在のシャンテン数より小さくなる牌のみを返す
    const usefulTiles: number[] = []
    for (let i = 0; i < acceptanceTiles.length; i++) {
      if (acceptanceShanten[i] < currentShanten) {
        usefulTiles.push(acceptanceTiles[i])
      }
    }
    
    return usefulTiles
  } catch (error) {
    console.error('受け入れ牌計算エラー:', error)
    return []
  }
}

/**
 * 受け入れ牌を文字列で取得（Rustライブラリ使用）
 * @param tiles 手牌
 * @returns 受け入れ牌の文字列
 */
export async function getAcceptanceStringRust(tiles: Tile[] | FourPlayerTile[]): Promise<string> {
  await initMahjongCalculator()
  
  try {
    const rustTiles = convertTilesToRustFormat(tiles)
    return get_acceptance_string_js(rustTiles)
  } catch (error) {
    console.error('受け入れ文字列取得エラー:', error)
    return 'なし'
  }
}

// 同期的なインターフェースも提供（内部で初期化は非同期だが、初期化済みであれば同期実行）
let calculatorReady = false

/**
 * 同期的なシャンテン計算（初期化済みの場合）
 */
export function calculateShantenSync(tiles: Tile[] | FourPlayerTile[]): number {
  if (!isInitialized) {
    console.warn('WASM未初期化です。非同期版を使用してください。')
    return 8
  }
  
  if (tiles.length === 0) {
    return 8
  }
  
  try {
    const rustTiles = convertTilesToRustFormat(tiles)
    return calc_shanten(rustTiles)
  } catch (error) {
    console.error('シャンテン計算エラー:', error)
    return 8
  }
}

/**
 * 同期的な受け入れ牌計算（初期化済みの場合）
 */
export function getUsefulTilesSync(tiles: Tile[] | FourPlayerTile[]): number[] {
  if (!isInitialized) {
    console.warn('WASM未初期化です。非同期版を使用してください。')
    return []
  }
  
  try {
    const rustTiles = convertTilesToRustFormat(tiles)
    const result = calc_acceptance(rustTiles)
    
    const acceptanceTiles = Array.from(result.acceptance_tiles)
    const acceptanceShanten = Array.from(result.acceptance_shanten)
    const currentShanten = result.current_shanten
    
    result.free()
    
    const usefulTiles: number[] = []
    for (let i = 0; i < acceptanceTiles.length; i++) {
      if (acceptanceShanten[i] < currentShanten) {
        usefulTiles.push(acceptanceTiles[i])
      }
    }
    
    return usefulTiles
  } catch (error) {
    console.error('受け入れ牌計算エラー:', error)
    return []
  }
}

/**
 * 詳細な受け入れ牌情報を取得（Rustライブラリ使用）
 * @param tiles 手牌
 * @returns 受け入れ牌の詳細情報
 */
export async function getAcceptanceInfoRust(tiles: Tile[] | FourPlayerTile[]): Promise<{
  currentShanten: number
  acceptanceTiles: number[]
  acceptanceShanten: number[]
}> {
  await initMahjongCalculator()
  
  try {
    const rustTiles = convertTilesToRustFormat(tiles)
    const result = calc_acceptance(rustTiles)
    
    const info = {
      currentShanten: result.current_shanten,
      acceptanceTiles: Array.from(result.acceptance_tiles),
      acceptanceShanten: Array.from(result.acceptance_shanten)
    }
    
    // メモリを解放
    result.free()
    
    return info
  } catch (error) {
    console.error('受け入れ情報取得エラー:', error)
    return {
      currentShanten: 8,
      acceptanceTiles: [],
      acceptanceShanten: []
    }
  }
}

/**
 * 牌のインデックスを文字列に変換（Rustライブラリ使用）
 * @param index 牌のインデックス（0-33）
 * @returns 牌の文字列表現
 */
export async function tileIndexToStringRust(index: number): Promise<string> {
  await initMahjongCalculator()
  
  try {
    return tile_to_string(index)
  } catch (error) {
    console.error('牌文字列変換エラー:', error)
    return '不明'
  }
}

/**
 * 指定された牌の残り枚数を計算
 * @param tileIndex 牌のインデックス（0-33）
 * @param visibleTiles 見えている牌
 * @returns 残り枚数
 */
export function getTileRemainingCount(
  tileIndex: number,
  visibleTiles: Tile[] | FourPlayerTile[]
): number {
  const maxCount = 4
  
  let visibleCount = 0
  for (const tile of visibleTiles) {
    if (getTileIndex(tile) === tileIndex) {
      visibleCount++
    }
  }
  
  return Math.max(0, maxCount - visibleCount)
}

// 受け入れ情報の型定義
export interface AcceptanceInfo {
  tileIndex: number
  tile: Tile | FourPlayerTile
  acceptanceTiles: number[]
  remainingCounts: number[]
  totalAcceptance: number
  shantenAfterDiscard: number
}

/**
 * 14枚の手牌から各牌を切った時の受け入れ計算（Rustライブラリ使用）
 * @param tiles 14枚の手牌
 * @param visibleTiles 見えている牌
 * @returns 各牌を切った時の受け入れ情報
 */
export async function calculateAcceptanceRust(
  tiles: Tile[] | FourPlayerTile[],
  visibleTiles: Tile[] | FourPlayerTile[] = []
): Promise<AcceptanceInfo[]> {
  if (tiles.length !== 14) {
    return []
  }
  
  const results: AcceptanceInfo[] = []
  const calculatedTileTypes = new Set<string>()
  
  const handTileIds = new Set(tiles.map(tile => tile.id))
  const otherVisibleTiles = visibleTiles.filter(tile => !handTileIds.has(tile.id))
  
  for (let i = 0; i < tiles.length; i++) {
    const tileToDiscard = tiles[i]
    
    const tileTypeKey = `${tileToDiscard.suit}_${tileToDiscard.rank}_${tileToDiscard.isRed || false}`
    if (calculatedTileTypes.has(tileTypeKey)) {
      const existingResult = results.find(r => 
        r.tile.suit === tileToDiscard.suit && 
        r.tile.rank === tileToDiscard.rank && 
        (r.tile as any).isRed === tileToDiscard.isRed
      )
      if (existingResult) {
        results.push({
          ...existingResult,
          tile: tileToDiscard
        })
      }
      continue
    }
    
    const remainingTiles = [...tiles]
    remainingTiles.splice(i, 1)
    
    if (remainingTiles.length === 13) {
      const currentShanten = await calculateShantenRust(remainingTiles)
      
      if (currentShanten === 0) {
        const acceptanceTiles = await getUsefulTilesRust(remainingTiles)
        
        const visibleTilesAfterDiscard = [...remainingTiles, ...otherVisibleTiles]
        
        const remainingCounts = acceptanceTiles.map(tileIndex =>
          getTileRemainingCount(tileIndex, visibleTilesAfterDiscard)
        )
        const totalAcceptance = remainingCounts.reduce((sum, count) => sum + count, 0)
        
        results.push({
          tileIndex: getTileIndex(tileToDiscard),
          tile: tileToDiscard,
          acceptanceTiles,
          remainingCounts,
          totalAcceptance,
          shantenAfterDiscard: 0
        })
        
        calculatedTileTypes.add(tileTypeKey)
      }
    }
  }
  
  return results
}