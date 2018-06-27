// @ts-check
const fs = require('fs')
const path = require('path')
const ora = require('ora')
const Promise = require('bluebird')
const repoRoot = path.join(__dirname, '..', '..')

// function should return boolean
// or resolve with a boolean
// if rejecting, will also retry
const findRecordAsync = title => {
  return new Promise((resolve, reject) => {
    const dbFilename = path.join(repoRoot, 'data.json')
    fs.readFile(dbFilename, 'utf8', (err, data) => {
      if (err) {
        return reject(err)
      }

      const contents = JSON.parse(data)
      const todos = contents.todos
      resolve(todos.find(record => record.title === title))
    })
  })
}

// sync, throwing error if not found
const findRecordSyncAndThrow = title => {
  const dbFilename = path.join(repoRoot, 'data.json')
  const data = fs.readFileSync(dbFilename, 'utf8')
  const contents = JSON.parse(data)
  const todos = contents.todos
  if (todos.find(record => record.title === title)) {
    return true
  } else {
    throw new Error('not found')
  }
}

// sync, returning boolean
const findRecord = title => {
  const dbFilename = path.join(repoRoot, 'data.json')
  const data = fs.readFileSync(dbFilename, 'utf8')
  const contents = JSON.parse(data)
  const todos = contents.todos
  return todos.find(record => record.title === title)
}

const retryFn = ({ fn, onTimedOut, timeLimitMs = 5000, delay = 50 }) => {
  return new Promise((resolve, reject) => {
    if (timeLimitMs < 0) {
      return reject(onTimedOut())
    }

    return Promise.try(() => {
      return fn()
    })
      .timeout(timeLimitMs)
      .catch(Promise.TimeoutError, () => {
        throw onTimedOut()
      })
      .then(
        found => {
          if (found) {
            return resolve(true)
          }

          // retry after a delay
          setTimeout(() => {
            retryFn({
              fn,
              onTimedOut,
              timeLimitMs: timeLimitMs - delay,
              delay
            }).then(resolve, reject)
          }, delay)
        },
        () => {
          // retry after a delay
          setTimeout(() => {
            retryFn({
              fn,
              onTimedOut,
              timeLimitMs: timeLimitMs - delay,
              delay
            }).then(resolve, reject)
          }, delay)
        }
      )
  })
}

const cliRetry = ({ fn, text, timeLimitMs = 5000, delay = 50 }) => {
  const spinner = ora(text.start).start()

  const onTimedOut = () => new Error(text.fail)

  return retryFn({ fn, onTimedOut, timeLimitMs, delay: 50 })
    .tap(() => {
      spinner.succeed(text.pass)
    })
    .tapCatch(err => {
      spinner.fail(err.message)
    })
}

module.exports = (on, config) => {
  // "cy.task" can be used from specs to "jump" into Node environment
  // and doing anything you might want. For example, checking "data.json" file!
  on('task', {
    hasSavedRecord (title, timeLimitMs = 5000) {
      return cliRetry({
        fn: findRecord.bind(null, title),
        text: {
          start: `looking for title "${title}" in the database`,
          pass: `found "${title}" in the database`,
          fail: `Could not find record with title "${title}"`
        },
        timeLimitMs,
        delay: 50
      })
    }
  })
}
