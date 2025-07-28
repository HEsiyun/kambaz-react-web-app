import { Button, FormControl, ListGroup } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { addTodo, updateTodo, setTodo } from "./todosReducer";

export default function TodoForm() {
  const { todo } = useSelector((state: any) => state.todosReducer);
  const dispatch = useDispatch();

  return (
    <ListGroup.Item className="d-flex align-items-center justify-content-between py-4">
      <FormControl
        className="me-3 fs-3 rounded-pill"
        value={todo.title}
        placeholder="Enter todo"
        style={{ maxWidth: 350, fontWeight: 500 }}
        onChange={(e) =>
          dispatch(setTodo({ ...todo, title: e.target.value }))
        }
      />
      <div className="d-flex gap-3">
        <Button
          variant="warning"
          className="fw-bold px-4 fs-4 text-black"
          onClick={() => dispatch(updateTodo(todo))}
          id="wd-update-todo-click"
        >
          Update
        </Button>
        <Button
          variant="success"
          className="fw-bold px-4 fs-4"
          onClick={() => dispatch(addTodo(todo))}
          id="wd-add-todo-click"
        >
          Add
        </Button>
      </div>
    </ListGroup.Item>
  );
}