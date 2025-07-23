import { useState } from "react";
import axios from "axios";

function Register({ onSwitchToLogin }) {
  const [form, setForm] = useState({ username: "", email: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://127.0.0.1:8000/register", form);
      alert("Registration successful! You can now login.");
      onSwitchToLogin();
    } catch (err) {
      alert(err.response?.data?.detail || "Registration failed");
    }
  };

  return (
    <form onSubmit={handleRegister} className="space-y-4 max-w-sm mx-auto mt-20">
      <input name="username" value={form.username} onChange={handleChange} placeholder="Username" className="w-full p-2 border rounded" required />
      <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" className="w-full p-2 border rounded" required />
      <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password" className="w-full p-2 border rounded" required />
      <button type="submit" className="bg-black text-white px-4 py-2 rounded">Register</button>
      <p className="text-center text-sm mt-2">
        Already have an account?{" "}
        <button type="button" className="text-blue-500 underline" onClick={onSwitchToLogin}>
          Login
        </button>
      </p>
    </form>
  );
}

export default Register;
