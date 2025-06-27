<template>
  <div class="ukeire-demo">
    <v-container fluid>
      <v-row>
        <v-col cols="12">
          <v-card class="demo-header">
            <v-card-title class="text-h4 text-center">
              受け入れ計算デモ
            </v-card-title>
            <v-card-subtitle class="text-center">
              riichi-rs-bundlers を使った2シャンテンからの受け入れ計算
            </v-card-subtitle>
          </v-card>
        </v-col>
      </v-row>

      <!-- 手牌表示・編集エリア -->
      <v-row class="mt-4">
        <v-col cols="12">
          <v-card>
            <v-card-title>手牌 (13枚)</v-card-title>
            <v-card-text>
              <div class="hand-tiles">
                <TileImage
                  v-for="(tile, index) in handTiles" 
                  :key="index"
                  :tile-id="tile"
                  size="large"
                  :clickable="true"
                  @click="editTile(index)"
                />
              </div>
              <div class="mt-4">
                <v-btn color="primary" @click="calculateUkeire">受け入れ計算</v-btn>
                <v-btn color="secondary" class="ml-2" @click="resetToExample">サンプル手牌に戻す</v-btn>
                <v-btn color="warning" class="ml-2" @click="generateRandomHand">ランダム手牌</v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- 結果表示エリア -->
      <v-row class="mt-4" v-if="result">
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>現在の状況</v-card-title>
            <v-card-text>
              <div class="result-info">
                <div class="info-row">
                  <span class="label">向聴数:</span>
                  <span class="value">{{ result.currentShanten }}シャンテン</span>
                </div>
                <div class="info-row">
                  <span class="label">待ち牌:</span>
                  <span class="value">{{ result.waitTiles.join(', ') }}</span>
                </div>
                <div class="info-row">
                  <span class="label">受け入れ枚数:</span>
                  <span class="value">{{ result.totalUkeire }}枚</span>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>捨て牌候補</v-card-title>
            <v-card-text>
              <div class="discard-options">
                <div 
                  v-for="option in result.discardOptions" 
                  :key="option.discard"
                  class="discard-option"
                >
                  <TileImage
                    :tile-id="getDiscardTileId(option.discard)"
                    size="medium"
                    class="discard-tile-img"
                  />
                  <div class="discard-info">
                    <div>→ {{ option.shanten }}シャンテン</div>
                    <div>受け入れ: {{ option.ukeire }}枚</div>
                    <div class="wait-tiles">{{ option.waits.join(', ') }}</div>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- エラー表示 -->
      <v-row class="mt-4" v-if="error">
        <v-col cols="12">
          <v-alert type="error">
            {{ error }}
          </v-alert>
        </v-col>
      </v-row>
    </v-container>

    <!-- 牌選択ダイアログ -->
    <v-dialog v-model="tileSelectDialog" max-width="600">
      <v-card>
        <v-card-title>牌を選択</v-card-title>
        <v-card-text>
          <div class="tile-selector">
            <div class="suit-group">
              <h4>萬子</h4>
              <div class="tile-row">
                <TileImage
                  v-for="i in 9" 
                  :key="`m${i}`"
                  :tile-id="getTileId('M', i)"
                  size="medium"
                  :clickable="true"
                  @click="selectTileFromId(getTileId('M', i))"
                />
              </div>
            </div>
            <div class="suit-group">
              <h4>筒子</h4>
              <div class="tile-row">
                <TileImage
                  v-for="i in 9" 
                  :key="`p${i}`"
                  :tile-id="getTileId('P', i)"
                  size="medium"
                  :clickable="true"
                  @click="selectTileFromId(getTileId('P', i))"
                />
              </div>
            </div>
            <div class="suit-group">
              <h4>索子</h4>
              <div class="tile-row">
                <TileImage
                  v-for="i in 9" 
                  :key="`s${i}`"
                  :tile-id="getTileId('S', i)"
                  size="medium"
                  :clickable="true"
                  @click="selectTileFromId(getTileId('S', i))"
                />
              </div>
            </div>
            <div class="suit-group">
              <h4>字牌</h4>
              <div class="tile-row">
                <TileImage
                  :tile-id="27"
                  size="medium"
                  :clickable="true"
                  @click="selectTileFromId(27)"
                />
                <TileImage
                  :tile-id="28"
                  size="medium"
                  :clickable="true"
                  @click="selectTileFromId(28)"
                />
                <TileImage
                  :tile-id="29"
                  size="medium"
                  :clickable="true"
                  @click="selectTileFromId(29)"
                />
                <TileImage
                  :tile-id="30"
                  size="medium"
                  :clickable="true"
                  @click="selectTileFromId(30)"
                />
                <TileImage
                  :tile-id="31"
                  size="medium"
                  :clickable="true"
                  @click="selectTileFromId(31)"
                />
                <TileImage
                  :tile-id="32"
                  size="medium"
                  :clickable="true"
                  @click="selectTileFromId(32)"
                />
                <TileImage
                  :tile-id="33"
                  size="medium"
                  :clickable="true"
                  @click="selectTileFromId(33)"
                />
              </div>
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="tileSelectDialog = false">キャンセル</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { calc, Tile } from 'riichi-rs-bundlers'
import TileImage from '../components/TileImage.vue'

