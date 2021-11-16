#!/usr/bin/env node

import program from 'commander'
import isPi from 'detect-rpi'

program.command('read').action(readCmd)
program.command('write').action(writeCmd)
program
  .command('run', { isDefault: true })
  .option('-r, --rfid', 'Use rfid', isPi())
  .option('--no-rfid')
  .option('-p, --path <value>', 'search paths', (value, previous) => {
    return (previous || []).concat([value])
  })
  .action(runCmd)
program.parseAsync()

async function readCmd({ rfid }) {}

async function writeCmd({ rfid }) {}

async function runCmd({ rfid, path: paths }) {}
