<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import SettingsModal from './components/SettingsModal.vue'
import RecordsModal from './components/RecordsModal.vue'

const router = useRouter()
const showSettingsModal = ref(false)
const showRecordsModal = ref(false)

function goHome() {
  router.push('/')
}

function showSettings() {
  showSettingsModal.value = true
}

function showRecords() {
  showRecordsModal.value = true
}
</script>

<template>
  <v-app>
    <v-app-bar color="primary" dark>
      <v-app-bar-title>牌操作麻雀</v-app-bar-title>
      
      <v-spacer></v-spacer>
      
      <!-- ハンバーガーメニュー（右側） -->
      <v-menu offset-y location="bottom end" :close-on-content-click="true">
        <template v-slot:activator="{ props }">
          <v-btn icon v-bind="props" style="color: white;">
            <v-icon style="color: white;">mdi-menu</v-icon>
          </v-btn>
        </template>
        
        <v-list>
          <v-list-item @click="goHome">
            <template v-slot:prepend>
              <v-icon>mdi-home</v-icon>
            </template>
            <v-list-item-title>ホーム</v-list-item-title>
          </v-list-item>
          
          <v-list-item @click="showSettings">
            <template v-slot:prepend>
              <v-icon>mdi-cog</v-icon>
            </template>
            <v-list-item-title>現在の設定を確認</v-list-item-title>
          </v-list-item>
          
          <v-list-item @click="showRecords">
            <template v-slot:prepend>
              <v-icon>mdi-chart-line</v-icon>
            </template>
            <v-list-item-title>記録</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>
    
    <v-main>
      <RouterView />
    </v-main>

    <!-- 設定確認モーダル -->
    <SettingsModal v-model="showSettingsModal" />

    <!-- 記録モーダル -->
    <RecordsModal v-model="showRecordsModal" />
  </v-app>
</template>

<style>
/* Global styles */

/* ハンバーガーメニューアイコンの色修正 */
.v-app-bar .v-btn .v-icon {
  color: white !important;
}

.v-app-bar .v-btn {
  color: white !important;
}

.mdi-menu {
  color: white !important;
}

.v-app-bar .mdi {
  color: white !important;
}

/* メニュー項目のスペーシング調整 */
.v-list-item__prepend {
  padding-inline-end: 8px !important;
  margin-inline-end: 0 !important;
}

.v-list-item__prepend .v-icon {
  margin-inline-end: 0 !important;
  margin-right: 0 !important;
}

.v-list-item__spacer {
  width: 0 !important;
  min-width: 0 !important;
  flex: none !important;
}

/* メニューのリストアイテム全体の調整 */
.v-menu .v-list-item {
  padding-inline-start: 12px !important;
  padding-inline-end: 12px !important;
  max-width: 200px !important;
  width: auto !important;
}

.v-menu .v-list-item__content {
  padding-inline-start: 0 !important;
  max-width: 160px !important;
  width: auto !important;
}

.v-menu .v-list-item-title {
  max-width: 140px !important;
  width: auto !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

/* メニューの位置調整 - メニュー専用の制限 */
.v-menu .v-overlay__content {
  right: 0 !important;
  max-width: 200px !important;
  width: auto !important;
}

/* ダイアログのオーバーレイは900pxに設定 */
.v-dialog .v-overlay__content {
  max-width: 900px !important;
  width: 90vw !important;
}

/* 設定モーダルと記録モーダルの幅を確実に保証 */
.v-dialog .settings-modal,
.v-dialog .records-modal {
  max-width: 900px !important;
  width: 100% !important;
}

/* 全モーダルの幅を900pxに設定 */
.v-dialog .v-card.win-modal,
.v-dialog .v-card.draw-modal,
.v-dialog .v-card.game-end-modal,
.v-dialog .v-card.settings-modal,
.v-dialog .v-card.records-modal {
  max-width: 900px !important;
  width: 100% !important;
  min-width: 300px !important;
}

/* ドロップダウンメニューの右端揃え */
.v-menu .v-list {
  min-width: auto !important;
  width: auto !important;
  max-width: 200px !important;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
}

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
