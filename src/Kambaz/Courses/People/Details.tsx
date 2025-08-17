import { useEffect, useState } from "react";
import { FaCheck, FaUserCircle } from "react-icons/fa";
import { IoCloseSharp } from "react-icons/io5";
import { useParams, useNavigate } from "react-router-dom";
import * as client from "../../Account/client";
import { FaPencil } from "react-icons/fa6";
import { FormControl, Form } from "react-bootstrap";

const ROLE_OPTIONS = ["ADMIN", "FACULTY", "STUDENT"];

export default function PeopleDetails() {
  const { uid } = useParams();
  const [user, setUser] = useState<any>({});
  const navigate = useNavigate();

  // local edit state
  const [name, setName]   = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole]   = useState<string>("");
  const [editing, setEditing] = useState(false);

  const deleteUser = async (id: string) => {
    await client.deleteUser(id);
    navigate(-1);
  };

  const fetchUser = async () => {
    if (!uid) return;
    const u = await client.findUserById(uid);
    setUser(u);
    setName(`${u?.firstName ?? ""} ${u?.lastName ?? ""}`.trim());
    setEmail(u?.email ?? "");
    setRole(u?.role ?? "");
  };

  const saveUser = async () => {
    const [firstName = "", lastName = ""] = name.trim().split(/\s+/, 2);
    const updatedUser = { ...user, firstName, lastName, email, role };
    await client.updateUser(updatedUser);
    setUser(updatedUser);
    setEditing(false);
    navigate(-1);
  };

  useEffect(() => {
    if (uid) fetchUser();
  }, [uid]);

  if (!uid) return null;

  return (
    <div className="wd-people-details position-fixed top-0 end-0 bottom-0 bg-white p-4 shadow w-25">
      <button
        onClick={() => navigate(-1)}
        className="btn position-fixed end-0 top-0 wd-close-details"
      >
        <IoCloseSharp className="fs-1" />
      </button>

      <div className="text-center mt-2">
        <FaUserCircle className="text-secondary me-2 fs-1" />
      </div>

      <hr />

      <div className="text-danger fs-4">
        {!editing && (
          <FaPencil
            onClick={() => setEditing(true)}
            className="float-end fs-5 mt-2 wd-edit"
            role="button"
          />
        )}
        {editing && (
          <FaCheck
            onClick={saveUser}
            className="float-end fs-5 mt-2 me-2 wd-save"
            role="button"
          />
        )}

        {!editing ? (
          <div className="wd-name" onClick={() => setEditing(true)} role="button">
            {user.firstName} {user.lastName}
          </div>
        ) : (
          <FormControl
            className="w-75 wd-edit-name mt-2"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && saveUser()}
          />
        )}
      </div>

      <div className="mt-3">
        <b>Email:</b>{" "}
        {!editing ? (
          <span className="wd-email">{user.email}</span>
        ) : (
          <FormControl
            className="w-75 mt-2 wd-edit-email"
            type="email"
            value={email}
            placeholder="name@example.com"
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && saveUser()}
          />
        )}
      </div>

      <div className="mt-3">
        <b>Role:</b>{" "}
        {!editing ? (
          <span className="wd-roles">{user.role}</span>
        ) : (
          <Form.Select
            className="w-75 mt-2 wd-edit-role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="" disabled>Select role…</option>
            {ROLE_OPTIONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </Form.Select>
        )}
      </div>

      <div className="mt-3">
        <b>Login ID:</b> <span className="wd-login-id">{user.loginId}</span>
        <br />
        <b>Section:</b> <span className="wd-section">{user.section}</span>
        <br />
        <b>Total Activity:</b>{" "}
        <span className="wd-total-activity">{user.totalActivity}</span>
      </div>

      <hr />

      <button onClick={() => deleteUser(uid)} className="btn btn-danger float-end wd-delete">
        Delete
      </button>
      <button onClick={() => navigate(-1)} className="btn btn-secondary float-start me-2 wd-cancel">
        Cancel
      </button>
    </div>
  );
}