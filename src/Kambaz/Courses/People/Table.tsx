import { Table } from "react-bootstrap";
import { FaUserCircle } from "react-icons/fa";
import PeopleDetails from "./Details";
import { Link } from "react-router-dom";
import { useParams } from "react-router";

// Accepts users as a prop; defaults to empty array if not provided
export default function PeopleTable({ users = [] }: { users?: any[] }) {
  const { cid } = useParams();
  // If we're under /Courses/:cid/People, link there; else fallback to global users
  const detailsBase = cid
    ? `/Kambaz/Courses/${cid}/People`
    : `/Kambaz/Account/Users`;

  return (
    <div id="wd-people-table">
      {/* Side panel will render only when a :uid is present in the URL */}
      <PeopleDetails />

      <Table striped>
        <thead>
          <tr>
            <th>Name</th>
            <th>Login ID</th>
            <th>Section</th>
            <th>Role</th>
            <th>Last Activity</th>
            <th>Total Activity</th>
          </tr>
        </thead>
        <tbody>
          {(users || []).map((user) => (
            <tr key={user._id}>
              <td className="wd-full-name text-nowrap">
                <Link
                  to={`${detailsBase}/${user._id}`}
                  className="text-decoration-none"
                >
                  <FaUserCircle className="me-2 fs-1 text-secondary" />
                  <span className="wd-first-name">{user.firstName}</span>{" "}
                  <span className="wd-last-name">{user.lastName}</span>
                </Link>
              </td>
              <td className="wd-login-id">{user.loginId}</td>
              <td className="wd-section">{user.section}</td>
              <td className="wd-role">{user.role}</td>
              <td className="wd-last-activity">{user.lastActivity}</td>
              <td className="wd-total-activity">{user.totalActivity}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}