import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import * as courseClient from "../client";
import PeopleTable from "./Table";

export default function CoursePeople() {
  const { cid } = useParams();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      if (!cid) return;
      try {
        const list = await courseClient.findUsersForCourse(cid);
        if (!ignore) setUsers(Array.isArray(list) ? list : []);
      } catch (e) {
        if (!ignore) setUsers([]);
        console.error(e);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, [cid]);

  if (loading) return <div className="p-3">Loading people…</div>;

  return <PeopleTable users={users} />;
}