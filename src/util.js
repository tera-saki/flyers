async function allSettled (func, arr, ...args) {
  const res = await Promise.allSettled(
    arr.map(a => func(a, ...args))
  )

  const fulfilled = []
  res.map(({ status, value, reason }) => {
    if (status === 'rejected') {
      console.error(reason)
    } else if (status === 'fulfilled') {
      fulfilled.push(value)
    } else {
      console.error('Unknown status')
    }
  })
  return fulfilled
}

module.exports = { allSettled }