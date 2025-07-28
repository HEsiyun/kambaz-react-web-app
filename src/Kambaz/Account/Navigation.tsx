import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
export default function AccountNavigation() {
  const { currentUser } = useSelector((state: any) => state.accountReducer);
  // const links = currentUser ? ["Profile"] : ["Signin", "Signup"];
  return (
    <div id="wd-account-navigation" className="wd list-group fs-4 rounded-0">
      {!currentUser &&(
      <>
        <Link
          to="/Kambaz/Account/Signin"
          className="list-group-item active border-0"
          id="wd-signin-link">
          Signin
        </Link>
        <Link
          to="/Kambaz/Account/Signup"
          className="list-group-item text-danger border-0"
          id="wd-signup-link">
          Signup
        </Link>
      </>
      )}
      {currentUser && (
      <>
        <Link 
          to="/Kambaz/Account/Profile"
          className="list-group-item text-danger border-0"
          id="wd-profile-link">
          Profile
        </Link>
      </>
      )}
    </div>
  );
}