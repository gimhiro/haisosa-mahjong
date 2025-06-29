<template>
  <v-dialog v-model="show" max-width="800px" persistent>
    <v-card>
      <v-card-title class="text-h6">
        テストモック設定
        <v-spacer />
        <v-btn icon="mdi-close" @click="cancel" />
      </v-card-title>
      
      <v-card-text>
        <div class="mb-4">
          <v-alert type="info" variant="tonal" density="compact">
            各プレイヤーの手牌とツモ牌を設定してください。牌は半角英数で入力（例: 1m 2m 3m 1p 2p 3p 1s 2s 3s ton）
          </v-alert>
        </div>

        <v-tabs v-model="activeTab" class="mb-4">
          <v-tab v-for="(player, index) in testData.players" :key="index">
            プレイヤー{{ index + 1 }}{{ index === 0 ? '(自分)' : '' }}
          </v-tab>
        </v-tabs>

        <v-tabs-window v-model="activeTab">
          <v-tabs-window-item v-for="(player, index) in testData.players" :key="index">
            <v-card variant="outlined" class="mb-4">
              <v-card-title class="text-subtitle-1">
                プレイヤー{{ index + 1 }}{{ index === 0 ? '(自分)' : '' }}
              </v-card-title>
              <v-card-text>
                <v-textarea
                  v-model="player.tilesInput"
                  label="手牌 (13枚または14枚)"
                  placeholder="例: 1m 2m 3m 4m 5m 6m 7m 8m 9m 1p 2p 3p 4p"
                  rows="3"
                  variant="outlined"
                  density="compact"
                  class="mb-3"
                />
                <v-textarea
                  v-model="player.drawTilesInput"
                  label="ツモ牌 (順番通り)"
                  placeholder="例: 5p 6p 7p 8p 9p ton nan sha pei"
                  rows="3"
                  variant="outlined"
                  density="compact"
                />
                <div class="mt-2">
                  <v-chip-group>
                    <v-chip size="small" variant="tonal">
                      手牌: {{ parseInput(player.tilesInput).length }}枚
                    </v-chip>
                    <v-chip size="small" variant="tonal">
                      ツモ牌: {{ parseInput(player.drawTilesInput).length }}枚
                    </v-chip>
                  </v-chip-group>
                </div>
              </v-card-text>
            </v-card>
          </v-tabs-window-item>
        </v-tabs-window>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn @click="cancel">キャンセル</v-btn>
        <v-btn @click="apply" color="primary" :disabled="!isValid">
          テストモード開始
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useGameSettings, type PlayerTestData } from '../utils/useGameSettings'

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'testModeApplied'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { settings, toggleTestMode, updateTestModeData } = useGameSettings()

const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const activeTab = ref(0)

interface PlayerInputData {
  tilesInput: string
  drawTilesInput: string
}

const testData = ref<{ players: PlayerInputData[] }>({
  players: [
    { tilesInput: '', drawTilesInput: '' },
    { tilesInput: '', drawTilesInput: '' },
    { tilesInput: '', drawTilesInput: '' },
    { tilesInput: '', drawTilesInput: '' }
  ]
})

// 牌文字列をパース
const parseInput = (input: string): string[] => {
  return input.trim().split(/\s+/).filter(tile => tile.length > 0)
}

// バリデーション
const isValid = computed(() => {
  return testData.value.players.every(player => {
    const tiles = parseInput(player.tilesInput)
    return tiles.length === 13 || tiles.length === 14
  })
})

// 設定を適用
const apply = () => {
  testData.value.players.forEach((player, index) => {
    const tilesData: PlayerTestData = {
      tiles: parseInput(player.tilesInput),
      drawTiles: parseInput(player.drawTilesInput)
    }
    updateTestModeData(index, tilesData)
  })
  
  // テストモードを有効化
  if (!settings.value.testMode.isActive) {
    toggleTestMode()
  }
  
  // ゲームが既に開始されている場合は、すぐに手牌を適用
  // 親コンポーネントにテストモード適用を通知
  emit('testModeApplied')
  
  show.value = false
}

const cancel = () => {
  show.value = false
}

// ダイアログが開かれた時にデフォルト値を設定
watch(show, (newValue) => {
  if (newValue) {
    // 既存の設定があれば復元
    testData.value.players.forEach((player, index) => {
      const existing = settings.value.testMode.players[index]
      player.tilesInput = existing.tiles.join(' ')
      player.drawTilesInput = existing.drawTiles.join(' ')
    })
    
    // デフォルト値を設定（空の場合）
    if (testData.value.players[0].tilesInput === '') {
      testData.value.players[0].tilesInput = '1m 1m 1m 1m 2m 3m 4m 5m 6m 7m 8m 9m 1p'
      testData.value.players[0].drawTilesInput = '5p 6p 7p 8p 9p'
      testData.value.players[1].tilesInput = '1m 2m 3m 1p 2p 3p 1s 2s 3s ton nan sha pei'
      testData.value.players[1].drawTilesInput = 'haku hatsu chun'
      testData.value.players[2].tilesInput = '1m 2m 3m 1p 2p 3p 1s 2s 3s ton nan sha pei'
      testData.value.players[2].drawTilesInput = 'haku hatsu chun'
      testData.value.players[3].tilesInput = '1m 2m 3m 1p 2p 3p 1s 2s 3s ton nan sha pei'
      testData.value.players[3].drawTilesInput = 'haku hatsu chun'
    }
  }
})
</script>

<style scoped>
.v-card-title {
  padding-bottom: 8px;
}

.v-tabs {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.v-tabs-window-item {
  padding-top: 16px;
}
</style>