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
  isHaitei?: boolean
  isDoubleRiichi?: boolean
  isRinshanKaihou?: boolean
  isTenho?: boolean
  isChiho?: boolean
  melds?: Array<{
    type: 'pon' | 'kan' | 'chi'
    tiles: Tile[]
    calledTile: Tile
    fromPlayer?: number
  }>
}

export interface ScoringResult {
  han: number
  fu: number
  points: number
  paymentInfo: string  // 支払い形式 (例: "400-700", "1000 all")
  totalPoints: number  // 合計獲得点数
  yakuman: number      // 役満の倍数 (0=役満でない、1=単役満、2=ダブル役満等)
  yaku: Array<{
    name: string
    han: number
  }>
}

// outgoing_tenから支払い形式を計算
function formatPaymentInfo(outgoingTen: [number, number] | null, totalPoints: number, isTsumo: boolean, isDealer: boolean): { paymentInfo: string, totalPoints: number } {
  if (isTsumo && outgoingTen) {
    const [first, second] = outgoingTen

    if (isDealer) {
      // 親ツモ: 全員が同額支払い
      const eachPayment = first
      return {
        paymentInfo: `${eachPayment} all`,
        totalPoints: eachPayment * 3
      }
    } else {
      // 子ツモ: 親が2倍、子が1倍支払い
      return {
        paymentInfo: `${second}-${first}`,
        totalPoints: first + second * 2
      }
    }
  } else {
    // ロン: outgoing_tenはnullなので、totalPointsをそのまま使用
    return {
      paymentInfo: `${totalPoints}`,
      totalPoints: totalPoints
    }
  }
}

// Convert our Tile format to riichi-rs-bundlers numeric format
function convertTileToNumber(tile: Tile): number {
  if (tile.suit === 'honor') {
    // Honor tiles: Use RsTile constants directly
    const honorMap = [RsTile.East, RsTile.South, RsTile.West, RsTile.North, RsTile.Haku, RsTile.Hatsu, RsTile.Chun]
    return honorMap[tile.rank - 1]
  } else {
    // Number tiles: Use RsTile constants
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
    [RsYaku.Hatsu]: '中',
    [RsYaku.Chun]: '發',
    [RsYaku.Dora]: 'ドラ',
    [RsYaku.Uradora]: '裏ドラ',
    [RsYaku.Akadora]: '赤ドラ'
  }

  const result = yakuNames[yakuId] || `役${yakuId}`
  return result
}

// 受け入れ計算（ukeire calculation）の結果
export interface HairiResult {
  now: number           // 現在のシャンテン数（0=テンパイ、-1=上がり）
  wait: number[]        // 待ち牌（現在の手牌で待っている牌）
  waits_after_discard: Array<[number, number[]]>  // [捨て牌, その後の待ち牌配列]
}

// 受け入れ計算を含む入力
export interface UkeireInput {
  hand: Tile[]
  doraIndicators?: Tile[]
  uradoraIndicators?: Tile[]
  isRiichi?: boolean
  isDealer?: boolean
}

// 受け入れ計算を含む結果
export interface UkeireResult {
  hairi: HairiResult | null
  isAgari: boolean
  han?: number
  fu?: number
  points?: number
}

