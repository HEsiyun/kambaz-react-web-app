import Lab1 from "./Lab1";
import { Route, Routes, Navigate } from "react-router"; 
import TOC from "./TOC";
import Lab2 from "./Lab2"; 
import Lab3 from "./Lab3";
export default function Labs() {
  return (
    <div id="wd-labs">
      <h1>Labs</h1>
      <a
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
        <Route path="Lab3/*" element={<Lab3 />} /> 
      </Routes>
    </div>
  );
}