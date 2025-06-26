const { calculateShanten, checkWinCondition } = require('./src/utils/mahjong-logic.ts')

// 111222333444m11p（確実に上がりの手）
const winningTiles = [
  { id: 'm1-1', suit: 'man', rank: 1, isRed: false },
  { id: 'm1-2', suit: 'man', rank: 1, isRed: false },
  { id: 'm1-3', suit: 'man', rank: 1, isRed: false },
  { id: 'm2-1', suit: 'man', rank: 2, isRed: false },
  { id: 'm2-2', suit: 'man', rank: 2, isRed: false },
  { id: 'm2-3', suit: 'man', rank: 2, isRed: false },
  { id: 'm3-1', suit: 'man', rank: 3, isRed: false },
  { id: 'm3-2', suit: 'man', rank: 3, isRed: false },
  { id: 'm3-3', suit: 'man', rank: 3, isRed: false },
  { id: 'm4-1', suit: 'man', rank: 4, isRed: false },
  { id: 'm4-2', suit: 'man', rank: 4, isRed: false },
  { id: 'm4-3', suit: 'man', rank: 4, isRed: false },
  { id: 'p1-1', suit: 'pin', rank: 1, isRed: false },
  { id: 'p1-2', suit: 'pin', rank: 1, isRed: false }
]

console.log('Testing winning hand (14 tiles):')
console.log('Tiles:', winningTiles.map(t => t.suit + t.rank).join(' '))
console.log('Length:', winningTiles.length)

const shanten = calculateShanten(winningTiles)
console.log('Shanten result:', shanten)

// 13枚の手牌でのテンパイ判定
const handTiles = winningTiles.slice(0, 13)
const tsumoTile = winningTiles[13]

console.log('\nTesting 13 tiles + tsumo:')
console.log('Hand tiles (13):', handTiles.map(t => t.suit + t.rank).join(' '))
console.log('Tsumo tile:', tsumoTile.suit + tsumoTile.rank)

const handShanten = calculateShanten(handTiles)
console.log('Hand shanten:', handShanten)

const winResult = checkWinCondition(winningTiles, tsumoTile, true, false, [], [])
console.log('Win result:', winResult)