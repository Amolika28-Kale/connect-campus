import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AdminAuthContext } from "../context/AdminAuthContext";

function AdminLogin() {
  const { login } = useContext(AdminAuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(form.email, form.password);
      navigate("/admin");
    } catch (error) {
      alert("Invalid Credentials");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-8 rounded-2xl w-96"
      >
        <h2 className="text-white text-2xl mb-6 text-center">
          Admin Login
        </h2>

        <input
          type="email"
          placeholder="Email"
          required
          className="w-full mb-4 p-3 bg-gray-700 text-white rounded"
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        <input
          type="password"
          placeholder="Password"
          required
          className="w-full mb-6 p-3 bg-gray-700 text-white rounded"
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        <button className="w-full bg-pink-500 p-3 rounded text-white hover:bg-pink-600">
          Login
        </button>
      </form>
    </div>
  );
}

export default AdminLogin;
