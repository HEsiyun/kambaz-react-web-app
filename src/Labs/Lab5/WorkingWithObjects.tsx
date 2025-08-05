import { useState } from "react";
import { FormControl, FormCheck } from "react-bootstrap";

const HTTP_SERVER = import.meta.env.VITE_HTTP_SERVER;

export default function WorkingWithObjects() {
  /* ---------- LOCAL REACT STATE ---------- */
  const [assignment, setAssignment] = useState({
    id: 1,
    title: "NodeJS Assignment",
    description: "Create a NodeJS server with ExpressJS",
    due: "2021-10-10",
    completed: false,
    score: 0,
  });

  const [moduleObj, setModuleObj] = useState({
    id: "mod1",
    name: "Introduction to React",
    description: "Learn the basics of React",
    course: "CS5610",
  });

  /* ---------- ROUTE BASES ---------- */
  const ASSIGNMENT_API_URL = `${HTTP_SERVER}/lab5/assignment`;
  const MODULE_API_URL = `${HTTP_SERVER}/lab5/module`;

  return (
    <div id="wd-working-with-objects">
      <h3>Working With Objects</h3>

      {/* ───────────────────── ASSIGNMENT ───────────────────── */}
      <h4>Assignment – Retrieve Object</h4>
      <a
        id="wd-retrieve-assignments"
        className="btn btn-primary"
        href={ASSIGNMENT_API_URL}
      >
        Get Assignment
      </a>

      <h4 className="mt-3">Assignment – Retrieve Property</h4>
      <a
        id="wd-retrieve-assignment-title"
        className="btn btn-primary"
        href={`${ASSIGNMENT_API_URL}/title`}
      >
        Get Title
      </a>

      <h4 className="mt-3">Assignment – Modify Properties</h4>

      {/* Title */}
      <div className="mb-2">
        <a
          id="wd-update-assignment-title"
          className="btn btn-primary float-end"
          href={`${ASSIGNMENT_API_URL}/title/${encodeURIComponent(
            assignment.title
          )}`}
        >
          Update Title
        </a>
        <FormControl
          className="w-75"
          id="wd-assignment-title"
          value={assignment.title}
          onChange={(e) =>
            setAssignment({ ...assignment, title: e.target.value })
          }
        />
      </div>

      {/* Score */}
      <div className="mb-2">
        <a
          id="wd-update-assignment-score"
          className="btn btn-primary float-end"
          href={`${ASSIGNMENT_API_URL}/score/${assignment.score}`}
        >
          Update Score
        </a>
        <FormControl
          type="number"
          className="w-75"
          id="wd-assignment-score"
          value={assignment.score}
          onChange={(e) =>
            setAssignment({ ...assignment, score: Number(e.target.value) })
          }
        />
      </div>

      {/* Completed */}
      <div className="mb-3">
        <a
          id="wd-update-assignment-completed"
          className="btn btn-primary float-end"
          href={`${ASSIGNMENT_API_URL}/completed/${assignment.completed}`}
        >
          Update Completed
        </a>
        <FormCheck
          type="checkbox"
          id="wd-assignment-completed"
          label="Completed?"
          checked={assignment.completed}
          onChange={(e) =>
            setAssignment({ ...assignment, completed: e.target.checked })
          }
        />
      </div>

      <hr />

      {/* ───────────────────────── MODULE ──────────────────────── */}
      <h4>Module – Retrieve Object</h4>
      <a
        id="wd-retrieve-module"
        className="btn btn-secondary"
        href={MODULE_API_URL}
      >
        Get Module
      </a>

      <h4 className="mt-3">Module – Retrieve Property</h4>
      <a
        id="wd-retrieve-module-name"
        className="btn btn-secondary"
        href={`${MODULE_API_URL}/name`}
      >
        Get Module Name
      </a>

      <h4 className="mt-3">Module – Modify Properties</h4>

      {/* Name */}
      <div className="mb-2">
        <a
          id="wd-update-module-name"
          className="btn btn-secondary float-end"
          href={`${MODULE_API_URL}/name/${encodeURIComponent(moduleObj.name)}`}
        >
          Update Name
        </a>
        <FormControl
          className="w-75"
          id="wd-module-name"
          value={moduleObj.name}
          onChange={(e) => setModuleObj({ ...moduleObj, name: e.target.value })}
        />
      </div>

      {/* Description */}
      <div className="mb-2">
        <a
          id="wd-update-module-description"
          className="btn btn-secondary float-end"
          href={`${MODULE_API_URL}/description/${encodeURIComponent(
            moduleObj.description
          )}`}
        >
          Update Description
        </a>
        <FormControl
          as="textarea"
          rows={2}
          className="w-75"
          id="wd-module-description"
          value={moduleObj.description}
          onChange={(e) =>
            setModuleObj({ ...moduleObj, description: e.target.value })
          }
        />
      </div>
    </div>
  );
}