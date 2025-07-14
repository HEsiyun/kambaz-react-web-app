// import Modules from "../Modules";
// import CourseStatus from "./Status";
// export default function Home() {
// return (
// <table id="wd-home">
// <tr>
// <td valign="top">
// <Modules />
// </td>
// <td valign="top">
// <CourseStatus />
// </td>
// </tr>
// </table>
// );}

import Modules from "../Modules";
import CourseStatus from "./Status";

export default function Home() {
  return (
    <div className="d-flex" id="wd-home">
      <div className="flex-fill me-3">
        <Modules />
      </div>
      <div className="d-none d-xl-block">
        <CourseStatus />
      </div>
    </div>
  );
}