import { useState, useEffect } from "react";
import { Container, Form, Row, Col, InputGroup, Button } from "react-bootstrap";
import { BsCalendar3 } from "react-icons/bs";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { addAssignment, updateAssignment } from "./reducer"; // adjust path

export default function AssignmentEditor() {
  const { cid, aid } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get assignments from Redux store
  const assignments = useSelector((state: any) => state.assignmentsReducer.assignments);

  // If editing, find assignment
  const editing = aid && aid !== "new";
  const assignment = assignments.find((a: any) => a._id === aid);

  // Local state for controlled form
  const [title, setTitle] = useState("New Assignment");
  const [description, setDescription] = useState("New Assignment Description");
  const [points, setPoints] = useState(100);
  const [dueDate, setDueDate] = useState("");
  const [availableFrom, setAvailableFrom] = useState("");
  const [availableUntil, setAvailableUntil] = useState("");

  // Populate for edit
  useEffect(() => {
    if (editing && assignment) {
      setTitle(assignment.title || "");
      setDescription(assignment.description || "");
      setPoints(assignment.points ?? 100);
      setDueDate(assignment.dueDate || "");
      setAvailableFrom(assignment.availableDate || "");
      setAvailableUntil(assignment.untilDate || "");
    }
  }, [editing, assignment]);

  // Save: update or create, then navigate
  const handleSave = () => {
    if (editing) {
      dispatch(
        updateAssignment({
          ...assignment,
          title,
          description,
          points,
          dueDate,
          availableDate: availableFrom,
          untilDate: availableUntil,
        })
      );
    } else {
      dispatch(
        addAssignment({
          title,
          description,
          points,
          dueDate,
          availableDate: availableFrom,
          untilDate: availableUntil,
          course: cid ?? "",
        })
      );
    }
    navigate(`/Kambaz/Courses/${cid}/Assignments`);
  };

  // Cancel: go back, no change
  const handleCancel = () => {
    navigate(`/Kambaz/Courses/${cid}/Assignments`);
  };

  return (
    <Container className="mt-4" style={{ maxWidth: 800 }}>
      <Form>
        <Form.Group className="mb-3">
          <Form.Label>Assignment Name</Form.Label>
          <Form.Control
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            id="wd-assignment-title"
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
            id="wd-assignment-description"
          />
        </Form.Group>
        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm={2}>Points</Form.Label>
          <Col sm={4}>
            <Form.Control
              type="number"
              value={points}
              onChange={e => setPoints(Number(e.target.value))}
              id="wd-assignment-points"
            />
          </Col>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Assign</Form.Label>
          <div className="border rounded p-3 bg-white">
            <div className="fw-bold mb-1">Due</div>
            <InputGroup className="mb-3">
              <Form.Control
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                id="wd-due-date"
              />
              <InputGroup.Text><BsCalendar3 /></InputGroup.Text>
            </InputGroup>
            <Row>
              <Col>
                <div className="fw-bold mb-1">Available from</div>
                <InputGroup className="mb-3">
                  <Form.Control
                    type="date"
                    value={availableFrom}
                    onChange={e => setAvailableFrom(e.target.value)}
                    id="wd-available-from"
                  />
                  <InputGroup.Text><BsCalendar3 /></InputGroup.Text>
                </InputGroup>
              </Col>
              <Col>
                <div className="fw-bold mb-1">Until</div>
                <InputGroup className="mb-3">
                  <Form.Control
                    type="date"
                    value={availableUntil}
                    onChange={e => setAvailableUntil(e.target.value)}
                    id="wd-available-until"
                  />
                  <InputGroup.Text><BsCalendar3 /></InputGroup.Text>
                </InputGroup>
              </Col>
            </Row>
          </div>
        </Form.Group>
        <div className="d-flex justify-content-end gap-2 mb-4">
          <Button variant="light" className="border" onClick={handleCancel} id="wd-cancel-btn">
            Cancel
          </Button>
          <Button variant="danger" onClick={handleSave} id="wd-save-btn">
            Save
          </Button>
        </div>
      </Form>
    </Container>
  );
}