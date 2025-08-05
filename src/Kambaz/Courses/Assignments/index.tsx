// Kambaz/Courses/Assignments/index.tsx
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Button,
  FormControl,
  InputGroup,
  Modal,
} from "react-bootstrap";
import {
  FaPlus,
  FaCheckCircle,
  FaTrash,
} from "react-icons/fa";
import {
  BsThreeDotsVertical,
  BsGripVertical,
  BsCaretDownFill,
} from "react-icons/bs";
import { GoSearch } from "react-icons/go";
import { MdOutlineAssignment } from "react-icons/md";

import type { RootState, AppDispatch } from "../../store";
import { assignmentThunks, type Assignment } from "./reducer";

function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function Assignments() {
  const { cid } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  /* fetch on mount / cid change */
  useEffect(() => {
    dispatch(assignmentThunks.fetchAssignments(cid));
  }, [cid, dispatch]);

  const assignments = useSelector(
    (s: RootState) => s.assignmentsReducer.assignments
  );
  const currentUser = useSelector(
    (s: RootState) => s.accountReducer.currentUser as { role?: string } | null
  );
  const isFaculty = currentUser?.role === "FACULTY";

  const list = assignments.filter((a) => a.course === cid);

  /* delete-confirmation modal */
  const [show, setShow] = useState(false);
  const [aidToDelete, setAid] = useState<string | null>(null);
  const confirmDelete = () => {
    if (aidToDelete)
      dispatch(assignmentThunks.deleteAssignmentThunk(aidToDelete));
    setShow(false);
  };

  return (
    <div id="wd-assignments" className="p-3">
      {/* 🔍 top bar */}
      <div className="d-flex mb-2 align-items-center">
        <InputGroup className="w-50">
          <InputGroup.Text>
            <GoSearch />
          </InputGroup.Text>
          <FormControl placeholder="Search…" />
        </InputGroup>

        {isFaculty && (
          <Button
            variant="danger"
            size="sm"
            className="ms-auto"
            onClick={() =>
              navigate(`/Kambaz/Courses/${cid}/Assignments/new`)
            }
          >
            <FaPlus className="me-2" />
            Assignment
          </Button>
        )}
      </div>

      {/* 📋 header */}
      <div className="d-flex align-items-center bg-light p-2 mb-2">
        <BsGripVertical className="me-2 text-secondary fs-4" />
        <BsCaretDownFill className="me-2" />
        <span className="fw-bold flex-grow-1">ASSIGNMENTS</span>
        <span className="border rounded-pill px-3 py-1 bg-white">
          40% of Total
        </span>
        <Button variant="light" size="sm" className="ms-2">
          <FaPlus />
        </Button>
        <Button variant="light" size="sm" className="ms-2">
          <BsThreeDotsVertical />
        </Button>
      </div>

      {/* 📜 list */}
      <ul className="list-group">
        {list.map((a: Assignment) => (
          <li
            key={a._id}
            className="list-group-item d-flex align-items-start border-0 border-start border-success border-4 mb-2"
          >
            <BsGripVertical className="me-2 mt-1 text-secondary" />
            <MdOutlineAssignment className="me-2 mt-1 text-success" />
            <div className="flex-grow-1">
              {/* title */}
              <Link
                to={`/Kambaz/Courses/${cid}/Assignments/${a._id}`}
                className="fw-bold text-decoration-none"
              >
                {a.title}
              </Link>

              {/* NEW: availability row */}
              <div className="small">
                <span className="text-danger">Multiple&nbsp;Modules</span>{" "}
                |{" "}
                {a.availableDate && (
                  <>
                    Not&nbsp;available&nbsp;until&nbsp;
                    {formatDate(a.availableDate)} |{" "}
                  </>
                )}
                {a.untilDate && (
                  <>
                    Available&nbsp;until&nbsp;
                    {formatDate(a.untilDate)} |{" "}
                  </>
                )}
              </div>

              {/* existing due row */}
              <div className="text-secondary small">
                <b>Due</b> {formatDate(a.dueDate)} | {a.points} pts
              </div>
            </div>

            {/* actions */}
            {isFaculty && (
              <Button
                variant="link"
                className="p-0 text-danger"
                onClick={() => {
                  setAid(a._id);
                  setShow(true);
                }}
              >
                <FaTrash />
              </Button>
            )}
            <FaCheckCircle className="text-success ms-2" />
            <BsThreeDotsVertical className="ms-2" />
          </li>
        ))}
      </ul>

      {/* 🗑️ confirm modal */}
      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Assignment</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShow(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}