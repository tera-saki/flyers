const util = require('util')
const exec = util.promisify(require('child_process').exec)
const { Builder, By, Key, until } = require('selenium-webdriver')
const { Options } = require('selenium-webdriver/chrome')

const { allSettled } = require('./util')
const { crawlingURL } = require('../config/setting')

async function createDriver () {
  const options = new Options().addArguments(['--headless', '--window-size=1280,1024'])
  return await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build()
}

async function extractTitleAndURL (flyer) {
  const pdfButton = await flyer.findElement(By.className('shufoo-pdf'))
  // headless chrome cannot deal with redirect roperly.
  const link = await pdfButton.findElement(By.css('a')).getAttribute('href')
  const { stdout } = await exec(`curl -s '${link}'`)
  const regex_r = /<meta http-equiv="refresh" content="0;URL=(.+\.pdf)\?/
  const url = regex_r.exec(stdout)[1]
  const titleWrap = await flyer.findElement(By.className('shufoo-title'))
  const title = await titleWrap.findElement(By.css('a')).getText()
  return { url, title }
}

async function doCrawl (driver) {
  await driver.get(crawlingURL)
  await driver.wait(until.elementLocated(By.className('shufoo-pdf')))
  const flyerWrappers = await driver.findElements(By.className('shufoo-chirashi_wrapper'))
  return await allSettled(extractTitleAndURL, flyerWrappers)
}

async function crawl () {
  const driver = await createDriver()

  try {
    const flyers = await doCrawl(driver)
    return flyers
  } catch (e) {
    console.error(e)
  } finally {
    await driver.quit()
  }
}

module.exports = { crawl }