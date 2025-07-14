import { Container, Form, Row, Col, InputGroup } from "react-bootstrap";
import { BsCalendar3, BsX } from "react-icons/bs";

export default function AssignmentEditor() {
  return (
    <Container className="mt-4">
      <h4>Assignment Name</h4>
      <Form.Control
        type="text"
        className="mb-3"
        value="A1"
      />

      {/* Description */}
      <Form.Group className="mb-3">
        <Form.Control
          as="textarea"
          rows={6}
          defaultValue={
            `The assignment is available online\n` +
            `Submit a link to the landing page of your Web application running on Netlify.\n\n` +
            `The landing page should include the following:\n` +
            `- Your full name and section\n` +
            `- Links to each of the lab assignments\n` +
            `- Link to the Kanbas application\n` +
            `- Links to all relevant source code repositories\n` +
            `The Kanbas application should include a link to navigate back to the landing page.`
          }
        />
      </Form.Group>

      {/* Points */}
      <Row className="mb-3">
        <Col sm={2}>
          <Form.Label>Points</Form.Label>
        </Col>
        <Col sm={4}>
          <Form.Control type="number" value={100} />
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

      {/* Submission Type - THIS IS THE KEY SECTION */}
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
      {/* left gutter with the word “Assign”  */}
      <Col sm={2}>
        <Form.Label className="pt-2">Assign</Form.Label>
      </Col>

      {/* white box */}
      <Col sm={8 /* = 6 + shift on lg */}>
        <div className="border rounded p-3 bg-white">
          {/* Assign-to pill */}
          <div className="fw-bold mb-1">Assign to</div>
          <div className="mb-3">
            <span className="badge bg-light text-dark border rounded-pill pe-3 ps-3 d-inline-flex align-items-center"
                  style={{ fontSize: "1rem" }}>
              Everyone
              <BsX className="ms-2 pointer-events-none" />
            </span>
          </div>

          {/* DUE  */}
          <div className="fw-bold mb-1">
          <Form.Label className="fw-bold mb-1">Due</Form.Label>
          </div>
          <InputGroup className="mb-3">
            <Form.Control
              type="datetime-local"
              id="wd-due-date"
              defaultValue="2024-05-13T23:59"
            />
            <InputGroup.Text><BsCalendar3 /></InputGroup.Text>
          </InputGroup>

          {/* AVAILABLE FROM  &  UNTIL */}
          <Row>
            <Col>
              <div className="fw-bold mb-1">
              <Form.Label className="fw-bold mb-1">Available from</Form.Label>
                </div>
              <InputGroup className="mb-3">
                <Form.Control
                  type="datetime-local"
                  id="wd-available-from"
                  defaultValue="2024-05-06T00:00"
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
    </Container>
  );
}