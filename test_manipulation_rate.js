// 牌操作率のテスト用コード
// ブラウザのコンソールで実行して動作確認

// 1. 設定値を変更
localStorage.setItem('mahjong-game-settings', JSON.stringify({
  disableMeld: false,
  autoWin: false,
  showAcceptance: false,
  showAcceptanceHighlight: false,
  manipulationRate: 0, // 0%に設定
  handQuality: 'good',
  testMode: {
    isActive: false,
    players: [
      { tiles: [], drawTiles: [] },
      { tiles: [], drawTiles: [] },
      { tiles: [], drawTiles: [] },
      { tiles: [], drawTiles: [] }
    ]
  }
}));

console.log('設定を0%に変更しました。ページをリロードしてからゲームを開始してください。');

// 2. 設定値を確認
function checkManipulationRate() {
  const settings = localStorage.getItem('mahjong-game-settings');
  if (settings) {
    const parsed = JSON.parse(settings);
    console.log('現在の牌操作率:', parsed.manipulationRate + '%');
  }
}

// 3. 40%に変更するテスト
function setTo40Percent() {
  const settings = JSON.parse(localStorage.getItem('mahjong-game-settings') || '{}');
  settings.manipulationRate = 40;
  localStorage.setItem('mahjong-game-settings', JSON.stringify(settings));
  console.log('設定を40%に変更しました。ページをリロードしてからゲームを開始してください。');
}

// 4. 80%に戻すテスト
function setTo80Percent() {
  const settings = JSON.parse(localStorage.getItem('mahjong-game-settings') || '{}');
  settings.manipulationRate = 80;
  localStorage.setItem('mahjong-game-settings', JSON.stringify(settings));
  console.log('設定を80%に変更しました。ページをリロードしてからゲームを開始してください。');
}

// エクスポート
window.checkManipulationRate = checkManipulationRate;
window.setTo40Percent = setTo40Percent;
window.setTo80Percent = setTo80Percent;