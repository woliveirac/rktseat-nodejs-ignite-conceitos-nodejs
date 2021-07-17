const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
    const { username } = request.headers;

    const user = users.find((user) => user.username === username);

    if (!user) {
        return response.status(400).json({ error: "User doesn't exist."});
    }

    request.user = user;

    return next();
}

app.post('/users', (request, response) => {
    const { name, username } = request.body;

    const user = users.find((user) => user.username === username);

    if(user) {
      return response.status(400).json({ error: "User already registered."});
    }

    let newUser = {
        name,
        username,
        id : uuidv4(),
        todos: [] 
    }

    users.push(newUser);

    return response.status(201).send(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
    const { todos } = request.user;

    return response.status(200).send(todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
    const { title, deadline } = request.body;
    const { username } = request.user;

    const user = users.find((user) => user.username === username);

    if (!user) {
        return response.status(400).json({ error: "User doesn't exist"});
    }

    let todo = { 
      id: uuidv4(), // precisa ser um uuid
      title: title,
      done: false, 
      deadline: new Date(deadline), 
      created_at: new Date()
    }

    user.todos.push(todo);

    return response.status(200).send(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
    const { id } = request.params;
    const { title, deadline } = request.body;
    const { user } = request;

    const todo = user.todos.find((todo) => todo.id === id);

    if (!todo) {
      return response.status(400).send({ error: "Todo doesn't exist" });
    }

    todo.title = title;
    todo.deadline = new Date(deadline);

    return response.status(201).send();  
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
    const { id } = request.params;
    const { user } = request;

    const todo = user.todos.find((todo) => todo.id === id);

    if (!todo) {
      return response.status(400).send({ error: "Todo doesn't exist" });
    }

    todo.done = true;

    return response.status(201).send();
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todo = user.todos.find((todo) => todo.id === id);
  
  if (!todo) {
    return response.status(400).send({ error: "Todo doesn't exist" });
  }

  user.todos.splice(todo, 1);

  return response.status(204).send();
});

module.exports = app;