// 受け入れ計算（ukeire calculation）を実行する関数
export function calculateUkeire(input: UkeireInput): UkeireResult {
  try {
    // 13枚または14枚でない場合は計算不可
    if (input.hand.length !== 13 && input.hand.length !== 14) {
      return { hairi: null, isAgari: false }
    }

    // 手牌をriichi-rs-bundlers形式に変換
    const closedPart = convertTilesToNumbers(input.hand)

    // ドラ情報の変換
    const doraNumbers = input.doraIndicators ? convertDoraIndicatorsToDora(input.doraIndicators) : []
    const uradoraNumbers = input.uradoraIndicators ? convertDoraIndicatorsToDora(input.uradoraIndicators) : []

    // calc関数のオプション設定
    const riichiOptions: any = {
      dora: doraNumbers,
      riichi: input.isRiichi || false,
      bakaze: RsTile.East, // 場風: 東場
      jikaze: input.isDealer ? RsTile.East : RsTile.South, // 自風
      allow_kuitan: true,
      allow_aka: false,
      tile_discarded_by_someone: -1 // ツモ想定
    }

    // リーチの場合は裏ドラも追加
    if (input.isRiichi && uradoraNumbers.length > 0) {
      riichiOptions.uradora = uradoraNumbers
    }

    // calc_hairi: trueで受け入れ計算を実行
    const result = calc({
      closed_part: closedPart as any,
      open_part: [],
      options: riichiOptions,
      calc_hairi: true
    })

    return {
      hairi: result.hairi || null,
      isAgari: result.is_agari,
      han: result.han,
      fu: result.fu,
      points: result.ten
    }
  } catch (error) {
    console.error('Error calculating ukeire:', error)
    return { hairi: null, isAgari: false }
  }
}

// 赤ドラの枚数を計算
function calculateAkaDoraCount(tiles: Tile[]): number {
  return tiles.filter(tile => tile.isRed === true).length
}



// タイル数値を日本語名に変換するヘルパー関数
export function tileNumberToString(tileNumber: number): string {
  const tileNames: Record<number, string> = {
    1: '1万', 2: '2万', 3: '3万', 4: '4万', 5: '5万', 6: '6万', 7: '7万', 8: '8万', 9: '9万',
    10: '1筒', 11: '2筒', 12: '3筒', 13: '4筒', 14: '5筒', 15: '6筒', 16: '7筒', 17: '8筒', 18: '9筒',
    19: '1索', 20: '2索', 21: '3索', 22: '4索', 23: '5索', 24: '6索', 25: '7索', 26: '8索', 27: '9索',
    28: '東', 29: '南', 30: '西', 31: '北', 32: '白', 33: '發', 34: '中'
  }
  return tileNames[tileNumber] || `牌${tileNumber}`
}

