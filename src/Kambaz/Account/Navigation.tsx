import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

export default function AccountNavigation() {
  const { currentUser } = useSelector((state: any) => state.accountReducer);
  const { pathname } = useLocation();

  // Utility for the correct class styling
  const navClass = (path: string) =>
    `list-group-item border-0 fs-5` + 
    (pathname.includes(path) 
      ? " active fw-bold text-dark " 
      : " text-danger");               

  return (
    <div id="wd-account-navigation" className="wd list-group rounded-0">
      {!currentUser && (
        <>
          <Link
            to="/Kambaz/Account/Signin"
            className={navClass("/Signin")}
            id="wd-signin-link"
          >
            Signin
          </Link>
          <Link
            to="/Kambaz/Account/Signup"
            className={navClass("/Signup")}
            id="wd-signup-link"
          >
            Signup
          </Link>
        </>
      )}
      {currentUser && (
        <>
          <Link
            to="/Kambaz/Account/Profile"
            className={navClass("/Profile")}
            id="wd-profile-link"
          >
            Profile
          </Link>
          {currentUser.role === "ADMIN" && (
            <Link
              to="/Kambaz/Account/Users"
              className={navClass("/Users")}
              id="wd-users-link"
            >
              Users
            </Link>
          )}
        </>
      )}
    </div>
  );
}