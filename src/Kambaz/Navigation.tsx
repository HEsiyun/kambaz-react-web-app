import { ListGroup } from "react-bootstrap";
import { AiOutlineDashboard } from "react-icons/ai";
import { IoCalendarOutline } from "react-icons/io5";
import { LiaBookSolid, LiaCogSolid } from "react-icons/lia";
import { FaInbox, FaRegCircleUser } from "react-icons/fa6";
import { Link, useLocation } from "react-router-dom";

export default function KambazNavigation() {
  const { pathname } = useLocation();

  const links = [
    { label: "Dashboard", path: "/Kambaz/Dashboard", icon: <AiOutlineDashboard className="fs-1" /> },
    { label: "Courses", path: "/Kambaz/Dashboard", icon: <LiaBookSolid className="fs-1" /> }, // Notice: Courses links to Dashboard
    { label: "Calendar", path: "/Kambaz/Calendar", icon: <IoCalendarOutline className="fs-1" /> },
    { label: "Inbox", path: "/Kambaz/Inbox", icon: <FaInbox className="fs-1" /> },
    { label: "Labs", path: "/Labs", icon: <LiaCogSolid className="fs-1" /> }
  ];

  return (
    <ListGroup style={{width: 120}}
      className="rounded-0 bg-black
        position-fixed bottom-0 top-0 z-2
        d-none d-md-block"
      id="wd-kambaz-navigation">
      {/* NEU Logo */}
      <ListGroup.Item target="_blank" action
        href="https://www.northeastern.edu/"
        className="bg-black border-0 text-center"
        id="wd-neu-link">
      <img src="/images/NEU.png" width="75px" />
    </ListGroup.Item>

      <ListGroup.Item
      as={Link}
      to="/Kambaz/Account"
      className={`text-center border-0 bg-black
        ${
          pathname.includes("Account")
            ? "bg-white text-danger"
            : "bg-black text-white"
        }
      `}
    >
      <FaRegCircleUser
        className={`fs-1 ${
          pathname.includes("Account") ? "text-danger" : "text-white"
        }`}
      />
      <br /> 
      Account
    </ListGroup.Item>

      {/* Sidebar links */}
      {links.map((link) => (
      <ListGroup.Item 
        key={link.path} 
        as={Link}
        to={link.path}
        className={`bg-black text-center border-0
          ${pathname.includes(link.label) ?
            "text-danger bg-white" :
            "text-danger bg-black"}`}>
          {link.icon}
        <br /> {link.label}
      </ListGroup.Item>
    ))}
  </ListGroup>
);}