<template>
  <v-dialog 
    v-model="isOpen" 
    max-width="900" 
    :scrim="false"
    @click:outside="closeModal"
  >
    <v-card class="win-modal">
      <v-card-title class="text-h4 text-center win-title">
        {{ winData.isTsumo ? 'ツモ' : 'ロン' }}
      </v-card-title>
      
      <v-card-text>
        <!-- 勝利プレイヤー情報 -->
        <div class="winner-info">
          <h3>{{ winData.winner.name }} の勝利！</h3>
        </div>
        
        <!-- 上がり牌表示 -->
        <div class="winning-tiles">
          <h4>上がり牌</h4>
          <div class="tiles-display">
            <!-- 手牌13枚 -->
            <div class="hand-tiles">
              <MahjongTile
                v-for="tile in handTiles"
                :key="tile.id"
                :tile="tile"
                size="medium"
                :is-draggable="false"
                :is-dora="isDoraTile(tile)"
              />
            </div>
            <!-- 上がり牌（少し右に配置） -->
            <div v-if="winData.winningTile" class="winning-tile-separate">
              <MahjongTile
                :tile="winData.winningTile"
                size="medium"
                :is-draggable="false"
                :is-winning-tile="true"
                :is-dora="isDoraTile(winData.winningTile)"
              />
            </div>
          </div>
        </div>
        
        <!-- 鳴き牌表示 -->
        <div v-if="winData.winner.melds && winData.winner.melds.length > 0" class="melds-section">
          <h4>鳴き牌</h4>
          <div class="melds-display">
            <div 
              v-for="(meld, index) in winData.winner.melds"
              :key="index"
              class="meld-group"
            >
              <MahjongTile
                v-for="(tile, tileIndex) in meld.tiles"
                :key="tile.id"
                :tile="tile"
                size="medium"
                :is-draggable="false"
                :is-yoko="shouldTileBeYoko(meld, tileIndex)"
                :is-back="shouldTileBeBack(meld, tileIndex)"
                :is-dora="isDoraTile(tile)"
              />
            </div>
          </div>
        </div>
        
        <!-- 得点情報 -->
        <div class="score-info">
          <v-row>
            <v-col cols="6">
              <v-card variant="outlined">
                <v-card-text class="text-center">
                  <div class="score-label">支払い</div>
                  <div class="score-value">{{ winData.paymentInfo }}</div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="6">
              <v-card variant="outlined">
                <v-card-text class="text-center">
                  <div class="score-label">合計</div>
                  <div class="score-value">{{ winData.totalPoints }}点</div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>
        
        <!-- スマホ用追加ボタン -->
        <div class="mobile-continue-button">
          <v-btn 
            color="primary" 
            size="large"
            block
            @click="$emit('continue')"
          >
            次の局へ
          </v-btn>
        </div>
        
        <!-- 役一覧 -->
        <div class="yaku-list">
          <h4>役</h4>
          <v-list density="compact">
            <v-list-item
              v-for="yaku in winData.yaku"
              :key="yaku.name"
            >
              <v-list-item-title>{{ yaku.name }}</v-list-item-title>
              <template #append>
                <span class="yaku-han">{{ yaku.han }}翻</span>
              </template>
            </v-list-item>
          </v-list>
          
          <div class="total-han">
            <span v-if="winData.yakuman > 0">
              {{ winData.yakuman === 1 ? '役満' : `${winData.yakuman}倍役満` }}
            </span>
            <span v-else>
              合計: {{ winData.totalHan }}翻 {{ winData.fu }}符
            </span>
          </div>
        </div>
        
        <!-- ドラ情報 -->
        <div class="dora-container">
          <div class="dora-info">
            <h4>ドラ表示</h4>
            <div class="dora-tiles">
              <MahjongTile
                v-for="dora in winData.doraIndicators"
                :key="dora.id"
                :tile="dora"
                size="small"
                :is-draggable="false"
              />
            </div>
            <div class="dora-count">ドラ: {{ winData.doraCount }}枚</div>
          </div>
          
          <!-- 裏ドラ情報（リーチ時のみ） -->
          <div v-if="winData.winner.riichi" class="uradora-info">
            <h4>裏ドラ表示</h4>
            <div class="uradora-tiles">
              <MahjongTile
                v-for="uradora in winData.uradoraIndicators"
                :key="uradora.id"
                :tile="uradora"
                size="small"
                :is-draggable="false"
              />
            </div>
            <div class="uradora-count">裏ドラ: {{ winData.uradoraCount }}枚</div>
          </div>
        </div>
      </v-card-text>
      
      <v-card-actions class="justify-center">
        <v-btn 
          color="primary" 
          size="large"
          @click="$emit('continue')"
        >
          次の局へ
        </v-btn>
        <!-- <v-btn 
          color="secondary" 
          size="large"
          @click="$emit('newGame')"
        >
          新ゲーム
        </v-btn> -->
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Tile, Player, Meld } from '../stores/fourPlayerMahjong'
import MahjongTile from './MahjongTile.vue'

