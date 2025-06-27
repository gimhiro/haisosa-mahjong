import type { GameRecords, GameModeStats } from '../types/records'
import { DEFAULT_RECORDS, YAKU_NAME_TO_KEY } from '../types/records'

export class RecordsManager {
  private static readonly STORAGE_KEY = 'mahjongGameRecords'

  // 記録を読み込み
  static loadRecords(): GameRecords {
    try {
      const savedRecords = localStorage.getItem(this.STORAGE_KEY)
      if (savedRecords) {
        const parsed = JSON.parse(savedRecords)
        return {
          ...DEFAULT_RECORDS,
          ...parsed,
          gameStats: {
            ...DEFAULT_RECORDS.gameStats,
            ...parsed.gameStats
          }
        }
      }
    } catch (error) {
      console.error('記録の読み込みに失敗しました:', error)
    }
    return DEFAULT_RECORDS
  }

  // 記録を保存
  static saveRecords(records: GameRecords): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(records))
    } catch (error) {
      console.error('記録の保存に失敗しました:', error)
    }
  }

  // 役の記録を追加
  static recordYaku(yakuList: string[]): void {
    const records = this.loadRecords()
    
    yakuList.forEach(yakuName => {
      // 日本語名を英語キーに変換
      const yakuKey = YAKU_NAME_TO_KEY[yakuName]
      if (yakuKey) {
        if (!records.yakuRecords[yakuKey]) {
          records.yakuRecords[yakuKey] = { count: 0 }
        }
        records.yakuRecords[yakuKey].count++
      } else {
        // 対応するキーが見つからない場合は警告を出力（開発用）
        console.warn(`Unknown yaku name: ${yakuName}`)
      }
    })

    this.saveRecords(records)
  }

  // ゲーム終了時の記録を追加
  static recordGameEnd(
    gameType: 'tonpuusen' | 'tonnanssen',
    agariRenchan: boolean,
    humanPlayerScore: number,
    isWin: boolean,
    winPoints?: number,
    winTurns?: number
  ): void {
    const records = this.loadRecords()
    
    // ゲームモードを決定
    let gameMode: keyof GameRecords['gameStats']
    if (gameType === 'tonpuusen') {
      gameMode = agariRenchan ? 'tonpuusenRenchan' : 'tonpuusenNoRenchan'
    } else {
      gameMode = agariRenchan ? 'tonnansenRenchan' : 'tonnansenNoRenchan'
    }

    const stats = records.gameStats[gameMode]
    
    // 総ゲーム数を増加
    stats.totalGames++

    // 最高持ち点を更新
    if (humanPlayerScore > stats.maxPoints) {
      stats.maxPoints = humanPlayerScore
    }

    // 上がりの場合の記録
    if (isWin && winPoints !== undefined && winTurns !== undefined) {
      stats.winCount++
      stats.totalWinPoints += winPoints
      stats.totalWinTurns += winTurns
    }

    this.saveRecords(records)
  }

  // 記録をクリア
  static clearRecords(): void {
    localStorage.removeItem(this.STORAGE_KEY)
  }
}