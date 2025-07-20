import { Link, useLocation, useParams } from "react-router-dom";

const links = [
  "Home",
  "Modules",
  "Piazza",
  "Zoom",
  "Assignments",
  "Quizzes",
  "Grades",
  "People",
];

export default function CourseNavigation() {
  const { cid } = useParams(); // get current course id from path
  const { pathname } = useLocation();

  return (
    <div id="wd-courses-navigation" className="wd list-group fs-5 rounded-0">
      {links.map((name) => {
        // Build the link path dynamically using cid
        const linkPath = `/Kambaz/Courses/${cid}/${name}`;
        // Check if the link is active by matching pathname
        const isActive = pathname.includes(name);
        return (
          <Link
            key={name}
            to={linkPath}
            className={`list-group-item border border-0 ${
              isActive ? "active" : "text-danger"
            }`}
            id={`wd-course-${name.toLowerCase()}-link`}
          >
            {name}
          </Link>
        );
      })}
    </div>
  );
}