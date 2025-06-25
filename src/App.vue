<script setup lang="ts">
// import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="global-container">
    <v-app class="app-container">
      <v-app-bar color="primary" dark class="global-header">
        <v-app-bar-title>麻雀アプリ - 80% 有効牌ツモ</v-app-bar-title>
        
        <v-spacer></v-spacer>
        
        <v-btn to="/" text>
          <v-icon start>mdi-home</v-icon>
          ホーム
        </v-btn>
        
        <v-btn to="/game" text>
          <v-icon start>mdi-cards-playing</v-icon>
          1人用
        </v-btn>
        
        <v-btn to="/four-player" text>
          <v-icon start>mdi-account-group</v-icon>
          4人対戦
        </v-btn>
      </v-app-bar>
      
      <v-main>
        <RouterView />
      </v-main>
    </v-app>
  </div>
</template>

<style>
/* Global styles */

/* アプリ全体の基本設定 */
html, body {
  margin: 0;
  padding: 0;
  width: 100vw;
  height: 100vh;
  overflow-x: hidden;
  background-color: #f5f5f5;
}

#app {
  margin: 0 !important;
  padding: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  background-color: #f5f5f5;
}

/* グローバルコンテナ */
.global-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #f5f5f5;
}

/* グローバルヘッダー */
.global-header {
  width: 100vw !important;
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  z-index: 1000 !important;
}

/* v-app の設定 */
.app-container {
  width: 70vw !important;
  max-width: 70vw !important;
  height: calc(100vh - 64px) !important;
  margin-top: 64px !important;
  background-color: white;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
}

/* v-main の設定 */
.v-main {
  width: 100vw !important;
  max-width: 100vw !important;
  margin: 0 !important;
  padding: 0 !important;
}

.v-main > .v-main__wrap {
  width: 100vw !important;
  max-width: 100vw !important;
  margin: 0 !important;
  padding: 0 !important;
}

/* コンテナの設定 */
.v-container {
  max-width: 100vw !important;
  width: 100vw !important;
  margin: 0 !important;
  padding: 0 !important;
}

/* レスポンシブ対応 */
@media (max-width: 1024px) {
  .app-container {
    width: 85vw !important;
    max-width: 85vw !important;
  }
  
  .global-header {
    margin-left: -7.5vw !important;
  }
}

@media (max-width: 768px) {
  .app-container {
    width: 95vw !important;
    max-width: 95vw !important;
  }
  
  .global-header {
    margin-left: -2.5vw !important;
  }
}

@media (max-width: 480px) {
  .app-container {
    width: 100vw !important;
    max-width: 100vw !important;
  }
  
  .global-header {
    margin-left: 0 !important;
  }
}
</style>
