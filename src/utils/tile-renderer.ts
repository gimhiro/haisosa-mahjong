import type { Tile } from '../stores/fourPlayerMahjong'

// publicディレクトリのパスベース（本番では /haisosa-mahjong/、開発では /）
const getBasePath = (): string => {
  return import.meta.env.PROD ? '/haisosa-mahjong/' : '/'
}

/**
 * 牌から画像ファイル名を生成
 */
export function getTileImagePath(tile: Tile): string {
  const basePath = getBasePath()
  
  if (tile.suit === 'man') {
    return tile.isRed ? `${basePath}tiles/0m.png` : `${basePath}tiles/m${tile.rank}.png`
  } else if (tile.suit === 'pin') {
    return tile.isRed ? `${basePath}tiles/0p.png` : `${basePath}tiles/p${tile.rank}.png`
  } else if (tile.suit === 'sou') {
    return tile.isRed ? `${basePath}tiles/0s.png` : `${basePath}tiles/s${tile.rank}.png`
  } else { // honor
    if (tile.rank <= 4) {
      return `${basePath}tiles/w${tile.rank}.png` // 風牌
    } else {
      return `${basePath}tiles/d${tile.rank - 4}.png` // 三元牌 (5->1, 6->2, 7->3)
    }
  }
}

/**
 * 横向き牌の画像パスを取得（鳴き牌用）
 */
export function getTileImagePathYoko(tile: Tile): string {
  const basePath = getBasePath()
  
  if (tile.suit === 'man') {
    return tile.isRed ? `${basePath}tiles/0m-yoko.png` : `${basePath}tiles/m${tile.rank}-yoko.png`
  } else if (tile.suit === 'pin') {
    return tile.isRed ? `${basePath}tiles/0p-yoko.png` : `${basePath}tiles/p${tile.rank}-yoko.png`
  } else if (tile.suit === 'sou') {
    return tile.isRed ? `${basePath}tiles/0s-yoko.png` : `${basePath}tiles/s${tile.rank}-yoko.png`
  } else { // honor
    if (tile.rank <= 4) {
      return `${basePath}tiles/w${tile.rank}-yoko.png` // 風牌
    } else {
      return `${basePath}tiles/d${tile.rank - 4}-yoko.png` // 三元牌 (5->1, 6->2, 7->3)
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
    return `${getBasePath()}tiles/back.png` // 裏牌画像があれば使用、なければCSSで対応
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