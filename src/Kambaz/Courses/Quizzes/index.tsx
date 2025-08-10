import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Spinner } from "react-bootstrap";
import { useParams } from "react-router-dom";
import type { AppDispatch, RootState } from "../../store"; // adjust import if your store path differs
import { quizThunks, type Quiz } from "./reducer";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FaPlus, FaTrash, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

function format(d?: string) {
  if (!d) return "";
  const dt = new Date(d);
  return dt.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export default function Quizzes() {
  const { cid } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const { list, loading, error } = useSelector((s:RootState)=>s.quizzesReducer);
  const currentUser = useSelector((s:RootState)=>s.accountReducer.currentUser as { role?: string } | null);
  const isFaculty = currentUser?.role === "FACULTY";

  useEffect(() => {
    if (cid) dispatch(quizThunks.fetchQuizzes(cid));
  }, [cid, dispatch]);

  const add = () => {
    if (!cid) return;
    dispatch(quizThunks.createQuizThunk({
      cid,
      data: { title: "New Quiz", description: "", published: false }
    }));
  };

  const remove = (qid: string) => dispatch(quizThunks.deleteQuizThunk(qid));
  const togglePublish = (q: Quiz) => dispatch(quizThunks.publishQuizThunk({ qid: q._id, published: !q.published }));

  return (
    <div className="p-3">
      <div className="d-flex align-items-center mb-3">
        <h3 className="mb-0">Quizzes</h3>
        {isFaculty && (
          <Button size="sm" className="ms-auto" variant="danger" onClick={add}>
            <FaPlus className="me-2"/> Quiz
          </Button>
        )}
      </div>

      {loading && <div className="text-secondary"><Spinner size="sm" className="me-2"/>Loading…</div>}
      {error && <div className="text-danger">Error: {error}</div>}

      {!loading && list.length === 0 && (
        <div className="text-secondary">No quizzes yet. {isFaculty && "Click + Quiz to create one."}</div>
      )}

      <ul className="list-group">
        {list.map(q => (
          <li key={q._id} className="list-group-item d-flex align-items-start border-0 border-start border-primary border-4 mb-2">
            <div className="flex-grow-1">
              <div className="d-flex align-items-center">
                <span className="fw-bold me-2">{q.title}</span>
                <Button size="sm" variant="light" className="py-0" onClick={()=>togglePublish(q)}>
                  {q.published ? <><FaCheckCircle className="text-success me-1"/> Published</> : <><FaTimesCircle className="text-secondary me-1"/> Unpublished</>}
                </Button>
              </div>
              <div className="small text-secondary">
                {q.availableFrom && <>Available: {format(q.availableFrom)} | </>}
                {q.availableUntil && <>Until: {format(q.availableUntil)} | </>}
                {q.dueDate && <>Due: {format(q.dueDate)}</>}
              </div>
            </div>

            {isFaculty && (
              <>
                <Button variant="link" className="text-danger p-0 me-2" onClick={()=>remove(q._id)}><FaTrash/></Button>
                <BsThreeDotsVertical/>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}