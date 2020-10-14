const path = require('path')
const util = require('util')
const exec = util.promisify(require('child_process').exec)
const { DateTime } = require('luxon') 
const { Builder, By, Key, until } = require('selenium-webdriver')
const { Options } = require('selenium-webdriver/chrome')

const { crawlingURL, tmpDir } = require('./config')

async function createDriver () {
  const options = new Options().addArguments(['--headless', '--window-size=1280,1024'])
  return await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build()
}

async function doCrawl (driver) {
  await driver.get(crawlingURL)
  await driver.wait(until.elementLocated(By.className('shufoo-pdf')))
  const flyers = await driver.findElements(By.className('shufoo-chirashi_wrapper'))
  
  let count = 0
  for (const flyer of flyers) {
    const pdfButton = await flyer.findElement(By.className('shufoo-pdf'))
    // headless chrome cannot deal with redirect roperly.
    const link = await pdfButton.findElement(By.css('a')).getAttribute('href')
    const { stdout } = await exec(`curl -s '${link}'`)
    const regex_r = /<meta http-equiv="refresh" content="0;URL=(.+\.pdf)\?/
    const redirectURL = regex_r.exec(stdout)[1]
    const regex_d = /c\/([0-9/]+)\/c/
    const postingDay = regex_d.exec(redirectURL)[1].replace(/\//g, '-')
    const today = DateTime.local().toISODate()
    
    if (postingDay === today) {
      const name = `${postingDay}-${count}.pdf`
      await exec(`wget ${redirectURL} -O ${path.join(tmpDir, name)}`)
      ++count
    }  
  }
}

async function crawl () {
  const driver = await createDriver()

  try {
    await doCrawl(driver)
  } catch (e) {
    throw new Error(e)
  } finally {
    await driver.quit()
  }
}

module.exports = { crawl }