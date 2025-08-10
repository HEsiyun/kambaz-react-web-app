import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCurrentUser } from "./reducer";
import * as client from "./client";

export default function Signin() {
  const [credentials, setCredentials] = useState<any>({});
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const signin = async () => {
    const user = await client.signin(credentials);
    if (!user) return;
    dispatch(setCurrentUser(user));
    navigate("/Kambaz/Dashboard");
  };

  return (
    <div
      id="wd-signin-screen"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#f7f7f7",
      }}
    >
      {/* Centered panel */}
      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px 16px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 420,
            background: "#fff",
            borderRadius: 10,
            padding: 32,
            boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
          }}
        >
          {/* NU Title */}
          <div style={{ textAlign: "left", marginBottom: 24 }}>
            <h1
              style={{
                fontFamily: "'Georgia','Times New Roman',serif",
                fontWeight: 600,
                fontSize: 32,
                margin: 0,
                color: "#111",
                letterSpacing: 0.2,
              }}
            >
              Northeastern University
            </h1>
          </div>

          {/* Username */}
          <label
            htmlFor="wd-username"
            style={{
              display: "block",
              fontSize: 14,
              fontWeight: 600,
              color: "#333",
              marginBottom: 6,
            }}
          >
            myNortheastern Username
          </label>
          <input
            id="wd-username"
            type="text"
            value={credentials.username ?? ""}
            onChange={(e) =>
              setCredentials({ ...credentials, username: e.target.value })
            }
            style={{
              width: "100%",
              height: 52,
              fontSize: 16,
              padding: "12px 14px",
              borderRadius: 6,
              border: "1px solid #d7d7d7",
              outline: "none",
              marginBottom: 18,
            }}
          />

          {/* Password */}
          <label
            htmlFor="wd-password"
            style={{
              display: "block",
              fontSize: 14,
              fontWeight: 600,
              color: "#333",
              marginBottom: 6,
            }}
          >
            myNortheastern Password
          </label>
          <input
            id="wd-password"
            type="password"
            value={credentials.password ?? ""}
            onChange={(e) =>
              setCredentials({ ...credentials, password: e.target.value })
            }
            style={{
              width: "100%",
              height: 52,
              fontSize: 16,
              padding: "12px 14px",
              borderRadius: 6,
              border: "1px solid #d7d7d7",
              outline: "none",
              marginBottom: 22,
            }}
          />

          {/* Log In button */}
          <button
            onClick={signin}
            id="wd-signin-btn"
            style={{
              width: "100%",
              height: 56,
              border: "none",
              borderRadius: 8,
              background: "#C8102E", // NU red
              color: "#fff",
              fontSize: 18,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 2px 0 rgba(0,0,0,0.08) inset",
              transition: "filter 0.15s ease",
            }}
            onMouseDown={(e) => (e.currentTarget.style.filter = "brightness(.95)")}
            onMouseUp={(e) => (e.currentTarget.style.filter = "none")}
            onMouseLeave={(e) => (e.currentTarget.style.filter = "none")}
          >
            Log In
          </button>

          {/* Signup link */}
          <div style={{ marginTop: 14 }}>
            <Link to="/Kambaz/Account/Signup" id="wd-signup-link">
              Sign up
            </Link>
          </div>
        </div>
      </main>

      {/* Footer pinned to bottom */}
      <footer
        style={{
          fontSize: "0.9rem",
          textAlign: "center",
          padding: "12px 8px 20px",
          borderTop: "1px solid #ddd",
          background: "#f7f7f7",
        }}
      >
        <h4 style={{ margin: "8px 0" }}>Project Information</h4>
        <p style={{ margin: 0 }}>
          <a
            href="https://github.com/HEsiyun/kambaz-react-web-app/tree/final"
            target="_blank"
            rel="noopener noreferrer"
          >
            Frontend GitHub
          </a>{" "}
          |{" "}
          <a
            href="https://github.com/HEsiyun/kambaz-node-server-app/tree/final"
            target="_blank"
            rel="noopener noreferrer"
          >
            Backend GitHub
          </a>
        </p>
        <p style={{ margin: "6px 0 0" }}>
          Team member: Siyun He (SEC 01 Summer 2 2025)
        </p>
      </footer>
    </div>
  );
}