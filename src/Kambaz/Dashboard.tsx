import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div id="wd-dashboard">
      <h1 id="wd-dashboard-title">Dashboard</h1>
      <hr />
      <h2 id="wd-dashboard-published">Published Courses (12)</h2>
      <hr />
      <div id="wd-dashboard-courses">
        <div className="wd-dashboard-course">
          <Link
            to="/Kambaz/Courses/1234/Home"
            className="wd-dashboard-course-link">
            <img src="/images/reactjs.jpg" width={200} />
            <div>
              <h5>CS1234 React JS</h5>
              <p className="wd-dashboard-course-title">
                Full Stack software developer
              </p>
              <button>Go</button>
            </div>
          </Link>
        </div>
        
        <div className="wd-dashboard-course">
          <Link
            to="/Kambaz/Courses/1235/Home"
            className="wd-dashboard-course-link">
            <img src="/images/algo.jpg" width={200} />
            <div>
              <h5>CS1235 Algorithm</h5>
              <p className="wd-dashboard-course-title">
                Algorithm and Data Structure
              </p>
              <button>Go</button>
            </div>
          </Link>
        </div>

        <div className="wd-dashboard-course">
          <Link
            to="/Kambaz/Courses/1236/Home"
            className="wd-dashboard-course-link">
            <img src="/images/nlp.jpg" width={200} />
            <div>
              <h5>CS1236 NLP </h5>
              <p className="wd-dashboard-course-title">
                Natrual Language Processing
              </p>
              <button>Go</button>
            </div>
          </Link>
        </div>

        <div className="wd-dashboard-course">
          <Link
            to="/Kambaz/Courses/1237/Home"
            className="wd-dashboard-course-link">
            <img src="/images/mobile.jpg" width={200} />
            <div>
              <h5>CS1237 Mobile Dev </h5>
              <p className="wd-dashboard-course-title">
                Mobile Application Development
              </p>
              <button>Go</button>
            </div>
          </Link>
        </div>

        <div className="wd-dashboard-course">
          <Link
            to="/Kambaz/Courses/1238/Home"
            className="wd-dashboard-course-link">
            <img src="/images/cv.jpg" width={200} />
            <div>
              <h5>CS1238 CV </h5>
              <p className="wd-dashboard-course-title">
                Computer Vision
              </p>
              <button>Go</button>
            </div>
          </Link>
        </div>
        
        <div className="wd-dashboard-course">
          <Link
            to="/Kambaz/Courses/1239/Home"
            className="wd-dashboard-course-link">
            <img src="/images/aws.jpg" width={200} />
            <div>
              <h5>CS1239 Cloud </h5>
              <p className="wd-dashboard-course-title">
                Cloud Computing
              </p>
              <button>Go</button>
            </div>
          </Link>
        </div>

        <div className="wd-dashboard-course">
          <Link
            to="/Kambaz/Courses/1240/Home"
            className="wd-dashboard-course-link">
            <img src="/images/ood.jpg" width={200} />
            <div>
              <h5>CS1240 OOD </h5>
              <p className="wd-dashboard-course-title">
                Object Oriented Design
              </p>
              <button>Go</button>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}