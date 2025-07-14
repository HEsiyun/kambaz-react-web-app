import { Link } from "react-router-dom";
import { Form } from "react-bootstrap";

export default function Profile() {
  return (
    <div id="wd-profile-screen" className="p-4" style={{ maxWidth: 500 }}>
      <h1>Profile</h1>
      <Form.Control
        defaultValue="alice"
        placeholder="username"
        className="mb-3"
      />
      <Form.Control
        defaultValue="123"
        placeholder="password"
        type="password"
        className="mb-3"
      />
      <Form.Control
        defaultValue="Alice"
        placeholder="First Name"
        className="mb-3"
      />
      <Form.Control
        defaultValue="Wonderland"
        placeholder="Last Name"
        className="mb-3"
      />
      <Form.Control
        placeholder="mm/dd/yyyy"
        type="date"
        className="mb-3"
      />
      <Form.Control
        defaultValue="alice@wonderland.com"
        type="email"
        placeholder="Email"
        className="mb-3"
      />
      <Form.Control
        as="select"
        defaultValue="User"
        className="mb-3"
      >
        <option>User</option>
        <option>Admin</option>
        <option>Faculty</option>
        <option>Student</option>
      </Form.Control>
      <Link
        to="/Kambaz/Account/Signin"
        className="btn btn-danger w-100"
        style={{ fontSize: 22 }}
      >
        Signout
      </Link>
    </div>
  );
}