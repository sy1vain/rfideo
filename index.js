#!/usr/bin/env node

import program from 'commander'
import delay from 'delay'
import isPi from 'detect-rpi'
import enquirer from 'enquirer'
import isURL from 'is-url'
import ora from 'ora'
import { createFileFinder } from './lib/findFile.js'
import { createPlayer } from './lib/player.js'
import { createReader } from './lib/rfid.js'
const { Select, Input } = enquirer

program.command('read').action(readCmd)
program.command('write').action(writeCmd)
program
  .command('run')
  .option('-r, --rfid', 'Use rfid', isPi())
  .option('--no-rfid')
  .option('-f, --folder <value>', 'folder search paths', (value, previous) => {
    return (previous || []).concat([value])
  })
  .action(runCmd)
program.command('menu', { isDefault: true }).action(choiceCommand)
program.parseAsync()

async function choiceCommand({ ...opts }) {
  let cancelTimeout = setTimeout(() => {
    prompt.cancel('auto choose run')
  }, 5000)

  const prompt = new Select({
    name: 'command',
    message: 'What do you want to do?',
    choices: ['run', 'read', 'write'],
    onSubmit: () => {
      clearTimeout(cancelTimeout)
    },
  })

  try {
    // const cmd = await prompt.run()
    switch (await prompt.run()) {
      case 'run':
        return runCmd({ ...opts })
      case 'read':
        return readCmd({ ...opts })
      case 'write':
        return writeCmd({ ...opts })
    }
  } catch (e) {
    runCmd({ ...opts })
  }
}

async function readCmd({ rfid = isPi() }) {
  if (!rfid) return

  const spinner = ora('Waiting for card').start()
  try {
    const reader = await createReader()
    const uid = await reader.findUID({ retries: 100 })
    if (!uid) throw new Error('No card found')
    const result = await reader.readString({ uid })
    if (!result) throw new Error('Unable to read data...')
    spinner.succeed(`Read: ${result}`)
  } catch (e) {
    spinner.fail(e.message || e)
  }
}

async function writeCmd({ rfid = isPi() }) {
  if (!rfid) return

  const spinner = ora('Waiting for card')
  try {
    const data = await new Input('Data to write').run()
    spinner.start()
    const reader = await createReader()
    const uid = await reader.findUID({ retries: 100 })
    if (!uid) throw new Error('No card found')
    const result = await reader.writeString({ uid, data })
    if (!result) throw new Error('Unable to write data...')
    spinner.succeed(`Written: ${data}`)
  } catch (e) {
    spinner.fail(e.message || e)
  }
}

async function runCmd({ rfid = isPi(), folder: folders }) {
  const findFile = createFileFinder({ folders })

  const idleVideo = await findFile('idle.mp4')
  const player = await createPlayer({ idleVideo })
  const reader = rfid ? await createReader() : null

  while (true) {
    await delay(500)

    try {
      const fileName = reader
        ? await reader.readString()
        : await new Input({ message: 'Filename' }).run()
      if (!fileName) continue
      const fileOrUrl = isURL(fileName) ? fileName : await findFile(fileName)

      if (!fileOrUrl) continue

      await player.play(fileOrUrl)
    } catch (e) {
      console.warn(e.message || e)
      break
    }
    await delay(5000)
  }

  await player.stop()
}
