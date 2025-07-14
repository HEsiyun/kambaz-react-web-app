// import { Link } from "react-router-dom";
// export default function KambazNavigation() {
// return (
// <div id="wd-kambaz-navigation"> <a href="https://www.northeastern.edu/" id="wd-neu-link" target="_blank">Northeastern</a><br/>
// <Link to="/Kambaz/Account" id="wd-account-link">Account</Link><br/>
// <Link to="/Kambaz/Dashboard" id="wd-dashboard-link">Dashboard</Link><br/>
// <Link to="/Kambaz/Dashboard" id="wd-course-link">Courses</Link><br/>
// <Link to="/Kambaz/Calendar" id="wd-calendar-link">Calendar</Link><br/>
// <Link to="/Kambaz/Inbox" id="wd-inbox-link">Inbox</Link><br/>
// <Link to="/Labs" id="wd-labs-link">Labs</Link><br/>
// </div>
// );}

import { ListGroup } from "react-bootstrap";
import { Link } from "react-router-dom";
import { AiOutlineDashboard } from "react-icons/ai";
import { IoCalendarOutline } from "react-icons/io5";
import { LiaBookSolid, LiaCogSolid } from "react-icons/lia";
import { FaInbox, FaRegCircleUser } from "react-icons/fa6";

export default function KambazNavigation() {
  return (
    <ListGroup
      id="wd-kambaz-navigation"
      style={{ width: 120 }}
      className="rounded-0 position-fixed bottom-0 top-0 d-none d-md-block bg-black z-2"
    >
      <ListGroup.Item
        id="wd-neu-link"
        target="_blank"
        action
        href="https://www.northeastern.edu/"
        className="bg-black border-0 text-center"
      >
        <img src="/images/NEU.png" width="75px" alt="NEU logo" />
      </ListGroup.Item>
      
      <ListGroup.Item
        to="/Kambaz/Account"
        as={Link}
        className="text-center border-0 bg-black text-white"
      >
        <FaRegCircleUser className="fs-1 text-white" />
        <br />
        Account
      </ListGroup.Item>
      <ListGroup.Item
        to="/Kambaz/Dashboard"
        as={Link}
        className="text-center border-0 bg-white text-danger"
      >
        <AiOutlineDashboard className="fs-1 text-danger" />
        <br />
        Dashboard
      </ListGroup.Item>
      <ListGroup.Item
        to="/Kambaz/Dashboard"
        as={Link}
        className="bg-black text-center border-0 text-white"
      >
        <LiaBookSolid className="fs-1 text-danger" />
        <br />
        Courses
      </ListGroup.Item>
      <ListGroup.Item
        to="/Kambaz/Calendar"
        as={Link}
        className="bg-black text-center border-0 text-white"
      >
        <IoCalendarOutline className="fs-1 text-danger" />
        <br />
        Calendar
      </ListGroup.Item>
      <ListGroup.Item
        to="/Kambaz/Inbox"
        as={Link}
        className="bg-black text-center border-0 text-white"
      >
        <FaInbox className="fs-1 text-danger" />
        <br />
        Inbox
      </ListGroup.Item>
      <ListGroup.Item
        to="/Labs"
        as={Link}
        className="bg-black text-center border-0 text-white"
      >
        <LiaCogSolid className="fs-1 text-danger" />
        <br />
        Labs
      </ListGroup.Item>
    </ListGroup>
  );
}