import { computed, ref, watch, onMounted, nextTick } from 'vue'
import { GameManager } from '../../utils/game-manager'
import { cpuAIs } from '../../utils/cpu-ai'
import { calculateShanten, calculateShantenWithMelds, canRiichi, checkWinCondition, calculateAcceptance, findBestAcceptanceTiles, getTileIndex, getUsefulTiles, getTileRemainingCount, createTileFromIndex, isFuriten, type AcceptanceInfo } from '../../utils/mahjong-logic'
import { defaultEnhancedDraw } from '../../utils/enhanced-draw'
import type { Tile } from '../../stores/fourPlayerMahjong'
import PlayerArea from '../../components/PlayerArea.vue'
import PlayerDiscardArea from '../../components/PlayerDiscardArea.vue'
import MahjongTile from '../../components/MahjongTile.vue'
import WinModal, { type WinData } from '../../components/WinModal.vue'
import DrawModal, { type DrawData } from '../../components/DrawModal.vue'
import GameEndModal, { type GameEndData } from '../../components/GameEndModal.vue'
import GameSettingsPanel from '../../components/GameSettingsPanel.vue'
import GameInfoPanel from '../../components/GameInfoPanel.vue'
import ActionPanel from '../../components/ActionPanel.vue'
import DoraPanel from '../../components/DoraPanel.vue'
import TestModeDialog from '../../components/TestModeDialog.vue'
import AcceptancePopup from '../../components/AcceptancePopup.vue'
import { useRouter } from 'vue-router'
import { useGameSettings } from '../../utils/useGameSettings'
import { SoundManager } from '../../utils/sound-manager'
import { isDebugMode } from '../../utils/env'

