// 記録データの型定義

export interface YakuRecord {
  count: number
}

export interface GameModeStats {
  totalGames: number
  totalWinPoints: number
  totalWinTurns: number
  winCount: number
  maxPoints: number
}

export interface GameRecords {
  // 役の上がり回数
  yakuRecords: Record<string, YakuRecord>
  
  // ゲームモード別統計
  gameStats: {
    tonpuusenNoRenchan: GameModeStats    // 東風戦連荘なし
    tonpuusenRenchan: GameModeStats      // 東風戦連荘あり
    tonnansenNoRenchan: GameModeStats    // 東南戦連荘なし
    tonnansenRenchan: GameModeStats      // 東南戦連荘あり
  }
}

export const DEFAULT_RECORDS: GameRecords = {
  yakuRecords: {},
  gameStats: {
    tonpuusenNoRenchan: { totalGames: 0, totalWinPoints: 0, totalWinTurns: 0, winCount: 0, maxPoints: 0 },
    tonpuusenRenchan: { totalGames: 0, totalWinPoints: 0, totalWinTurns: 0, winCount: 0, maxPoints: 0 },
    tonnansenNoRenchan: { totalGames: 0, totalWinPoints: 0, totalWinTurns: 0, winCount: 0, maxPoints: 0 },
    tonnansenRenchan: { totalGames: 0, totalWinPoints: 0, totalWinTurns: 0, winCount: 0, maxPoints: 0 }
  }
}

// 役名とハン数の定義
export const YAKU_NAMES: Record<string, string> = {
  // 1翻
  'riichi': 'リーチ',
  'ippatsu': '一発',
  'menzenTsumo': '門前清自摸和',
  'tanyao': '断么九',
  'yakuhai': '役牌',
  'pinfu': '平和',
  'iipeikou': '一盃口',
  'haiteiRaoyue': '海底撈月',
  'houteiRaoyui': '河底撈魚',
  'rinshanKaihou': '嶺上開花',
  'chankan': '槍槓',
  
  // 2翻
  'doubleRiichi': 'ダブルリーチ',
  'chiitoi': '七対子',
  'chanta': '混全帯么九',
  'ittsu': '一気通貫',
  'sanshokuDoujun': '三色同順',
  'sanshokuDoukou': '三色同刻',
  'sankantsu': '三槓子',
  'toitoi': '対々和',
  'sanankou': '三暗刻',
  'shousangen': '小三元',
  'honroutou': '混老頭',
  
  // 3翻
  'ryanpeikou': '二盃口',
  'junchan': '純全帯么九',
  'honitsu': '混一色',
  
  // 6翻
  'chinitsu': '清一色',
  
  // 役満
  'tenhou': '天和',
  'chihou': '地和',
  'daisangen': '大三元',
  'suuankou': '四暗刻',
  'tsuuiisou': '字一色',
  'ryuuiisou': '緑一色',
  'chinroutou': '清老頭',
  'kokushimusou': '国士無双',
  'shousuushii': '小四喜',
  'daisuushii': '大四喜',
  'suukantsu': '四槓子',
  'chuurenpoutou': '九蓮宝燈'
}

// 日本語名から英語キーへの逆引きマップ
export const YAKU_NAME_TO_KEY: Record<string, string> = {
  'リーチ': 'riichi',
  '一発': 'ippatsu',
  '門前清自摸和': 'menzenTsumo',
  '断么九': 'tanyao',
  '役牌': 'yakuhai',
  '平和': 'pinfu',
  '一盃口': 'iipeikou',
  '海底撈月': 'haiteiRaoyue',
  '河底撈魚': 'houteiRaoyui',
  '嶺上開花': 'rinshanKaihou',
  '槍槓': 'chankan',
  'ダブルリーチ': 'doubleRiichi',
  '七対子': 'chiitoi',
  '混全帯么九': 'chanta',
  '一気通貫': 'ittsu',
  '三色同順': 'sanshokuDoujun',
  '三色同刻': 'sanshokuDoukou',
  '三槓子': 'sankantsu',
  '対々和': 'toitoi',
  '三暗刻': 'sanankou',
  '小三元': 'shousangen',
  '混老頭': 'honroutou',
  '二盃口': 'ryanpeikou',
  '純全帯么九': 'junchan',
  '混一色': 'honitsu',
  '清一色': 'chinitsu',
  '天和': 'tenhou',
  '地和': 'chihou',
  '大三元': 'daisangen',
  '四暗刻': 'suuankou',
  '字一色': 'tsuuiisou',
  '緑一色': 'ryuuiisou',
  '清老頭': 'chinroutou',
  '国士無双': 'kokushimusou',
  '小四喜': 'shousuushii',
  '大四喜': 'daisuushii',
  '四槓子': 'suukantsu',
  '九蓮宝燈': 'chuurenpoutou'
}

// ハン数別役分類
export const YAKU_BY_HAN = {
  1: [
    'riichi', 'ippatsu', 'menzenTsumo', 'tanyao', 'yakuhai', 'pinfu', 'iipeikou',
    'haiteiRaoyue', 'houteiRaoyui', 'rinshanKaihou', 'chankan'
  ],
  2: [
    'doubleRiichi', 'chiitoi', 'chanta', 'ittsu', 'sanshokuDoujun', 'sanshokuDoukou',
    'sankantsu', 'toitoi', 'sanankou', 'shousangen', 'honroutou'
  ],
  3: ['ryanpeikou', 'junchan', 'honitsu'],
  6: ['chinitsu'],
  yakuman: [
    'tenhou', 'chihou', 'daisangen', 'suuankou', 'tsuuiisou', 'ryuuiisou',
    'chinroutou', 'kokushimusou', 'shousuushii', 'daisuushii', 'suukantsu', 'chuurenpoutou'
  ]
}