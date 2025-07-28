import { useState } from "react";

export default function ArrayStateVariable() {
  const [array, setArray] = useState([1, 2, 3, 4, 5]);
  const addElement = () => {
    setArray([...array, Math.floor(Math.random() * 100)]);
  };
  const deleteElement = (index: number) => {
    setArray(array.filter((_, i) => i !== index));
  };
  return (
    <div id="wd-array-state-variables" style={{ maxWidth: 380, border: "3px solid #eee", borderRadius: 5, padding: 10 }}>
      <h2>Array State Variable</h2>
      <button
        className="btn btn-success mb-3"
        style={{ width: 200, fontSize: 18, fontWeight: 500 }}
        onClick={addElement}
      >
        Add Element
      </button>
      <ul className="list-group">
        {array.map((item, index) => (
          <li
            key={index}
            className="list-group-item d-flex justify-content-between align-items-center"
            style={{ fontSize: 18, fontWeight: 500, border: "none", borderBottom: "2px solid #ececec" }}
          >
            <span>{item}</span>
            <button
              className="btn btn-danger"
              style={{ fontSize: 18, fontWeight: 400, width: 120, borderRadius: 15 }}
              onClick={() => deleteElement(index)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
      <hr />
    </div>
  );
}