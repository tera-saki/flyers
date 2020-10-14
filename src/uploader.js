const path = require('path')
const fs = require('fs')
const axios = require('axios')

const { credentialsPath, tokenPath, tmpDir, uploadDir, webhookURL } = require('./config')
const GoogleDrive = require('./GoogleDrive')
const googleDrive = new GoogleDrive(credentialsPath, tokenPath)

async function sendAlert (res) {
  const fileId = res.data.id
  const url = await googleDrive.getWebViewLink(fileId)
  const message = `New flyer was posted.\n ${url}`
  await axios.post(webhookURL, { text: message })
}

async function uploadPDF () {
  const pdfs = fs.readdirSync(tmpDir).map(file => path.join(tmpDir, file))
  for (const pdf of pdfs) {
    try {
      const res = await googleDrive.upload(pdf, { dir: uploadDir })
      await sendAlert(res)
      fs.unlinkSync(pdf)
    } catch (e) {
      console.error(e)
    }
  }
}

module.exports = { uploadPDF }