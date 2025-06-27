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
  isIppatsu?: boolean
}

export interface ScoringResult {
  han: number
  fu: number
  points: number
  paymentInfo: string  // 支払い形式 (例: "400-700", "1000 all")
  totalPoints: number  // 合計獲得点数
  yaku: Array<{
    name: string
    han: number
  }>
}

// 点数から支払い形式を計算
function calculatePaymentInfo(points: number, isDealer: boolean, isTsumo: boolean): { paymentInfo: string, totalPoints: number } {
  if (isTsumo) {
    if (isDealer) {
      // 親のツモ: 全員から同額
      const eachPayment = Math.ceil(points / 3 / 100) * 100
      return {
        paymentInfo: `${eachPayment} all`,
        totalPoints: eachPayment * 3
      }
    } else {
      // 子のツモ: 親は2倍、子は1倍
      const koPayment = Math.ceil(points / 4 / 100) * 100
      const oyaPayment = koPayment * 2
      return {
        paymentInfo: `${koPayment}-${oyaPayment}`,
        totalPoints: koPayment * 2 + oyaPayment
      }
    }
  } else {
    // ロン: 放銃者が全額支払い
    const actualPoints = isDealer ? Math.ceil(points * 1.5 / 100) * 100 : points
    return {
      paymentInfo: `${actualPoints}`,
      totalPoints: actualPoints
    }
  }
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
  return tiles.map(convertTileToNumber)
}

// Convert dora indicator to actual dora tile number
function convertDoraIndicatorToDora(indicator: Tile): number {
  if (indicator.suit === 'honor') {
    // Honor tiles: 東→南→西→北→東, 白→發→中→白
    if (indicator.rank <= 4) {
      // Wind tiles: 東(1)→南(2)→西(3)→北(4)→東(1)
      const nextRank = indicator.rank === 4 ? 1 : indicator.rank + 1
      const honorMap = [RsTile.East, RsTile.South, RsTile.West, RsTile.North]
      return honorMap[nextRank - 1]
    } else {
      // Dragon tiles: 白(5)→發(6)→中(7)→白(5)
      const nextRank = indicator.rank === 7 ? 5 : indicator.rank + 1
      const dragonMap = [RsTile.Haku, RsTile.Hatsu, RsTile.Chun]
      return dragonMap[nextRank - 5]
    }
  } else {
    // Number tiles: 9→1
    const nextRank = indicator.rank === 9 ? 1 : indicator.rank + 1
    if (indicator.suit === 'man') {
      return RsTile.M1 + nextRank - 1
    } else if (indicator.suit === 'pin') {
      return RsTile.P1 + nextRank - 1
    } else if (indicator.suit === 'sou') {
      return RsTile.S1 + nextRank - 1
    }
  }
  throw new Error(`Invalid dora indicator: ${indicator.suit}${indicator.rank}`)
}

// Convert dora indicators to actual dora numbers
function convertDoraIndicatorsToDora(indicators: Tile[]): number[] {
  return indicators.map(convertDoraIndicatorToDora).sort((a, b) => a - b)
}

// Convert yaku ID to Japanese name
function getYakuName(yakuId: number): string {
  // 実際のriichi-rs-bundlersの定数値でデバッグ

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

  const result = yakuNames[yakuId] || `役${yakuId}`
  return result
}

