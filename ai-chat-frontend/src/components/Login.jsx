import { useState } from "react";
import axios from "axios";

function Login({ onLogin, onSwitchToRegister }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    try {
      const response = await axios.post("http://127.0.0.1:8000/login", new URLSearchParams({
        username,
        password
      }), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      const token = response.data.access_token;
      localStorage.setItem("token", token);
      onLogin();
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      alert("Invalid credentials");
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4 max-w-sm mx-auto mt-20">
      <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" className="w-full p-2 border rounded" />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full p-2 border rounded" />
      <button type="submit" className="bg-black text-white px-4 py-2 rounded">Login</button>
      <p className="text-center text-sm mt-2">
        No account yet?{" "}
        <button type="button" className="text-blue-500 underline" onClick={onSwitchToRegister}>
          Register
        </button>
      </p>
    </form>
  );
}

export default Login;
