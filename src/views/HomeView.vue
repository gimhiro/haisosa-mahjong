<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function startSingleGame() {
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
            80% 有効牌ツモシステム
          </v-card-subtitle>
          
          <v-card-text>
            <div class="feature-list">
              <v-list>
                <v-list-item>
                  <template #prepend>
                    <v-icon color="success">mdi-check-circle</v-icon>
                  </template>
                  <v-list-item-title>80% の確率で有効牌をツモ</v-list-item-title>
                  <v-list-item-subtitle>進行をサポートする独自のシステム</v-list-item-subtitle>
                </v-list-item>
                
                <v-list-item>
                  <template #prepend>
                    <v-icon color="info">mdi-calculator</v-icon>
                  </template>
                  <v-list-item-title>リアルタイムシャンテン計算</v-list-item-title>
                  <v-list-item-subtitle>syanten ライブラリで正確な計算</v-list-item-subtitle>
                </v-list-item>
                
                <v-list-item>
                  <template #prepend>
                    <v-icon color="warning">mdi-drag</v-icon>
                  </template>
                  <v-list-item-title>直感的な操作</v-list-item-title>
                  <v-list-item-subtitle>ドラッグ＆ドロップで簡単操作</v-list-item-subtitle>
                </v-list-item>
                
                <v-list-item>
                  <template #prepend>
                    <v-icon color="primary">mdi-web</v-icon>
                  </template>
                  <v-list-item-title>GitHub Pages 対応</v-list-item-title>
                  <v-list-item-subtitle>ブラウザでどこでもプレイ可能</v-list-item-subtitle>
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
                @click="startSingleGame"
                class="mb-2"
              >
                <v-icon start>mdi-account</v-icon>
                1人用ゲーム
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
                  <h3>ゲーム選択</h3>
                  <p>1人用ゲームまたは4人対戦を選択してゲームを開始します。</p>
                </div>
              </v-col>
              
              <v-col cols="12" md="4">
                <div class="instruction-step">
                  <v-icon size="48" color="success">mdi-numeric-2-circle</v-icon>
                  <h3>ツモと打牌</h3>
                  <p>「ツモ」ボタンで牌を引き、不要な牌をクリックして捨てます。</p>
                </div>
              </v-col>
              
              <v-col cols="12" md="4">
                <div class="instruction-step">
                  <v-icon size="48" color="warning">mdi-numeric-3-circle</v-icon>
                  <h3>4人対戦</h3>
                  <p>3人のCPUと対戦し、本格的な麻雀を楽しめます。</p>
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