interface UkeireResult {
  currentShanten: number
  waitTiles: string[]
  totalUkeire: number
  discardOptions: Array<{
    discard: string
    shanten: number
    ukeire: number
    waits: string[]
  }>
}

// リアクティブデータ
const handTiles = ref<number[]>([])
const result = ref<UkeireResult | null>(null)
const error = ref<string>('')
const tileSelectDialog = ref(false)
const editingIndex = ref(-1)

// サンプル手牌（1シャンテン）
// 1m2m3m 4p5p6p 7s8s9s 東東 白白 發
const sampleHand = [
  0, 1, 2,      // 1m, 2m, 3m
  12, 13, 14,   // 4p, 5p, 6p
  24, 25, 26,   // 7s, 8s, 9s
  27, 27,       // 東, 東
  31, 31,       // 白, 白
  32            // 發
]

// 初期化
resetToExample()

function resetToExample() {
  handTiles.value = sortTiles([...sampleHand])
  result.value = null
  error.value = ''
}

function getTileDisplay(tileId: number): string {
  // riichi-rs-bundlersの牌IDと表示文字列の直接マッピング
  const displayMap: { [key: number]: string } = {
    // 萬子 (0-8 → 1m-9m)
    0: '1m', 1: '2m', 2: '3m', 3: '4m', 4: '5m', 5: '6m', 6: '7m', 7: '8m', 8: '9m',
    // 筒子 (9-17 → 1p-9p)
    9: '1p', 10: '2p', 11: '3p', 12: '4p', 13: '5p', 14: '6p', 15: '7p', 16: '8p', 17: '9p',
    // 索子 (18-26 → 1s-9s)
    18: '1s', 19: '2s', 20: '3s', 21: '4s', 22: '5s', 23: '6s', 24: '7s', 25: '8s', 26: '9s',
    // 風牌 (27-30)
    27: '東', 28: '南', 29: '西', 30: '北',
    // 三元牌 (31-33)
    31: '白', 32: '發', 33: '中'
  }
  
  const display = displayMap[tileId]
  if (display !== undefined) {
    return display
  }
  
  console.warn('Unknown tile ID for display:', tileId)
  return '?'
}

function getTileKey(tileId: number): string {
  for (const [key, value] of Object.entries(Tile)) {
    if (value === tileId) {
      return key
    }
  }
  return 'Unknown'
}

function editTile(index: number) {
  editingIndex.value = index
  tileSelectDialog.value = true
}

function selectTile(tileKey: string) {
  if (editingIndex.value >= 0) {
    handTiles.value[editingIndex.value] = (Tile as any)[tileKey]
  }
  tileSelectDialog.value = false
  editingIndex.value = -1
}

function selectTileFromId(tileId: number) {
  if (editingIndex.value >= 0) {
    handTiles.value[editingIndex.value] = tileId
    // 牌を変更した後にソート
    handTiles.value = sortTiles(handTiles.value)
  }
  tileSelectDialog.value = false
  editingIndex.value = -1
}

function getTileId(suit: string, rank: number): number {
  // 直接数値IDを返す
  if (suit === 'M') {
    return rank - 1  // 1m=0, 2m=1, ..., 9m=8
  } else if (suit === 'P') {
    return 8 + rank  // 1p=9, 2p=10, ..., 9p=17
  } else if (suit === 'S') {
    return 17 + rank // 1s=18, 2s=19, ..., 9s=26
  }
  return 0 // フォールバック
}

function getDiscardTileId(displayText: string): number {
  // 表示テキストから牌IDを逆引き
  for (const [key, value] of Object.entries(Tile)) {
    const display = getTileDisplay(value as number)
    if (display === displayText) {
      return value as number
    }
  }
  return Tile.M1 // フォールバック
}

function sortTiles(tiles: number[]): number[] {
  // 牌IDは連続した数値なので、そのまま比較すれば正しい順序になる
  // 萬子(0-8) → 筒子(9-17) → 索子(18-26) → 風牌(27-30) → 三元牌(31-33)
  return [...tiles].sort((a, b) => a - b)
}

