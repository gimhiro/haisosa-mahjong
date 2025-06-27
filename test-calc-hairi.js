import { calc, Tile, Yaku } from 'riichi-rs-bundlers'

// テスト用の手牌（テンパイ手）
const testHand = [
  Tile.M1, Tile.M2, Tile.M3, // 123万の順子
  Tile.P4, Tile.P5, Tile.P6, // 456筒の順子
  Tile.S7, Tile.S8, Tile.S9, // 789索の順子
  Tile.East, Tile.East,      // 東の対子
  Tile.M4,                   // 4万待ちのテンパイ
]

console.log('=== 受け入れ計算テスト ===')

// 1. 通常の上がり判定のみ（calc_hairi: false）
const normalResult = calc({
  closed_part: testHand,
  open_part: [],
  options: {
    tile_discarded_by_someone: Tile.M4, // 4万ロン
    bakaze: Tile.East,
    jikaze: Tile.South,
    allow_kuitan: true,
  },
  calc_hairi: false
})

console.log('通常計算（calc_hairi: false）:')
console.log(JSON.stringify(normalResult, null, 2))

// 2. 受け入れ計算付き（calc_hairi: true）
const hairiResult = calc({
  closed_part: testHand,
  open_part: [],
  options: {
    tile_discarded_by_someone: Tile.M4, // 4万ロン
    bakaze: Tile.East,
    jikaze: Tile.South,
    allow_kuitan: true,
  },
  calc_hairi: true
})

console.log('\n受け入れ計算付き（calc_hairi: true）:')
console.log(JSON.stringify(hairiResult, null, 2))

// hairiプロパティの詳細を確認
if (hairiResult.hairi) {
  console.log('\n=== hairiプロパティの詳細 ===')
  console.log('現在のシャンテン数:', hairiResult.hairi.now)
  console.log('待ち牌:', hairiResult.hairi.wait)
  console.log('捨て牌後の待ち:')
  hairiResult.hairi.waits_after_discard.forEach(([discard, waits], index) => {
    console.log(`  ${index + 1}. 捨て牌 ${discard} → 待ち牌 [${waits.join(', ')}]`)
  })
}

// 3. テンパイでない手で受け入れ計算
const nonTenpaiHand = [
  Tile.M1, Tile.M2, Tile.M3, // 123万の順子
  Tile.P4, Tile.P5, Tile.P6, // 456筒の順子
  Tile.S7, Tile.S8,          // 78索の搭子
  Tile.East, Tile.East,      // 東の対子
  Tile.M9, Tile.P1, Tile.S1  // バラバラ
]

console.log('\n=== 非テンパイ手の受け入れ計算 ===')

const nonTenpaiHairiResult = calc({
  closed_part: nonTenpaiHand,
  open_part: [],
  options: {
    tile_discarded_by_someone: -1, // ツモ
    bakaze: Tile.East,
    jikaze: Tile.South,
    allow_kuitan: true,
  },
  calc_hairi: true
})

console.log('非テンパイ手の結果:')
console.log(JSON.stringify(nonTenpaiHairiResult, null, 2))

if (nonTenpaiHairiResult.hairi) {
  console.log('\n=== 非テンパイ手のhairi詳細 ===')
  console.log('現在のシャンテン数:', nonTenpaiHairiResult.hairi.now)
  console.log('待ち牌（受け入れ）:', nonTenpaiHairiResult.hairi.wait)
  console.log('捨て牌後の受け入れ:')
  nonTenpaiHairiResult.hairi.waits_after_discard.forEach(([discard, waits], index) => {
    console.log(`  ${index + 1}. 捨て牌 ${discard} → 受け入れ [${waits.join(', ')}]`)
  })
}