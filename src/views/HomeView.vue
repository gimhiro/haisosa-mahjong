<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function startUkeireDemo() {
  router.push('/game')
}

function startFourPlayerGame() {
  router.push('/four-player')
}
</script>

<template>
  <v-container class="home-view">
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card class="welcome-card" elevation="8">
          <v-card-title class="text-h3 text-center">
            麻雀アプリ
          </v-card-title>
          
          <v-card-subtitle class="text-h6 text-center">
            riichi-rs-bundlers 受け入れ計算デモ
          </v-card-subtitle>
          
          <v-card-text>
            <div class="feature-list">
              <v-list>
                <v-list-item>
                  <template #prepend>
                    <v-icon color="success">mdi-calculator-variant</v-icon>
                  </template>
                  <v-list-item-title>受け入れ計算デモ</v-list-item-title>
                  <v-list-item-subtitle>2シャンテンからの受け入れ枚数を計算</v-list-item-subtitle>
                </v-list-item>
                
                <v-list-item>
                  <template #prepend>
                    <v-icon color="info">mdi-code-braces</v-icon>
                  </template>
                  <v-list-item-title>riichi-rs-bundlers 使用</v-list-item-title>
                  <v-list-item-subtitle>Rust製の高速・高精度な麻雀ライブラリ</v-list-item-subtitle>
                </v-list-item>
                
                <v-list-item>
                  <template #prepend>
                    <v-icon color="warning">mdi-hand-pointing-up</v-icon>
                  </template>
                  <v-list-item-title>手牌編集機能</v-list-item-title>
                  <v-list-item-subtitle>クリックで手牌を変更して受け入れを確認</v-list-item-subtitle>
                </v-list-item>
                
                <v-list-item>
                  <template #prepend>
                    <v-icon color="primary">mdi-chart-line</v-icon>
                  </template>
                  <v-list-item-title>捨て牌候補分析</v-list-item-title>
                  <v-list-item-subtitle>各捨て牌ごとの次巻受け入れを表示</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </div>
          </v-card-text>
          
          <v-card-actions class="justify-center pb-6">
            <div class="game-mode-buttons">
              <v-btn
                color="primary"
                size="large"
                elevation="2"
                @click="startUkeireDemo"
                class="mb-2"
              >
                <v-icon start>mdi-calculator-variant</v-icon>
                受け入れ計算デモ
              </v-btn>
              
              <v-btn
                color="secondary"
                size="large"
                elevation="2"
                @click="startFourPlayerGame"
              >
                <v-icon start>mdi-account-group</v-icon>
                4人対戦
              </v-btn>
            </div>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    
    <v-row justify="center" class="mt-8">
      <v-col cols="12" md="10">
        <v-card class="info-card">
          <v-card-title>使い方</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="4">
                <div class="instruction-step">
                  <v-icon size="48" color="primary">mdi-numeric-1-circle</v-icon>
                  <h3>デモ選択</h3>
                  <p>受け入れ計算デモまたは4人対戦を選択します。</p>
                </div>
              </v-col>
              
              <v-col cols="12" md="4">
                <div class="instruction-step">
                  <v-icon size="48" color="success">mdi-numeric-2-circle</v-icon>
                  <h3>手牌編集</h3>
                  <p>デモでは牌をクリックして手牌を編集し、受け入れを計算できます。</p>
                </div>
              </v-col>
              
              <v-col cols="12" md="4">
                <div class="instruction-step">
                  <v-icon size="48" color="warning">mdi-numeric-3-circle</v-icon>
                  <h3>分析結果</h3>
                  <p>向聽数、待ち牌、捨て牌候補ごとの受け入れ枚数が表示されます。</p>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.home-view {
  width: 100vw;
  min-height: calc(100vh - 64px);
  margin: 0;
  padding: 1rem 0;
  background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
}

.welcome-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

.feature-list {
  margin: 1rem 0;
}

.info-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(5px);
}

.instruction-step {
  text-align: center;
  padding: 1rem;
}

.instruction-step h3 {
  margin: 0.5rem 0;
  color: #1976d2;
}

.instruction-step p {
  color: #666;
  line-height: 1.6;
}

.game-mode-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}
</style>