export function useFourPlayerGameView() {
  const gameManagerInstance = ref<GameManager>(new GameManager())
  const router = useRouter()
  const { settings } = useGameSettings()

  // 設定変更の監視（牌操作率の更新）
  watch(() => settings.value.manipulationRate, (newRate, oldRate) => {
    if (newRate !== oldRate) {
      gameManagerInstance.value.updateManipulationRate()
    }
  }, { immediate: false })

  // 設定変更の監視（鳴きなし設定）
  watch(() => settings.value.disableMeld, (newValue) => {
    // 鳴きなし設定がONになった場合、表示中の鳴きアクションをキャンセル
    if (newValue && (canPon.value || canKan.value || canChi.value)) {
      cancelActions()
    }
  }, { immediate: false })

  // CPU手牌表示状態
  const cpuTilesVisible = ref({
    1: false, // CPU1 (右)
    2: false, // CPU2 (上)
    3: false  // CPU3 (左)
  })

  // リーチプレビューモード状態
  const riichiPreviewMode = ref(false)

  // CPU処理中フラグ
  const processingCpuTurn = ref(false)

  // Win modal state
  const showWinModal = ref(false)

  // Draw modal state  
  const showDrawModal = ref(false)
  const drawModalData = ref<DrawData | null>(null)

  // Game end modal state
  const showGameEndModal = ref(false)
  const gameEndModalData = ref<GameEndData | null>(null)

  // Test mode dialog state
  const showTestDialog = ref(false)

  // Acceptance popup state
  const showAcceptancePopup = ref(false)
  const acceptanceInfos = ref<AcceptanceInfo[]>([])
  const bestAcceptanceTiles = ref<number[]>([])
  const currentHoveredTileAcceptance = ref<AcceptanceInfo | null>(null)
  const mouseX = ref(0)
  const mouseY = ref(0)
  const currentShanten = ref(8)
  const isUsefulTilesMode = ref(false)
  const isCalculatingAcceptance = ref(false)

  // 計算キャンセル用フラグ
  let isCalculationCancelled = ref(false)

  // Sound mute state
  const isMuted = ref(false)

  const winModalData = ref<WinData>({
    winner: gameManagerInstance.value.players[0],
    winningHand: [],
    winningTile: null,
    isTsumo: false,
    basePoints: 0,
    totalPoints: 0,
    paymentInfo: '',
    yaku: [],
    totalHan: 0,
    fu: 0,
    yakuman: 0,
    doraIndicators: [],
    doraCount: 0,
    uradoraIndicators: [],
    uradoraCount: 0
  })

  // GameManagerからプロパティを参照
  const players = computed(() => gameManagerInstance.value.players)
  const gamePhase = computed(() => gameManagerInstance.value.gamePhase)
  const currentPlayerIndex = computed(() => gameManagerInstance.value.currentPlayerIndex)
  const currentDrawnTile = computed(() => gameManagerInstance.value.currentDrawnTile)
  const doraIndicators = computed(() => gameManagerInstance.value.doraIndicators)
  const round = computed(() => gameManagerInstance.value.round)
  const dealer = computed(() => gameManagerInstance.value.dealer)
  const currentPlayer = computed(() => gameManagerInstance.value.currentPlayer)
  const humanPlayer = computed(() => gameManagerInstance.value.humanPlayer)
  const wallRemaining = computed(() => gameManagerInstance.value.wallRemaining)


  const isHumanTurn = computed(() => {
    return gameManagerInstance.value.isHumanTurn()
  })

  // 計算キャンセル関数
  function cancelCurrentCalculation() {
    isCalculationCancelled.value = true
    isCalculatingAcceptance.value = false
  }

  const canDraw = computed(() => {
    return gameManagerInstance.value.canHumanDraw()
  })

  const effectiveHandSize = computed(() => {
    // 鳴き牌を考慮した実効手牌枚数を計算
    // カンは3枚として扱う（実際の手牌から4枚取って、鳴き牌に3枚として記録される）
    const actualTiles = humanPlayer.value.tiles.length
    const meldTiles = humanPlayer.value.melds.reduce((total, meld) => {
      return total + (meld.type === 'kan' ? 3 : 3) // カンもポン・チーも3枚として数える
    }, 0)
    const totalSize = actualTiles + meldTiles
    return totalSize
  })

  const canDeclareRiichi = computed(() => {
    const result = gameManagerInstance.value.canPlayerRiichi(0)
    return result
  })

  const canTsumo = computed(() => {
    const isMyTurn = isHumanTurn.value
    const drawnTile = currentDrawnTile.value


    if (!isMyTurn || !drawnTile) {
      return false
    }

    try {
      const winResult = gameManagerInstance.value.checkWinConditionForPlayer(0, drawnTile, true)
      // 上がり形かつ点数が0より大きい場合のみツモ可能
      const canWin = winResult.isWin && (winResult.result?.totalPoints || 0) > 0
      return canWin
    } catch (error) {
      return false
    }
  })

  const canRon = computed(() => {
    const isMyTurn = isHumanTurn.value
    const canHumanRonResult = gameManagerInstance.value.canHumanRon()

    if (isMyTurn) return false // 自分のターンではロンできない

    return canHumanRonResult
  })

  // シャンテン数計算
  const humanShanten = computed(() => {
    const player = humanPlayer.value
    const allTiles = currentDrawnTile.value
      ? [...player.tiles, currentDrawnTile.value]
      : player.tiles

    // 鳴き牌を考慮した枚数チェック（カンは3枚として数える）
    const meldTileCount = player.melds.reduce((count, meld) => {
      if (meld.type === 'kan') {
        return count + 3 // カンは3枚として数える
      } else {
        return count + meld.tiles.length // ポン・チーは実際の枚数
      }
    }, 0)
    const expectedHandTiles = 13 - meldTileCount
    const expectedTotalTiles = [expectedHandTiles, expectedHandTiles + 1]

    if (!expectedTotalTiles.includes(allTiles.length)) {
      return 8
    }

    // 鳴き牌を考慮したシャンテン数計算
    return calculateShantenWithMelds(allTiles, player.melds)
  })

  const shantenColor = computed(() => {
    if (humanShanten.value === -1) return 'success' // アガリ
    if (humanShanten.value === 0) return 'warning'  // テンパイ
    if (humanShanten.value <= 2) return 'info'     // 良形
    if (humanShanten.value >= 8) return 'grey-lighten-2' // 計算不可
    return 'grey'                              // 遠い
  })

  const shantenText = computed(() => {
    if (humanShanten.value === -1) return 'アガリ'
    if (humanShanten.value === 0) {
      return 'テンパイ'
    }
    if (humanShanten.value >= 8) return '計算不可'
    return `${humanShanten.value}シャンテン`
  })

  // リーチボタンのテキスト
  const riichiButtonText = computed(() => {
    return riichiPreviewMode.value ? 'キャンセル' : 'リーチ'
  })

  // 自動アガリ機能のwatcher
  watch([canTsumo, canRon], ([newCanTsumo, newCanRon]) => {
    if (settings.value.autoWin) {
      if (newCanTsumo) {
        declareTsumo()
      } else if (newCanRon) {
        declareRon()
      }
    }
  })

  // 受け入れ情報更新のwatcher（ツモ牌がある場合のみ）
  watch([currentDrawnTile, () => settings.value.showAcceptance, () => settings.value.showAcceptanceHighlight], () => {
    if (isHumanTurn.value && currentDrawnTile.value) {
      updateAcceptanceInfo()
    } else if (!isHumanTurn.value) {
      // 人間プレイヤーのターンでない場合は受け入れマスクを消去
      acceptanceInfos.value = []
      bestAcceptanceTiles.value = []
      isUsefulTilesMode.value = false
    }
  }, { deep: true })

  // プレイヤーターンの変更を監視
  watch(currentPlayerIndex, (newPlayerIndex) => {
    if (newPlayerIndex !== 0) {
      // 人間プレイヤー以外のターンになったら受け入れマスクを消去
      acceptanceInfos.value = []
      bestAcceptanceTiles.value = []
      isUsefulTilesMode.value = false
    }
  })


  function getDealerText(): string {
    return gameManagerInstance.value.getDealerText()
  }

  function startGame() {
    // 音声ファイルを事前ロード
    SoundManager.preloadSounds()

    // テストモードが有効な場合はGameManagerに設定を送信
    if (settings.value.testMode.isActive) {
      gameManagerInstance.value.setTestMode(true, settings.value.testMode.players)
    }

    gameManagerInstance.value.startNewGame()

    // テストモードの場合は手牌を設定
    if (settings.value.testMode.isActive) {
      gameManagerInstance.value.setTestHands()
    }

    // ゲーム開始後、最初のプレイヤーにツモ牌を配る
    setTimeout(() => {
      if (gameManagerInstance.value.gamePhase === 'playing') {
        // テストモードで人間プレイヤーの場合は既にツモ済みなのでスキップ
        if (!settings.value.testMode.isActive || currentPlayerIndex.value !== 0) {
          gameManagerInstance.value.drawTileAndKeepSeparate(currentPlayerIndex.value)
        }

        // CPUプレイヤーの場合は自動的にターンを開始
        if (players.value[currentPlayerIndex.value].type === 'cpu') {
          setTimeout(() => {
            processCpuTurn()
          }, 500)
        } else if (players.value[currentPlayerIndex.value].type === 'human') {
          // 人間プレイヤーの場合は暗カンチェック
          checkAnkanOptions()
        }
      }
    }, 100)
  }

  function resetGame() {
    // ゲームリセット時に受け入れマスクを消去
    acceptanceInfos.value = []
    bestAcceptanceTiles.value = []
    isUsefulTilesMode.value = false

    gameManagerInstance.value.resetGame()
  }

  // ミュート状態を切り替え
  function toggleMute() {
    isMuted.value = SoundManager.toggleMute()
  }

  // テストモード適用イベントハンドラ
  function onTestModeApplied() {
    if (settings.value.testMode.isActive) {
      gameManagerInstance.value.setTestMode(true, settings.value.testMode.players)
      gameManagerInstance.value.setTestHands()
      // テスト手牌適用後に暗カンチェック
      if (isHumanTurn.value) {
        checkAnkanOptions()
      }
    }
  }

  // ツモボタンを削除したため、自動ツモ機能は削除
  // 人間プレイヤーのターンが開始されたときに自動的にツモする

  async function onHumanTileDiscard(tileId: string) {
    const startTime = performance.now()
    
    if (!isHumanTurn.value) {
      return
    }

    // 進行中の受け入れ計算をキャンセル
    cancelCurrentCalculation()

    // 打牌時に受け入れマスクと受け入れツールチップを消去
    acceptanceInfos.value = []
    bestAcceptanceTiles.value = []
    isUsefulTilesMode.value = false
    showAcceptancePopup.value = false
    currentHoveredTileAcceptance.value = null
    isCalculatingAcceptance.value = false

    // 打牌時に嶺上開花フラグをリセット
    gameManagerInstance.value.resetAfterKan()

    const discardStartTime = performance.now()
    const success = gameManagerInstance.value.discardTile(0, tileId)

    if (success) {
      // 打牌音を再生
      SoundManager.playDiscardSound()

      // プレイヤーが牌を捨てた後、CPUのロン判定を行う
      const cpuRonOccurred = await checkCpuRon(0)

      if (!cpuRonOccurred) {
        // ロンが発生しなかった場合のみ次のターンに進む
        gameManagerInstance.value.nextTurn()

        // 次のターンに進んだ後、流局判定を行う
        checkForDraw()
      }
    }
  }

  async function processCpuTurn() {
    // 重複処理を防ぐ
    if (processingCpuTurn.value) {
      return
    }

    if (gamePhase.value !== 'playing' || currentPlayer.value.type === 'human') {
      return
    }

    processingCpuTurn.value = true

    try {
      const currentIndex = currentPlayerIndex.value
      const player = currentPlayer.value


      if (currentDrawnTile.value) {
        const winResult = gameManagerInstance.value.checkWinConditionForPlayer(currentIndex, currentDrawnTile.value, true)
        if (winResult.isWin && winResult.result) {
          // CPU上がり処理（既にチェック済みの結果を渡す）
          handleCpuWinWithResult(currentIndex, currentDrawnTile.value, true, winResult.result)
          return
        }
      }

      const ai = cpuAIs[currentIndex as 1 | 2 | 3]

      if (ai) {
        // プレイヤーの難易度をAIに設定（初期化時のみ）
        if (player.difficulty) {
          ai.setDifficulty(player.difficulty)
        }

        const allTiles = currentDrawnTile.value ? [...player.tiles, currentDrawnTile.value] : player.tiles

        const decision = await ai.makeDecision({ ...player, tiles: allTiles }, currentDrawnTile.value)

        if (decision.action === 'riichi') {
          // リーチ宣言前にテンパイにするための捨て牌を決定
          const riichiDiscardTile = ai.getRiichiDiscardTile(player, currentDrawnTile.value)

          if (riichiDiscardTile) {
            // リーチ宣言
            const riichiSuccess = gameManagerInstance.value.declareRiichi(currentIndex)

            if (riichiSuccess) {
              // リーチ宣言音を再生
              SoundManager.playRiichiSound()

              // リーチ宣言と同時に決定した牌を捨てる
              const discardSuccess = gameManagerInstance.value.discardTile(currentIndex, riichiDiscardTile, true)

              if (discardSuccess) {
                // CPUが牌を捨てた後、人間プレイヤーがロン可能かチェック
                if (gameManagerInstance.value.canHumanRon()) {
                  return
                }

                // 人間プレイヤーがポン・カン・チー可能かチェック
                checkHumanMeldActions(currentIndex)

                // ポン・カン・チーが可能な場合はプレイヤーの選択を待つ
                if (canPon.value || canKan.value || canChi.value) {
                  return
                }

                // CPUプレイヤーがロンできるかチェック
                if (await checkCpuRon(currentIndex)) {
                  return
                }

                gameManagerInstance.value.nextTurn()
              }
            }
          }
        } else if (decision.tileId) {
          // 通常の捨て牌
          const success = gameManagerInstance.value.discardTile(currentIndex, decision.tileId)
          if (success) {
            // 打牌音を再生
            SoundManager.playDiscardSound()
            // CPUが牌を捨てた後、人間プレイヤーがロン可能かチェック
            if (gameManagerInstance.value.canHumanRon()) {
              // ロンボタンが表示されるので、ここでは次のターンに進まない
              return
            }

            // 人間プレイヤーがポン・カン・チー可能かチェック
            checkHumanMeldActions(currentIndex)

            // ポン・カン・チーが可能な場合はプレイヤーの選択を待つ
            if (canPon.value || canKan.value || canChi.value) {
              return
            }

            // CPUプレイヤーがロンできるかチェック
            if (await checkCpuRon(currentIndex)) {
              return
            }

            gameManagerInstance.value.nextTurn()

            // 次のターンに進んだ後、流局判定を行う
            checkForDraw()
          }
        }
      }
    } finally {
      processingCpuTurn.value = false
    }
  }

  function declareRiichi() {
    if (canDeclareRiichi.value && !humanPlayer.value.riichi) {
      // 進行中の受け入れ計算をキャンセル
      cancelCurrentCalculation()
      
      // リーチボタンを押すとプレビューモードに入る
      riichiPreviewMode.value = true
    }
  }

  // リーチプレビューモードの切り替え
  function toggleRiichiPreview() {
    // すでにリーチしている場合は何もしない
    if (humanPlayer.value.riichi) {
      return
    }
    riichiPreviewMode.value = !riichiPreviewMode.value
  }

  // リーチ時に有効な牌IDのリストを取得
  function getRiichiValidTiles(): string[] {
    if (!canDeclareRiichi.value || !currentDrawnTile.value) {
      return []
    }

    const player = humanPlayer.value
    const allTiles = [...player.tiles, currentDrawnTile.value]
    const validTileIds: string[] = []

    // 各牌を捨てた場合にテンパイを維持するかチェック
    for (const tile of allTiles) {
      const remainingTiles = allTiles.filter(t => t.id !== tile.id)
      const shanten = calculateShanten(remainingTiles)

      if (shanten === 0) { // テンパイを維持
        validTileIds.push(tile.id)
      }
    }

    return validTileIds
  }

  // リーチプレビューで無効な牌IDのリストを取得
  function getRiichiDisabledTiles(): string[] {
    if (!canDeclareRiichi.value || !currentDrawnTile.value || humanPlayer.value.riichi) {
      return []
    }

    const player = humanPlayer.value
    const allTiles = [...player.tiles, currentDrawnTile.value]
    const disabledTileIds: string[] = []

    // 各牌を捨てた場合にテンパイにならない牌をチェック
    for (const tile of allTiles) {
      const remainingTiles = allTiles.filter(t => t.id !== tile.id)
      const shanten = calculateShanten(remainingTiles)

      if (shanten !== 0) { // テンパイにならない
        disabledTileIds.push(tile.id)
      }
    }

    return disabledTileIds
  }

  // リーチ後の手牌で無効な牌IDのリストを取得
  function getPostRiichiDisabledTiles(): string[] {
    if (!humanPlayer.value.riichi || !currentDrawnTile.value) {
      return []
    }

    // リーチ後は手牌の全ての牌をdisabledにする（ツモ牌のみ捨てられる）
    return humanPlayer.value.tiles.map(tile => tile.id)
  }

  // リーチ確定と牌捨て
  function confirmRiichiAndDiscard(tileId: string) {
    if (!riichiPreviewMode.value) {
      return
    }

    const validTiles = getRiichiValidTiles()
    if (!validTiles.includes(tileId)) {
      return
    }

    // リーチ宣言時に受け入れマスクと受け入れツールチップを消去
    acceptanceInfos.value = []
    bestAcceptanceTiles.value = []
    isUsefulTilesMode.value = false
    showAcceptancePopup.value = false
    currentHoveredTileAcceptance.value = null

    // リーチを宣言
    if (canDeclareRiichi.value) {
      const riichiSuccess = gameManagerInstance.value.declareRiichi(0)

      // リーチ宣言音を再生
      SoundManager.playRiichiSound()
    }

    // プレビューモードを解除
    riichiPreviewMode.value = false

    // 牌を捨てる（リーチ宣言牌としてマーク）
    const success = gameManagerInstance.value.discardTile(0, tileId, true)

    if (success) {
      gameManagerInstance.value.nextTurn()
    }
  }

  function cancelTsumo() {
    // ツモをキャンセルして牌を捨てる必要がある
    // リーチ後はツモ切りのみ可能
    if (humanPlayer.value.riichi && currentDrawnTile.value) {
      onHumanTileDiscard(currentDrawnTile.value.id)
    }
  }

  function declareTsumo() {
    if (canTsumo.value && currentDrawnTile.value) {
      const winResult = gameManagerInstance.value.checkWinConditionForPlayer(0, currentDrawnTile.value, true, true)

      if (winResult.isWin && winResult.result) {
        const player = humanPlayer.value

        winModalData.value = {
          winner: player,
          winningHand: [...player.tiles, currentDrawnTile.value],
          winningTile: currentDrawnTile.value,
          isTsumo: true,
          basePoints: winResult.result.basePoints,
          totalPoints: winResult.result.totalPoints,
          paymentInfo: winResult.result.paymentInfo,
          yaku: winResult.result.yaku,
          totalHan: winResult.result.totalHan,
          fu: winResult.result.fu,
          yakuman: winResult.result.yakuman,
          doraIndicators: doraIndicators.value,
          doraCount: winResult.result.doraCount,
          uradoraIndicators: player.riichi ? gameManagerInstance.value.getUradoraIndicators() : [],
          uradoraCount: winResult.result.uradoraCount
        }

        // 供託分を加算
        gameManagerInstance.value.applyKyotakuToWinner(0)

        // 点数移動を実行（ツモ）
        gameManagerInstance.value.executeScoreTransfer(
          0, // winner index (human player)
          winResult.result.paymentInfo,
          winResult.result.totalPoints,
          true // isTsumo
        )

        // ゲーム終了判定
        const gameEndCheck = gameManagerInstance.value.checkGameEnd()
        const isGameEnding = gameEndCheck.isGameEnd

        // 人間プレイヤーの上がりを記録
        gameManagerInstance.value.recordHumanWin(
          winResult.result.yaku.map(y => y.name),
          winResult.result.totalPoints,
          isGameEnding
        )

        // ゲーム状態を終了に変更
        gameManagerInstance.value.gamePhase = 'finished'
        showWinModal.value = true
      }
    }
  }

  function declareRon() {
    if (canRon.value && gameManagerInstance.value.lastDiscardedTile) {
      const winResult = gameManagerInstance.value.checkWinConditionForPlayer(0, gameManagerInstance.value.lastDiscardedTile, false, true)

      if (winResult.isWin && winResult.result) {
        const player = humanPlayer.value

        winModalData.value = {
          winner: player,
          winningHand: [...player.tiles, gameManagerInstance.value.lastDiscardedTile],
          winningTile: gameManagerInstance.value.lastDiscardedTile,
          isTsumo: false,
          basePoints: winResult.result.basePoints,
          totalPoints: winResult.result.totalPoints,
          paymentInfo: winResult.result.paymentInfo,
          yaku: winResult.result.yaku,
          totalHan: winResult.result.totalHan,
          fu: winResult.result.fu,
          yakuman: winResult.result.yakuman,
          doraIndicators: doraIndicators.value,
          doraCount: winResult.result.doraCount,
          uradoraIndicators: player.riichi ? gameManagerInstance.value.getUradoraIndicators() : [],
          uradoraCount: winResult.result.uradoraCount
        }

        // 供託分を加算
        gameManagerInstance.value.applyKyotakuToWinner(0)

        // 点数移動を実行（ロン）
        gameManagerInstance.value.executeScoreTransfer(
          0, // winner index (human player)
          winResult.result.paymentInfo,
          winResult.result.totalPoints,
          false, // isTsumo
          gameManagerInstance.value.lastDiscardPlayerIndex ?? undefined // ron target
        )

        // ゲーム終了判定
        const gameEndCheck = gameManagerInstance.value.checkGameEnd()
        const isGameEnding = gameEndCheck.isGameEnd

        // 人間プレイヤーの上がりを記録
        gameManagerInstance.value.recordHumanWin(
          winResult.result.yaku.map(y => y.name),
          winResult.result.totalPoints,
          isGameEnding
        )

        // ゲーム状態を終了に変更
        gameManagerInstance.value.gamePhase = 'finished'
        showWinModal.value = true
      }
    }
  }

  function cancelRon() {
    // ロンをキャンセルして次のプレイヤーのターンに進む
    gameManagerInstance.value.clearLastDiscard()
    gameManagerInstance.value.nextTurn()
  }

  // ポン・カン・チー関連
  const canPon = ref(false)
  const canKan = ref(false) // 明カン（他人の捨て牌でのカン）
  const canAnkan = ref(false) // 暗カン（手牌4枚でのカン）
  const canChi = ref(false)
  const chiOptions = ref<string[][]>([]) // チーの選択肢
  const selectedChiOption = ref<string[] | null>(null)
  const lastDiscardedTile = ref<Tile | null>(null)
  const ankanOptions = ref<{ suit: string, rank: number }[]>([]) // 暗カン可能な牌

  // ポン・カン・チーのアクション
  function declarePon() {
    if (!lastDiscardedTile.value) return

    const humanPlayer = gameManagerInstance.value.humanPlayer
    const tile = lastDiscardedTile.value

    // ポンの実行（手牌から同じ牌2枚を削除し、鳴き牌に追加）
    const sameRankTiles = humanPlayer.tiles.filter(t => t.suit === tile.suit && t.rank === tile.rank)

    if (sameRankTiles.length >= 2) {
      // 手牌から2枚削除
      for (let i = 0; i < 2; i++) {
        const index = humanPlayer.tiles.findIndex(t => t.suit === tile.suit && t.rank === tile.rank)
        if (index !== -1) {
          humanPlayer.tiles.splice(index, 1)
        }
      }

      // 捨て牌を削除し、どのプレイヤーから鳴いたかを記録
      const lastDiscardPlayer = gameManagerInstance.value.players.find(p =>
        p.discards.length > 0 && p.discards[p.discards.length - 1].id === tile.id
      )
      let fromPlayerIndex = 0
      if (lastDiscardPlayer) {
        fromPlayerIndex = lastDiscardPlayer.id
        lastDiscardPlayer.discards.pop()
      }

      // 鳴き牌に追加
      humanPlayer.melds.push({
        type: 'pon',
        tiles: [sameRankTiles[0], sameRankTiles[1], tile],
        calledTile: tile,
        fromPlayer: fromPlayerIndex
      })

      // 人間プレイヤーのターンに設定
      gameManagerInstance.value.currentPlayerIndex = 0

      // フラグリセット
      resetActionFlags()
    }
  }

  function declareKan() {
    if (!lastDiscardedTile.value) return

    const humanPlayer = gameManagerInstance.value.humanPlayer
    const tile = lastDiscardedTile.value

    // カンの実行（手牌から同じ牌3枚を削除し、鳴き牌に追加）
    const sameRankTiles = humanPlayer.tiles.filter(t => t.suit === tile.suit && t.rank === tile.rank)

    if (sameRankTiles.length >= 3) {
      // 手牌から3枚削除
      for (let i = 0; i < 3; i++) {
        const index = humanPlayer.tiles.findIndex(t => t.suit === tile.suit && t.rank === tile.rank)
        if (index !== -1) {
          humanPlayer.tiles.splice(index, 1)
        }
      }

      // 捨て牌を削除し、どのプレイヤーから鳴いたかを記録
      const lastDiscardPlayer = gameManagerInstance.value.players.find(p =>
        p.discards.length > 0 && p.discards[p.discards.length - 1].id === tile.id
      )
      let fromPlayerIndex = 0
      if (lastDiscardPlayer) {
        fromPlayerIndex = lastDiscardPlayer.id
        lastDiscardPlayer.discards.pop()
      }

      // 鳴き牌に追加
      humanPlayer.melds.push({
        type: 'kan',
        tiles: [sameRankTiles[0], sameRankTiles[1], sameRankTiles[2], tile],
        calledTile: tile,
        fromPlayer: fromPlayerIndex
      })

      // カン後は嶺上牌を引く
      const kanTile = gameManagerInstance.value.drawKanTile(0)

      // カンドラを追加
      gameManagerInstance.value.addKanDoraIndicator()

      // 嶺上開花フラグを設定
      gameManagerInstance.value.setAfterKan(0)

      // 手牌をソート
      gameManagerInstance.value.sortPlayerHand(humanPlayer)

      // 人間プレイヤーのターンに設定
      gameManagerInstance.value.currentPlayerIndex = 0

      // フラグリセット
      resetActionFlags()

      // 再度暗カン可能な牌をチェック
      checkAnkanOptions()
    }
  }

  function declareChi() {
    // チーの場合は選択肢があるので、最初の選択肢を使用（簡易実装）
    if (!lastDiscardedTile.value || chiOptions.value.length === 0) return

    const humanPlayer = gameManagerInstance.value.humanPlayer
    const tile = lastDiscardedTile.value
    const option = chiOptions.value[0] // 最初の選択肢を使用

    // チーの実行
    // 鳴き牌のタイル情報を削除前に収集
    const calledTile = tile // チーした牌
    const handTiles: Tile[] = [] // 手牌から使う牌

    option.forEach(id => {
      if (id !== tile.id) {
        const handTile = humanPlayer.tiles.find(t => t.id === id)
        if (handTile) {
          handTiles.push(handTile)
        }
      }
    })

    // 手牌の牌を数字順に並べ替え
    handTiles.sort((a, b) => a.rank - b.rank)

    // チーした牌を左端に、残りを数字順で配置
    const meldTiles = [calledTile, ...handTiles]

    // 手牌から必要な牌を削除
    const tilesToRemove = option.filter(id => id !== tile.id)
    tilesToRemove.forEach(tileId => {
      const index = humanPlayer.tiles.findIndex(t => t.id === tileId)
      if (index !== -1) {
        humanPlayer.tiles.splice(index, 1)
      }
    })

    humanPlayer.melds.push({
      type: 'chi',
      tiles: meldTiles,
      calledTile: tile
    })

    // 捨て牌を削除し、どのプレイヤーから鳴いたかを記録
    const lastDiscardPlayer = gameManagerInstance.value.players.find(p =>
      p.discards.length > 0 && p.discards[p.discards.length - 1].id === tile.id
    )
    let fromPlayerIndex = 0
    if (lastDiscardPlayer) {
      fromPlayerIndex = lastDiscardPlayer.id
      lastDiscardPlayer.discards.pop()
    }

    // 鳴き牌の fromPlayer フィールドを更新
    const lastMeld = humanPlayer.melds[humanPlayer.melds.length - 1]
    if (lastMeld) {
      lastMeld.fromPlayer = fromPlayerIndex
    }

    // 人間プレイヤーのターンに設定
    gameManagerInstance.value.currentPlayerIndex = 0

    // フラグリセット
    resetActionFlags()
  }

  // 暗カンを実行する関数
  function declareAnkan() {
    if (ankanOptions.value.length === 0) return

    const humanPlayer = gameManagerInstance.value.humanPlayer

    // 簡易実装：最初の選択肢を使用
    const option = ankanOptions.value[0]

    // 正しいカンのルール：ツモ牌を手牌に加えてからカンを実行
    const currentDrawnTile = gameManagerInstance.value.currentDrawnTile
    if (currentDrawnTile) {
      humanPlayer.tiles.push(currentDrawnTile)
      gameManagerInstance.value.currentDrawnTile = null
    }

    // 手牌かざ4枚同じ牌を探す（ツモ牌含む）
    const targetTiles = humanPlayer.tiles.filter(t =>
      t.suit === option.suit && t.rank === option.rank
    ).slice(0, 4)

    if (targetTiles.length >= 4) {
      // 手牌から4枚削除
      for (let i = 0; i < 4; i++) {
        const index = humanPlayer.tiles.findIndex(t =>
          t.suit === option.suit && t.rank === option.rank
        )
        if (index !== -1) {
          humanPlayer.tiles.splice(index, 1)
        }
      }

      // 暗カンを鳴き牌に追加
      humanPlayer.melds.push({
        type: 'kan',
        tiles: targetTiles,
        calledTile: targetTiles[0], // 暗カンの場合は自分の牌
        fromPlayer: 0 // 暗カンは自分から
      })

      // 暗カン後は嶺上牌を引く
      const kanTile = gameManagerInstance.value.drawKanTile(0)

      // カンドラを追加
      gameManagerInstance.value.addKanDoraIndicator()

      // 嶺上開花フラグを設定
      gameManagerInstance.value.setAfterKan(0)

      // 手牌をソート
      gameManagerInstance.value.sortPlayerHand(humanPlayer)

      // 人間プレイヤーのターンを維持
      gameManagerInstance.value.currentPlayerIndex = 0

      // フラグリセット
      resetActionFlags()

      // 再度暗カン可能な牌をチェック
      checkAnkanOptions()
    }
  }

  function cancelActions() {
    resetActionFlags()

    // キャンセル後は次のプレイヤーのターンに進む
    gameManagerInstance.value.nextTurn()
  }

  function resetActionFlags() {
    canPon.value = false
    canKan.value = false
    canAnkan.value = false
    canChi.value = false
    chiOptions.value = []
    selectedChiOption.value = null
    lastDiscardedTile.value = null
    ankanOptions.value = []
  }

  // 人間プレイヤーがポン・カン・チー可能かチェックする関数
  function checkHumanMeldActions(discardPlayerIndex: number) {
    // まず既存のフラグをリセット
    canPon.value = false
    canKan.value = false
    canAnkan.value = false
    canChi.value = false
    chiOptions.value = []
    lastDiscardedTile.value = null
    ankanOptions.value = []

    // 鳴きなし設定が有効な場合は早期リターン
    if (settings.value.disableMeld) {
      return
    }

    const humanPlayer = gameManagerInstance.value.humanPlayer

    // リーチ後は暗カン以外の鳴きができない
    if (humanPlayer.riichi) {
      return
    }

    // 最後に捨てられた牌を取得
    const discardedTile = gameManagerInstance.value.lastDiscardedTile
    if (!discardedTile) {
      return
    }

    lastDiscardedTile.value = discardedTile

    // ポンの判定：同じ牌が2枚以上手牌にある
    const ponCount = humanPlayer.tiles.filter(t =>
      t.suit === discardedTile.suit && t.rank === discardedTile.rank
    ).length

    canPon.value = ponCount >= 2

    // カンの判定：同じ牌が3枚以上手牌にある
    canKan.value = ponCount >= 3

    // チーの判定：数牌のみ、かつ左隣のプレイヤーからの捨て牌のみ
    if (discardedTile.suit !== 'honor' && isLeftNeighbor(discardPlayerIndex)) {
      chiOptions.value = getChiOptions(humanPlayer.tiles, discardedTile)
      canChi.value = chiOptions.value.length > 0
    }
  }

  // 暗カン可能な牌をチェックする関数
  function checkAnkanOptions() {
    const humanPlayer = gameManagerInstance.value.humanPlayer
    ankanOptions.value = []

    // 手牌 + ツモ牌で同じ牌が4枚あるかチェック
    const allTiles = [...humanPlayer.tiles]
    const currentDrawnTile = gameManagerInstance.value.currentDrawnTile
    if (currentDrawnTile) {
      allTiles.push(currentDrawnTile)
    }

    const tileGroups = new Map<string, Tile[]>()

    allTiles.forEach(tile => {
      const key = `${tile.suit}-${tile.rank}`
      if (!tileGroups.has(key)) {
        tileGroups.set(key, [])
      }
      tileGroups.get(key)!.push(tile)
    })

    tileGroups.forEach((tiles, key) => {
      if (tiles.length >= 4) {
        const [suit, rank] = key.split('-')
        ankanOptions.value.push({
          suit: suit,
          rank: parseInt(rank)
        })
      }
    })

    canAnkan.value = ankanOptions.value.length > 0
  }

  // 左隣のプレイヤーかどうかを判定（人間プレイヤーは0番、左隣は3番）
  function isLeftNeighbor(playerIndex: number): boolean {
    return playerIndex === 3
  }

  // チーの選択肢を取得
  function getChiOptions(handTiles: Tile[], discardedTile: Tile): string[][] {
    const options: string[][] = []
    const suit = discardedTile.suit
    const rank = discardedTile.rank

    if (suit === 'honor') {
      return options // 字牌はチーできない
    }

    // パターン1: [n-2, n-1, n] の n
    if (rank >= 3) {
      const tile1 = handTiles.find(t => t.suit === suit && t.rank === rank - 2)
      const tile2 = handTiles.find(t => t.suit === suit && t.rank === rank - 1)
      if (tile1 && tile2) {
        options.push([tile1.id, tile2.id, discardedTile.id])
      }
    }

    // パターン2: [n-1, n, n+1] の n
    if (rank >= 2 && rank <= 8) {
      const tile1 = handTiles.find(t => t.suit === suit && t.rank === rank - 1)
      const tile2 = handTiles.find(t => t.suit === suit && t.rank === rank + 1)
      if (tile1 && tile2) {
        options.push([tile1.id, discardedTile.id, tile2.id])
      }
    }

    // パターン3: [n, n+1, n+2] の n
    if (rank <= 7) {
      const tile1 = handTiles.find(t => t.suit === suit && t.rank === rank + 1)
      const tile2 = handTiles.find(t => t.suit === suit && t.rank === rank + 2)
      if (tile1 && tile2) {
        options.push([discardedTile.id, tile1.id, tile2.id])
      }
    }

    return options
  }

  function handleCpuWinWithResult(playerIndex: number, winTile: any, isTsumo: boolean, winResult: any) {
    const player = players.value[playerIndex]

    // 実際の上がり確定時に一発フラグをリセット
    gameManagerInstance.value.checkWinConditionForPlayer(playerIndex, winTile, isTsumo, true)

    winModalData.value = {
      winner: player,
      winningHand: [...player.tiles, winTile],
      winningTile: winTile,
      isTsumo,
      basePoints: winResult.basePoints,
      totalPoints: winResult.totalPoints,
      paymentInfo: winResult.paymentInfo,
      yaku: winResult.yaku,
      totalHan: winResult.totalHan,
      fu: winResult.fu,
      yakuman: winResult.yakuman,
      doraIndicators: doraIndicators.value,
      doraCount: winResult.doraCount,
      uradoraIndicators: player.riichi ? gameManagerInstance.value.getUradoraIndicators() : [],
      uradoraCount: winResult.uradoraCount
    }

    // 供託分を加算
    gameManagerInstance.value.applyKyotakuToWinner(playerIndex)

    // 点数移動を実行
    if (isTsumo) {
      gameManagerInstance.value.executeScoreTransfer(
        playerIndex,
        winResult.paymentInfo,
        winResult.totalPoints,
        true
      )
    } else {
      // ロンの場合（放銃者のインデックスを特定する必要がある）
      gameManagerInstance.value.executeScoreTransfer(
        playerIndex,
        winResult.paymentInfo,
        winResult.totalPoints,
        false,
        gameManagerInstance.value.lastDiscardPlayerIndex ?? undefined
      )
    }

    // ゲーム状態を終了に変更
    gameManagerInstance.value.gamePhase = 'finished'
    showWinModal.value = true
  }

  function handleCpuWin(playerIndex: number, winTile: any, isTsumo: boolean) {
    const result = gameManagerInstance.value.checkWinConditionForPlayer(playerIndex, winTile, isTsumo, true)

    if (result.isWin && result.result) {
      const player = players.value[playerIndex]
      const winResult = result.result

      winModalData.value = {
        winner: player,
        winningHand: [...player.tiles, winTile],
        winningTile: winTile,
        isTsumo,
        basePoints: winResult.basePoints,
        totalPoints: winResult.totalPoints,
        paymentInfo: winResult.paymentInfo,
        yaku: winResult.yaku,
        totalHan: winResult.totalHan,
        fu: winResult.fu,
        yakuman: winResult.yakuman,
        doraIndicators: doraIndicators.value,
        doraCount: winResult.doraCount,
        uradoraIndicators: player.riichi ? gameManagerInstance.value.getUradoraIndicators() : [],
        uradoraCount: winResult.uradoraCount
      }

      // 供託分を加算
      gameManagerInstance.value.applyKyotakuToWinner(playerIndex)

      // 点数移動を実行
      if (isTsumo) {
        gameManagerInstance.value.executeScoreTransfer(
          playerIndex,
          winResult.paymentInfo,
          winResult.totalPoints,
          true
        )
      } else {
        // ロンの場合（放銃者のインデックスを特定する必要がある）
        gameManagerInstance.value.executeScoreTransfer(
          playerIndex,
          winResult.paymentInfo,
          winResult.totalPoints,
          false,
          gameManagerInstance.value.lastDiscardPlayerIndex ?? undefined
        )
      }

      // ゲーム状態を終了に変更
      gameManagerInstance.value.gamePhase = 'finished'
      showWinModal.value = true
    }
  }

  function checkWinConditionForPlayer(playerIndex: number, winTile: any, isTsumo: boolean): boolean {
    const result = gameManagerInstance.value.checkWinConditionForPlayer(playerIndex, winTile, isTsumo)

    if (result.isWin && result.result) {
      // CPUプレイヤーの場合は自動で上がる
      if (players.value[playerIndex].type === 'cpu') {
        handleCpuWin(playerIndex, winTile, isTsumo)
        return true
      }

      // 人間プレイヤーの場合はボタンで選択制にするため、ここでは何もしない
      return true
    }

    return false
  }

  const showResultAndNextButtons = ref(false)
  const showDrawResultButtons = ref(false)

  function onContinueGame() {
    showWinModal.value = false
    showResultAndNextButtons.value = false

    // ゲーム終了判定
    const gameEndCheck = gameManagerInstance.value.checkGameEnd()
    if (gameEndCheck.isGameEnd) {
      gameEndModalData.value = gameEndCheck.gameEndData
      showGameEndModal.value = true
      return
    }

    gameManagerInstance.value.advanceToNextRound()

    // 次局開始後、最初のプレイヤーにツモ牌を配る
    setTimeout(() => {
      if (gameManagerInstance.value.gamePhase === 'playing') {
        gameManagerInstance.value.drawTileAndKeepSeparate(currentPlayerIndex.value)

        // CPUプレイヤーの場合は自動的にターンを開始
        if (players.value[currentPlayerIndex.value].type === 'cpu') {
          setTimeout(() => {
            processCpuTurn()
          }, 500)
        }
      }
    }, 100)
  }

  function onNewGame() {
    showWinModal.value = false
    showResultAndNextButtons.value = false
    gameManagerInstance.value.resetGame()
  }

  function onWinModalClose() {
    showResultAndNextButtons.value = gameManagerInstance.value.gamePhase === 'finished'
  }

  function reopenWinModal() {
    showWinModal.value = true
    showResultAndNextButtons.value = false
  }

  function reopenDrawModal() {
    showDrawModal.value = true
    showDrawResultButtons.value = false
  }

  // 流局関連のハンドラー
  function onContinueFromDraw() {
    showDrawModal.value = false
    showDrawResultButtons.value = false

    // ゲーム終了判定
    const gameEndCheck = gameManagerInstance.value.checkGameEnd()
    if (gameEndCheck.isGameEnd) {
      gameEndModalData.value = gameEndCheck.gameEndData
      showGameEndModal.value = true
      return
    }

    gameManagerInstance.value.advanceToNextRound()

    // 次局開始後、最初のプレイヤーにツモ牌を配る
    setTimeout(() => {
      if (gameManagerInstance.value.gamePhase === 'playing') {
        gameManagerInstance.value.drawTileAndKeepSeparate(currentPlayerIndex.value)

        // CPUプレイヤーの場合は自動的にターンを開始
        if (players.value[currentPlayerIndex.value].type === 'cpu') {
          setTimeout(() => {
            processCpuTurn()
          }, 500)
        }
      }
    }, 100)
  }

  function onDrawModalClose() {
    // 流局モーダルを閉じた後、結果表示ボタンを表示
    showDrawResultButtons.value = gameManagerInstance.value.gamePhase === 'finished'
  }

  // ゲーム終了関連のハンドラー
  function onBackToHome() {
    // ゲーム終了時の記録（上がりなし）
    gameManagerInstance.value.recordGameEnd()
    router.push('/')
  }

  function onRematch() {
    showGameEndModal.value = false
    gameManagerInstance.value.resetGame()

    // 新しいゲーム開始
    setTimeout(() => {
      gameManagerInstance.value.startNewGame()

      setTimeout(() => {
        if (gameManagerInstance.value.gamePhase === 'playing') {
          gameManagerInstance.value.drawTileAndKeepSeparate(currentPlayerIndex.value)

          // CPUプレイヤーの場合は自動的にターンを開始
          if (players.value[currentPlayerIndex.value].type === 'cpu') {
            setTimeout(() => {
              processCpuTurn()
            }, 500)
          }
        }
      }, 100)
    }, 100)
  }

  function onGameEndModalClose() {
    // ゲーム終了モーダルを閉じるだけ
  }

  // 流局判定
  function checkForDraw() {
    if (gameManagerInstance.value.gamePhase !== 'playing') {
      return
    }

    const drawCheck = gameManagerInstance.value.checkDraw()
    if (drawCheck.isDraw) {
      drawModalData.value = drawCheck.drawData
      showDrawModal.value = true
      gameManagerInstance.value.gamePhase = 'finished'
    }
  }

  // 受け入れ表示関連関数（キャンセル機能付き）
  async function updateAcceptanceInfo() {

    if (!settings.value.showAcceptance && !settings.value.showAcceptanceHighlight) {
      acceptanceInfos.value = []
      bestAcceptanceTiles.value = []
      return
    }

    const player = humanPlayer.value
    if (!player || !currentDrawnTile.value) {
      acceptanceInfos.value = []
      bestAcceptanceTiles.value = []
      return
    }

    // 14枚の手牌（手牌13枚 + ツモ牌1枚）
    const allTiles = [...player.tiles, currentDrawnTile.value]
    if (allTiles.length !== 14) {
      acceptanceInfos.value = []
      bestAcceptanceTiles.value = []
      return
    }

    // 計算開始前にキャンセルフラグをリセット
    isCalculationCancelled.value = false

    // 手牌状態をチェックして重複計算を避ける
    const handStateKey = allTiles.map(t => `${t.suit}${t.rank}${t.isRed ? 'r' : ''}`).sort().join(',')
    const lastHandStateKey = gameManagerInstance.value.getLastHandStateKey(0)
    
    if (lastHandStateKey === handStateKey && acceptanceInfos.value.length > 0) {
      return
    }

    isCalculatingAcceptance.value = true

    try {
      // 現在のシャンテン数をチェック
      const shantenNum = calculateShanten(allTiles)
      currentShanten.value = shantenNum

      // キャンセルチェック
      if (isCalculationCancelled.value) {
        return
      }

      if (shantenNum === -1) {
        acceptanceInfos.value = []
        bestAcceptanceTiles.value = []
        isUsefulTilesMode.value = false
        return
      }

      // 見えている牌を収集
      const visibleTiles = [...allTiles]
      for (const p of players.value) {
        visibleTiles.push(...p.discards)
      }
      visibleTiles.push(...doraIndicators.value)

      // キャンセルチェック
      if (isCalculationCancelled.value) {
        return
      }

      if (shantenNum === 0) {
        // テンパイの場合：各牌を切った時の受け入れ計算
        acceptanceInfos.value = await calculateAcceptanceOptimizedWithCancel(allTiles, visibleTiles)
        isUsefulTilesMode.value = false
      } else {
        // シャンテン数1以上の場合：有効牌計算
        acceptanceInfos.value = await calculateUsefulTilesInfoOptimizedWithCancel(allTiles, visibleTiles)
        isUsefulTilesMode.value = true
      }

      // キャンセルチェック
      if (isCalculationCancelled.value) {
        return
      }

      bestAcceptanceTiles.value = findBestAcceptanceTiles(acceptanceInfos.value)
    } finally {
      if (!isCalculationCancelled.value) {
        isCalculatingAcceptance.value = false
      }
    }
  }

  // キャッシュを使用したテンパイ時の受け入れ計算（キャンセル対応版）
  async function calculateAcceptanceOptimizedWithCancel(allTiles: any[], visibleTiles: any[]): Promise<AcceptanceInfo[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const startTime = performance.now()
        
        // キャンセルチェック
        if (isCalculationCancelled.value) {
          resolve([])
          return
        }
        
        // まずキャッシュから取得を試みる
        const cachedResults = gameManagerInstance.value.getCachedAcceptanceInfo(0)
        if (cachedResults.length > 0) {
          
          // 最終キャンセルチェック
          if (isCalculationCancelled.value) {
            resolve([])
            return
          }
          
          resolve(cachedResults)
          return
        }
        
        
        // 最終キャンセルチェック
        if (isCalculationCancelled.value) {
          resolve([])
          return
        }
        
        // キャッシュにない場合のみ全計算を実行
        const results: AcceptanceInfo[] = []
        const calculatedTileTypes = new Set<string>()
        
        for (const tile of allTiles) {
          // 定期的なキャンセルチェック
          if (isCalculationCancelled.value) {
            resolve([])
            return
          }
          
          const tileTypeKey = `${tile.suit}-${tile.rank}-${tile.isRed || false}`
          
          // 同じ牌種は一度だけ計算
          if (calculatedTileTypes.has(tileTypeKey)) {
            // 既に計算済みの牌種の結果をコピー
            const existingResult = results.find(r => 
              r.tile.suit === tile.suit && 
              r.tile.rank === tile.rank && 
              (r.tile.isRed || false) === (tile.isRed || false)
            )
            if (existingResult) {
              results.push({
                ...existingResult,
                tile: tile,
                tileIndex: getTileIndex(tile)
              })
            }
            continue
          }
          
          calculatedTileTypes.add(tileTypeKey)
          
          // この牌を除いた残りの手牌
          const remainingTiles = allTiles.filter(t => t.id !== tile.id)
          
          // この牌を切った後の見えている牌を計算（切った後の手牌13枚 + 河 + ドラ）
          const visibleTilesForThis = [...remainingTiles]
          for (const p of players.value) {
            visibleTilesForThis.push(...p.discards)
          }
          visibleTilesForThis.push(...doraIndicators.value)
          
          // この牌を切った後の受け入れ計算
          const acceptanceResult = calculateAcceptance(remainingTiles, visibleTilesForThis)
          
          if (acceptanceResult.length > 0) {
            results.push(acceptanceResult[0])
          }
        }
        
        
        // 最終キャンセルチェック
        if (isCalculationCancelled.value) {
          resolve([])
          return
        }
        
        resolve(results)
      }, 0)
    })
  }

  // キャッシュを使用したテンパイ時の受け入れ計算（全牌対象）
  async function calculateAcceptanceOptimized(allTiles: any[], visibleTiles: any[]): Promise<AcceptanceInfo[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const startTime = performance.now()
        
        // まずキャッシュから取得を試みる
        const cachedResults = gameManagerInstance.value.getCachedAcceptanceInfo(0)
        if (cachedResults.length > 0) {
          resolve(cachedResults)
          return
        }
        
        // キャッシュにない場合のみ全計算を実行
        const results: AcceptanceInfo[] = []
        const calculatedTileTypes = new Set<string>()
        
        for (const tile of allTiles) {
          const tileTypeKey = `${tile.suit}-${tile.rank}-${tile.isRed || false}`
          
          // 同じ牌種は一度だけ計算
          if (calculatedTileTypes.has(tileTypeKey)) {
            // 既に計算済みの牌種の結果をコピー
            const existingResult = results.find(r => 
              r.tile.suit === tile.suit && 
              r.tile.rank === tile.rank && 
              (r.tile.isRed || false) === (tile.isRed || false)
            )
            if (existingResult) {
              results.push({
                ...existingResult,
                tile: tile,
                tileIndex: getTileIndex(tile)
              })
            }
            continue
          }
          
          calculatedTileTypes.add(tileTypeKey)
          
          // この牌を除いた残りの手牌
          const remainingTiles = allTiles.filter(t => t.id !== tile.id)
          
          // この牌を切った後の受け入れ計算
          const acceptanceResult = calculateAcceptance(remainingTiles, visibleTiles)
          
          if (acceptanceResult.length > 0) {
            const acceptanceInfo = acceptanceResult[0] // 最初の結果を使用
            results.push({
              tile: tile,
              tileIndex: getTileIndex(tile),
              acceptanceTiles: acceptanceInfo.acceptanceTiles,
              remainingCounts: acceptanceInfo.remainingCounts,
              totalAcceptance: acceptanceInfo.totalAcceptance,
              shantenAfterDiscard: acceptanceInfo.shantenAfterDiscard
            })
          } else {
            // テンパイを崩す牌の場合は有効牌を計算
            const shantenAfterDiscard = calculateShanten(remainingTiles)
            const usefulTileIndices = getUsefulTiles(remainingTiles) // インデックス配列を直接取得
            const usefulRemainingCounts: number[] = []
            
            for (const tileIndex of usefulTileIndices) {
              const remainingCount = getTileRemainingCount(tileIndex, visibleTiles)
              usefulRemainingCounts.push(remainingCount)
            }
            
            const totalUseful = usefulRemainingCounts.reduce((sum, count) => sum + count, 0)
            
            results.push({
              tile: tile,
              tileIndex: getTileIndex(tile),
              acceptanceTiles: usefulTileIndices,
              remainingCounts: usefulRemainingCounts,
              totalAcceptance: totalUseful,
              shantenAfterDiscard: shantenAfterDiscard
            })
          }
        }
        
        resolve(results)
      }, 0)
    })
  }

  // キャッシュを使用した有効牌計算（キャンセル対応版）
  async function calculateUsefulTilesInfoOptimizedWithCancel(allTiles: any[], visibleTiles: any[]): Promise<AcceptanceInfo[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const functionStartTime = performance.now()

        // キャンセルチェック
        if (isCalculationCancelled.value) {
          resolve([])
          return
        }

        // まずはキャッシュから受け入れ情報を取得
        const cacheStartTime = performance.now()
        const cachedResults = gameManagerInstance.value.getCachedAcceptanceInfo(0)

        // キャッシュにあればそれを返す（テンパイの場合）
        if (cachedResults.length > 0) {
          
          // 最終キャンセルチェック
          if (isCalculationCancelled.value) {
            resolve([])
            return
          }
          
          resolve(cachedResults)
          return
        }

        // キャッシュにない場合、従来の計算を実行（シャンテン数1以上）
        const results: AcceptanceInfo[] = []
        const calculatedTileTypes = new Set<string>() // 計算済みの牌種を記録

        // forloop1: 手牌の切る牌→ 残り13枚を temp_tiles とします
        for (let i = 0; i < allTiles.length; i++) {
          // 定期的なキャンセルチェック
          if (isCalculationCancelled.value) {
            resolve([])
            return
          }
          
          const tileToDiscard = allTiles[i]

          // 同じ種類の牌が既に計算済みかチェック
          const tileTypeKey = `${tileToDiscard.suit}_${tileToDiscard.rank}_${tileToDiscard.isRed || false}`
          if (calculatedTileTypes.has(tileTypeKey)) {
            // 同じ牌種は既に計算済みなので、既存の結果をコピーして牌情報だけ更新
            const existingResult = results.find(r =>
              r.tile.suit === tileToDiscard.suit &&
              r.tile.rank === tileToDiscard.rank &&
              (r.tile as any).isRed === tileToDiscard.isRed
            )
            if (existingResult) {
              results.push({
                ...existingResult,
                tile: tileToDiscard // 実際の牌情報を更新
              })
            }
            continue
          }

          // 計算済みとしてマーク
          calculatedTileTypes.add(tileTypeKey)

          const remainingTiles = [...allTiles]
          remainingTiles.splice(i, 1) // i番目の牌を切る

          if (remainingTiles.length === 13) {
            const currentShanten = calculateShanten(remainingTiles)

            // 有効牌を取得
            const usefulTiles = getUsefulTiles(remainingTiles)
            const remainingCounts = usefulTiles.map(tileIndex =>
              getTileRemainingCount(tileIndex, visibleTiles)
            )
            const totalAcceptance = remainingCounts.reduce((sum, count) => sum + count, 0)

            results.push({
              tileIndex: getTileIndex(tileToDiscard),
              tile: tileToDiscard,
              acceptanceTiles: usefulTiles,
              remainingCounts,
              totalAcceptance,
              shantenAfterDiscard: currentShanten
            })
          }
        }

        
        // 最終キャンセルチェック
        if (isCalculationCancelled.value) {
          resolve([])
          return
        }
        
        resolve(results)
      }, 0)
    })
  }

  // キャッシュを使用した有効牌計算（シャンテン数1以上）
  async function calculateUsefulTilesInfoOptimized(allTiles: any[], visibleTiles: any[]): Promise<AcceptanceInfo[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const functionStartTime = performance.now()

        // まずはキャッシュから受け入れ情報を取得
        const cacheStartTime = performance.now()
        const cachedResults = gameManagerInstance.value.getCachedAcceptanceInfo(0)

        // キャッシュにあればそれを返す（テンパイの場合）
        if (cachedResults.length > 0) {
          resolve(cachedResults)
          return
        }

        // キャッシュにない場合、従来の計算を実行（シャンテン数1以上）
        const results: AcceptanceInfo[] = []
        const calculatedTileTypes = new Set<string>() // 計算済みの牌種を記録

        // forloop1: 手牌の切る牌→ 残り13枚を temp_tiles とします
        for (let i = 0; i < allTiles.length; i++) {
          const tileToDiscard = allTiles[i]

          // 同じ種類の牌が既に計算済みかチェック
          const tileTypeKey = `${tileToDiscard.suit}_${tileToDiscard.rank}_${tileToDiscard.isRed || false}`
          if (calculatedTileTypes.has(tileTypeKey)) {
            // 同じ牌種は既に計算済みなので、既存の結果をコピーして牌情報だけ更新
            const existingResult = results.find(r =>
              r.tile.suit === tileToDiscard.suit &&
              r.tile.rank === tileToDiscard.rank &&
              (r.tile as any).isRed === tileToDiscard.isRed
            )
            if (existingResult) {
              results.push({
                ...existingResult,
                tile: tileToDiscard // 実際の牌情報を更新
              })
            }
            continue
          }

          const tempTiles = [...allTiles]
          tempTiles.splice(i, 1) // i番目の牌を切る

          if (tempTiles.length === 13) {
            const currentShanten = calculateShanten(tempTiles)
            const usefulTileIndices: number[] = []
            const remainingCounts: number[] = []

            // forloop2: すべての牌種（34種類）
            for (let tileIndex = 0; tileIndex < 34; tileIndex++) {
              // 孤立牌の場合、絶対に不要なので以降の処理をスキップ
              if (isIsolatedTile(tempTiles, tileIndex)) {
                continue
              }

              // そうでない場合、有効牌かどうか判定
              const testTile = createTileFromIndex(tileIndex, 'test')
              const testTiles = [...tempTiles, testTile]
              const newShanten = calculateShanten(testTiles)

              if (newShanten < currentShanten) {
                usefulTileIndices.push(tileIndex)
                remainingCounts.push(getTileRemainingCount(tileIndex, visibleTiles))
              }
            }

            const totalUseful = remainingCounts.reduce((sum, count) => sum + count, 0)

            if (usefulTileIndices.length > 0) {
              results.push({
                tileIndex: getTileIndex(tileToDiscard),
                tile: tileToDiscard,
                acceptanceTiles: usefulTileIndices,
                remainingCounts,
                totalAcceptance: totalUseful,
                shantenAfterDiscard: currentShanten
              })

              // この牌種を計算済みとしてマーク
              calculatedTileTypes.add(tileTypeKey)
            }
          }
        }

        resolve(results)
      }, 0)
    })
  }

  // 孤立牌かどうかの判定（最適化のため）
  function isIsolatedTile(tiles: any[], tileIndex: number): boolean {
    const testTile = createTileFromIndex(tileIndex, 'test')

    // 字牌の場合
    if (testTile.suit === 'honor') {
      // 同じ字牌が手牌にあるかチェック
      const sameHonorCount = tiles.filter(t =>
        t.suit === 'honor' && t.rank === testTile.rank
      ).length
      return sameHonorCount === 0
    }

    // 数牌の場合、隣接する牌があるかチェック
    const suitTiles = tiles.filter(t => t.suit === testTile.suit)
    const ranks = suitTiles.map(t => t.rank)

    // 同じ牌があるか
    if (ranks.includes(testTile.rank)) {
      return false
    }

    // 隣接する牌があるか（-2, -1, +1, +2の範囲）
    for (let offset = -2; offset <= 2; offset++) {
      if (offset === 0) continue
      const adjacentRank = testTile.rank + offset
      if (adjacentRank >= 1 && adjacentRank <= 9 && ranks.includes(adjacentRank)) {
        return false
      }
    }

    return true
  }

  // ホバー時のツールチップ表示処理
  async function onTileHover(tile: Tile, x: number, y: number) {
    
    // ツールチップ表示条件をチェック
    const shouldShowTooltip = settings.value.showAcceptance || riichiPreviewMode.value
    if (!shouldShowTooltip) {
      return
    }

    // ツールチップ位置をプレイヤー操作エリアの上部に固定
    const playerBottomArea = document.querySelector('.player-bottom')
    if (playerBottomArea) {
      const rect = playerBottomArea.getBoundingClientRect()
      // ツールチップの左端をプレイヤーエリアの左端に合わせる
      let tooltipX = rect.left
      // プレイヤーエリアの上部に十分な余白を取って配置（手牌に被らないように）
      let tooltipY = rect.top - 300 // より上に配置

      // 画面左端からはみ出さないように調整
      if (tooltipX < 10) {
        tooltipX = 10
      }

      // 画面右端からはみ出さないように調整（ツールチップ幅400px想定）
      if (tooltipX + 400 > window.innerWidth) {
        tooltipX = window.innerWidth - 410
      }

      // 画面上端からはみ出さないように調整
      if (tooltipY < 10) {
        // 上に十分なスペースがない場合は、プレイヤーエリアの下に表示
        tooltipY = rect.bottom + 10
      }

      mouseX.value = tooltipX
      mouseY.value = tooltipY
    } else {
      mouseX.value = x
      mouseY.value = y
    }

    // 計算中の場合はローディング表示
    if (isCalculatingAcceptance.value) {
      currentHoveredTileAcceptance.value = null
      showAcceptancePopup.value = true
      return
    }

    const tileIndex = getTileIndex(tile)
    let acceptanceInfo = acceptanceInfos.value.find(info => info.tileIndex === tileIndex)

    // リーチプレビューモード時は、テンパイを維持する牌のみ表示
    if (riichiPreviewMode.value) {
      const validTiles = getRiichiValidTiles()
      if (!validTiles.includes(tile.id)) {
        return // 無効牌の場合は表示しない
      }
    }

    // 受け入れ情報がない場合はローディング表示して計算開始
    if (!acceptanceInfo) {
      
      // 即座にローディング表示
      currentHoveredTileAcceptance.value = null
      isCalculatingAcceptance.value = true
      showAcceptancePopup.value = true
      
      // DOM更新を待って、バックグラウンドで計算実行
      await nextTick()
      
      // テンパイ時で該当する受け入れ情報がない場合、動的に計算
      if (currentShanten.value === 0) {
        const calculatedInfo = await calculateSingleTileAcceptance(tile)
        if (calculatedInfo) {
          acceptanceInfo = calculatedInfo
          // 計算完了後にツールチップ内容を更新
          currentHoveredTileAcceptance.value = calculatedInfo
        }
      }
      
      isCalculatingAcceptance.value = false
    }

    if (acceptanceInfo) {
      currentHoveredTileAcceptance.value = acceptanceInfo
      showAcceptancePopup.value = true
      
      // nextTickを使用してDOM更新後に確認
      await nextTick()
    }
  }

  // テンパイ時の単一牌受け入れ計算
  async function calculateSingleTileAcceptance(tile: Tile): Promise<AcceptanceInfo | null> {
    return new Promise((resolve) => {
      // 非同期処理でUIをブロックしない
      setTimeout(() => {
        
        const player = humanPlayer.value
        if (!player || !currentDrawnTile.value) {
          resolve(null)
          return
        }

        const allTiles = [...player.tiles, currentDrawnTile.value]
        const tileIndex = getTileIndex(tile)

        // この牌を切った後の手牌を作成
        const tileToDiscardIndex = allTiles.findIndex(t => getTileIndex(t) === tileIndex)
        if (tileToDiscardIndex === -1) {
          resolve(null)
          return
        }

        const remainingTiles = [...allTiles]
        remainingTiles.splice(tileToDiscardIndex, 1)

        if (remainingTiles.length !== 13) {
          resolve(null)
          return
        }

        // この牌を切った後のシャンテン数を計算
        const shantenAfterDiscard = calculateShanten(remainingTiles)

    // 見えている牌を収集
    const visibleTiles = [...allTiles]
    for (const p of players.value) {
      visibleTiles.push(...p.discards)
    }
    visibleTiles.push(...doraIndicators.value)

    let acceptanceTiles: number[] = []
    let remainingCounts: number[] = []

    if (shantenAfterDiscard === 0) {
      // テンパイを維持する場合、受け入れ牌を計算
      acceptanceTiles = getUsefulTiles(remainingTiles)
      remainingCounts = acceptanceTiles.map(tileIdx =>
        getTileRemainingCount(tileIdx, visibleTiles)
      )
    } else {
      // シャンテン数が上がる場合、有効牌を計算
      for (let tileIdx = 0; tileIdx < 34; tileIdx++) {
        if (isIsolatedTile(remainingTiles, tileIdx)) {
          continue
        }

        const testTile = createTileFromIndex(tileIdx, 'test')
        const testTiles = [...remainingTiles, testTile]
        const newShanten = calculateShanten(testTiles)

        if (newShanten < shantenAfterDiscard) {
          acceptanceTiles.push(tileIdx)
          remainingCounts.push(getTileRemainingCount(tileIdx, visibleTiles))
        }
      }
    }

        const totalAcceptance = remainingCounts.reduce((sum, count) => sum + count, 0)
        
        resolve({
          tileIndex,
          tile,
          acceptanceTiles,
          remainingCounts,
          totalAcceptance,
          shantenAfterDiscard
        })
      }, 0)
    })
  }

  // ホバー終了時の処理
  function onTileLeave() {
    showAcceptancePopup.value = false
    currentHoveredTileAcceptance.value = null
  }

  async function checkCpuRon(discardPlayerIndex: number): Promise<boolean> {
    if (!gameManagerInstance.value.lastDiscardedTile) {
      return false
    }

    const lastDiscardedTile = gameManagerInstance.value.lastDiscardedTile
    const doraIndicators = gameManagerInstance.value.doraIndicators

    // 捨て牌を出したプレイヤー以外の全プレイヤーをチェック（人間プレイヤーは除く）  
    for (let i = 1; i <= 3; i++) {
      if (i === discardPlayerIndex) continue // 捨てたプレイヤー自身はスキップ

      const player = players.value[i]
      if (player.type !== 'cpu') continue

      const ai = cpuAIs[i as 1 | 2 | 3]
      if (!ai) continue

      // CPUがロンできるかチェック
      if (ai.canRon(player, lastDiscardedTile, doraIndicators)) {
        // CPUがロンするかどうかを決定（難易度に応じた確率）
        if (ai.shouldDeclareRon(player, lastDiscardedTile, doraIndicators)) {
          // CPUのロン処理を実行
          await handleCpuRon(i, discardPlayerIndex, lastDiscardedTile)
          return true
        }
      }
    }

    return false
  }

  async function handleCpuRon(winnerIndex: number, loserIndex: number, winTile: any) {
    const winner = players.value[winnerIndex]

    // ロン判定と得点計算
    const winResult = gameManagerInstance.value.checkWinConditionForPlayer(winnerIndex, winTile, false, true)

    if (winResult.isWin && winResult.result) {
      // 実際の上がり確定時に一発フラグをリセット
      gameManagerInstance.value.checkWinConditionForPlayer(winnerIndex, winTile, false, true)

      winModalData.value = {
        winner: winner,
        winningHand: [...winner.tiles, winTile],
        winningTile: winTile,
        isTsumo: false,
        basePoints: winResult.result.basePoints,
        totalPoints: winResult.result.totalPoints,
        paymentInfo: winResult.result.paymentInfo,
        yaku: winResult.result.yaku,
        totalHan: winResult.result.totalHan,
        fu: winResult.result.fu,
        yakuman: winResult.result.yakuman,
        doraIndicators: doraIndicators.value,
        doraCount: winResult.result.doraCount,
        uradoraIndicators: winner.riichi ? gameManagerInstance.value.getUradoraIndicators() : [],
        uradoraCount: winResult.result.uradoraCount
      }

      // 供託分を加算
      gameManagerInstance.value.applyKyotakuToWinner(winnerIndex)

      // 点数移動を実行（ロン）
      gameManagerInstance.value.executeScoreTransfer(
        winnerIndex, // winner index
        winResult.result.paymentInfo,
        winResult.result.totalPoints,
        false, // isTsumo
        loserIndex // ron target (放銃者)
      )

      // ゲーム状態を終了に変更
      gameManagerInstance.value.gamePhase = 'finished'
      showWinModal.value = true
    }
  }

  function getPlayerDiscardRow(playerIndex: number, rowIndex: number): any[] {
    return gameManagerInstance.value.getPlayerDiscardRow(playerIndex, rowIndex)
  }

  function getPlayerPosition(playerIndex: number): string {
    return gameManagerInstance.value.getPlayerPosition(playerIndex)
  }

  function toggleCpuTiles(playerIndex: number) {
    if (playerIndex >= 1 && playerIndex <= 3) {
      cpuTilesVisible.value[playerIndex as 1 | 2 | 3] = !cpuTilesVisible.value[playerIndex as 1 | 2 | 3]
    }
  }

  onMounted(() => {
    if (gamePhase.value === 'waiting') {
      gameManagerInstance.value.startNewGame()

      setTimeout(() => {
        if (gameManagerInstance.value.gamePhase === 'playing') {
          gameManagerInstance.value.drawTileAndKeepSeparate(currentPlayerIndex.value)
        }
      }, 100)
    }
  })

  watch(() => currentPlayerIndex.value, async (newIndex) => {
    if (gamePhase.value === 'playing') {
      // プレイヤーの手牌が適切な枚数でない場合はツモを行わない
      const player = players.value[newIndex]

      // 鳴き牌を考慮した枚数計算（カンは3枚として数える）
      const meldTileCount = player.melds.reduce((count, meld) => {
        if (meld.type === 'kan') {
          return count + 3 // カンは3枚として数える
        } else {
          return count + meld.tiles.length // ポン・チーは実際の枚数
        }
      }, 0)
      const expectedHandTiles = 13 - meldTileCount

      if (player.tiles.length !== expectedHandTiles) {
        return
      }

      // カン直後の場合は追加のツモを行わない（既にリンシャン牌を引いているため）
      if (gameManagerInstance.value.currentDrawnTile && gameManagerInstance.value.isRinshanKaihou(newIndex)) {
        return
      }

      // すべてのプレイヤーはdrawTileAndKeepSeparateを使用
      // （super CPUの場合は内部で有効牌処理が行われる）
      const drawnTile = gameManagerInstance.value.drawTileAndKeepSeparate(newIndex)

      // ツモが成功しなかった場合（山が空など）は流局判定
      if (!drawnTile) {
        checkForDraw()
        return
      }

      if (players.value[newIndex].type === 'cpu') {
        setTimeout(() => {
          processCpuTurn()
        }, 500)
      } else if (players.value[newIndex].type === 'human') {
        // 人間プレイヤーのターン開始：暗カン可能な牌をチェック
        checkAnkanOptions()

        // 受け入れ計算とハイライト処理
        updateAcceptanceInfo()
      }
    }
  })

  // ライフサイクルフック
  onMounted(() => {
    // 特に初期化処理なし
  })

  return {
    // refs
    gameManagerInstance,
    cpuTilesVisible,
    riichiPreviewMode,
    processingCpuTurn,
    showWinModal,
    showDrawModal,
    drawModalData,
    showGameEndModal,
    gameEndModalData,
    showTestDialog,
    showAcceptancePopup,
    acceptanceInfos,
    bestAcceptanceTiles,
    currentHoveredTileAcceptance,
    mouseX,
    mouseY,
    currentShanten,
    isUsefulTilesMode,
    isCalculatingAcceptance,
    isMuted,
    winModalData,
    showResultAndNextButtons,
    showDrawResultButtons,
    canPon,
    canKan,
    canAnkan,
    canChi,
    chiOptions,
    selectedChiOption,
    lastDiscardedTile,
    ankanOptions,

    // computed
    players,
    gamePhase,
    currentPlayerIndex,
    currentDrawnTile,
    doraIndicators,
    round,
    dealer,
    currentPlayer,
    humanPlayer,
    wallRemaining,
    isHumanTurn,
    canDraw,
    effectiveHandSize,
    canDeclareRiichi,
    canTsumo,
    canRon,
    humanShanten,
    shantenColor,
    shantenText,
    riichiButtonText,

    // methods
    getDealerText,
    startGame,
    resetGame,
    toggleMute,
    onTestModeApplied,
    onHumanTileDiscard,
    processCpuTurn,
    declareRiichi,
    toggleRiichiPreview,
    getRiichiValidTiles,
    getRiichiDisabledTiles,
    getPostRiichiDisabledTiles,
    confirmRiichiAndDiscard,
    cancelTsumo,
    declareTsumo,
    declareRon,
    cancelRon,
    declarePon,
    declareKan,
    declareChi,
    declareAnkan,
    cancelActions,
    resetActionFlags,
    checkHumanMeldActions,
    checkAnkanOptions,
    isLeftNeighbor,
    getChiOptions,
    handleCpuWinWithResult,
    handleCpuWin,
    checkWinConditionForPlayer,
    onContinueGame,
    onNewGame,
    onWinModalClose,
    reopenWinModal,
    reopenDrawModal,
    onContinueFromDraw,
    onDrawModalClose,
    onBackToHome,
    onRematch,
    onGameEndModalClose,
    checkForDraw,
    updateAcceptanceInfo,
    calculateAcceptanceOptimized,
    calculateUsefulTilesInfoOptimized,
    isIsolatedTile,
    onTileHover,
    calculateSingleTileAcceptance,
    onTileLeave,
    checkCpuRon,
    handleCpuRon,
    getPlayerDiscardRow,
    getPlayerPosition,
    toggleCpuTiles,
    settings
  }
}