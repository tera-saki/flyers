const { crawl } = require('./crawler')
const { accumlate } = require('./accumlator')
const { upload } = require('./uploader')

async function main () {
  try {
    const flyers = await crawl()
    const newFlyers = await accumlate(flyers)
    await upload(newFlyers)
  } catch (e) {
    console.error(e)
  } 
}

main().then(() => {
  process.exit(0)
})