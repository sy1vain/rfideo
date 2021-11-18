import delay from 'delay'
import isPi from 'detect-rpi'

export async function createReader({
  clock = 23,
  mosi = 19,
  miso = 21,
  client = 24,
  reset = 22,
  block_start = 4,
  block_end = 6,
} = {}) {
  if (!isPi()) return null

  const { default: SoftSPI } = await import('rpi-softspi')
  const { default: Rc522 } = await import('rc522-rpi')

  const reader = new Rc522(
    new SoftSPI({ clock, mosi, miso, client })
  ).setResetPin(reset)
  return new RFIDReader({ reader, block_start, block_end })
}

class RFIDReader {
  #reader
  #block_start
  #block_end

  constructor({ reader, block_start = 4, block_end = 9 }) {
    this.#reader = reader
    this.#block_start = block_start
    this.#block_end = block_end
  }

  async readString({ retries, uid } = {}) {
    uid = uid || (await this.findUID(retries))

    if (!uid) return null

    const reader = this.#reader
    const memoryCapacity = reader.selectCard(uid)
    const key = [0xff, 0xff, 0xff, 0xff, 0xff, 0xff]

    let bytes = []
    for (let block = this.#block_start; block <= this.#block_end; block++) {
      if (!reader.authenticate(block, key, uid)) return null
      bytes = bytes.concat(reader.getDataForBlock(block))
    }

    reader.stopCrypto()

    if (bytes.includes(0)) bytes = bytes.slice(0, bytes.indexOf(0))

    const data = String.fromCharCode(...bytes).trim()

    return data
  }

  async writeString({ data, retries, uid }) {
    uid = uid || (await this.findUID(retries))

    if (!uid) return false

    const reader = this.#reader
    const bytes = Array.from(data).map((c) =>
      c.charCodeAt ? c.charCodeAt(0) : +c
    )

    const memoryCapacity = reader.selectCard(uid)
    const key = [0xff, 0xff, 0xff, 0xff, 0xff, 0xff]

    for (let block = this.#block_start; block <= this.#block_end; block++) {
      if (!reader.authenticate(block, key, uid)) return false
      const data = bytes.splice(0, 16)
      while (data.length < 16) data.push(0)
      reader.writeDataToBlock(block, data)
    }

    reader.stopCrypto()

    return true
  }

  async findUID(retries = Number.MAX_SAFE_INTEGER) {
    const reader = this.#reader
    do {
      reader.reset()
      await delay(100)

      const card = reader.findCard()
      if (!card.status) continue

      const uid = reader.getUid()
      if (!uid.status) continue

      return uid.data
    } while (--retries > 0)
  }
}
