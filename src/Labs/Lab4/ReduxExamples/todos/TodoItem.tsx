import { Button, ListGroup } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { deleteTodo, setTodo } from "./todosReducer";

export default function TodoItem({ todo }: { todo: { id: string; title: string } }) {
  const dispatch = useDispatch();

  return (
    <ListGroup.Item
      key={todo.id}
      className="d-flex justify-content-between align-items-center py-4"
    >
      <span className="fs-2 fw-bold">{todo.title}</span>
      <div className="d-flex gap-3">
        <Button
          onClick={() => dispatch(setTodo(todo))}
          id="wd-set-todo-click"
          variant="primary"
          className="fs-4 fw-bold px-4"
        >
          Edit
        </Button>
        <Button
          onClick={() => dispatch(deleteTodo(todo.id))}
          id="wd-delete-todo-click"
          variant="danger"
          className="fs-4 fw-bold px-4"
        >
          Delete
        </Button>
      </div>
    </ListGroup.Item>
  );
}