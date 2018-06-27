/// <reference types="cypress" />
// @ts-check

import { enterTodo } from './utils'

describe('cy.tasks', () => {
  it('can observe records saved in the database', () => {
    const title = 'create a task'
    enterTodo(title)
    // https://on.cypress.io/task
    cy.task('hasSavedRecord', title, { timeout: 10000 })
  })

  it('returns resolved value', () => {
    const title = 'create a task'
    enterTodo(title)
    // https://on.cypress.io/task
    cy
      .task('hasSavedRecord', title, { timeout: 10000 })
      .should('contain', {
        title,
        completed: false
      })
      // there is also an ID
      .and('have.property', 'id')
  })
})
