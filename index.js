#!/usr/bin/env node

import program from 'commander'
import isPi from 'detect-rpi'
import { createFileFinder } from './lib/findFile.js'

program.command('read').action(readCmd)
program.command('write').action(writeCmd)
program
  .command('run', { isDefault: true })
  .option('-r, --rfid', 'Use rfid', isPi())
  .option('--no-rfid')
  .option('-f, --folder <value>', 'folder search paths', (value, previous) => {
    return (previous || []).concat([value])
  })
  .action(runCmd)
program.parseAsync()

async function readCmd({ rfid }) {}

async function writeCmd({ rfid }) {}

async function runCmd({ rfid, folder: folders }) {
  const findFile = createFileFinder({ folders })

  const idleVideo = await findFile('idle.mp4')
}
