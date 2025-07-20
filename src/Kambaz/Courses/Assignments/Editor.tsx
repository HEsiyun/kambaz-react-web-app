import { Container, Form, Row, Col, InputGroup } from "react-bootstrap";
import { BsCalendar3, BsX } from "react-icons/bs";
import { useParams, Link } from "react-router-dom";
import * as db from "../../Database";

export default function AssignmentEditor() {
  const { cid, aid } = useParams();
  const assignment = db.assignments.find(a => a.course === cid && a._id === aid);

  if (!assignment) return <div>Assignment not found</div>;

  return (
    <Container className="mt-4">
      <h4>Assignment Name</h4>
      <Form.Control
        type="text"
        className="mb-3"
        value={assignment.title}
        readOnly
      />

      {/* Description */}
      <Form.Group className="mb-3">
      <Form.Label>Description</Form.Label>
      <div className="mb-3 p-3 bg-white rounded border">
        {/* Assignment description from JSON */}
        <div className="mb-3">{assignment.description}</div>

        {/* Formatted instructions */}
        <div>
          The assignment is{" "}
          <span style={{ color: "red" }}>available online</span>
        </div>
        <div className="mt-3">
          Submit a link to the landing page of your Web application running on{" "}
          <a href="https://netlify.com" target="_blank" rel="noopener noreferrer">
            Netlify
          </a>
          .
        </div>
        <div className="mt-3">
          The landing page should include the following:
          <ul>
            <li>Your full name and section</li>
            <li>Links to each of the lab assignments</li>
            <li>Link to the Kanbas application</li>
            <li>Links to all relevant source code repositories</li>
          </ul>
          The Kanbas application should include a link to navigate back to the landing page.
        </div>
      </div>
    </Form.Group>

      {/* Points */}
      <Row className="mb-3">
        <Col sm={2}>
          <Form.Label>Points</Form.Label>
        </Col>
        <Col sm={4}>
          <Form.Control type="number" value={assignment.points} readOnly />
        </Col>
      </Row>

      {/* Assignment Group */}
      <Row className="mb-3">
        <Col sm={2}>
          <Form.Label>Assignment Group</Form.Label>
        </Col>
        <Col sm={4}>
          <Form.Select>
            <option>ASSIGNMENTS</option>
            <option>Other</option>
          </Form.Select>
        </Col>
      </Row>

      {/* Display Grade as */}
      <Row className="mb-3">
        <Col sm={2}>
          <Form.Label>Display Grade as</Form.Label>
        </Col>
        <Col sm={4}>
          <Form.Select>
            <option>Percentage</option>
            <option>Number</option>
          </Form.Select>
        </Col>
      </Row>

      {/* Submission Type */}
      <Row className="mb-3 align-items-start">
        <Col sm={2}>
          <Form.Label>Submission Type</Form.Label>
        </Col>
        <Col sm={6}>
          <div className="border rounded p-3">
            <Form.Select className="mb-3">
              <option>Online</option>
              <option>On Paper</option>
            </Form.Select>
            <div className="fw-bold mb-2">Online Entry Options</div>
            <Form.Check
              type="checkbox"
              id="text-entry"
              label="Text Entry"
              className="mb-2"
            />
            <Form.Check
              type="checkbox"
              id="website-url"
              label="Website URL"
              className="mb-2"
              defaultChecked
            />
            <Form.Check
              type="checkbox"
              id="media-recordings"
              label="Media Recordings"
              className="mb-2"
            />
            <Form.Check
              type="checkbox"
              id="student-annotation"
              label="Student Annotation"
              className="mb-2"
            />
            <Form.Check
              type="checkbox"
              id="file-uploads"
              label="File Uploads"
            />
          </div>
        </Col>
      </Row>

      {/* Assign */}
      <Row className="mb-4">
  <Col sm={2}>
    <Form.Label className="pt-2">Assign</Form.Label>
  </Col>
  <Col sm={8}>
    <div className="border rounded p-3 bg-white">
      <div className="fw-bold mb-1">Assign to</div>
      <div className="mb-3">
        <span className="badge bg-light text-dark border rounded-pill pe-3 ps-3 d-inline-flex align-items-center"
              style={{ fontSize: "1rem" }}>
          Everyone
          <BsX className="ms-2 pointer-events-none" />
        </span>
      </div>
      {/* DUE */}
      <div className="fw-bold mb-1">
        <Form.Label className="fw-bold mb-1">Due</Form.Label>
      </div>
      <InputGroup className="mb-3">
        <Form.Control
          type="datetime-local"
          id="wd-due-date"
          value={assignment.dueDate}
          readOnly
        />
        <InputGroup.Text><BsCalendar3 /></InputGroup.Text>
      </InputGroup>
      {/* AVAILABLE FROM & UNTIL */}
      <Row>
        <Col>
          <div className="fw-bold mb-1">
            <Form.Label className="fw-bold mb-1">Available from</Form.Label>
          </div>
          <InputGroup className="mb-3">
            <Form.Control
              type="datetime-local"
              id="wd-available-from"
              value={
                assignment.availableDate
                  ? (assignment.availableDate.length === 10
                      ? assignment.availableDate + "T00:00"
                      : assignment.availableDate)
                  : ""
              }
              readOnly
            />
            <InputGroup.Text><BsCalendar3 /></InputGroup.Text>
          </InputGroup>
        </Col>
        <Col>
          <div className="fw-bold mb-1">
            <Form.Label className="fw-bold mb-1">Until</Form.Label>
          </div>
          <InputGroup className="mb-3">
            <Form.Control
              type="datetime-local"
              id="wd-available-until"
            />
            <InputGroup.Text><BsCalendar3 /></InputGroup.Text>
          </InputGroup>
        </Col>
      </Row>
    </div>
  </Col>
</Row>

      {/* Cancel and Save buttons */}
      <div className="d-flex justify-content-end gap-2 mb-4">
        <Link
          to={`/Kambaz/Courses/${cid}/Assignments`}
          className="btn btn-light border"
        >
          Cancel
        </Link>
        <Link
          to={`/Kambaz/Courses/${cid}/Assignments`}
          className="btn btn-danger"
        >
          Save
        </Link>
      </div>
    </Container>
  );
}