// 環境変数管理ユーティリティ
export const isDevelopment = import.meta.env.VITE_APP_MODE === 'development'
export const isProduction = import.meta.env.VITE_APP_MODE === 'production'
export const isDebugEnabled = import.meta.env.VITE_ENABLE_DEBUG === 'true'

// デバッグ機能が有効かどうかを判定
export const isDebugMode = isDevelopment || isDebugEnabled

// 環境変数の値を取得
export const getEnvMode = () => import.meta.env.VITE_APP_MODE || 'development'

// コンソールログ用のヘルパー
export const debugLog = (...args: any[]) => {
  if (isDebugMode) {
    // デバッグモード時のみログ出力（本番環境では無効）
  }
}