export default function AssignmentEditor() {
    return (
      <div id="wd-assignments-editor">
        <label htmlFor="wd-name"><b>Assignment Name</b></label><br /><br />
        <input id="wd-name" value="A1 - ENV + HTML" /><br /><br />
        <textarea id="wd-description" rows={6} cols={40}>
        The assignment is available online Submit a Link to the Landing page of your Web 
        application running on Netlify. The Landing page should include the following: 
        Your full name and section Links to each of the lab assignments Link to the Kanbas 
        application Links to all relevant source code repositories 
        The Kanbas application should include a link to navigate back to the landing page.
        </textarea><br /><br />
        <table>
          <tr>
            <td align="right" valign="top">
              <label htmlFor="wd-points">Points</label>
            </td>
            <td>
              <input id="wd-points" value={100} /><br /><br />
            </td>
          </tr>
          {/* Complete on your own */}
          <tr>
          <td align="right" valign="top">
          <label htmlFor="wd-group">Assignment Group</label>
          </td>
          <td>
            <select id="wd-group" defaultValue="ASSIGNMENTS">
              <option value="ASSIGNMENTS">ASSIGNMENTS</option>
              <option value="Other">Other</option>
            </select><br /><br />
          </td>
        </tr>

        <tr>
          <td align="right" valign="top">
          <label htmlFor="wd-display-grade-as">Display Grade as</label>
          </td>
          <td>
            <select id="wd-display-grade-as" defaultValue="Percentage">
              <option value="Percentage">Percentage</option>
              <option value="Number">Number</option>
            </select><br /><br />
          </td>
        </tr>

        <tr>
          <td align="right" valign="top">
          <label htmlFor="wd-submission-type">Submission Type</label>
          </td>
          <td>
            <select id="wd-submission-type" defaultValue="Online">
              <option value="Onlines">Online</option>
              <option value="In Person">In Person</option>
            </select><br /><br />
          </td>
        </tr>

        <tr>
        <td align="right" valign="top">
            Online Entry Options
        </td>
        <td align="left" valign="top">
            {/* a single break at the top of this cell */}
            <br />

            <input type="checkbox" id="wd-text-entry" />
            <label htmlFor="wd-text-entry"> Text Entry</label><br />

            <input type="checkbox" id="wd-website-url" />
            <label htmlFor="wd-website-url"> Website URL</label><br />

            <input type="checkbox" id="wd-media-recordings" />
            <label htmlFor="wd-media-recordings"> Media Recordings</label><br />

            <input type="checkbox" id="wd-student-annotation" />
            <label htmlFor="wd-student-annotation"> Student Annotation</label><br />

            <input type="checkbox" id="wd-file-upload" />
            <label htmlFor="wd-file-upload"> File Uploads</label>
        </td>
        </tr><br />

        <tr>
          <td align="right" valign="top">
          <label htmlFor="wd-assign-to">Assign to</label>
          </td>
          <td>
              <br />
              <input id="wd-assign-to" value="Everyone" /><br /><br />
            </td>
        </tr>

        <tr>
          <td align="right" valign="top">
          <label htmlFor="wd-due-date">Due</label>
          </td>
          <td>
            <br />
            <input id="wd-due-date" type="date" value="2024-05-13" /><br /><br />
          </td>
        </tr>

        <tr>
        <td align="left" valign="top">
            <label htmlFor="wd-available-from">Available from</label>
        </td>
        <td align="left" valign="top">
            <label htmlFor="wd-available-until">Until</label>
        </td>
        </tr>
        <tr>
        <td align="right" valign="top">
            <input
            id="wd-available-from"
            type="date"
            value="2024-05-06"
            />
        </td>
        <td align="left" valign="top">
            <input
            id="wd-available-until"
            type="date"
            value="2024-05-20"
            />
        </td>
        </tr><br />
        <tr>
        <td colSpan={2} align="right">
        <button>Cancel</button>
        <button>Save</button>
        </td>
    </tr>
        </table>
      </div>
    );
  }