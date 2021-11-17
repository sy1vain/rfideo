export async function createPlayer({ idleVideo }) {
  const player = new OMXPlayer({ idleVideo })

  await player.init()

  return player
}

import OMXConductor from 'omxconductor'

export class OMXPlayer {
  #idleVideo
  #idlePlayer
  #player

  constructor({ idleVideo }) {
    this.#idleVideo = idleVideo
  }

  async init() {
    if (this.#idleVideo) {
      const player = (this.#idlePlayer = new OMXConductor(this.#idleVideo, {
        loop: true,
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

    const player = (this.#player = new OMXConductor(fileOrUrl, {
      layer,
      loop: false,
      ...options,
    }))

    player.on('close', async () => {
      if (player != this.#player) return
      this.#player = null
      if (this.#idlePlayer) await this.#idlePlayer.resume()
    })

    await player.open()

    if (prevPlayer) {
      try {
        await prevPlayer.stop()
      } catch (e) {}
    }

    if (this.#idlePlayer) {
      await this.#idlePlayer.pause()
      await this.#idlePlayer.seekAbsolute(0)
    }
  }
}
