import { useCallback, useEffect, useRef, useState } from "react";
import { useDebounce } from "../hooks/useDebounce";

function TaskList() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState(""); // status filter
  const [tasks, setTasks] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL; // http://localhost:5000/api/tasks
  const debouncedQuery = useDebounce(query, 500);
  const observer = useRef();

  // Fetch tasks from backend
  const fetchTasks = useCallback(
    async (cursor = null, replace = false) => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.append("limit", 10);
        if (debouncedQuery) params.append("search", debouncedQuery);
        if (status) params.append("status", status);
        if (cursor) params.append("cursor", cursor);

        const res = await fetch(`${API_URL}?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch tasks");

        const data = await res.json();
        setTasks((prev) =>
          replace ? data.items : [...prev, ...(data.items || [])]
        );
        setNextCursor(data.nextCursor || null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [debouncedQuery, status, API_URL] // remove 'loading' from dependencies
  );

  useEffect(() => {
    setTasks([]);
    setNextCursor(null);
    fetchTasks(null, true);
  }, [debouncedQuery, status, fetchTasks]);

  // Reset list when search or status changes
  useEffect(() => {
    if (!nextCursor) return;

    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 200 &&
        !loading
      ) {
        fetchTasks(nextCursor);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [nextCursor, fetchTasks, loading]);

  // Infinite scroll: load more when near bottom
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 200 &&
        nextCursor &&
        !loading
      ) {
        fetchTasks(nextCursor);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [nextCursor, fetchTasks, loading]);

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <h2>Tasks</h2>

      <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tasks..."
          style={{ flex: 1, padding: "8px" }}
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={{ padding: "8px" }}
        >
          <option value="">All</option>
          <option value="todo">Todo</option>
          <option value="doing">Doing</option>
          <option value="done">Done</option>
        </select>
      </div>

      {tasks.length === 0 && !loading && !error && <p>No tasks found.</p>}
      {error && (
        <div style={{ color: "red", marginBottom: "10px" }}>
          <p>{error}</p>
          <button onClick={() => fetchTasks(nextCursor)}>Retry</button>
        </div>
      )}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {tasks.map((task) => (
          <li
            key={task._id}
            style={{
              padding: "10px",
              marginBottom: "5px",
              border: "1px solid #ccc",
              borderRadius: "5px",
            }}
          >
            <strong>{task.title}</strong> – {task.status} (priority{" "}
            {task.priority})
          </li>
        ))}
      </ul>

      {loading && <p>Loading...</p>}
    </div>
  );
}

export default TaskList;
