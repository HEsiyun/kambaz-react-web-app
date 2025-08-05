import { useState } from "react";
import { FormCheck, FormControl } from "react-bootstrap";
import axios from "axios";

const HTTP_SERVER = import.meta.env.VITE_HTTP_SERVER;
const API = `${HTTP_SERVER}/lab5/todos`;

export default function WorkingWithArrays() {
  const [todo, setTodo] = useState({
    id: "1",
    title: "NodeJS Assignment",
    description: "Create a NodeJS server with ExpressJS",
    due: "2021-09-09",
    completed: false,
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // REMOVE TODO
  const removeTodo = async () => {
    try {
      setErrorMessage(null);
      await axios.get(`${API}/${todo.id}/delete`);
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message ||
          `Unable to delete Todo with ID ${todo.id}`
      );
    }
  };

  // UPDATE TITLE
  const updateTitle = async () => {
    try {
      setErrorMessage(null);
      await axios.get(`${API}/${todo.id}/title/${encodeURIComponent(todo.title)}`);
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message ||
          `Unable to update title for Todo with ID ${todo.id}`
      );
    }
  };

  // UPDATE DESCRIPTION
  const updateDescription = async () => {
    try {
      setErrorMessage(null);
      await axios.get(
        `${API}/${todo.id}/description/${encodeURIComponent(todo.description)}`
      );
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message ||
          `Unable to update description for Todo with ID ${todo.id}`
      );
    }
  };

  // UPDATE COMPLETED
  const updateCompleted = async () => {
    try {
      setErrorMessage(null);
      await axios.get(`${API}/${todo.id}/completed/${todo.completed}`);
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message ||
          `Unable to update completed for Todo with ID ${todo.id}`
      );
    }
  };

  return (
    <div id="wd-working-with-arrays">
      <h3>Working with Arrays</h3>
      {errorMessage && (
        <div
          id="wd-todo-error-message"
          className="alert alert-danger mb-2 mt-2"
        >
          {errorMessage}
        </div>
      )}
      <h4>Retrieving Arrays</h4>
      <a id="wd-retrieve-todos" className="btn btn-primary" href={API}>
        Get Todos
      </a>
      <hr />
      <h4>Retrieving an Item from an Array by ID</h4>
      <a
        id="wd-retrieve-todo-by-id"
        className="btn btn-primary float-end"
        href={`${API}/${todo.id}`}
      >
        Get Todo by ID
      </a>
      <FormControl
        id="wd-todo-id"
        value={todo.id}
        className="w-50"
        onChange={(e) => setTodo({ ...todo, id: e.target.value })}
      />
      <hr />
      <h3>Filtering Array Items</h3>
      <a
        id="wd-retrieve-completed-todos"
        className="btn btn-primary"
        href={`${API}?completed=true`}
      >
        Get Completed Todos
      </a>
      <hr />
      <h3>Creating new Items in an Array</h3>
      <a
        id="wd-create-todo"
        className="btn btn-primary"
        href={`${API}/create`}
      >
        Create Todo
      </a>
      <hr />
      <h3>Removing from an Array</h3>
      <button
        id="wd-remove-todo"
        className="btn btn-primary float-end"
        onClick={removeTodo}
      >
        Remove Todo with ID = {todo.id}
      </button>
      <FormControl
        value={todo.id}
        className="w-50"
        onChange={(e) => setTodo({ ...todo, id: e.target.value })}
      />
      <hr />
      <h3>Updating an Item in an Array</h3>
      <button
        className="btn btn-primary float-end"
        onClick={updateTitle}
      >
        Update Todo Title
      </button>
      <FormControl
        value={todo.id}
        className="w-25 float-start me-2"
        onChange={(e) => setTodo({ ...todo, id: e.target.value })}
      />
      <FormControl
        value={todo.title}
        className="w-50 float-start"
        onChange={(e) => setTodo({ ...todo, title: e.target.value })}
      />
      <br />
      <br />
      <hr />
      <h3>Update Todo Description and Completed</h3>
      <div className="mb-2">
        <FormControl
          className="w-50 d-inline"
          value={todo.description}
          onChange={(e) => setTodo({ ...todo, description: e.target.value })}
        />
        <button className="btn btn-primary ms-2" onClick={updateDescription}>
          Update Description
        </button>
      </div>
      <div>
        <FormCheck
          type="checkbox"
          checked={todo.completed}
          label="Completed"
          onChange={(e) =>
            setTodo({ ...todo, completed: e.target.checked })
          }
        />
        <button className="btn btn-primary ms-2" onClick={updateCompleted}>
          Update Completed
        </button>
      </div>
      <hr />
    </div>
  );
}