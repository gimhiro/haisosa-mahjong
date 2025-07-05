# 麻雀シャンテン計算ライブラリ JavaScript API リファレンス

このドキュメントは、WebAssemblyにコンパイルされた麻雀シャンテン計算ライブラリのJavaScript APIリファレンスです。

## 目次
1. [初期化](#初期化)
2. [シャンテン計算関数](#シャンテン計算関数)
3. [受け入れ牌計算関数](#受け入れ牌計算関数)
4. [ユーティリティ関数](#ユーティリティ関数)
5. [データ構造](#データ構造)
6. [13-3n枚対応について](#13-3n枚対応について)
7. [注意事項](#注意事項)

---

## 初期化

WebAssemblyモジュールを使用する前に初期化が必要です。

```javascript
import init, { 
    calc_shanten, 
    calc_acceptance,
    tile_to_string 
} from './pkg/mahjong_calculator_rs.js';

// 初期化
await init();

// 以降、各関数が使用可能
```

---

## シャンテン計算関数

### `calc_shanten`
麻雀の手牌に対してシャンテン数を計算します（一般形・七対子・国士無双を考慮）。

```typescript
function calc_shanten(tiles: Uint8Array): number
```

#### パラメータ
- `tiles`: 34要素のUint8Array。各要素は該当する牌の枚数（0-4）
  - [0-8]: 1-9萬
  - [9-17]: 1-9筒
  - [18-26]: 1-9索
  - [27-33]: 東南西北白發中

#### 戻り値
- シャンテン数（-1: 和了形、0: 聴牌、1: 1シャンテン...、8: エラー）

#### 使用例
```javascript
// 手牌を作成（123456789m111p11s）
const tiles = new Uint8Array(34);
// 萬子 1-9
for (let i = 0; i < 9; i++) tiles[i] = 1;
// 筒子 1×3
tiles[9] = 3;
// 索子 1×2
tiles[18] = 2;

const shanten = calc_shanten(tiles);
console.log(`シャンテン数: ${shanten}`); // -1（和了形）
```

---

### `calc_shanten_general`
通常の面子手のみでシャンテン数を計算します（七対子・国士無双を除外）。

```typescript
function calc_shanten_general(tiles: Uint8Array): number
```

#### パラメータ
- `tiles`: `calc_shanten`と同じ

#### 戻り値
- 一般形のみのシャンテン数

#### 使用例
```javascript
const shanten = calc_shanten_general(tiles);
console.log(`一般形シャンテン数: ${shanten}`);
```

---

## 受け入れ牌計算関数

### `calc_acceptance`
手牌に対して受け入れ牌を計算します。

```typescript
function calc_acceptance(tiles: Uint8Array): AcceptanceResultJS
```

#### パラメータ
- `tiles`: 34要素のUint8Array（13-3n枚または14枚の手牌に対応）
  - 対応枚数: 1, 4, 7, 10, 13, 14枚

#### 戻り値
- `AcceptanceResultJS`: 受け入れ牌の情報を含むオブジェクト

#### 使用例
```javascript
// 13枚の手牌を設定
const tiles = new Uint8Array(34);
// ... 手牌を設定 ...

const result = calc_acceptance(tiles);
console.log(`現在${result.current_shanten}シャンテン`);

// 受け入れ牌を表示
const acceptanceTiles = result.acceptance_tiles;
const acceptanceShanten = result.acceptance_shanten;

for (let i = 0; i < acceptanceTiles.length; i++) {
    const tileName = tile_to_string(acceptanceTiles[i]);
    console.log(`${tileName}をツモると${acceptanceShanten[i]}シャンテン`);
}

// メモリを解放（重要）
result.free();
```

#### 13-3n枚対応の使用例
```javascript
// 10枚の手牌（1メンツ完成済み）
const tiles10 = new Uint8Array(34);
tiles10[3] = 1; tiles10[5] = 1;        // 4m, 6m
tiles10[13] = 1; tiles10[14] = 1; tiles10[15] = 1; // 5p, 6p, 7p
tiles10[18] = 1; tiles10[20] = 1;      // 1s, 3s
tiles10[27] = 3;                       // 1z×3（東の刻子）

const result10 = calc_acceptance(tiles10);
console.log(`10枚手牌: ${result10.current_shanten}シャンテン`);
console.log(`受け入れ牌: ${get_acceptance_string_js(tiles10)}`);
result10.free();
```

---

### `get_acceptance_string_js`
受け入れ牌をスペース区切りの文字列で取得します。

```typescript
function get_acceptance_string_js(tiles: Uint8Array): string
```

#### パラメータ
- `tiles`: 34要素のUint8Array（13-3n枚または14枚対応）

#### 戻り値
- 受け入れ牌の文字列（例: "1m 4m 7p 1s"）、受け入れ牌がない場合は"なし"

#### 使用例
```javascript
const acceptanceStr = get_acceptance_string_js(tiles);
console.log(`受け入れ牌: ${acceptanceStr}`);
```

---

## ユーティリティ関数

### `tile_to_string`
牌のインデックスを文字列表現に変換します。

```typescript
function tile_to_string(index: number): string
```

#### パラメータ
- `index`: 0-33の牌インデックス

#### 戻り値
- 牌の文字列表現（例: "1m", "9p", "1z"）

#### 使用例
```javascript
console.log(tile_to_string(0));   // "1m"
console.log(tile_to_string(18));  // "1s"
console.log(tile_to_string(27));  // "1z"（東）
```

---

## データ構造

### `AcceptanceResultJS`
受け入れ牌計算の結果を格納するクラス。

```typescript
class AcceptanceResultJS {
    readonly current_shanten: number;        // 現在のシャンテン数
    readonly acceptance_tiles: Uint8Array;   // 受け入れ牌のインデックス
    readonly acceptance_shanten: Int8Array;  // 各受け入れ牌での新シャンテン数
    
    free(): void;  // メモリ解放（使用後は必ず呼び出す）
}
```

#### 注意事項
- WebAssemblyのメモリ管理のため、使用後は必ず`free()`を呼び出してください

---

## 牌配列のインデックス対応表

| インデックス | 牌 | インデックス | 牌 | インデックス | 牌 |
|------------|---|------------|---|------------|---|
| 0-8 | 1-9萬 | 9-17 | 1-9筒 | 18-26 | 1-9索 |
| 27 | 東 | 28 | 南 | 29 | 西 |
| 30 | 北 | 31 | 白 | 32 | 發 |
| 33 | 中 | | | | |

---

## 完全な使用例

```javascript
import init, { 
    calc_shanten, 
    calc_acceptance,
    tile_to_string,
    get_acceptance_string_js 
} from './pkg/mahjong_calculator_rs.js';

async function main() {
    // WASMモジュールを初期化
    await init();
    
    // 手牌を設定（1128m68p2349s1237z）
    const tiles = new Uint8Array(34);
    tiles[0] = 2;  // 1m×2
    tiles[1] = 1;  // 2m×1
    tiles[7] = 1;  // 8m×1
    tiles[14] = 1; // 6p×1
    tiles[16] = 1; // 8p×1
    tiles[19] = 1; // 2s×1
    tiles[20] = 1; // 3s×1
    tiles[21] = 1; // 4s×1
    tiles[26] = 1; // 9s×1
    tiles[27] = 1; // 東×1
    tiles[28] = 1; // 南×1
    tiles[29] = 1; // 西×1
    tiles[33] = 1; // 中×1
    
    // シャンテン数を計算
    const shanten = calc_shanten(tiles);
    console.log(`シャンテン数: ${shanten}`);
    
    // 受け入れ牌を計算
    const result = calc_acceptance(tiles);
    const acceptanceStr = get_acceptance_string_js(tiles);
    
    console.log(`受け入れ牌: ${acceptanceStr}`);
    console.log(`受け入れ種類数: ${result.acceptance_tiles.length}`);
    
    // メモリを解放
    result.free();
}

main();
```

---

## 13-3n枚対応について

このライブラリは、通常の13枚・14枚の手牌に加えて、**13-3n枚**（n個のメンツが既に完成している状態）の受け入れ牌計算に対応しています。

### 対応枚数と想定状況

| 枚数 | 完成メンツ数 | 想定状況 |
|------|-------------|----------|
| 14枚 | 0個 | 和了形チェック |
| 13枚 | 0個 | 通常の手牌 |
| 10枚 | 1個 | 1メンツポン/チー済み |
| 7枚  | 2個 | 2メンツポン/チー済み |
| 4枚  | 3個 | 3メンツポン/チー済み |
| 1枚  | 4個 | 4メンツ完成、雀頭のみ |

### シャンテン計算の仕組み

13-3n枚の手牌では、**仮想メンツ**を追加してシャンテン計算を行います：

```
仮想メンツ数 = (14 - 手牌枚数) / 3
```

例：10枚の手牌の場合
- 仮想メンツ数 = (14 - 10) / 3 = 1個
- 手牌の実メンツ + 仮想メンツ1個でシャンテン計算

### 実用例

```javascript
// ポン・チー済みの手牌計算例
const tiles7 = new Uint8Array(34);
tiles7[3] = 1; tiles7[5] = 1;        // 4m, 6m（搭子）
tiles7[13] = 1; tiles7[14] = 1; tiles7[15] = 1; // 567p（順子）
tiles7[18] = 1; tiles7[19] = 1;      // 12s（搭子）

// 7枚なので2メンツ既に完成している前提
const result = calc_acceptance(tiles7);
console.log(`7枚手牌: ${result.current_shanten}シャンテン`);
console.log(`受け入れ牌: ${get_acceptance_string_js(tiles7)}`);
result.free();
```

---

## 注意事項

1. **配列サイズ**: tiles配列は必ず34要素のUint8Arrayである必要があります
2. **手牌枚数**: 
   - シャンテン計算: 13枚未満でも対応（仮想メンツ計算）
   - 受け入れ牌計算: 13-3n枚（1, 4, 7, 10, 13, 14枚）に対応
3. **13-3n枚での計算**: nメンツが既に完成している前提で計算
   - 10枚: 1メンツ完成済み
   - 7枚: 2メンツ完成済み
   - 4枚: 3メンツ完成済み
   - 1枚: 4メンツ完成済み（雀頭のみ）
4. **牌の枚数**: 各牌は最大4枚まで
5. **メモリ管理**: `AcceptanceResultJS`使用後は必ず`free()`を呼び出してください
6. **初期化**: 関数を使用する前に必ず`init()`を呼び出してください
7. **文字列表記**: 萬=m、筒=p、索=s、字牌=z