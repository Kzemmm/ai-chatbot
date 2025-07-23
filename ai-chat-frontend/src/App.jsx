import { useEffect, useState } from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import axios from "axios";

function App() {
  const [page, setPage] = useState("login");
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const fetchUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await axios.get("http://127.0.0.1:8000/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data);
      setAuthenticated(true);
    } catch {
      localStorage.removeItem("token");
      setAuthenticated(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setAuthenticated(false);
    setUser(null);
    setPage("login");
  };

  if (!authenticated) {
    if (page === "login") return <Login onLogin={fetchUser} onSwitchToRegister={() => setPage("register")} />;
    if (page === "register") return <Register onSwitchToLogin={() => setPage("login")} />;
  }

  return <Dashboard user={user} onLogout={handleLogout} />;
}

export default App;
