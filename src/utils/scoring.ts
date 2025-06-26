import { calc, Tile as RsTile, Yaku as RsYaku } from 'riichi-rs-bundlers'
import type { Tile } from '../stores/fourPlayerMahjong'

export interface ScoringInput {
  hand: Tile[]
  winningTile: Tile
  isTsumo: boolean
  isRiichi: boolean
  doraIndicators: Tile[]
  uradoraIndicators: Tile[]
  isDealer: boolean
}

export interface ScoringResult {
  han: number
  fu: number
  points: number
  yaku: Array<{
    name: string
    han: number
  }>
}

// Convert our Tile format to riichi-rs-bundlers numeric format
function convertTileToNumber(tile: Tile): number {
  if (tile.suit === 'honor') {
    // Honor tiles: 1=東(28), 2=南(29), 3=西(30), 4=北(31), 5=白(32), 6=發(33), 7=中(34)
    const honorMap = [RsTile.East, RsTile.South, RsTile.West, RsTile.North, RsTile.Haku, RsTile.Hatsu, RsTile.Chun]
    return honorMap[tile.rank - 1]
  } else {
    // Number tiles
    if (tile.suit === 'man') {
      return RsTile.M1 + tile.rank - 1
    } else if (tile.suit === 'pin') {
      return RsTile.P1 + tile.rank - 1
    } else if (tile.suit === 'sou') {
      return RsTile.S1 + tile.rank - 1
    }
  }
  throw new Error(`Invalid tile: ${tile.suit}${tile.rank}`)
}

// Convert array of tiles to riichi-rs-bundlers numeric format
function convertTilesToNumbers(tiles: Tile[]): number[] {
  return tiles.map(convertTileToNumber).sort((a, b) => a - b)
}

// Convert yaku ID to Japanese name
function getYakuName(yakuId: number): string {
  const yakuNames: Record<number, string> = {
    [RsYaku.Kokushimusou13Sides]: '国士無双十三面',
    [RsYaku.Kokushimusou]: '国士無双',
    [RsYaku.Chuurenpoto9Sides]: '九蓮宝燈九面',
    [RsYaku.Chuurenpoto]: '九蓮宝燈',
    [RsYaku.SuuankouTanki]: '四暗刻単騎',
    [RsYaku.Suuankou]: '四暗刻',
    [RsYaku.Daisuushi]: '大四喜',
    [RsYaku.Shosuushi]: '小四喜',
    [RsYaku.Daisangen]: '大三元',
    [RsYaku.Tsuuiisou]: '字一色',
    [RsYaku.Ryuuiisou]: '緑一色',
    [RsYaku.Chinroutou]: '清老頭',
    [RsYaku.Suukantsu]: '四槓子',
    [RsYaku.Tenhou]: '天和',
    [RsYaku.Chihou]: '地和',
    [RsYaku.Renhou]: '人和',
    [RsYaku.Daisharin]: '大車輪',
    [RsYaku.Chinitsu]: '清一色',
    [RsYaku.Honitsu]: '混一色',
    [RsYaku.Ryanpeikou]: '二盃口',
    [RsYaku.Junchan]: '純全帯么九',
    [RsYaku.Chanta]: '混全帯么九',
    [RsYaku.Toitoi]: '対々和',
    [RsYaku.Honroutou]: '混老頭',
    [RsYaku.Sankantsu]: '三槓子',
    [RsYaku.Shosangen]: '小三元',
    [RsYaku.SanshokuDoukou]: '三色同刻',
    [RsYaku.Sanankou]: '三暗刻',
    [RsYaku.Chiitoitsu]: '七対子',
    [RsYaku.DaburuRiichi]: 'ダブルリーチ',
    [RsYaku.Ittsu]: '一気通貫',
    [RsYaku.Sanshoku]: '三色同順',
    [RsYaku.Tanyao]: '断么九',
    [RsYaku.Pinfu]: '平和',
    [RsYaku.Iipeikou]: '一盃口',
    [RsYaku.Menzentsumo]: '門前清自摸和',
    [RsYaku.Riichi]: 'リーチ',
    [RsYaku.Ippatsu]: '一発',
    [RsYaku.Rinshan]: '嶺上開花',
    [RsYaku.Chankan]: '槍槓',
    [RsYaku.Haitei]: '海底摸月',
    [RsYaku.Houtei]: '河底撈魚',
    [RsYaku.RoundWindEast]: '場風 東',
    [RsYaku.RoundWindSouth]: '場風 南',
    [RsYaku.RoundWindWest]: '場風 西',
    [RsYaku.RoundWindNorth]: '場風 北',
    [RsYaku.OwnWindEast]: '自風 東',
    [RsYaku.OwnWindSouth]: '自風 南',
    [RsYaku.OwnWindWest]: '自風 西',
    [RsYaku.OwnWindNorth]: '自風 北',
    [RsYaku.Haku]: '白',
    [RsYaku.Hatsu]: '發',
    [RsYaku.Chun]: '中',
    [RsYaku.Dora]: 'ドラ',
    [RsYaku.Uradora]: '裏ドラ',
    [RsYaku.Akadora]: '赤ドラ'
  }
  return yakuNames[yakuId] || `役${yakuId}`
}

export function calculateScore(input: ScoringInput): ScoringResult | null {
  try {
    // Convert tiles to riichi-rs-bundlers format
    const closedPart = convertTilesToNumbers(input.hand) as number[] // Type assertion for riichi-rs-bundlers
    const doraNumbers = convertTilesToNumbers(input.doraIndicators) as number[]
    const uradoraNumbers = convertTilesToNumbers(input.uradoraIndicators) as number[]

    // Determine tile discarded by someone (for ron)
    const winTileNumber = convertTileToNumber(input.winningTile)
    const tileDiscardedBy = input.isTsumo ? -1 : winTileNumber

    // Determine winds
    const bakaze = RsTile.East // 場風: 東場
    const jikaze = input.isDealer ? RsTile.East : RsTile.South // 自風: 親=東、子=南

    // Create RiichiInput for riichi-rs-bundlers
    const riichiInput = {
      closed_part: closedPart as any, // Type assertion for WebAssembly compatibility
      open_part: [], // No open melds for now
      options: {
        dora: doraNumbers as any,
        riichi: input.isRiichi,
        tile_discarded_by_someone: tileDiscardedBy as any,
        bakaze,
        jikaze,
        allow_kuitan: true,
        allow_aka: false
      }
    }

    // Call riichi-rs-bundlers calc function
    const result = calc(riichiInput)

    if (!result.is_agari) {
      return null
    }

    // Convert result to our format
    const yaku = Object.entries(result.yaku)
      .filter(([_, han]) => han > 0)
      .map(([yakuId, han]) => ({
        name: getYakuName(parseInt(yakuId)),
        han: han
      }))

    return {
      han: result.han,
      fu: result.fu,
      points: result.ten,
      yaku
    }
  } catch (error) {
    console.error('Error calculating score:', error)
    return null
  }
}