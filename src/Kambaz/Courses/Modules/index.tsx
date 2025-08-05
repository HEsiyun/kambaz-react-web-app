import ModulesControls from "./ModulesControls";
import LessonControlButtons from "./LessonControlButtons";
import { ListGroup, FormControl } from "react-bootstrap";
import { BsGripVertical } from "react-icons/bs";
import ModuleControlButtons from "./ModuleControlButtons";
import { useParams } from "react-router";
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  setModules,
  deleteModule,
  updateModule,
  editModule,
  addModule,
} from "./reducer";
import * as coursesClient from "../client";    // For fetch/create
import * as modulesClient from "../client";    // For delete

export default function Modules() {
  const { cid } = useParams();
  const [moduleName, setModuleName] = useState<string>("");

  const { modules } = useSelector((state: any) => state.modulesReducer);
  const { currentUser } = useSelector((state: any) => state.accountReducer);
  const isFaculty = currentUser?.role === "FACULTY";
  const dispatch = useDispatch();

  // Save module to server and update state
  const saveModule = async (module: any) => { await modulesClient.updateModule(module); dispatch(updateModule(module)); };

  // FETCH MODULES FROM SERVER ON MOUNT
  useEffect(() => {
    const fetchModules = async () => {
      const modules = await coursesClient.findModulesForCourse(cid as string);
      dispatch(setModules(modules));
    };
    fetchModules();
  }, [cid, dispatch]);

  // CREATE MODULE FOR THIS COURSE (SERVER)
  const createModuleForCourse = async () => {
    if (!cid) return;
    const newModule = { name: moduleName, course: cid };
    const module = await coursesClient.createModuleForCourse(cid, newModule);
    dispatch(addModule(module));
    setModuleName("");
  };

  // REMOVE MODULE FROM SERVER AND STATE
  const removeModule = async (moduleId: string) => {
    await modulesClient.deleteModule(moduleId);
    dispatch(deleteModule(moduleId));
  };

  return (
    <div className="wd-modules">
      {/* Only show add module control to FACULTY */}
      {isFaculty && (
        <ModulesControls
          moduleName={moduleName}
          setModuleName={setModuleName}
          addModule={createModuleForCourse}
        />
      )}
      <br /><br /><br /><br />
      <ListGroup id="wd-modules" className="rounded-0">
        {modules.map((module: any) => (
          <ListGroup.Item
            key={module._id}
            className="wd-module p-0 mb-5 fs-5 border-gray"
          >
            <div className="wd-title p-3 ps-2 bg-secondary">
              <BsGripVertical className="me-2 fs-3" />
              {/* Inline editing logic only for FACULTY */}
              {!module.editing && module.name}
              {isFaculty && module.editing && (
                <FormControl
                  className="w-50 d-inline-block"
                  value={module.name}
                  onChange={(e) =>
                    dispatch(updateModule({ ...module, name: e.target.value }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      saveModule({ ...module, editing: false });
                      dispatch(updateModule({ ...module, editing: false }));
                    }
                  }}
                  autoFocus
                />
              )}
              {/* Only show control buttons to FACULTY */}
              {isFaculty && (
                <ModuleControlButtons
                  moduleId={module._id}
                  deleteModule={removeModule}
                  editModule={(moduleId: string) =>
                    dispatch(editModule(moduleId))
                  }
                />
              )}
            </div>
            {module.lessons && (
              <ListGroup className="wd-lessons rounded-0">
                {module.lessons.map(
                  (lesson: { _id: React.Key | null | undefined; name: any }) => (
                    <ListGroup.Item
                      key={lesson._id}
                      className="wd-lesson p-3 ps-1"
                    >
                      <BsGripVertical className="me-2 fs-3" />
                      {lesson.name}
                      <LessonControlButtons />
                    </ListGroup.Item>
                  )
                )}
              </ListGroup>
            )}
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
}