export interface WinData {
  winner: Player
  winningHand: Tile[]
  winningTile: Tile | null
  isTsumo: boolean
  basePoints: number
  totalPoints: number
  paymentInfo: string
  yaku: Array<{ name: string; han: number }>
  totalHan: number
  fu: number
  yakuman: number
  doraIndicators: Tile[]
  doraCount: number
  uradoraIndicators: Tile[]
  uradoraCount: number
}

interface Props {
  modelValue: boolean
  winData: WinData
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'continue'): void
  (e: 'newGame'): void
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

const closeModal = () => {
  emit('update:modelValue', false)
  emit('close')
}

// 手牌（上がり牌を除いた13枚）
const handTiles = computed(() => {
  return props.winData.winningHand.filter(tile => tile.id !== props.winData.winningTile?.id)
})

// ドラ判定
const isDoraTile = (tile: any) => {
  if (!tile) return false
  
  // ドラ表示牌から実際のドラを計算
  const doraNumbers = props.winData.doraIndicators.map(indicator => getNextTile(indicator))
  const uradoraNumbers = props.winData.uradoraIndicators.map(indicator => getNextTile(indicator))
  
  const tileNumber = convertTileToNumber(tile)
  return doraNumbers.includes(tileNumber) || uradoraNumbers.includes(tileNumber)
}

// 次の牌を取得（ドラ計算用）
const getNextTile = (tile: any) => {
  if (tile.suit === 'man') {
    // 萬子: 1-9, 9の次は1
    const nextRank = tile.rank === 9 ? 1 : tile.rank + 1
    const result = nextRank - 1 // 0-8の範囲
    return result
  } else if (tile.suit === 'pin') {
    // 筒子: 1-9, 9の次は1
    const nextRank = tile.rank === 9 ? 1 : tile.rank + 1
    const result = 9 + nextRank - 1 // 9-17の範囲
    return result
  } else if (tile.suit === 'sou') {
    // 索子: 1-9, 9の次は1
    const nextRank = tile.rank === 9 ? 1 : tile.rank + 1
    const result = 18 + nextRank - 1 // 18-26の範囲
    return result
  } else if (tile.suit === 'honor') {
    // 字牌: 東南西北白發中 (1-7) → (27-33)
    const honorOrder = [1, 2, 3, 4, 5, 6, 7] // rank
    const currentIndex = honorOrder.indexOf(tile.rank)
    const nextRank = honorOrder[(currentIndex + 1) % honorOrder.length]
    const result = 27 + nextRank - 1
    return result
  }
  
  return 0
}

// 牌を数値に変換
const convertTileToNumber = (tile: any) => {
  if (tile.suit === 'man') return tile.rank - 1
  if (tile.suit === 'pin') return tile.rank + 8
  if (tile.suit === 'sou') return tile.rank + 17
  if (tile.suit === 'honor') return tile.rank + 26
  return 0
}

// 横向き表示を判定する関数
const shouldTileBeYoko = (meld: Meld, tileIndex: number): boolean => {
  if (meld.type === 'chi') {
    // チーの場合、どのプレイヤーから鳴いたかに応じて横向きにする位置を決定
    // fromPlayer: 1=下家(右), 2=対面, 3=上家(左) from human player perspective
    switch (meld.fromPlayer) {
      case 1: // 右のプレイヤーからチー → 一番右の牌を横向き
        return tileIndex === meld.tiles.length - 1
      case 2: // 対面のプレイヤーからチー → 真ん中の牌を横向き
        return tileIndex === Math.floor(meld.tiles.length / 2)
      case 3: // 左のプレイヤーからチー → 一番左の牌を横向き
        return tileIndex === 0
      default:
        return false
    }
  } else if (meld.type === 'pon') {
    // ポンの場合、鳴いた牌を横向きにする
    const tile = meld.tiles[tileIndex]
    const isCalledTile = tile.id === meld.calledTile.id
    return isCalledTile
  } else if (meld.type === 'kan') {
    // カンの場合の横向き表示ルール
    if (meld.fromPlayer === 0) {
      // 暗槓の場合：横向きなし（1枚目と4枚目は裏向き）
      return false
    } else {
      // 明槓の場合：プレイヤーに応じて横向き位置を決定
      switch (meld.fromPlayer) {
        case 1: // 右からのミンカン → 4枚目を横向き
          return tileIndex === 3
        case 2: // 上からのミンカン → 3枚目を横向き  
          return tileIndex === 2
        case 3: // 左からのミンカン → 1枚目を横向き
          return tileIndex === 0
        default:
          return false
      }
    }
  }
  
  return false
}

