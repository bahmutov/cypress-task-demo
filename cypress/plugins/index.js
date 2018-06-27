// @ts-check
const fs = require('fs')
const path = require('path')
const repoRoot = path.join(__dirname, '..', '..')

const findRecord = title => {
  const dbFilename = path.join(repoRoot, 'data.json')
  const contents = JSON.parse(fs.readFileSync(dbFilename, 'utf8'))
  const todos = contents.todos
  return todos.find(record => record.title === title)
}

module.exports = (on, config) => {
  // "cy.task" can be used from specs to "jump" into Node environment
  // and doing anything you might want. For example, checking "data.json" file!
  on('task', {
    hasSavedRecord (title) {
      console.log('looking for title "%s" in the database', title)
      return Boolean(findRecord(title))
    }
  })
}
