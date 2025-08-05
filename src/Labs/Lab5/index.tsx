import { Container } from "react-bootstrap";
import EnvironmentVariables from "./EnvironmentVariables";
import PathParameters from "./PathParameters";
import QueryParameters from "./QueryParameters";
import WorkingWithObjects from "./WorkingWithObjects";
import WorkingWithArrays from "./WorkingWithArrays";
import HttpClient from "./HttpClient";
import WorkingWithObjectsAsynchronously from "./WorkingWithObjectsAsynchronously";
import WorkingWithArraysAsynchronously from "./WorkingWithArraysAsynchronously";
const HTTP_SERVER = import.meta.env.VITE_HTTP_SERVER;
export default function Lab5() {
  return (
    <Container>
        <div id="wd-lab5">
        <h2>Lab 5</h2>
        <HttpClient />
        <div className="list-group">
            <a href={`${HTTP_SERVER}/lab5/welcome`}
            className="list-group-item">
            Welcome
            </a>
        </div>
        <hr />
        <EnvironmentVariables />
        <PathParameters />
        <QueryParameters />
        <WorkingWithObjects />
        <WorkingWithArrays />
        <WorkingWithObjectsAsynchronously />
        <WorkingWithArraysAsynchronously />
        </div>
    </Container>
  );
}
