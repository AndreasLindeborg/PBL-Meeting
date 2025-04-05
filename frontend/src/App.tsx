import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "./firebase";

import Login from "./components/Login";
import Lobby from "./components/Lobby";
import Meeting from "./components/Meeting";
import ActiveMeeting from "./components/ActiveMeeting"; // ✅ NEW

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/lobby"
          element={user ? <Lobby user={user} /> : <Navigate to="/login" />}
        />
        <Route
          path="/meeting/:id"
          element={user ? <Meeting user={user} /> : <Navigate to="/login" />}
        />
        <Route
          path="/meeting/:id/active" // ✅ NEW
          element={user ? <ActiveMeeting user={user} /> : <Navigate to="/login" />}
        />
        <Route
          path="/"
          element={<Navigate to={user ? "/lobby" : "/login"} />}
        />
      </Routes>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </Router>
  );
}
