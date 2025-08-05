import { useState } from "react";
import { FormControl, Button } from "react-bootstrap";

const HTTP_SERVER = import.meta.env.VITE_HTTP_SERVER;

export default function QueryParameters() {
  const [a, setA] = useState(34);
  const [b, setB] = useState(23);

  return (
    <div id="wd-query-parameters">
      <h3>Query Parameters</h3>
      <FormControl
        id="wd-query-parameter-a"
        className="mb-2"
        defaultValue={a}
        type="number"
        onChange={(e) => setA(Number(e.target.value))}
      />
      <FormControl
        id="wd-query-parameter-b"
        className="mb-2"
        defaultValue={b}
        type="number"
        onChange={(e) => setB(Number(e.target.value))}
      />
      <div className="mb-4">
        <Button
          as="a"
          id="wd-query-parameter-add"
          variant="primary"
          className="me-3"
          href={`${HTTP_SERVER}/lab5/calculator?operation=add&a=${a}&b=${b}`}
        >
          Add {a} + {b}
        </Button>
        <Button
          as="a"
          id="wd-query-parameter-subtract"
          variant="danger"
          className="me-3"
          href={`${HTTP_SERVER}/lab5/calculator?operation=subtract&a=${a}&b=${b}`}
        >
          Substract {a} - {b}
        </Button>
        <Button
          as="a"
          id="wd-query-parameter-multiply"
          variant="success"
          className="me-3"
          href={`${HTTP_SERVER}/lab5/calculator?operation=multiply&a=${a}&b=${b}`}
        >
          Multiply {a} * {b}
        </Button>
        <Button
          as="a"
          id="wd-query-parameter-divide"
          variant="warning"
          className="text-dark"
          href={`${HTTP_SERVER}/lab5/calculator?operation=divide&a=${a}&b=${b}`}
        >
          Divide {a} / {b}
        </Button>
      </div>
      <hr />
    </div>
  );
}