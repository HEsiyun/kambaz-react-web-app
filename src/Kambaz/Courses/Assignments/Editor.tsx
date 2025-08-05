// Kambaz/Courses/Assignments/Editor.tsx
import { useEffect, useState } from "react";
import { Container, Form, Row, Col, InputGroup, Button } from "react-bootstrap";
import { BsCalendar3 } from "react-icons/bs";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../store";
import { assignmentThunks } from "./reducer";

export default function AssignmentEditor() {
  const { cid, aid }      = useParams();
  const navigate          = useNavigate();
  const dispatch          = useDispatch<AppDispatch>();

  /* load list (needed for edit-refresh) */
  useEffect(()=>{ dispatch(assignmentThunks.fetchAssignments(cid)); },[cid,dispatch]);

  const assignments       = useSelector((s:RootState)=>s.assignmentsReducer.assignments);
  const editing           = aid && aid !== "new";
  const existing          = assignments.find((a: { _id: string | undefined; })=>a._id === aid);

  const [title,        setTitle]        = useState<string>(existing?.title ?? "New Assignment");
  const [description,  setDescription]  = useState<string>(existing?.description ?? "");
  const [points,       setPoints]       = useState<number>(existing?.points ?? 100);
  const [dueDate,      setDueDate]      = useState<string>(existing?.dueDate ?? "");
  const [availableFrom,setAvailableFrom]= useState<string>(existing?.availableDate ?? "");
  const [availableUntil,setAvailableUntil]=useState<string>(existing?.untilDate ?? "");

  /* keep local form in-sync if redux list loads later */
  useEffect(()=>{
    if(editing && existing){
      setTitle(existing.title);
      setDescription(existing.description ?? "");
      setPoints(existing.points);
      setDueDate(existing.dueDate ?? "");
      setAvailableFrom(existing.availableDate ?? "");
      setAvailableUntil(existing.untilDate ?? "");
    }
  },[editing, existing]);

  const save = () => {
    const payload = { title, description, points, dueDate,
                      availableDate: availableFrom, untilDate: availableUntil, course: cid ?? "" };

    if (editing) dispatch(assignmentThunks.updateAssignmentThunk({ ...existing!, ...payload }));
    else         dispatch(assignmentThunks.createAssignmentThunk(payload as any));

    navigate(`/Kambaz/Courses/${cid}/Assignments`);
  };

  return (
    <Container className="mt-4" style={{maxWidth:800}}>
      <Form>
        <Form.Group className="mb-3">
          <Form.Label>Assignment Name</Form.Label>
          <Form.Control value={title} onChange={e=>setTitle(e.target.value)} />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Description</Form.Label>
          <Form.Control as="textarea" rows={3}
                        value={description} onChange={e=>setDescription(e.target.value)}/>
        </Form.Group>

        <Row className="mb-3">
          <Col sm={2}><Form.Label>Points</Form.Label></Col>
          <Col sm={4}>
            <Form.Control type="number" value={points}
                          onChange={e=>setPoints(+e.target.value)}/>
          </Col>
        </Row>

        {/* Dates */}
        <Form.Group className="mb-3">
          <Form.Label>Assign</Form.Label>
          <div className="border rounded p-3 bg-white">
            <div className="fw-bold mb-1">Due</div>
            <InputGroup className="mb-3">
              <Form.Control type="date" value={dueDate}
                            onChange={e=>setDueDate(e.target.value)}/>
              <InputGroup.Text><BsCalendar3/></InputGroup.Text>
            </InputGroup>

            <Row>
              <Col>
                <div className="fw-bold mb-1">Available from</div>
                <InputGroup className="mb-3">
                  <Form.Control type="date" value={availableFrom}
                                onChange={e=>setAvailableFrom(e.target.value)}/>
                  <InputGroup.Text><BsCalendar3/></InputGroup.Text>
                </InputGroup>
              </Col>
              <Col>
                <div className="fw-bold mb-1">Until</div>
                <InputGroup className="mb-3">
                  <Form.Control type="date" value={availableUntil}
                                onChange={e=>setAvailableUntil(e.target.value)}/>
                  <InputGroup.Text><BsCalendar3/></InputGroup.Text>
                </InputGroup>
              </Col>
            </Row>
          </div>
        </Form.Group>

        <div className="d-flex justify-content-end gap-2 mb-4">
          <Button variant="light" className="border" onClick={()=>navigate(-1)}>Cancel</Button>
          <Button variant="danger"           onClick={save}>Save</Button>
        </div>
      </Form>
    </Container>
  );
}