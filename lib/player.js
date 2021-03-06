import isPi from 'detect-rpi'
import OMXConductor from 'omxconductor'
import { logError } from './console.js'

export async function createPlayer({ idleVideo, omxFlags }) {
  if (!isPi()) return new DummyPlayer({ idleVideo })

  const player = new OMXPlayer({ idleVideo, omxFlags })
  try {
    await player.init()
  } catch (e) {
    logError(e)
  }
  return player
}

export class DummyPlayer {
  constructor() {}
  async init() {}
  async play() {}
  async stop() {}
}

export class OMXPlayer {
  #idleVideo
  #idlePlayer
  #player
  #omxFlags

  constructor({ idleVideo, omxFlags }) {
    this.#idleVideo = idleVideo
    this.#omxFlags = omxFlags
  }

  async init() {
    if (this.#idleVideo) {
      const player = (this.#idlePlayer = new OMXConductor(this.#idleVideo, {
        loop: true,
        audioOutput: 'hdmi',
        otherOmxFlags: this.#omxFlags,
      }))
      await player.open()
    }
  }

  async play(fileOrUrl, options = {}) {
    if (this.#player && (await this.#player.getIsPlaying())) {
      if (this.#player.fileOrUrl == fileOrUrl) return //already playing
    }

    const prevPlayer = this.#player

    const layer = prevPlayer ? +prevPlayer.settings.layer + 1 : 2

    const player = new OMXConductor(fileOrUrl, {
      layer,
      loop: false,
      audioOutput: 'hdmi',
      otherOmxFlags: this.#omxFlags,
      ...options,
    })

    player.on('close', async () => {
      if (player != this.#player) return
      this.#player = null
      if (this.#idlePlayer) await this.#idlePlayer.resume()
    })

    player.on('error', () => {})

    await player.open()

    if (prevPlayer) {
      try {
        await prevPlayer.stop()
      } catch (e) {}
    }

    this.#player = player

    if (this.#idlePlayer) {
      await this.#idlePlayer.pause()
      await this.#idlePlayer.seekAbsolute(0)
    }
  }

  async stop() {
    if (this.#idlePlayer) {
      try {
        await this.#idlePlayer.stop()
      } catch (e) {}
    }
    this.#idlePlayer = null

    if (this.#player) {
      try {
        await this.#player.stop()
      } catch (e) {}
    }
    this.#player = null
  }
}
