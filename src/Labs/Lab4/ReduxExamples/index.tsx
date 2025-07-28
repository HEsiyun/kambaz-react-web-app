import { useSelector } from "react-redux";
import CounterRedux from "./CounterRedux";
import AddRedux from "./AddRedux";
import TodoList from "./todos/TodoList";

export default function ReduxExamples() {
  const { message } = useSelector((state: any) => state.helloReducer);
  return (
    <div>
      <h2>Redux Examples</h2>
      <div id="wd-hello-redux">
        <h3>Hello Redux</h3>
        <h4>{message}</h4>
        <CounterRedux />
        <AddRedux />
        <TodoList />
        <hr />
      </div>
    </div>
  );
}

