/* eslint-disable no-console */
/* global Promise */

const fs = require('fs')
const path = require('path')

const findRecord = title => {
  const dbFilename = path.join(__dirname, '..', '..', 'todomvc', 'data.json')
  const contents = JSON.parse(fs.readFileSync(dbFilename))
  const todos = contents.todos
  return todos.find(record => record.title === title)
}

const hasRecordAsync = (title, ms) => {
  const delay = 50
  return new Promise((resolve, reject) => {
    if (ms < 0) {
      return reject(new Error(`Could not find record with title "${title}"`))
    }
    const found = findRecord(title)
    if (found) {
      return resolve(found)
    }
    setTimeout(() => {
      hasRecordAsync(title, ms - delay).then(resolve, reject)
    }, 50)
  })
}

module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  // "cy.task" can be used from specs to "jump" into Node environment
  // and doing anything you might want. For example, checking "data.json" file!
  on('task', {
    hasSavedRecord (title, ms = 3000) {
      console.log(
        'looking for title "%s" in the database (time limit %dms)',
        title,
        ms
      )
      return hasRecordAsync(title, ms)
    }
  })
}
