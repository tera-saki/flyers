const path = require('path')

const rootDir = path.join(__dirname, '..')
const credentialsPath = path.join(rootDir, 'credentials.json')
const tokenPath = path.join(rootDir, 'token.json')

const tmpDir = path.join(rootDir, 'tmp')
const uploadDir = 'flyers'
// fill in the blanks
const crawlingURL = ''
const webhookURL = ''

module.exports = { credentialsPath, tokenPath, tmpDir, uploadDir, crawlingURL, webhookURL }