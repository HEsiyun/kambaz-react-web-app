import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setCurrentUser } from "./reducer";
import { useNavigate } from "react-router-dom";
import { FormControl, Button } from "react-bootstrap";

export default function Profile() {
  const [profile, setProfile] = useState<any>({});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state: any) => state.accountReducer);

  // Fetch profile on mount
  useEffect(() => {
    if (!currentUser) {
      navigate("/Kambaz/Account/Signin");
    } else {
      setProfile(currentUser);
    }
  }, [currentUser, navigate]);

  // Sign out handler
  const signout = () => {
    dispatch(setCurrentUser(null));
    navigate("/Kambaz/Account/Signin");
  };

  return (
    <div className="wd-profile-screen p-4" style={{ maxWidth: 500 }}>
      <h3>Profile</h3>
      {profile && (
        <div>
          <FormControl
            defaultValue={profile.username}
            id="wd-username"
            className="mb-2"
            onChange={e =>
              setProfile({ ...profile, username: e.target.value })
            }
          />
          <FormControl
            defaultValue={profile.password}
            id="wd-password"
            className="mb-2"
            onChange={e =>
              setProfile({ ...profile, password: e.target.value })
            }
          />
          <FormControl
            defaultValue={profile.firstName}
            id="wd-firstname"
            className="mb-2"
            onChange={e =>
              setProfile({ ...profile, firstName: e.target.value })
            }
          />
          <FormControl
            defaultValue={profile.lastName}
            id="wd-lastname"
            className="mb-2"
            onChange={e =>
              setProfile({ ...profile, lastName: e.target.value })
            }
          />
          <FormControl
            defaultValue={profile.dob}
            id="wd-dob"
            className="mb-2"
            type="date"
            onChange={e =>
              setProfile({ ...profile, dob: e.target.value })
            }
          />
          <FormControl
            defaultValue={profile.email}
            id="wd-email"
            className="mb-2"
            type="email"
            onChange={e =>
              setProfile({ ...profile, email: e.target.value })
            }
          />
          <select
            className="form-control mb-2"
            id="wd-role"
            value={profile.role}
            onChange={e =>
              setProfile({ ...profile, role: e.target.value })
            }
          >
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
            <option value="FACULTY">Faculty</option>
            <option value="STUDENT">Student</option>
          </select>
          <Button
            onClick={signout}
            className="w-100 mb-2"
            id="wd-signout-btn"
            variant="danger"
          >
            Sign out
          </Button>
        </div>
      )}
    </div>
  );
}