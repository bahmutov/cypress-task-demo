// @ts-check
const fs = require('fs')
const path = require('path')
const ora = require('ora')
const Promise = require('bluebird')
const repoRoot = path.join(__dirname, '..', '..')

// function should return boolean
// or resolve with a boolean
const findRecord = title => {
  const dbFilename = path.join(repoRoot, 'data.json')
  const contents = JSON.parse(fs.readFileSync(dbFilename, 'utf8'))
  const todos = contents.todos
  return todos.find(record => record.title === title)
}

const retryFn = ({ fn, onTimedOut, timeLimitMs = 5000, delay = 50 }) => {
  return new Promise((resolve, reject) => {
    if (timeLimitMs < 0) {
      return reject(onTimedOut())
    }
    const found = fn()
    if (found) {
      return resolve(true)
    }
    setTimeout(() => {
      retryFn({ fn, onTimedOut, timeLimitMs: timeLimitMs - delay, delay }).then(
        resolve,
        reject
      )
    }, 50)
  })
}

module.exports = (on, config) => {
  // "cy.task" can be used from specs to "jump" into Node environment
  // and doing anything you might want. For example, checking "data.json" file!
  on('task', {
    hasSavedRecord (title, timeLimitMs = 5000) {
      const spinner = ora(
        `looking for title "${title}" in the database`
      ).start()

      const fn = findRecord.bind(null, title)
      const onTimedOut = () =>
        new Error(`Could not find record with title "${title}"`)

      return retryFn({ fn, onTimedOut, timeLimitMs, delay: 50 })
        .tap(() => {
          spinner.succeed(`found "${title}" in the database`)
        })
        .tapCatch(err => {
          spinner.fail(err.message)
        })
    }
  })
}
