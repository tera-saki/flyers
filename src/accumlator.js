const path = require('path')
const util = require('util')
const exec = util.promisify(require('child_process').exec)
const Redis = require('ioredis')
const _ = require('lodash')
const { DateTime } = require('luxon') 
const redis = new Redis(require('../config/redis.json'))
const { tmpDir } = require('./common')

const expiredays = 90
const expiresecs = expiredays * 24 * 60 * 60

async function extractNewFlyers (flyers) {
  const exists = (
    await redis.pipeline(
      flyers.map(flyer => ['exists', flyer.url])
    ).exec()
  ).map(([err, res]) => { 
    if (err) { throw e }
    return res
  })
  const newFlyers = _.zip(flyers, exists).filter(r => !r[1]).map(r => r[0])
  await redis.pipeline(
    newFlyers.map(flyer => ['setex', flyer.url, expiresecs, flyer.title])
  ).exec()
  return newFlyers
} 

async function getNewFlyers (flyers) {
  const today = DateTime.local().toISODate()
  let count = 0
  
  for (const flyer of flyers) {
    const name = `${today}-${count}.pdf`
    const tmpSavedPath = path.join(tmpDir, name)
    await exec(`wget ${flyer.url} -O ${tmpSavedPath}`)
    flyer.tmpSavedPath = tmpSavedPath
    ++count
  }
  return flyers
}

async function accumlate (flyers) {
  try {
    const newFlyers = await getNewFlyers(await extractNewFlyers(flyers))
    return newFlyers
  } catch (e) {
    console.error(e)
  }
}

module.exports = { accumlate }