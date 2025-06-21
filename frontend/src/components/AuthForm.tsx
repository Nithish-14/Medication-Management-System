import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from 'js-cookie'
import { useLocation } from "react-router-dom";


const apiUrl = import.meta.env.VITE_API_URL;
interface AuthFormProps {
  mode: "login" | "signup";
  updateMode: (m: any) => void
}

export default function AuthForm({ mode, updateMode }: AuthFormProps) {
  const [username, setUsername] = useState("");
  const [formMode, setFormMode] = useState(mode);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const location = useLocation();
  const [role, setRole] = useState("patient");
  const navigate = useNavigate();
  const bgColor = role === "caretaker" ? "bg-[#18A24A]" : "bg-[#2463EB]";
  const hoverColor = role === "caretaker" ? "hover:bg-green-700" : "hover:bg-blue-700";

  useEffect(() => {
    setUsername("");
    setPassword("");
    setEmail("");
    setError("");
  }, [mode]);

// console.log("form", formMode)
console.log("mode", mode)


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username || !password || (mode === "signup" && !email)) {
      setError("Please fill all required fields.");
      return;
    }

    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/signup";

    try {
      const res = await fetch(apiUrl + endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role, ...(mode === "signup" && { email }) }),
      });


      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong.");
        return;
      }

      if (mode === "signup") {
        updateMode("login");
        navigate("/auth");
        return;
      } else {
        Cookies.set(role + "_jwt", data.token);
        if (role === "patient") navigate("/patient-dashboard");
        else navigate("/caretaker-patients");
      }

    } catch (err) {
      setError("Network error. Try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="bg-red-100 text-red-600 p-2 rounded">{error}</div>}

      <div>
        <label className="block text-sm font-medium">Username</label>
        <input
          required
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      {mode === "signup" && (
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium">Password</label>
        <input
          type="password"
          required
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Role</label>
        <select
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="patient">Patient</option>
          <option value="caretaker">Caretaker</option>
        </select>
      </div>

      <button
        type="submit"
        className={`w-full ${bgColor} text-white py-2 rounded ${hoverColor} transition`}
      >
        {mode === "login" ? "Log In" : "Sign Up"}
      </button>
    </form>
  );
}
