import { Link } from "react-router-dom";

export default function AccountNavigation() {
  return (
    <div id="wd-account-navigation" className="wd list-group fs-4 rounded-0">
      <Link
        to="/Kambaz/Account/Signin"
        className="list-group-item active border-0"
        id="wd-signin-link"
      >
        Signin
      </Link>
      <Link
        to="/Kambaz/Account/Signup"
        className="list-group-item text-danger border-0"
        id="wd-signup-link"
      >
        Signup
      </Link>
      <Link
        to="/Kambaz/Account/Profile"
        className="list-group-item text-danger border-0"
        id="wd-profile-link"
      >
        Profile
      </Link>
    </div>
  );
}