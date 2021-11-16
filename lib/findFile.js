const DEFAULT_FOLDERS = ['~/Movies', '~/Videos']

import { constants, promises as fs } from 'fs'
import ora from 'ora'
import { resolve } from 'path'
import untildify from 'untildify'

export function createFileFinder({ folders }) {
  return async (fileName) => {
    return findFile({ fileName, folders })
  }
}

export async function findFile({ fileName, folders = DEFAULT_FOLDERS }) {
  const spinner = ora(`Looking for file "${fileName}"`).start()

  if (!fileName) return spinner.fail && null

  for (const folder of folders) {
    const filePath = resolve(untildify(folder), fileName)
    try {
      await fs.access(filePath, constants.R_OK)
      spinner.succeed(`Found ${filePath}`)
      return filePath
    } catch (e) {}
  }

  spinner.fail(`Unable to find "${fileName}"`)

  return null
}
