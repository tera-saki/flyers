const fs = require('fs')
const path = require('path')
const { google } = require('googleapis')

class GoogleDrive {
  constructor (credentials, token) {
    this.credentials = JSON.parse(fs.readFileSync(credentials))
    this.token = JSON.parse(fs.readFileSync(token))
    this._init()
  }

  _init () {
    const { client_secret, client_id, redirect_uris } = this.credentials.installed
    const auth = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0])
    auth.setCredentials(this.token)
    this.client = google.drive({ version: 'v3', auth })
  }

  async _makeFolder (p) {
    const dirnames = p.split('/')
    let parent = 'root'
    
    for (const name of dirnames) {
      const res = await this.list({
        q: `mimeType = 'application/vnd.google-apps.folder' 
            and name = '${name}' 
            and '${parent}' in parents 
            and trashed = false`
      })
      if (res.length > 0) {
        parent = res[0].id
        continue
      }
      const res_2 = await this.client.files.create({
        resource: {
          name,
          parents: [parent],
          mimeType: 'application/vnd.google-apps.folder',
          fields: 'id'
        }
      })
      parent = res_2.data.id
    }
    return parent
  }

  async getWebViewLink (fileId) {
    const res = await this.client.files.get({
      fileId,
      fields: 'webViewLink'
    })
    if (res.length === 0) {
      throw new Error('file that has specified fileId does not exist.')
    }
    return res.data.webViewLink
  }

  async list (options = {}) {
    let files = []
    
    let pageToken
    do {
      const res = await this.client.files.list({
        q: options.q, 
        fields: 'nextPageToken, files(id, name, parents)',
      })
      files = [...files, ...res.data.files]
      pageToken = res.nextPageToken
    } while (pageToken)
    return files
  }

  async upload (file, options = {}) {
    return await this.client.files.create({
      resource: {
        parents: options.dir ? [await this._makeFolder(options.dir)] : 'root',
        name: options.name || path.basename(file)
      },
      media: {
        body: fs.createReadStream(file)
      }
    })
  }
}

module.exports = GoogleDrive