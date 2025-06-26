<script setup lang="ts">
// import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <v-app>
    <v-app-bar color="primary" dark>
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
</template>

<style>
/* Global styles */

/* 基本リセット */
* {
  box-sizing: border-box;
}

/* アプリ全体の基本設定 */
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  background-color: #f5f5f5;
}

/* #appの幅を画面の80%に設定 */
#app {
  width: 80%;
  height: 100%;
  margin: 0 auto;
  padding: 0;
  background-color: #f5f5f5;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

/* v-applicationを中央に配置 */
.v-application {
  width: 100% !important;
  max-width: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
  position: relative !important;
}

/* v-app要素の設定 */
.v-app {
  width: 100% !important;
  position: relative !important;
}

/* v-app-barを画面全幅に */
.v-app-bar {
  position: fixed !important;
  width: 100vw !important;
  left: 0 !important;
  right: 0 !important;
  top: 0 !important;
  margin: 0 !important;
  z-index: 9999 !important;
}

/* v-application__wrapの設定 */
.v-application__wrap {
  width: 100% !important;
  max-width: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
  min-height: 100vh;
  position: relative !important;
}

/* v-main の設定 */
.v-main {
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding: 0;
  padding-top: 64px; /* ヘッダー分の余白 */
}

.v-main > .v-main__wrap {
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding: 0;
}

/* 四人麻雀ビューの特別な設定 */
.four-player-game {
  width: 100%;
  height: calc(100vh - 64px);
  margin: 0;
  padding: 0;
}
</style>
