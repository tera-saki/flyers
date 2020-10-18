const fs = require('fs')
const axios = require('axios')

const { credentialsPath, tokenPath, uploadDir } = require('./common')
const { webhookURL } = require('../config/setting')
const GoogleDrive = require('./GoogleDrive')
const googleDrive = new GoogleDrive(credentialsPath, tokenPath)

async function sendAlert (flyers) {
  let message = ''
  for (const flyer of flyers) {
    message += `${flyer.title}\n${flyer.viewLink}\n`
  }
  await axios.post(webhookURL, { text: message })
}

async function upload (flyers) { 
  const uploads = []
  for (const flyer of flyers) {
    try {
      const res = await googleDrive.upload(flyer.tmpSavedPath, { dir: uploadDir })
      flyer.viewLink = await googleDrive.getWebViewLink(res.data.id)
      uploads.push(flyer)
      fs.unlinkSync(flyer.tmpSavedPath)
    } catch (e) {
      console.error(e)
    }
  }
  if (uploads.length > 0) {
    await sendAlert(uploads)
  }
}

module.exports = { upload }