function generateRandomHand() {
  const allTiles = [
    // 萬子 (0-8)
    0, 1, 2, 3, 4, 5, 6, 7, 8,
    // 筒子 (9-17)
    9, 10, 11, 12, 13, 14, 15, 16, 17,
    // 索子 (18-26)
    18, 19, 20, 21, 22, 23, 24, 25, 26,
    // 字牌 (27-33)
    27, 28, 29, 30, 31, 32, 33
  ]
  
  // 各牌の枚数制限を考慮してランダム手牌を生成
  const randomHand = []
  const tileCounts: { [key: number]: number } = {}
  
  for (let i = 0; i < 13; i++) {
    let attempts = 0
    let selectedTile: number
    
    do {
      const randomIndex = Math.floor(Math.random() * allTiles.length)
      selectedTile = allTiles[randomIndex]
      attempts++
      
      // 無限ループを防ぐ
      if (attempts > 100) {
        // フォールバック: 使用枚数が少ない牌を選ぶ
        selectedTile = allTiles.find(tile => (tileCounts[tile] || 0) < 4) || 0
        break
      }
    } while ((tileCounts[selectedTile] || 0) >= 4)
    
    randomHand.push(selectedTile)
    tileCounts[selectedTile] = (tileCounts[selectedTile] || 0) + 1
  }
  
  // ソートして設定
  handTiles.value = sortTiles(randomHand)
  result.value = null
  error.value = ''
}

// 残り枚数を計算
function leftoverCount(tileId: number): number {
  const total = 4
  const alreadySeen = handTiles.value.filter(t => t === tileId).length
  return Math.max(total - alreadySeen, 0)
}

// 受け入れ枚数を計算
function ukeireFromWaits(waitIds: number[]): number {
  return waitIds.reduce((sum, id) => sum + leftoverCount(id), 0)
}

function calculateUkeire() {
  try {
    error.value = ''
    
    if (handTiles.value.length !== 13) {
      error.value = '手牌は13枚である必要があります'
      return
    }

    // 手牌の有効性チェック
    const tileCounts: { [key: number]: number } = {}
    for (const tile of handTiles.value) {
      tileCounts[tile] = (tileCounts[tile] || 0) + 1
      if (tileCounts[tile] > 4) {
        error.value = `牌 ${getTileDisplay(tile)} が4枚を超えています`
        return
      }
    }

    // デバッグ用：現在の手牌を表示
    console.log('Current hand tiles:', handTiles.value)
    console.log('Hand display:', handTiles.value.map(t => getTileDisplay(t)).join(' '))

    // 手牌をソートしてからcalcに渡す
    const sortedHand = [...handTiles.value].sort((a, b) => a - b)

    // riichi-rs-bundlersで受け入れ計算
    const res = calc({
      closed_part: sortedHand as Tile[],
      open_part: [],
      options: {
        tile_discarded_by_someone: -1,
        jikaze: 28, // 南 (直接数値を使用)
        bakaze: 27, // 東 (直接数値を使用)
        allow_kuitan: true,
        allow_aka: false,
      },
      calc_hairi: true, // 受け入れ計算を有効化
    })

    if (!res.hairi) {
      error.value = '受け入れ計算結果が取得できませんでした'
      return
    }

    console.log(res.hairi)

    // 現在の待ち牌を文字列に変換
    const waitTiles = res.hairi.wait.map(id => getTileDisplay(id))
    const totalUkeire = ukeireFromWaits(res.hairi.wait)

    // 捨て牌候補ごとの受け入れ計算
    const discardOptions = []
    for (const [discard, waits] of res.hairi.waits_after_discard) {
      const ukeire = ukeireFromWaits(waits)
      const waitDisplays = waits.map(id => getTileDisplay(id))
      
      discardOptions.push({
        discard: getTileDisplay(discard),
        shanten: res.hairi.now - 1,
        ukeire,
        waits: waitDisplays
      })
    }

    // 受け入れ枚数でソート（降順）
    discardOptions.sort((a, b) => b.ukeire - a.ukeire)

    result.value = {
      currentShanten: res.hairi.now,
      waitTiles,
      totalUkeire,
      discardOptions
    }

  } catch (err) {
    console.error('受け入れ計算エラー:', err)
    error.value = `計算エラー: ${err instanceof Error ? err.message : String(err)}`
  }
}
</script>

<style scoped>
.ukeire-demo {
  min-height: 100vh;
  background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
  padding: 16px 0;
}

.demo-header {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
}

.hand-tiles {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin: 16px 0;
}

.result-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.label {
  font-weight: 500;
  color: #666;
}

.value {
  font-weight: bold;
  color: #1976d2;
}

.discard-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.discard-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #f9f9f9;
}

.discard-tile-img {
  border: 1px solid #ccc;
  border-radius: 4px;
  background: white;
}

.discard-info {
  flex: 1;
  font-size: 14px;
}

.wait-tiles {
  color: #666;
  margin-top: 4px;
}

.tile-selector {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.suit-group h4 {
  margin-bottom: 8px;
  color: #333;
}

.tile-row {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .hand-tiles {
    justify-content: center;
  }
}
</style>