// 裏向き表示を判定する関数
const shouldTileBeBack = (meld: Meld, tileIndex: number): boolean => {
  if (meld.type === 'kan' && meld.fromPlayer === 0) {
    // 暗槓の場合：1枚目と4枚目を裏向き
    return tileIndex === 0 || tileIndex === 3
  }
  return false
}
</script>

<style scoped>
.win-modal {
  max-height: 90vh;
  overflow-y: auto;
}

.win-title {
  background: linear-gradient(45deg, #ff6b6b, #feca57);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: bold;
  margin-bottom: 16px;
}

.winner-info {
  text-align: center;
  margin-bottom: 24px;
}

.winner-info h3 {
  color: #1976d2;
  font-size: 1.5rem;
}

.winning-tiles {
  margin-bottom: 24px;
}

.winning-tiles h4 {
  margin-bottom: 12px;
  color: #333;
}

.tiles-display {
  display: flex;
  align-items: center;
  gap: 16px;
  justify-content: center;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 8px;
  overflow-x: auto;
}

.hand-tiles {
  display: flex;
  flex-wrap: nowrap;
  gap: 2px;
}

.winning-tile-separate {
  margin-left: 8px;
  position: relative;
}

.score-info {
  margin-bottom: 24px;
}

.score-label {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 4px;
}

.score-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1976d2;
}

.yaku-list {
  margin-bottom: 24px;
}

.yaku-list h4 {
  margin-bottom: 12px;
  color: #333;
}

.yaku-han {
  font-weight: bold;
  color: #ff9800;
}

.total-han {
  text-align: center;
  font-weight: bold;
  font-size: 1.1rem;
  color: #1976d2;
  margin-top: 12px;
  padding: 8px;
  background: #e3f2fd;
  border-radius: 4px;
}

.dora-container {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.dora-info,
.uradora-info {
  flex: 1;
  min-width: 200px;
}

.dora-info h4,
.uradora-info h4 {
  margin-bottom: 8px;
  color: #333;
  text-align: center;
}

.dora-tiles,
.uradora-tiles {
  display: flex;
  gap: 4px;
  justify-content: center;
  margin-bottom: 8px;
}

.dora-count,
.uradora-count {
  text-align: center;
  font-weight: bold;
  color: #4caf50;
}

/* メルド表示 */
.melds-section {
  margin-bottom: 20px;
}

.melds-section h4 {
  margin-bottom: 12px;
  color: #333;
}

.melds-display {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.meld-group {
  display: flex;
  gap: 2px;
  padding: 8px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  align-items: flex-end; /* 下揃え */
}

/* スマホ用ボタンをデフォルトで非表示 */
.mobile-continue-button {
  display: none;
}

/* スマホ横画面向けレスポンシブ対応 */
@media screen and (max-width: 1024px) and (max-height: 600px) and (orientation: landscape) {
  /* ツモ・ロンタイトルを非表示 */
  .win-title {
    display: none !important;
  }
  
  /* 勝利プレイヤー情報を非表示 */
  .winner-info {
    display: none !important;
  }
  
  /* モーダルサイズ調整 */
  .win-modal {
    max-height: 95vh;
  }
  
  /* スマホ用ボタンを表示 */
  .mobile-continue-button {
    display: block !important;
    margin: 16px 0;
  }
}

/* より小さいスマホ向け（高さ480px以下） */
@media screen and (max-width: 768px) and (max-height: 480px) and (orientation: landscape) {
  /* ツモ・ロンタイトルを非表示（継承） */
  .win-title {
    display: none !important;
  }
  
  /* 勝利プレイヤー情報を非表示（継承） */
  .winner-info {
    display: none !important;
  }
  
  /* モーダルサイズ調整 */
  .win-modal {
    max-height: 98vh;
  }
  
  /* スマホ用ボタンを表示（継承） */
  .mobile-continue-button {
    display: block !important;
    margin: 12px 0;
  }
}
</style>