export function calculateScore(input: ScoringInput): ScoringResult | null {
  try {
    // ツモとロンで処理を分ける
    let closedPart: number[]

    if (input.isTsumo) {
      // ツモ牌を除いた13枚の手牌
      const handWithoutWinTile = [...input.hand]
      let removed = false
      for (let i = 0; i < handWithoutWinTile.length; i++) {
        const tile = handWithoutWinTile[i]
        if (tile.id === input.winningTile.id ||
          (!removed && tile.suit === input.winningTile.suit && tile.rank === input.winningTile.rank)) {
          handWithoutWinTile.splice(i, 1)
          removed = true
          break
        }
      }

      // 13枚の手牌を変換
      const handNumbers = convertTilesToNumbers(handWithoutWinTile).sort((a, b) => a - b)
      // ツモ牌を最後に追加（ソートしない！最後の位置が重要）
      const winTileNumber = convertTileToNumber(input.winningTile)
      closedPart = [...handNumbers, winTileNumber]

    } else {
      // ロンの場合：13枚のclosed_partと上がり牌を分離
      const handWithoutWinTile = [...input.hand]

      // 上がり牌を1枚除外する（まずIDで検索、なければ同種の牌を除外）
      let removed = false
      for (let i = 0; i < handWithoutWinTile.length; i++) {
        const tile = handWithoutWinTile[i]
        if (tile.id === input.winningTile.id ||
          (!removed && tile.suit === input.winningTile.suit && tile.rank === input.winningTile.rank)) {
          handWithoutWinTile.splice(i, 1)
          removed = true
          break
        }
      }

      // 13枚でない場合は先頭から13枚を取る
      if (handWithoutWinTile.length !== 13) {
        console.warn(`Expected 13 tiles after removing win tile, got ${handWithoutWinTile.length}`)
        handWithoutWinTile.splice(13)
      }

      closedPart = convertTilesToNumbers(handWithoutWinTile) as number[]
    }
    // ドラ指示牌から実際のドラ牌に変換
    const doraNumbers = convertDoraIndicatorsToDora(input.doraIndicators) as number[]
    const uradoraNumbers = convertDoraIndicatorsToDora(input.uradoraIndicators) as number[]

    // Determine tile discarded by someone (for ron)
    const winTileNumber = convertTileToNumber(input.winningTile)
    // For tsumo, we should not specify tile_discarded_by_someone
    // For ron, we specify the winning tile number
    const tileDiscardedBy = input.isTsumo ? undefined : winTileNumber

    // Determine winds
    const bakaze = RsTile.East // 場風: 東場
    const jikaze = input.isDealer ? RsTile.East : RsTile.South // 自風: 親=東、子=南

    // Create RiichiInput for riichi-rs-bundlers
    const riichiOptions: any = {
      dora: doraNumbers as any,
      riichi: input.isRiichi,
      ippatsu: input.isIppatsu || false,
      bakaze,
      jikaze,
      allow_kuitan: true,
      allow_aka: false
    }

    console.log(`[calculateScore] 一発フラグ: ${input.isIppatsu}, リーチ: ${input.isRiichi}, ツモ: ${input.isTsumo}`)

    // リーチの場合は裏ドラも追加
    if (input.isRiichi && uradoraNumbers.length > 0) {
      riichiOptions.uradora = uradoraNumbers as any
    }

    // ツモとロンで上がり牌の指定方法を変える
    if (input.isTsumo) {
      // ツモの場合: tile_discarded_by_someone = -1
      riichiOptions.tile_discarded_by_someone = -1
    } else {
      // ロンの場合: tile_discarded_by_someoneで指定
      riichiOptions.tile_discarded_by_someone = tileDiscardedBy as any
    }

    const riichiInput = {
      closed_part: closedPart as any, // ツモ=14枚、ロン=13枚
      open_part: [], // No open melds for now
      options: riichiOptions
    }
    // Call riichi-rs-bundlers calc function
    const result = calc(riichiInput)


    if (!result.is_agari) {
      return null
    }

    // Convert result to our format
    const yaku = Object.entries(result.yaku)
      .filter(([_, han]) => han > 0)
      .map(([yakuId, han]) => {
        const yakuName = getYakuName(parseInt(yakuId))
        return {
          name: yakuName,
          han: han
        }
      })

    // 支払い形式と合計点数を計算
    const payment = calculatePaymentInfo(result.ten, input.isDealer, input.isTsumo)

    return {
      han: result.han,
      fu: result.fu,
      points: result.ten,
      paymentInfo: payment.paymentInfo,
      totalPoints: payment.totalPoints,
      yaku
    }
  } catch (error) {
    console.error('Error calculating score:', error)
    return null
  }
}