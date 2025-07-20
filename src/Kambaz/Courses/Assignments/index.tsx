import { InputGroup, FormControl, Button } from "react-bootstrap";
import { FaPlus, FaCheckCircle } from "react-icons/fa";
import { BsThreeDotsVertical, BsGripVertical, BsCaretDownFill } from "react-icons/bs";
import { GoSearch } from "react-icons/go";
import { MdOutlineAssignment } from "react-icons/md";
import { useParams, Link } from "react-router-dom";
import * as db from "../../Database";

// Helper to format date as "May 13 at 11:59pm"
function formatDate(dateStr: string | number | Date) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const month = d.toLocaleString("default", { month: "short" });
  const day = d.getDate();
  let hour = d.getHours();
  const minute = d.getMinutes().toString().padStart(2, "0");
  const ampm = hour >= 12 ? "pm" : "am";
  hour = hour % 12 || 12;
  return `${month} ${day} at ${hour}:${minute}${ampm}`;
}

export default function Assignments() {
  const { cid } = useParams();
  const assignments = db.assignments.filter(a => a.course === cid);

  return (
    <div id="wd-assignments" className="p-3">
      {/* Top Bar */}
      <div className="d-flex mb-2 align-items-center">
        <InputGroup className="w-50">
          <InputGroup.Text>
            <GoSearch />
          </InputGroup.Text>
          <FormControl
            placeholder="Search..."
            aria-label="Search"
            id="wd-search-assignment"
          />
        </InputGroup>
        <div className="ms-auto">
          <Button variant="secondary" size="sm" className="me-2" id="wd-add-assignment-group">
            <FaPlus className="me-2" /> Group
          </Button>
          <Button variant="danger" size="sm" id="wd-add-assignment">
            <FaPlus className="me-2" /> Assignment
          </Button>
        </div>
      </div>

      {/* Assignments Title Row */}
      <div className="d-flex align-items-center bg-light p-2 mb-2">
        <BsGripVertical className="me-2 text-secondary fs-4" />
        <BsCaretDownFill className="me-2 text-dark fs-6" />
        <span className="fw-bold flex-grow-1">ASSIGNMENTS</span>
        <span className="border rounded-pill px-3 py-1 bg-white text-dark me-2"
          style={{ fontSize: "1.15rem", borderWidth: "1.5px" }}>
          40% of Total
        </span>
        <Button variant="light" size="sm" className="border">
          <FaPlus />
        </Button>
        <Button variant="light" size="sm" className="border ms-2">
          <BsThreeDotsVertical />
        </Button>
      </div>

      {/* Assignments List */}
      <ul className="list-group">
        {assignments.map((a, _idx) => (
          <li
            className="list-group-item d-flex align-items-start border-0 border-start border-success border-4 mb-2"
            key={a._id}
          >
            <BsGripVertical className="me-2 mt-1 text-secondary fs-5" />
            <MdOutlineAssignment className="me-2 mt-1 text-success fs-5" />
            <div className="flex-grow-1">
              <Link
                to={`/Kambaz/Courses/${cid}/Assignments/${a._id}`}
                className="fw-bold text-decoration-none text-dark"
              >
                {a.title}
              </Link>
              <div className="text-secondary small">
                Multiple Modules | <b>Not available until</b> {formatDate(a.availableDate)} |<br />
                <b>Due</b> {formatDate(a.dueDate)} | {a.points} pts
              </div>
            </div>
            <div className="ms-2 d-flex align-items-center">
              <FaCheckCircle className="text-success fs-4" />
              <BsThreeDotsVertical className="fs-5 ms-2" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}