const { crawl } = require('./crawler')
const { uploadPDF } = require('./uploader')

async function main () {
  try {
    await crawl()
    await uploadPDF()
  } catch (e) {
    console.error(e)
  } 
}

main().then(() => {
  process.exit(0)
})