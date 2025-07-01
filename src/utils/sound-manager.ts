// 音声再生管理クラス
export class SoundManager {
  private static audioCache: Map<string, HTMLAudioElement> = new Map()
  private static isMuted: boolean = false
  
  // publicディレクトリのパスベース（本番では /haisosa-mahjong/、開発では /）
  private static get basePath(): string {
    return import.meta.env.PROD ? '/haisosa-mahjong/' : '/'
  }
  
  /**
   * 音声ファイルを事前にロードしてキャッシュ
   */
  static preloadSounds() {
    const sounds = [
      { key: 'dahai', path: `${this.basePath}sound/dahai.mp3` },
      { key: 'riichi', path: `${this.basePath}sound/dahai_2.mp3` }
    ]
    
    sounds.forEach(({ key, path }) => {
      const audio = new Audio(path)
      audio.preload = 'auto'
      this.audioCache.set(key, audio)
    })
  }
  
  /**
   * 音声を再生
   */
  static playSound(soundKey: string, volume: number = 0.3) {
    // ミュート中は音声を再生しない
    if (this.isMuted) {
      return
    }
    
    try {
      let audio = this.audioCache.get(soundKey)
      
      if (!audio) {
        // キャッシュにない場合は新規作成
        const soundPaths: Record<string, string> = {
          'dahai': `${this.basePath}sound/dahai.mp3`,
          'riichi': `${this.basePath}sound/dahai_2.mp3`
        }
        
        if (soundPaths[soundKey]) {
          audio = new Audio(soundPaths[soundKey])
          this.audioCache.set(soundKey, audio)
        } else {
          console.warn(`Unknown sound key: ${soundKey}`)
          return
        }
      }
      
      // 音量設定
      audio.volume = Math.max(0, Math.min(1, volume))
      
      // 既に再生中の場合は一旦停止してリセット
      if (!audio.paused) {
        audio.pause()
        audio.currentTime = 0
      }
      
      // 再生
      const playPromise = audio.play()
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn('Sound play failed:', error)
        })
      }
    } catch (error) {
      console.warn('Sound playback error:', error)
    }
  }
  
  /**
   * 打牌音を再生
   */
  static playDiscardSound() {
    this.playSound('dahai')
  }
  
  /**
   * リーチ宣言音を再生
   */
  static playRiichiSound() {
    this.playSound('dahai')
  }

  /**
   * ミュート状態を切り替え
   */
  static toggleMute(): boolean {
    this.isMuted = !this.isMuted
    return this.isMuted
  }

  /**
   * ミュート状態を取得
   */
  static isMutedState(): boolean {
    return this.isMuted
  }

  /**
   * ミュート状態を設定
   */
  static setMute(muted: boolean): void {
    this.isMuted = muted
  }
}