export function calculateScore(input: ScoringInput): ScoringResult | null {
  try {
    // ツモとロンで処理を分ける
    let closedPart: number[]

    if (input.isTsumo) {
      // ツモ: 鳴き牌を考慮した正しい手牌数を計算
      // カンは手牌から4枚取り除かれるが、ポン・チーは3枚取り除かれる
      const meldTileCount = input.melds ? input.melds.reduce((count, meld) => {
        return count + (meld.type === 'kan' ? 3 : 3)  // カンもポン・チーも3枚として数える
      }, 0) : 0
      const expectedHandSize = 13 - meldTileCount  // 鳴き牌を除いた手牌数

      // 手牌の最初のN枚を取得（ツモ牌以外）
      const handTiles = input.hand.slice(0, expectedHandSize)
      const handNumbers = convertTilesToNumbers(handTiles).sort((a, b) => a - b)

      // ツモ牌（上がり牌）を最後に追加
      const winTileNumber = convertTileToNumber(input.winningTile)
      closedPart = [...handNumbers, winTileNumber]

    } else {
      // ロン: 鳴き牌を考慮した正しい手牌数を計算
      // カンは手牌から4枚取り除かれるが、ポン・チーは3枚取り除かれる
      const meldTileCount = input.melds ? input.melds.reduce((count, meld) => {
        return count + (meld.type === 'kan' ? 3 : 3)  // カンもポン・チーも3枚として数える
      }, 0) : 0
      const expectedHandSize = 13 - meldTileCount  // 鳴き牌を除いた手牌数


      if (input.hand.length !== expectedHandSize) {
        // 期待される枚数でない場合は先頭N枚を取る
        const handTiles = input.hand.slice(0, expectedHandSize)
        closedPart = convertTilesToNumbers(handTiles) as number[]
      } else {
        closedPart = convertTilesToNumbers(input.hand) as number[]
      }
    }
    // ドラ指示牌から実際のドラ牌に変換
    const doraNumbers = convertDoraIndicatorsToDora(input.doraIndicators) as number[]
    const uradoraNumbers = convertDoraIndicatorsToDora(input.uradoraIndicators) as number[]

    // Determine tile discarded by someone (for ron)
    const winTileNumber = convertTileToNumber(input.winningTile)

    // Determine winds
    const bakaze = RsTile.East // 場風: 東場
    const jikaze = input.isDealer ? RsTile.East : RsTile.South // 自風: 親=東、子=南


    // 表ドラと裏ドラを合わせてdora配列に入れる
    const allDoraNumbers = [...doraNumbers]
    if (input.isRiichi && uradoraNumbers.length > 0) {
      allDoraNumbers.push(...uradoraNumbers)
    }

    // 赤ドラの枚数を計算
    const akaCount = calculateAkaDoraCount(input.hand)


    // Create RiichiInput for riichi-rs-bundlers
    const riichiOptions: any = {
      dora: allDoraNumbers as any,
      aka_count: akaCount,
      riichi: input.isRiichi,
      double_riichi: input.isDoubleRiichi || false,  // ダブルリーチ
      ippatsu: input.isIppatsu || false,
      last_tile: input.isHaitei || false,  // ハイテイツモ/ハイテイロン
      after_kan: input.isRinshanKaihou || false,  // 嶺上開花/槍槓
      first_take: input.isTenho || input.isChiho || false,  // 天和・地和
      bakaze,
      jikaze,
      allow_kuitan: true,
      allow_aka: true
    }

    // ツモとロンで上がり牌の指定方法を変える
    if (input.isTsumo) {
      // ツモの場合: tile_discarded_by_someone = -1
      riichiOptions.tile_discarded_by_someone = -1
    } else {
      // ロンの場合: tile_discarded_by_someoneで上がり牌を指定
      riichiOptions.tile_discarded_by_someone = winTileNumber as any
    }

    // Convert melds to riichi-rs format: [is_open, Tile[]]
    const openPart: any[] = []
    if (input.melds && input.melds.length > 0) {
      for (const meld of input.melds) {
        const meldTiles = convertTilesToNumbers(meld.tiles).sort((a, b) => a - b)

        // is_open: 暗槓の場合はfalse、その他はtrue
        // 暗槓の判定: type='kan' かつ fromPlayerが自分自身（プレイヤー0）
        const isOpen = !(meld.type === 'kan' && meld.fromPlayer === 0)

        // riichi-rs-bundlers形式: [is_open, Tile[]]
        openPart.push([isOpen, meldTiles])

      }
    }

    const riichiInput = {
      closed_part: closedPart as any, // ツモ=14枚、ロン=13枚
      open_part: openPart, // メルド情報
      options: riichiOptions
    }

    // Final validation - 鳴き牌を考慮した期待される長さ
    const meldTileCount = input.melds ? input.melds.reduce((count, meld) => count + meld.tiles.length, 0) : 0
    const expectedClosedPartLength = input.isTsumo ? (13 - meldTileCount + 1) : (13 - meldTileCount)



    // Call riichi-rs-bundlers calc function
    const result = calc(riichiInput)


    if (!result.is_agari) {
      return null
    }

    // Convert result to our format
    const yaku = Object.entries(result.yaku)
      .filter(([_, han]) => han > 0)
      .map(([yakuId, han]) => {
        // yakuIdが文字列の場合と数値の場合を両方処理
        let yakuName: string
        if (typeof yakuId === 'string' && isNaN(parseInt(yakuId))) {
          // 文字列の役名の場合はそのまま使用
          yakuName = yakuId
        } else {
          // 数値IDの場合は変換
          yakuName = getYakuName(parseInt(yakuId))
        }

        return {
          name: yakuName,
          han: han
        }
      })

    // 支払い形式と合計点数を計算
    const payment = formatPaymentInfo(result.outgoing_ten || null, result.ten, input.isTsumo, input.isDealer)

    return {
      han: result.han,
      fu: result.fu,
      points: result.ten,
      paymentInfo: payment.paymentInfo,
      totalPoints: payment.totalPoints,
      yakuman: result.yakuman,
      yaku
    }
  } catch (error) {
    return null
  }
}