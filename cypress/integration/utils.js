// @ts-check
export const resetDatabase = () => {
  console.log('resetDatabase')
  cy.request({
    method: 'POST',
    url: '/reset',
    body: {
      todos: []
    }
  })
}

export const getTodoApp = () => cy.get('.todoapp')

export const getNewTodoInput = () => getTodoApp().find('.new-todo')

export const enterTodo = (text = 'example todo') => {
  console.log('entering todo', text)

  getNewTodoInput().type(`${text}{enter}`)
  console.log('typed', text)

  // we need to make sure the store and the vue component
  // get updated and the DOM is updated.
  // quick check - the new text appears at the last position
  // I am going to use combined selector to always grab
  // the element and not use stale reference from previous chain call
  const lastItem = '.todoapp .todo-list li:last'
  cy.get(lastItem).should('contain', text)
}
