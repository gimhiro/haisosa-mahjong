import type { Tile } from '../stores/fourPlayerMahjong'

/**
 * 牌から画像ファイル名を生成
 */
export function getTileImagePath(tile: Tile): string {
  if (tile.suit === 'man') {
    return tile.isRed ? '/src/assets/tiles/0m.png' : `/src/assets/tiles/m${tile.rank}.png`
  } else if (tile.suit === 'pin') {
    return tile.isRed ? '/src/assets/tiles/0p.png' : `/src/assets/tiles/p${tile.rank}.png`
  } else if (tile.suit === 'sou') {
    return tile.isRed ? '/src/assets/tiles/0s.png' : `/src/assets/tiles/s${tile.rank}.png`
  } else { // honor
    if (tile.rank <= 4) {
      return `/src/assets/tiles/w${tile.rank}.png` // 風牌
    } else {
      return `/src/assets/tiles/d${tile.rank - 4}.png` // 三元牌 (5->1, 6->2, 7->3)
    }
  }
}

/**
 * 横向き牌の画像パスを取得（鳴き牌用）
 */
export function getTileImagePathYoko(tile: Tile): string {
  if (tile.suit === 'man') {
    return tile.isRed ? '/src/assets/tiles/0m-yoko.png' : `/src/assets/tiles/m${tile.rank}-yoko.png`
  } else if (tile.suit === 'pin') {
    return tile.isRed ? '/src/assets/tiles/0p-yoko.png' : `/src/assets/tiles/p${tile.rank}-yoko.png`
  } else if (tile.suit === 'sou') {
    return tile.isRed ? '/src/assets/tiles/0s-yoko.png' : `/src/assets/tiles/s${tile.rank}-yoko.png`
  } else { // honor
    if (tile.rank <= 4) {
      return `/src/assets/tiles/w${tile.rank}-yoko.png` // 風牌
    } else {
      return `/src/assets/tiles/d${tile.rank - 4}-yoko.png` // 三元牌 (5->1, 6->2, 7->3)
    }
  }
}

/**
 * 牌の画像URLを取得（裏牌・横向き対応）
 */
export function getTileImageUrl(tile: Tile, options: {
  isBack?: boolean
  isYoko?: boolean
} = {}): string {
  const { isBack = false, isYoko = false } = options
  
  if (isBack) {
    // 裏牌の場合は固定の画像またはCSS背景を使用
    return '/src/assets/tiles/back.png' // 裏牌画像があれば使用、なければCSSで対応
  }
  
  if (isYoko) {
    return getTileImagePathYoko(tile)
  }
  
  return getTileImagePath(tile)
}

/**
 * 牌のテキストを取得（表示用）
 */
export function getTileText(tile: Tile): string {
  if (tile.suit === 'man') return `${tile.rank}萬`
  if (tile.suit === 'pin') return `${tile.rank}筒`
  if (tile.suit === 'sou') return `${tile.rank}索`
  
  const honorMap = ['', '東', '南', '西', '北', '白', '發', '中']
  return honorMap[tile.rank] || '?'
}