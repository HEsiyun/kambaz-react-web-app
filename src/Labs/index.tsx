import Lab1 from "./Lab1";
import { Route, Routes, Navigate } from "react-router"; 
import TOC from "./TOC";
import Lab2 from "./Lab2"; 
import Lab3 from "./Lab3";
import Lab4 from "./Lab4";
import store from "./store"; 
import { Provider } from "react-redux";
export default function Labs() {
  return (
    <Provider store={store}>
    <div className="container-fluid" id="wd-labs">
      <h1>Labs</h1>
      <p>Student Name: Siyun He</p>
      <p>Section: CS5610 60924 Web Development SEC 01 Summer 2 2025</p>
      <a
        id="wd-github"
        href="https://github.com/HEsiyun/kambaz-react-web-app/tree/a1"
        target="_blank"
        rel="noopener noreferrer"
      >
        Source Code Repository
      </a>
      <TOC /> 
      <Routes> 
        <Route path="/" element={<Navigate to="Lab1" />} /> 
        <Route path="Lab1" element={<Lab1 />} /> 
        <Route path="Lab2/*" element={<Lab2 />} /> 
        <Route path="/" element={<Navigate to="Lab3" />} />
        <Route path="Lab3/*" element={<Lab3 />} /> 
        <Route path="/" element={<Navigate to="Lab4" />} />
        <Route path="Lab4/*" element={<Lab4 />} /> 
      </Routes>
    </div>
    </Provider>
  );
}