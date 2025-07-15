import { InputGroup, FormControl, Button } from "react-bootstrap";
import { FaPlus, FaCheckCircle } from "react-icons/fa";
import { BsThreeDotsVertical, BsGripVertical, BsCaretDownFill } from "react-icons/bs";
import { GoSearch } from "react-icons/go";
import { MdOutlineAssignment } from "react-icons/md";

export default function Assignments() {
  return (
    <div id="wd-assignments" className="p-3">
      {/* Top Bar: Search + Buttons */}
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
          <Button
            variant="secondary"
            size="sm"
            className="me-2"
            id="wd-add-assignment-group"
          >
            <FaPlus className="me-2" /> Group
          </Button>
          <Button
            variant="danger"
            size="sm"
            id="wd-add-assignment"
          >
            <FaPlus className="me-2" /> Assignment
          </Button>
        </div>
      </div>

      {/* Assignments Title Row */}
      <div className="d-flex align-items-center bg-light p-2 mb-2">
      <BsGripVertical className="me-2 text-secondary fs-4" />
      <BsCaretDownFill className="me-2 text-dark fs-6" /> {/* The triangle */}
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
        <li className="list-group-item d-flex align-items-start border-0 border-start border-success border-4 mb-2">
        <BsGripVertical className="me-2 mt-1 text-secondary fs-5" />
        <MdOutlineAssignment className="me-2 mt-1 text-success fs-5" />
        <div className="flex-grow-1">
          <a href="#/Kambaz/Courses/1234/Assignments/123" className="fw-bold text-decoration-none text-dark">
            A1 - ENV + HTML
          </a>
          <div className="text-secondary small">
            Multiple Modules | <b>Not available until</b> May 6 at 12:00am |<br /> <b>Due</b> May 13 at 11:59pm | 100 pts
          </div>
        </div>
        <div className="ms-2 d-flex align-items-center">
          <FaCheckCircle className="text-success fs-4" />
          <BsThreeDotsVertical className="fs-5 ms-2" />
        </div>
      </li>
        <li className="list-group-item d-flex align-items-start border-0 border-start border-success border-4 mb-2">
          <BsGripVertical className="me-2 mt-1 text-secondary fs-5" />
          <MdOutlineAssignment className="me-2 mt-1 text-success fs-5" />
          <div className="flex-grow-1">
            <a href="#/Kambaz/Courses/1234/Assignments/124" className="fw-bold text-decoration-none text-dark">
              A2 - CSS + BOOTSTRAP
            </a>
            <div className="text-secondary small">
              Multiple Modules | <b>Not available until</b> May 13 at 12:00am |<br /> <b>Due</b> May 20 at 11:59pm | 100 pts
            </div>
          </div>
          <div className="ms-2 d-flex align-items-center">
            <FaCheckCircle className="text-success fs-4" />
            <BsThreeDotsVertical className="fs-5 ms-2" />
          </div>
        </li>
        <li className="list-group-item d-flex align-items-start border-0 border-start border-success border-4 mb-2">
          <BsGripVertical className="me-2 mt-1 text-secondary fs-5" />
          <MdOutlineAssignment className="me-2 mt-1 text-success fs-5" />
          <div className="flex-grow-1">
            <a href="#/Kambaz/Courses/1234/Assignments/125" className="fw-bold text-decoration-none text-dark">
              A3 - JAVASCRIPT + REACT
            </a>
            <div className="text-secondary small">
              Multiple Modules | <b>Not available until</b> May 20 at 12:00am |<br /> <b>Due</b> May 27 at 11:59pm | 100 pts
            </div>
          </div>
          <div className="ms-2 d-flex align-items-center">
            <FaCheckCircle className="text-success fs-4" />
            <BsThreeDotsVertical className="fs-5 ms-2" />
          </div>
        </li>
      </ul>
    </div>
  );
}